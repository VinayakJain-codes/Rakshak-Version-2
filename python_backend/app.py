import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from verifier import GuardImageVerifier

app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests

verifier = GuardImageVerifier()

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "ok",
        "service": "Rakshak Guard Biometric Verification Engine",
        "model_version": "Rakshak-CV-v1.0"
    }), 200

@app.route('/verify', methods=['POST'])
def verify_image():
    try:
        data = request.get_json(force=True, silent=True)
        if not data:
            return jsonify({
                "is_valid": False,
                "verification_result": "FAIL",
                "verification_score": 0.0,
                "reason": "Missing JSON request body."
            }), 400

        image_base64 = data.get('imageBase64') or data.get('image') or data.get('photo')
        if not image_base64:
            return jsonify({
                "is_valid": False,
                "verification_result": "FAIL",
                "verification_score": 0.0,
                "reason": "No image base64 data provided in request body."
            }), 400

        result = verifier.verify(image_base64)
        
        status_code = 200 if result["is_valid"] else 400
        return jsonify(result), status_code

    except Exception as e:
        return jsonify({
            "is_valid": False,
            "verification_result": "FAIL",
            "verification_score": 0.0,
            "reason": f"Internal server error: {str(e)}",
            "model_version": "Rakshak-CV-v1.0"
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    print(f"==================================================")
    print("Rakshak Guard Verification Service Starting...")
    print(f"Listening on http://127.0.0.1:{port}")
    print(f"==================================================")
    app.run(host='0.0.0.0', port=port, debug=False)
