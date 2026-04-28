# Explainable AI Framework for Credit Risk Prediction Using Ensemble Learning

![Project Status](https://img.shields.io/badge/Status-Completed-success)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

This research-grade framework predicts credit risk using an **Ensemble Learning (Random Forest)** model and provides transparent, human-readable insights through **Explainable AI (SHAP)**. Built for 8th-semester engineering evaluation, it handles real-world loan datasets and features a high-end interactive dashboard for simulation and analysis.

---

## 🌟 Key Features

### 1. Advanced Machine Learning
- **Ensemble Engine**: Utilizes a Random Forest Ensemble model trained on 5,000+ real-world loan applications.
- **High Accuracy**: Verified 96.5% predictive accuracy on the provided test dataset.
- **Categorical Intelligence**: Integrated Label Encoding for features like Education, Employment Type, and City.

### 2. Explainable AI (XAI) Suite
- **SHAP Integration**: Every decision is backed by mathematical feature attribution (SHAP values).
- **AI Smart-Summary**: A Natural Language Generation (NLG) engine translates charts into professional prose.
- **Mitigation Advisor**: Automatically identifies risk factors and provides actionable tips for loan approval improvement.

### 3. What-If Simulation Sandbox
- **Interactive Sandbox**: Toggle credit scores, income, and loan amounts to see live updates.
- **Real-Time Delta Tracking**: Watch the Approval Probability change instantly as you simulate different scenarios.

---

## 🛠️ Technology Stack

| Component | Technology |
| :--- | :--- |
| **Backend** | Python, FastAPI, Uvicorn |
| **ML/XAI** | Scikit-Learn, SHAP, Pandas, NumPy |
| **Frontend** | React, Vite, Tailwind CSS, Lucide-React |
| **Visuals** | Recharts (Responsive Charts) |
| **Deployment** | Docker & Docker Compose |

---

## 🚀 Getting Started

### Prerequisites
- [Docker](https://www.docker.com/products/docker-desktop/) installed on your machine.

### Installation & Execution
1. **Clone the Repository**:
   ```bash
   git clone git@github.com:bibhu-apeiro/Explainable-AI-Framework-for-Credit-Risk-Prediction-.git
   cd Explainable-AI-Framework-for-Credit-Risk-Prediction-
   ```

2. **Launch with Docker**:
   ```bash
   docker-compose up --build -d
   ```

3. **Access the Dashboard**:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:8000](http://localhost:8000)

---

## 📊 Usage Guide
1. **Dossier Entry**: Fill in the applicant's financial details (Age, Income, Credit Score, etc.).
2. **Analysis**: Click **"Analyze Application"** to generate the AI assessment.
3. **Interpret**: Read the **AI Executive Summary** and view the **SHAP Chart** to understand the decision.
4. **Simulate**: Click **"Enable Sandbox"** to enter What-If mode and adjust values to see potential outcomes.

---

## 📂 Project Structure
```text
├── backend/
│   ├── data/               # Project Dataset (CSV)
│   ├── model_engine.py    # Training & Persistence
│   ├── xai_engine.py      # SHAP Explainability Logic
│   ├── insights_engine.py # NLG Summary & Advisory Logic
│   └── main.py            # FastAPI REST Endpoints
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI (Typewriter, etc.)
│   │   └── App.jsx        # Main Dashboard UI
│   └── Dockerfile         # Nginx Multi-stage config
└── docker-compose.yml     # Container Orchestration
```

---

## 🎓 Author
**BIBHU PRASAD SAHOO**  
*8th Semester Research Project*

---
## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
