from flask import Flask, request, jsonify
import requests
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

OLLAMA_API_URL = "http://localhost:11434/api/generate"
LLAMA3_MODEL = "llama3"

@app.route('/chat', methods=["POST"])
def chat():
    try:
        data = request.json
        if not data or not isinstance(data, dict):
            return jsonify({"error": "Invalid or missing JSON payload."}), 400
        user_message = data.get("message", "")
        if not user_message:
            return jsonify({"error": "No message provided."}), 400

        payload = {
            "model": LLAMA3_MODEL,
            "prompt": user_message
        }
        response = requests.post(OLLAMA_API_URL, json=payload)
        response.raise_for_status()
        result = response.json()
        reply = result.get("response", "No response from model.")
        return jsonify({"response": reply})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)