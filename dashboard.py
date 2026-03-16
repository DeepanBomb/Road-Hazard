import streamlit as st
import json
import pandas as pd

st.title("🚧 Road Hazard Monitoring Dashboard")

with open("dashboard_data.json") as f:
    data = json.load(f)

hazards = data["hazards"]
df = pd.DataFrame(hazards)

st.subheader("Key Insights")

col1, col2 = st.columns(2)

col1.metric("Total Potholes Detected", data["total_potholes"])
col2.metric("Total Estimated Repair Cost", f"₹{data['total_repair_cost']}")

st.subheader("Severity Distribution")

severity_counts = df["severity"].value_counts()
st.bar_chart(severity_counts)

st.subheader("Detected Hazards Table")

st.dataframe(df)