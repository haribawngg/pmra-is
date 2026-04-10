# -*- coding: utf-8 -*-
"""
Script huấn luyện 2 mô hình ML và xuất file .pkl
Chạy: python train_models.py
"""

import pandas as pd
import numpy as np
import pickle
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

os.makedirs(MODELS_DIR, exist_ok=True)


def save_pkl(obj, filename):
    path = os.path.join(MODELS_DIR, filename)
    with open(path, "wb") as f:
        pickle.dump(obj, f)
    print(f"  ✅ Saved: {path}")


# ========================================================================
# 1. MÔ HÌNH TIỂU ĐƯỜNG (Diabetes) — RandomForest + StandardScaler
# ========================================================================
def train_diabetes():
    print("\n" + "=" * 60)
    print("  TRAINING: Tiểu đường (Diabetes)")
    print("=" * 60)

    df = pd.read_csv(os.path.join(DATA_DIR, "tieuduong.csv"))
    print(f"  Data shape: {df.shape}")

    # Xóa cột Pregnancies theo yêu cầu
    if "Pregnancies" in df.columns:
        df = df.drop("Pregnancies", axis=1)
        print("  Dropped column: Pregnancies")

    # Thay 0 bằng median cho các cột sinh lý
    features_with_zero = ["Glucose", "BloodPressure", "SkinThickness", "Insulin", "BMI"]
    df[features_with_zero] = df[features_with_zero].replace(0, np.nan)
    for col in features_with_zero:
        df[col] = df[col].fillna(df[col].median())

    # Tách X, y
    X = df.drop("Outcome", axis=1)
    y = df["Outcome"]

    # Train/Test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Standard Scaling
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Train model
    model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
    model.fit(X_train_scaled, y_train)

    # Evaluate
    y_pred = model.predict(X_test_scaled)
    print(f"\n  Accuracy : {accuracy_score(y_test, y_pred):.4f}")
    print(f"  Precision: {precision_score(y_test, y_pred):.4f}")
    print(f"  Recall   : {recall_score(y_test, y_pred):.4f}")
    print(f"  F1-Score : {f1_score(y_test, y_pred):.4f}")
    print(f"\n  Features: {list(X.columns)}")

    # Save
    save_pkl(model, "diabetes_model.pkl")
    save_pkl(scaler, "diabetes_scaler.pkl")

    return model, scaler


# ========================================================================
# 2. MÔ HÌNH THIẾU MÁU (Anemia) — RandomForest + MinMaxScaler
# ========================================================================
def train_anemia():
    print("\n" + "=" * 60)
    print("  TRAINING: Thiếu máu (Anemia)")
    print("=" * 60)

    df = pd.read_csv(os.path.join(DATA_DIR, "anemia.csv"))
    print(f"  Data shape: {df.shape}")

    # Features & target
    X = df[["Gender", "Hemoglobin", "MCH", "MCHC", "MCV"]]
    y = df["Result"]

    # Train/Test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # MinMax Scaling
    scaler = MinMaxScaler(feature_range=(0, 1))
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Train model
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train_scaled, y_train)

    # Evaluate
    y_pred = model.predict(X_test_scaled)
    print(f"\n  Accuracy : {accuracy_score(y_test, y_pred):.4f}")
    print(f"  Precision: {precision_score(y_test, y_pred):.4f}")
    print(f"  Recall   : {recall_score(y_test, y_pred):.4f}")
    print(f"  F1-Score : {f1_score(y_test, y_pred):.4f}")
    print(f"\n  Features: {list(X.columns)}")

    # Save
    save_pkl(model, "anemia_model.pkl")
    save_pkl(scaler, "anemia_scaler.pkl")

    return model, scaler


if __name__ == "__main__":
    print("🚀 Bắt đầu huấn luyện mô hình...")
    train_diabetes()
    train_anemia()
    print("\n" + "=" * 60)
    print("  ✅ HOÀN TẤT — Tất cả models đã được lưu vào thư mục models/")
    print("=" * 60)
