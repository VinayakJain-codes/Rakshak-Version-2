import cv2
import numpy as np
import base64
import io
from PIL import Image

class GuardImageVerifier:
    def __init__(self):
        # Load Haar Cascade classifiers from OpenCV standard data path
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        self.face_cascade_alt = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_alt2.xml')
        self.eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')
        self.eye_glasses_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye_tree_eyeglasses.xml')

    def decode_base64_image(self, base64_str: str) -> np.ndarray | None:
        """Decodes base64 string (data URI or raw base64) into OpenCV BGR numpy array."""
        try:
            if ',' in base64_str:
                base64_str = base64_str.split(',')[1]
            
            image_bytes = base64.b64decode(base64_str)
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            return img
        except Exception:
            return None

    def check_blur_and_lighting(self, gray_img: np.ndarray) -> tuple[float, float, str | None]:
        """Calculates Laplacian variance for blur and mean intensity for lighting."""
        blur_val = float(cv2.Laplacian(gray_img, cv2.CV_64F).var())
        brightness_val = float(np.mean(gray_img))

        if blur_val < 25.0:
            return blur_val, brightness_val, "Image is too blurry. Please hold the camera steady."
        
        if brightness_val < 20.0:
            return blur_val, brightness_val, "Environment is too dark. Please ensure sufficient lighting."
        
        if brightness_val > 245.0:
            return blur_val, brightness_val, "Image is overexposed. Please avoid direct harsh glare."

        return blur_val, brightness_val, None

    def check_skin_tone_liveness(self, bgr_img: np.ndarray, face_box: tuple) -> bool:
        """Basic YCrCb color space check for realistic skin tone presence in face bounding box."""
        x, y, w, h = face_box
        face_roi = bgr_img[y:y+h, x:x+w]
        if face_roi.size == 0:
            return False

        ycrcb = cv2.cvtColor(face_roi, cv2.COLOR_BGR2YCrCb)
        min_YCrCb = np.array([0, 133, 77], np.uint8)
        max_YCrCb = np.array([255, 173, 127], np.uint8)
        
        skin_mask = cv2.inRange(ycrcb, min_YCrCb, max_YCrCb)
        skin_ratio = float(np.sum(skin_mask > 0)) / float(w * h)
        
        return skin_ratio > 0.15

    def verify(self, base64_image: str) -> dict:
        """Main verification pipeline checking face, eyes, liveness, and image quality."""
        try:
            img = self.decode_base64_image(base64_image)
            if img is None:
                return {
                    "is_valid": False,
                    "verification_result": "FAIL",
                    "verification_score": 0.0,
                    "face_detected": False,
                    "eyes_detected": False,
                    "reason": "Invalid image data uploaded.",
                    "model_version": "Rakshak-CV-v1.0"
                }

            h_img, w_img = img.shape[:2]
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

            # 1. Quality & Lighting Check
            blur_score, mean_brightness, quality_error = self.check_blur_and_lighting(gray)
            if quality_error:
                return {
                    "is_valid": False,
                    "verification_result": "FAIL",
                    "verification_score": float(round(min(blur_score, 40.0), 1)),
                    "face_detected": False,
                    "eyes_detected": False,
                    "blur_score": float(round(blur_score, 2)),
                    "brightness": float(round(mean_brightness, 2)),
                    "reason": quality_error,
                    "model_version": "Rakshak-CV-v1.0"
                }

            # 2. Face Detection
            min_face_size = (int(w_img * 0.15), int(h_img * 0.15))
            faces = self.face_cascade.detectMultiScale(
                gray, scaleFactor=1.1, minNeighbors=5, minSize=min_face_size
            )
            
            if len(faces) == 0:
                # Fallback to alternate cascade
                faces = self.face_cascade_alt.detectMultiScale(
                    gray, scaleFactor=1.1, minNeighbors=4, minSize=min_face_size
                )

            if len(faces) == 0:
                return {
                    "is_valid": False,
                    "verification_result": "FAIL",
                    "verification_score": 20.0,
                    "face_detected": False,
                    "eyes_detected": False,
                    "blur_score": float(round(blur_score, 2)),
                    "reason": "No face detected in photo. Please frame your face clearly and look directly at the camera.",
                    "model_version": "Rakshak-CV-v1.0"
                }

            # Select largest face
            largest_face = max(faces, key=lambda rect: int(rect[2]) * int(rect[3]))
            fx, fy, fw, fh = [int(v) for v in largest_face]

            # Check liveness skin ratio
            has_skin = self.check_skin_tone_liveness(img, (fx, fy, fw, fh))

            # 3. Eye Detection within upper 65% of face region
            eye_roi_gray = gray[fy : fy + int(fh * 0.65), fx : fx + fw]
            
            eyes = self.eye_cascade.detectMultiScale(
                eye_roi_gray, scaleFactor=1.1, minNeighbors=4, minSize=(int(fw * 0.12), int(fh * 0.12))
            )
            
            if len(eyes) == 0:
                # Fallback eye check with eyeglasses cascade
                eyes = self.eye_glasses_cascade.detectMultiScale(
                    eye_roi_gray, scaleFactor=1.1, minNeighbors=3, minSize=(int(fw * 0.10), int(fh * 0.10))
                )

            eyes_detected = len(eyes) > 0

            # If no eyes detected (eyes closed, head turned, heavy shadow), fail verification
            if not eyes_detected:
                return {
                    "is_valid": False,
                    "verification_result": "FAIL",
                    "verification_score": 45.0,
                    "face_detected": True,
                    "eyes_detected": False,
                    "blur_score": float(round(blur_score, 2)),
                    "reason": "Eyes appear closed, obstructed, or unverified. Please look directly into the camera with eyes open.",
                    "model_version": "Rakshak-CV-v1.0"
                }

            # Calculate confidence score (85% to 99.5%) based on face area ratio, blur, and eye count
            face_coverage = float(fw * fh) / float(w_img * h_img)
            base_score = 85.0 + min(10.0, face_coverage * 20.0) + min(4.5, blur_score / 50.0)
            if len(eyes) >= 2:
                base_score += 2.0
            if has_skin:
                base_score += 1.5

            final_score = float(round(min(99.5, base_score), 1))

            return {
                "is_valid": True,
                "verification_result": "PASS",
                "verification_score": final_score,
                "face_detected": True,
                "eyes_detected": True,
                "eyes_count": int(len(eyes)),
                "blur_score": float(round(blur_score, 2)),
                "reason": "Verification passed: Guard face & open eyes confirmed.",
                "model_version": "Rakshak-CV-v1.0"
            }

        except Exception as e:
            return {
                "is_valid": False,
                "verification_result": "FAIL",
                "verification_score": 0.0,
                "face_detected": False,
                "eyes_detected": False,
                "reason": f"Verification error: {str(e)}",
                "model_version": "Rakshak-CV-v1.0"
            }
