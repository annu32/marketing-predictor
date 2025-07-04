from flask import Flask, request, jsonify
from flask_cors import CORS  # 🔹 Add this line
import joblib
import numpy as np

app = Flask(__name__)
CORS(app)  # 🔹 Enable CORS support here

# Load model and scaler
model = joblib.load('marketing_campaign_model.pkl')
scaler = joblib.load('feature_scaler.pkl')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    try:
        features = np.array(data['features']).reshape(1, -1)
        scaled = scaler.transform(features)
        prediction = model.predict(scaled)[0]
        proba = model.predict_proba(scaled)[0][1]
        return jsonify({
            'prediction': int(prediction),
            'probability': round(float(proba), 4)
        })
    except Exception as e:
        return jsonify({'error': str(e)})

# Optional welcome route for browser testing
@app.route('/', methods=['GET'])
def home():
    return jsonify({'message': 'Welcome to the Marketing Campaign Predictor API'})

if __name__ == '__main__':
    app.run(debug=True)
