import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.neural_network import MLPClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
import joblib
import os

MODEL_RF_PATH = "model_rf.joblib"
MODEL_LINEAR_PATH = "model_linear.joblib"
MODEL_NEURAL_PATH = "model_neural.joblib"
SCALER_PATH = "scaler.joblib"
ENCODERS_PATH = "encoders.joblib"
DATA_PATH = "data/loan_risk_prediction_dataset.csv"

# Updated features based on real dataset
NUMERICAL_FEATURES = ['Age', 'Income', 'LoanAmount', 'CreditScore', 'YearsExperience']
CATEGORICAL_FEATURES = ['Gender', 'Education', 'City', 'EmploymentType']
FEATURES = NUMERICAL_FEATURES + CATEGORICAL_FEATURES
TARGET = 'LoanApproved'

def preprocess_data(df):
    # 1. Fill missing numerical values with median
    for col in NUMERICAL_FEATURES:
        df[col] = pd.to_numeric(df[col], errors='coerce')
        df[col] = df[col].fillna(df[col].median())
    
    # 2. Fix negative LoanAmount
    df['LoanAmount'] = df['LoanAmount'].abs()
    
    # 3. Handle categorical missing values
    for col in CATEGORICAL_FEATURES:
        if col not in df.columns:
            df[col] = "Unknown"
        else:
            df[col] = df[col].fillna("Unknown").astype(str)
            df[col] = df[col].replace('', 'Unknown')

    # 4. Encoding
    encoders = {}
    for col in CATEGORICAL_FEATURES:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col])
        encoders[col] = le
        
    return df, encoders

def train_model():
    if not os.path.exists(DATA_PATH):
        print(f"Error: Dataset not found at {DATA_PATH}")
        return None

    print(f"Loading real dataset from {DATA_PATH}...")
    df = pd.read_csv(DATA_PATH)
    
    df, encoders = preprocess_data(df)
    
    X = df[FEATURES]
    y = df[TARGET]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # 1. Agent RF: Random Forest (Non-linear specialist)
    print("Training Agent RF (Random Forest)...")
    model_rf = RandomForestClassifier(n_estimators=100, random_state=42)
    model_rf.fit(X_train_scaled, y_train)
    
    # 2. Agent Linear: Logistic Regression (Transparency specialist)
    print("Training Agent Linear (Logistic Regression)...")
    model_linear = LogisticRegression(max_iter=1000, random_state=42)
    model_linear.fit(X_train_scaled, y_train)
    
    # 3. Agent Neural: MLP Neural Network (Complex patterns specialist)
    print("Training Agent Neural (Neural Network)...")
    model_neural = MLPClassifier(hidden_layer_sizes=(64, 32), max_iter=1000, random_state=42)
    model_neural.fit(X_train_scaled, y_train)
    
    # Save all agents
    joblib.dump(model_rf, MODEL_RF_PATH)
    joblib.dump(model_linear, MODEL_LINEAR_PATH)
    joblib.dump(model_neural, MODEL_NEURAL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    joblib.dump(encoders, ENCODERS_PATH)
    
    rf_acc = model_rf.score(X_test_scaled, y_test)
    linear_acc = model_linear.score(X_test_scaled, y_test)
    neural_acc = model_neural.score(X_test_scaled, y_test)
    
    print(f"RF Acc: {rf_acc:.4f}, Linear Acc: {linear_acc:.4f}, Neural Acc: {neural_acc:.4f}")
    return {"rf": rf_acc, "linear": linear_acc, "neural": neural_acc}

def load_all_agents():
    paths = [MODEL_RF_PATH, MODEL_LINEAR_PATH, MODEL_NEURAL_PATH, SCALER_PATH, ENCODERS_PATH]
    if not all(os.path.exists(p) for p in paths):
        train_model()
    
    return {
        "rf": joblib.load(MODEL_RF_PATH),
        "linear": joblib.load(MODEL_LINEAR_PATH),
        "neural": joblib.load(MODEL_NEURAL_PATH),
        "scaler": joblib.load(SCALER_PATH),
        "encoders": joblib.load(ENCODERS_PATH)
    }

if __name__ == "__main__":
    train_model()
