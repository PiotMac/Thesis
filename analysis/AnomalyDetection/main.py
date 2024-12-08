from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv
from anomaly_algorithms import analyze_kmeans, analyze_dbscan, analyze_isolation_forest, analyze_zscore, analyze_iqr
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
        SELECT d.delivery_date, AVG(d.delivery_price / d.quantity) AS price_per_unit
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


# Endpoint to fetch flagged deliveries
@app.get("/flagged-deliveries")
def get_flagged_deliveries():
    connection = get_db_connection()
    query = """
        SELECT 
            d.delivery_id, 
            d.inventory_id, 
            d.delivery_date, 
            d.delivery_price, 
            d.quantity, 
            d.status, 
            i.product_id, 
            p.name AS product_name
        FROM Deliveries d
        JOIN Inventory i ON d.inventory_id = i.id
        JOIN Products p ON i.product_id = p.product_id
        WHERE d.status = 'flagged'
        ORDER BY d.delivery_date DESC;
    """
    df = pd.read_sql(query, connection)
    connection.close()
    return df.to_dict(orient="records")

# Endpoint to approve a delivery
@app.post("/approve_delivery/{delivery_id}")
def approve_delivery(delivery_id: int):
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute("UPDATE Deliveries SET status = 'approved' WHERE delivery_id = %s", (delivery_id,))
    connection.commit()
    cursor.close()
    connection.close()
    return {"message": f"Delivery {delivery_id} approved successfully"}

# Endpoint to reject a delivery
@app.post("/reject_delivery/{delivery_id}")
def reject_delivery(delivery_id: int):
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute("UPDATE Deliveries SET status = 'rejected' WHERE delivery_id = %s", (delivery_id,))
    connection.commit()
    cursor.close()
    connection.close()
    return {"message": f"Delivery {delivery_id} rejected successfully"}


@app.get("/kmeans_analysis")
def get_kmeans_analysis(product_id: int, start_date: str, end_date: str):
    connection = get_db_connection()
    query = f"""
            SELECT
    --             d.delivery_id,
    --             d.inventory_id,
                d.delivery_date,
                d.delivery_price / d.quantity AS price_per_unit,
                d.quantity as avg_quantity
            FROM
                Deliveries d
            JOIN
                Inventory i ON d.inventory_id = i.id
            WHERE
                i.product_id = %s
                AND d.delivery_date BETWEEN %s AND %s
            ORDER BY
                d.delivery_date;
        """
    df = pd.read_sql(query, connection, params=(product_id, start_date, end_date))
    connection.close()
    analyze_kmeans(df)
    return df.to_dict(orient="records")

@app.get("/dbscan_analysis")
def get_dbscan_analysis(product_id: int, start_date: str, end_date: str):
    connection = get_db_connection()
    query = f"""
            SELECT
    --             d.delivery_id,
    --             d.inventory_id,
                d.delivery_date,
                d.delivery_price / d.quantity AS price_per_unit,
                d.quantity as avg_quantity
            FROM
                Deliveries d
            JOIN
                Inventory i ON d.inventory_id = i.id
            WHERE
                i.product_id = %s
                AND d.delivery_date BETWEEN %s AND %s
            ORDER BY
                d.delivery_date;
        """
    df = pd.read_sql(query, connection, params=(product_id, start_date, end_date))
    connection.close()
    analyze_dbscan(product_id, df)
    return df.to_dict(orient="records")


@app.get("/isolation_forest_analysis")
def get_isolation_forest_analysis(product_id: int, start_date: str, end_date: str):
    connection = get_db_connection()
    query = f"""
            SELECT
    --             d.delivery_id,
    --             d.inventory_id,
                d.delivery_date,
                d.delivery_price / d.quantity AS price_per_unit,
                d.quantity as avg_quantity
            FROM
                Deliveries d
            JOIN
                Inventory i ON d.inventory_id = i.id
            WHERE
                i.product_id = %s
                AND d.delivery_date BETWEEN %s AND %s
            ORDER BY
                d.delivery_date;
        """
    df = pd.read_sql(query, connection, params=(product_id, start_date, end_date))
    connection.close()
    analyze_isolation_forest(product_id, df)
    return df.to_dict(orient="records")


@app.get("/zscore_analysis")
def get_zscore_analysis(product_id: int, start_date: str, end_date: str):
    connection = get_db_connection()
    query = f"""
                SELECT
        --             d.delivery_id,
        --             d.inventory_id,
                    d.delivery_date,
                    d.delivery_price / d.quantity AS price_per_unit,
                    d.quantity as avg_quantity
                FROM
                    Deliveries d
                JOIN
                    Inventory i ON d.inventory_id = i.id
                WHERE
                    i.product_id = %s
                    AND d.delivery_date BETWEEN %s AND %s
                ORDER BY
                    d.delivery_date;
            """
    df = pd.read_sql(query, connection, params=(product_id, start_date, end_date))
    connection.close()
    analyze_zscore(product_id, df)
    return df.to_dict(orient="records")


@app.get("/iqr_analysis")
def get_zscore_analysis(product_id: int, start_date: str, end_date: str):
    connection = get_db_connection()
    query = f"""
                SELECT
        --             d.delivery_id,
        --             d.inventory_id,
                    d.delivery_date,
                    d.delivery_price / d.quantity AS price_per_unit,
                    d.quantity as avg_quantity
                FROM
                    Deliveries d
                JOIN
                    Inventory i ON d.inventory_id = i.id
                WHERE
                    i.product_id = %s
                    AND d.delivery_date BETWEEN %s AND %s
                ORDER BY
                    d.delivery_date;
            """
    df = pd.read_sql(query, connection, params=(product_id, start_date, end_date))
    connection.close()
    analyze_iqr(product_id, df)
    return df.to_dict(orient="records")
