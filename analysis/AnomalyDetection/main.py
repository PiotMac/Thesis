from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv
import os
import pandas as pd
# Initialize FastAPI app
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()


def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host=os.getenv("DB_HOST"),
            port=os.getenv("DB_PORT"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME"),
        )
        if connection.is_connected():
            return connection
    except Error as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Database connection failed")


@app.on_event("startup")
async def startup_event():
    try:
        connection = get_db_connection()
        connection.close()
        print(f"Connected to database!")
    except Error as e:
        print(f"Error during startup: {e}")


def get_connection():
    connection = get_db_connection()
    try:
        yield connection
    finally:
        connection.close()

@app.get("/price_per_unit")
def get_price_per_unit(product_id: int, start_date: str, end_date: str):
    connection = get_db_connection()
    query = f"""
        SELECT d.delivery_date, (d.delivery_price / d.quantity) AS price_per_unit
        FROM Deliveries d
        JOIN Inventory i ON d.inventory_id = i.id
        WHERE i.product_id = %s
        AND d.delivery_date BETWEEN %s AND %s
        ORDER BY d.delivery_date;
    """
    df = pd.read_sql(query, connection, params=(product_id, start_date, end_date))
    connection.close()
    return df.to_dict(orient="records")

@app.get("/average_quantity")
def get_average_quantity(product_id: int, start_date: str, end_date: str):
    connection = get_db_connection()
    query = f"""
        SELECT d.delivery_date, AVG(d.quantity) AS avg_quantity
        FROM Deliveries d
        JOIN Inventory i ON d.inventory_id = i.id
        WHERE i.product_id = %s
        AND d.delivery_date BETWEEN %s AND %s
        GROUP BY d.delivery_date
        ORDER BY d.delivery_date;
    """
    df = pd.read_sql(query, connection, params=(product_id, start_date, end_date))
    connection.close()
    return df.to_dict(orient="records")
