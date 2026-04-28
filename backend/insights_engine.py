import numpy as np

def generate_ai_insights(prediction, probability, shap_features, raw_data=None):
    """
    prediction: "Approved" or "Rejected"
    probability: float
    shap_features: list of dicts {feature: str, impact: float}
    raw_data: dict of raw input features
    """
    # Sort features by absolute impact
    sorted_features = sorted(shap_features, key=lambda x: abs(x['impact']), reverse=True)
    
    top_pos = [f for f in sorted_features if f['impact'] > 0][:2]
    top_neg = [f for f in sorted_features if f['impact'] < 0][:2]
    
    # 1. Generate Summary
    if prediction == "Approved":
        summary = f"Your application was approved with {probability*100:.1f}% confidence. "
        if top_pos:
            features_text = " and ".join([f['feature'].replace('_', ' ') for f in top_pos])
            summary += f"The primary drivers for this decision were your strong {features_text}. "
        summary += "While there are minor risk factors, your overall financial profile meets our lending criteria."
    else:
        summary = f"Unfortunately, the AI model has flagged this application as High Risk ({ (1-probability)*100:.1f}% risk score). "
        if top_neg:
            features_text = " and ".join([f['feature'].replace('_', ' ') for f in top_neg])
            summary += f"This decision was most heavily influenced by your {features_text}. "
        summary += "The model suggests that specific areas of your profile do not align with our current risk tolerance levels."

    # 1b. Add Rule-Based SBI Special Eligibility
    if raw_data:
        credit_score = raw_data.get('CreditScore', 0)
        income = raw_data.get('Income', 0)
        if 300 <= credit_score <= 400 and income >= 300000:
            summary += " [SPECIAL ELIGIBILITY]: Despite the standard model consensus, you meet SBI's criteria for a Special Credit Line up to ₹1,00,000 based on your high income."

    # 2. Generate Mitigation Tips
    mitigation_tips = []
    
    # Map features to specific advice
    advice_map = {
        'CreditScore': "Focus on improving your credit score by at least {target} points through consistent on-time payments.",
        'Income': "A higher verifiable income or a secondary income source would significantly improve your approval probability.",
        'LoanAmount': "Consider requesting a smaller loan amount (at least {target}% lower) to better align with your debt-to-income profile.",
        'YearsExperience': "Additional years of employment in your current field will demonstrate better financial stability.",
        'EmploymentType': "A Salaried employment status is generally viewed as more stable than Unemployed or Self-Employed categories.",
        'Education': "Advancing your education level (e.g., from High School to Bachelors) is statistically linked to lower default rates in our dataset."
    }

    if prediction == "Rejected":
        for f in top_neg:
            feat = f['feature']
            if feat in advice_map:
                # Custom target logic (simplified)
                target = "15-20"
                if feat == 'CreditScore': target = "30"
                if feat == 'LoanAmount': target = "20"
                
                mitigation_tips.append(advice_map[feat].format(target=target))
        
        if not mitigation_tips:
            mitigation_tips.append("Review your overall financial history and consider applying again after 6 months of stable financial activity.")
    else:
        mitigation_tips.append("Maintaining your current financial habits will help ensure future credit approvals.")
        mitigation_tips.append("Ensure any new debt is managed carefully to keep your credit score in the optimal range.")

    return {
        "summary": summary,
        "mitigation_tips": mitigation_tips,
        "top_drivers": [f['feature'] for f in sorted_features[:3]]
    }
