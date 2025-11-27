import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)  # Enable CORS for all routes

# Configure Gemini API
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    print("Warning: GEMINI_API_KEY not found in environment variables.")
else:
    genai.configure(api_key=API_KEY)

# Generation Configuration
generation_config = {
    "temperature": 0.7,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 8192,
    "response_mime_type": "application/json",
}

# System Prompt
SYSTEM_PROMPT = """
You are an expert cognitive scientist, fact-checker, and critical thinking coach. 
Your goal is to analyze text for emotional intensity, logical fallacies, cognitive distortions, and potential misinformation.

Analyze the provided text and return a JSON object with the following structure:
{
  "misinformation_score": integer (0-100, where 0 is safe/credible and 100 is high risk/misinformation),
  "credibility_rating": string ("High", "Medium", "Low"),
  "emotional_intensity": string ("Low", "Medium", "High"),
  "summary": string (Brief objective summary of the content),
  "biases": [
    {
      "type": string (Name of the bias or fallacy, e.g., "Ad Hominem", "Confirmation Bias"),
      "text_snippet": string (The specific text that exhibits the bias),
      "explanation": string (Why this is a bias)
    }
  ],
  "recommendations": [
    string (Actionable advice for the user to verify or think critically about this content)
  ]
}

Scoring Logic Guide:
- Base Score: 0 (Safe)
- High Emotional Intensity: +15
- Logical Fallacies: +10 each
- Cognitive Distortions: +5 each
- Aggressive/Polarizing Language: +10
- Lack of Citations/Evidence for Claims: +10

Thresholds:
- 0-20: High Credibility (Green)
- 21-50: Medium Credibility (Yellow)
- 51+: Low Credibility / High Risk (Red)
"""

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

@app.route('/api/analyze', methods=['POST'])
def analyze_content():
    if not API_KEY:
        return jsonify({"error": "Server configuration error: API Key missing"}), 500

    data = request.json
    text_to_analyze = data.get('text', '')

    if not text_to_analyze:
        return jsonify({"error": "No text provided"}), 400

    try:
        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            generation_config=generation_config,
            system_instruction=SYSTEM_PROMPT
        )

        chat_session = model.start_chat(history=[])
        response = chat_session.send_message(text_to_analyze)
        
        # The response.text should be a JSON string due to response_mime_type config
        return response.text, 200, {'Content-Type': 'application/json'}

    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        return jsonify({"error": "Failed to analyze content", "details": str(e)}), 500

if __name__ == '__main__':
    print("Starting server on http://localhost:5000")
    app.run(debug=True, port=5000)
