import pandas as pd
import numpy as np
import os

# Set seed for reproducibility
np.random.seed(42)

# Configuration
n_samples = 2000
output_path = "backend/data/loan_risk_prediction_dataset.csv"

# Generate features
data = {
    'Age': np.random.randint(22, 65, n_samples),
    'Income': np.random.randint(30000, 150000, n_samples),
    'LoanAmount': np.random.randint(5000, 80000, n_samples),
    'CreditScore': np.random.randint(400, 850, n_samples),
    'YearsExperience': np.random.randint(1, 40, n_samples),
    'Gender': np.random.choice(['Male', 'Female'], n_samples),
    'Education': np.random.choice(['High School', 'Bachelors', 'Masters', 'PhD'], n_samples),
    'City': np.random.choice(['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'], n_samples),
    'EmploymentType': np.random.choice(['Salaried', 'Self-Employed', 'Unemployed'], n_samples)
}

df = pd.DataFrame(data)

# Heuristic logic for LoanApproved (Target)
# High CreditScore + High Income relative to LoanAmount = Approval
def determine_approval(row):
    score = 0
    if row['CreditScore'] > 700: score += 4
    elif row['CreditScore'] > 600: score += 2
    
    if row['Income'] > row['LoanAmount'] * 2: score += 3
    elif row['Income'] > row['LoanAmount']: score += 1
    
    if row['YearsExperience'] > 5: score += 1
    
    if row['EmploymentType'] == 'Salaried': score += 1
    elif row['EmploymentType'] == 'Unemployed': score -= 3
    
    # Add some randomness
    score += np.random.normal(0, 1)
    
    return 1 if score > 3 else 0

df['LoanApproved'] = df.apply(determine_approval, axis=1)

# Ensure directory exists
os.makedirs(os.path.dirname(output_path), exist_ok=True)

# Save to CSV
df.to_csv(output_path, index=False)

print(f"Generated synthetic dataset with {n_samples} samples at {output_path}")
print(df.head())
print(f"Approval rate: {df['LoanApproved'].mean():.2%}")
