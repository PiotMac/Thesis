# Project Overview

This project consists of a full-stack application with three main components: a frontend, a backend server, and an anomaly detection logic module. The application is structured into three folders, each responsible for a distinct functionality:

- **Frontend**: Implements the user interface using React.js.
- **Server**: Handles database-related requests (except for Deliveries) using Node.js and Express.
- **Analysis**: Contains the anomaly detection logic and processes Deliveries-related requests, implemented with Python and FastAPI.

## Script: `run.sh`

The project includes a script, `run.sh`, which sets up and runs the entire application. This script automatically opens three terminals, each running a specific component:

1. **Frontend**: Runs on port `3000`.
2. **Backend**: Runs on port `4000`.
3. **Anomaly Detection Logic**: Runs on port `8000`.

Use command './run.sh to start the programs.

## Folder Structure

### `frontend/`
This folder contains all the frontend implementation using React.js. It handles the user interface and sends requests to the backend server for database interactions.

### `server/`
This folder contains the backend server implemented with Node.js and Express. It processes all database-related requests except for Deliveries.

### `analysis/`
This folder contains the logic for anomaly detection, implemented with Python and FastAPI. It also handles Deliveries-related requests, integrating them with the anomaly detection functionality.
