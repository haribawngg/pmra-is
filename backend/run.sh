#!/bin/bash
# Script khởi động backend với virtual environment
cd "$(dirname "$0")"
/home/hanh/hackathon/.venv/bin/uvicorn main:app --reload --port 8000
