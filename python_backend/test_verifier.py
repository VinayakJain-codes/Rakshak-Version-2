import cv2
import numpy as np
import base64
from verifier import GuardImageVerifier

def create_synthetic_face_image():
    """Generates a simple synthetic face-like image for unit testing."""
    img = np.ones((300, 300, 3), dtype=np.uint8) * 220 # Light background
    
    # Draw face oval (skin tone)
    cv2.ellipse(img, (150, 150), (80, 100), 0, 0, 360, (140, 180, 230), -1)
    
    # Draw eyes
    cv2.circle(img, (120, 130), 12, (255, 255, 255), -1)
    cv2.circle(img, (120, 130), 5, (50, 50, 50), -1)
    
    cv2.circle(img, (180, 130), 12, (255, 255, 255), -1)
    cv2.circle(img, (180, 130), 5, (50, 50, 50), -1)
    
    # Draw mouth
    cv2.ellipse(img, (150, 190), (25, 10), 0, 0, 180, (50, 50, 150), 3)

    _, buffer = cv2.imencode('.jpg', img)
    return base64.b64encode(buffer).decode('utf-8')

def test_verifier():
    print("Testing GuardImageVerifier...")
    verifier = GuardImageVerifier()

    # Test 1: Invalid blank image
    blank_img = np.zeros((100, 100, 3), dtype=np.uint8)
    _, buffer = cv2.imencode('.jpg', blank_img)
    b64_blank = base64.b64encode(buffer).decode('utf-8')
    res_blank = verifier.verify(b64_blank)
    print("Blank Image Result:", res_blank)
    assert res_blank["is_valid"] is False, "Blank image should fail verification"

    # Test 2: Random Noise image
    noise_img = np.random.randint(0, 255, (200, 200, 3), dtype=np.uint8)
    _, buffer = cv2.imencode('.jpg', noise_img)
    b64_noise = base64.b64encode(buffer).decode('utf-8')
    res_noise = verifier.verify(b64_noise)
    print("Noise Image Result:", res_noise)
    assert res_noise["is_valid"] is False, "Noise image should fail face detection"

    print("[SUCCESS] All verifier baseline tests passed!")

if __name__ == '__main__':
    test_verifier()
