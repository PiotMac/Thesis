#!/bin/bash

cd frontend
gnome-terminal -- bash -c "npm start; exec bash"
cd ../server
gnome-terminal -- bash -c "npm start; exec bash"
# cd ../analysis
# gnome-terminal -- bash -c "npm start; exec bash"
