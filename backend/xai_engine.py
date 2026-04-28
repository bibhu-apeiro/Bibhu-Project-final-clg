from model_engine import load_all_agents, FEATURES
import shap
import pandas as pd
import numpy as np

def get_explanations(input_encoded_list):
    """
    input_encoded_list: list of encoded values corresponding to FEATURES
    Using the lead Agent (Random Forest) for SHAP explanations.
    """
    agents = load_all_agents()
    model = agents['rf']
    scaler = agents['scaler']
    
    # Scale input
    input_df = pd.DataFrame([input_encoded_list], columns=FEATURES)
    input_scaled = scaler.transform(input_df)
    
    # SHAP Explainer
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(input_scaled)
    
    # Class 1 (Approved)
    if isinstance(shap_values, list):
        class_1_shap = shap_values[1][0].tolist()
    else:
        if len(shap_values.shape) == 3:
            class_1_shap = shap_values[0, :, 1].tolist()
        else:
            class_1_shap = shap_values[0].tolist()

    # Format output for frontend visualization
    explanations = []
    for feature, val in zip(FEATURES, class_1_shap):
        explanations.append({
            "feature": feature,
            "impact": float(val)
        })
    
    # Base value
    if hasattr(explainer, "expected_value"):
        if isinstance(explainer.expected_value, (list, np.ndarray)):
            base_value = float(explainer.expected_value[1])
        else:
            base_value = float(explainer.expected_value)
    else:
        base_value = 0.5
        
    return {
        "base_value": base_value,
        "features": explanations
    }

def get_robustness_score(input_raw_dict):
    """
    Simulate an 'AI Red Team' attack by perturbing numerical inputs.
    Returns a score from 0-100 indicating stability.
    """
    agents = load_all_agents()
    model = agents['rf']
    scaler = agents['scaler']
    encoders = agents['encoders']
    
    def get_prob(current_dict):
        df = pd.DataFrame([current_dict])
        for col, le in encoders.items():
            if current_dict[col] not in le.classes_:
                fallback = le.classes_[0]
                df[col] = le.transform([fallback])
            else:
                df[col] = le.transform([current_dict[col]])
        input_scaled = scaler.transform(df[FEATURES])
        return float(model.predict_proba(input_scaled)[0][1])

    original_prob = get_prob(input_raw_dict)
    deviations = []
    
    # Perturb numerical features by +/- 5%
    for feat in ['CreditScore', 'Income', 'LoanAmount']:
        for direction in [0.95, 1.05]:
            temp_profile = input_raw_dict.copy()
            temp_profile[feat] *= direction
            new_prob = get_prob(temp_profile)
            deviations.append(abs(new_prob - original_prob))
    
    # Average deviation determines instability
    avg_dev = np.mean(deviations) if deviations else 0
    stability = max(0, 100 - (avg_dev * 200)) # Scale: 0.5 dev = 0 stability
    return round(stability, 1)

def generate_advanced_analytics(input_raw_dict):
    """
    Generate counterfactuals and sensitivity matrix for the current profile.
    """
    agents = load_all_agents()
    model = agents['rf']
    scaler = agents['scaler']
    encoders = agents['encoders']
    
    def get_prob(current_dict):
        df = pd.DataFrame([current_dict])
        for col, le in encoders.items():
            if current_dict[col] not in le.classes_:
                fallback = le.classes_[0]
                df[col] = le.transform([fallback])
            else:
                df[col] = le.transform([current_dict[col]])
        input_data = df[FEATURES]
        input_scaled = scaler.transform(input_data)
        return float(model.predict_proba(input_scaled)[0][1])

    # 1. Counterfactuals (Path to Approval)
    target_prob = 0.6
    current_prob = get_prob(input_raw_dict)
    counterfactuals = []

    if current_prob < target_prob:
        features_to_try = ['CreditScore', 'Income', 'LoanAmount']
        adjusted_profile = input_raw_dict.copy()
        
        for feat in features_to_try:
            temp_profile = adjusted_profile.copy()
            for step in range(1, 11):
                if feat == 'LoanAmount':
                    temp_profile[feat] = max(0, input_raw_dict[feat] * (1 - step * 0.05))
                elif feat == 'Income':
                    temp_profile[feat] = input_raw_dict[feat] * (1 + step * 0.05)
                elif feat == 'CreditScore':
                    temp_profile[feat] = min(850, input_raw_dict[feat] + step * 15)
                
                new_prob = get_prob(temp_profile)
                if new_prob >= target_prob or step == 10:
                    counterfactuals.append({
                        "feature": feat,
                        "original": input_raw_dict[feat],
                        "target": temp_profile[feat],
                        "prob_reached": new_prob
                    })
                    if new_prob >= target_prob:
                        adjusted_profile = temp_profile.copy()
                        break

    # 2. Risk Sensitivity Matrix
    sensitivity_data = []
    x_feat, y_feat = 'CreditScore', 'Income'
    x_range = np.linspace(300, 850, 10)
    y_range = np.linspace(max(10000, input_raw_dict[y_feat] * 0.5), input_raw_dict[y_feat] * 2, 10)
    
    for y_val in y_range:
        row = []
        for x_val in x_range:
            temp_profile = input_raw_dict.copy()
            temp_profile[x_feat] = float(x_val)
            temp_profile[y_feat] = float(y_val)
            row.append({
                "x": float(x_val), "y": float(y_val), "prob": get_prob(temp_profile)
            })
        sensitivity_data.append(row)

    return {
        "counterfactuals": counterfactuals,
        "sensitivity_matrix": sensitivity_data,
        "features": {"x": x_feat, "y": y_feat}
    }
