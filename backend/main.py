from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import pandas as pd
from model_engine import load_all_agents, FEATURES, train_model
from xai_engine import get_explanations, get_robustness_score
from insights_engine import generate_ai_insights
from report_engine import generate_credit_report
import uvicorn

app = FastAPI(title="Explainable AI Credit Risk API (Ensemble Suite)")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CreditApplication(BaseModel):
    Age: int
    Income: float
    LoanAmount: float
    CreditScore: int
    YearsExperience: int
    Gender: str
    Education: str
    City: str
    EmploymentType: str

@app.on_event("startup")
async def startup_event():
    load_all_agents()

@app.get("/")
def read_root():
    return {"message": "XAI Ensemble Credit Risk API is running"}

@app.post("/predict")
async def predict(data: CreditApplication):
    try:
        agents = load_all_agents()
        model_rf = agents['rf']
        model_linear = agents['linear']
        model_neural = agents['neural']
        scaler = agents['scaler']
        encoders = agents['encoders']
        
        raw_data = {
            'Age': data.Age, 'Income': data.Income, 'LoanAmount': data.LoanAmount,
            'CreditScore': data.CreditScore, 'YearsExperience': data.YearsExperience,
            'Gender': data.Gender, 'Education': data.Education, 'City': data.City,
            'EmploymentType': data.EmploymentType
        }
        
        input_df = pd.DataFrame([raw_data])
        for col, le in encoders.items():
            fallback = le.classes_[0]
            val = raw_data[col] if raw_data[col] in le.classes_ else fallback
            input_df[col] = le.transform([val])
        
        input_data = input_df[FEATURES]
        input_scaled = scaler.transform(input_data)
        
        # 1. Gather votes from all agents
        prob_rf = float(model_rf.predict_proba(input_scaled)[0][1])
        prob_linear = float(model_linear.predict_proba(input_scaled)[0][1])
        prob_neural = float(model_neural.predict_proba(input_scaled)[0][1])
        
        # 2. Calculate Consensus (Weighted average could be used, here simple mean)
        consensus_prob = (prob_rf + prob_linear + prob_neural) / 3
        certainty = 1 - np.std([prob_rf, prob_linear, prob_neural])
        
        prediction_str = "Approved" if consensus_prob >= 0.5 else "Rejected"
        
        # 3. Agent Votes for UI
        agent_votes = [
            {"name": "Agent RF (Ensemble)", "prob": prob_rf, "vote": "Approve" if prob_rf >= 0.5 else "Reject"},
            {"name": "Agent Linear (Stat)", "prob": prob_linear, "vote": "Approve" if prob_linear >= 0.5 else "Reject"},
            {"name": "Agent Neural (Deep)", "prob": prob_neural, "vote": "Approve" if prob_neural >= 0.5 else "Reject"}
        ]
        
        # Explanation (using Lead Agent RF)
        encoded_list = input_data.values[0].tolist()
        explanation = get_explanations(encoded_list)
        
        # AI Insights (Passing raw_data for rule-based checks)
        ai_insights = generate_ai_insights(prediction_str, consensus_prob, explanation['features'], raw_data)
        
        # Advanced Analytics & Robustness
        from xai_engine import generate_advanced_analytics
        advanced_analytics = generate_advanced_analytics(raw_data)
        robustness_score = get_robustness_score(raw_data)
        
        return {
            "approval_probability": consensus_prob,
            "prediction": prediction_str,
            "certainty_index": float(certainty),
            "agent_votes": agent_votes,
            "explanation": explanation,
            "ai_insights": ai_insights,
            "advanced_analytics": advanced_analytics,
            "robustness_score": robustness_score
        }
    except Exception as e:
        print(f"Prediction Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/retrain")
async def retrain():
    accuracy = train_model()
    return {"message": "Model retrained successfully", "accuracy": accuracy}

@app.post("/generate-report")
async def generate_report(data: dict):
    try:
        applicant_data = data.get("applicant_data", {})
        prediction_result = data.get("prediction_result", {})

        if not applicant_data or not prediction_result:
            raise HTTPException(status_code=400, detail="Both applicant_data and prediction_result are required")

        pdf_buffer = generate_credit_report(applicant_data, prediction_result)

        from datetime import datetime
        filename = f"Credit_Report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"

        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Report Generation Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
