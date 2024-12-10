#!/bin/bash

cd frontend
gnome-terminal -- bash -c "npm start; exec bash"
cd ../server
gnome-terminal -- bash -c "npm start; exec bash"
cd ../analysis/AnomalyDetection
source .venv/bin/activate
gnome-terminal -- bash -c "uvicorn main:app --reload; exec bash"
