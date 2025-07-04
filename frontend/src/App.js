import React, { useState } from "react";
import "./App.css";

function App() {
  const [features, setFeatures] = useState(Array(7).fill(""));
  const [errors, setErrors] = useState(Array(7).fill(""));
  const [result, setResult] = useState(null);
  const [apiError, setApiError] = useState("");

  const fieldLabels = [
    "Age",
    "Income",
    "Children",
    "Married (1 = Married/Together, 0 = Other)",
    "Homeowner (1 = Yes, 0 = No)",
    "Campaign Contacts",
    "Recency Score (0.0 - 1.0)",
  ];

  const validateField = (index, value) => {
    const num = Number(value);
    let message = "";

    switch (index) {
      case 0: // Age
        if (isNaN(num) || num < 18 || num > 100) message = "Age must be 18–100";
        break;
      case 1: // Income
        if (isNaN(num) || num <= 0) message = "Income must be > 0";
        break;
      case 2: // Children
        if (isNaN(num) || num < 0) message = "Children must be ≥ 0";
        break;
      case 3: // Married
      case 4: // Homeowner
        if (!(num === 0 || num === 1)) message = "Must be 0 or 1";
        break;
      case 5: // Campaign Contacts
        if (isNaN(num) || num < 0 || !Number.isInteger(num))
          message = "Contacts must be a whole number ≥ 0";
        break;
      case 6: // Recency Score
        if (isNaN(num) || num < 0 || num > 1)
          message = "Recency Score must be between 0.0 and 1.0";
        break;
      default:
        break;
    }

    return message;
  };

  const handleInputChange = (index, value) => {
    const updated = [...features];
    updated[index] = value;
    setFeatures(updated);

    const errorMsg = validateField(index, value);
    const updatedErrors = [...errors];
    updatedErrors[index] = errorMsg;
    setErrors(updatedErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const featureArray = features.map(Number);

    const validationErrors = features.map((value, i) =>
      validateField(i, value)
    );

    if (validationErrors.some((msg) => msg)) {
      setErrors(validationErrors);
      setApiError("Please correct validation errors.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ features: featureArray }),
      });

      const data = await res.json();

      if (res.ok) {
        setResult(data);
        setApiError("");
      } else {
        setApiError(data.error || "Something went wrong.");
        setResult(null);
      }
    } catch (err) {
      setApiError("API connection failed.");
      setResult(null);
    }
  };

  return (
    <div className="App">
      <h1>Marketing Campaign Predictor</h1>
      <form onSubmit={handleSubmit} className="form">
        {features.map((value, index) => (
          <div key={index} className="input-group">
            <label>{fieldLabels[index]}:</label>
            <input
              type="number"
              step="any"
              placeholder={`Enter ${fieldLabels[index]}`}
              value={value}
              onChange={(e) => handleInputChange(index, e.target.value)}
              required
            />
            {errors[index] && <span className="error">{errors[index]}</span>}
          </div>
        ))}
        <button type="submit">Predict</button>
      </form>

      {apiError && <p className="error">{apiError}</p>}

      {result && (
        <div className="result">
          <h2>Result:</h2>
          <p>
            <strong>Prediction:</strong>{" "}
            {result.prediction === 1
              ? "✅ Likely to Respond"
              : "❌ Unlikely to Respond"}
          </p>
          <p>
            <strong>Probability:</strong>{" "}
            {Math.round(result.probability * 100)}%
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
