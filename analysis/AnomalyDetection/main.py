from typing import List
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv
from starlette.responses import JSONResponse

from anomaly_algorithms import (analyze_dbscan_product, analyze_isolation_forest_product,
                                analyze_zscore_product, analyze_iqr_product, analyze_kmeans_product,
                                evaluate_algorithms_on_product_data)
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
        AND d.status = 'approved'
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
        AND d.status = 'approved'
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
@app.post("/approve_delivery")
def approve_delivery(delivery_id: int):
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute("UPDATE Deliveries SET status = 'approved' WHERE delivery_id = %s", (delivery_id,))
    connection.commit()
    cursor.close()
    connection.close()
    return {"message": f"Delivery {delivery_id} approved successfully"}

# Endpoint to reject a delivery
@app.post("/reject_delivery")
def reject_delivery(delivery_id: int):
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute("UPDATE Deliveries SET status = 'rejected' WHERE delivery_id = %s", (delivery_id,))
    connection.commit()
    cursor.close()
    connection.close()
    return {"message": f"Delivery {delivery_id} rejected successfully"}


# Endpoint to receive all pending deliveries
@app.get("/pending_deliveries")
def get_pending_deliveries():
    connection = get_db_connection()
    query = """
            SELECT d.*, i.product_id
            FROM Deliveries d
            JOIN Inventory i ON d.inventory_id = i.id
            WHERE d.status = 'pending'
            ORDER BY d.delivery_date;
        """
    df = pd.read_sql(query, connection)
    connection.close()
    return df.to_dict(orient="records")

# Endpoint to receive all product's inventory
@app.get("/inventory")
def get_inventory(product_id: int):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    print(product_id)

    query = """
            SELECT 
                i.product_id,
                c.red, c.green, c.blue, 
                s.name AS size_name,
                i.quantity
            FROM Inventory i
            JOIN Colors c ON i.color_id = c.color_id
            JOIN Sizes s ON i.size_id = s.size_id
            WHERE i.product_id = %s
            ORDER BY s.name, c.red, c.green, c.blue;
        """
    cursor.execute(query, (product_id,))
    inventory = cursor.fetchall()

    cursor.close()
    connection.close()
    return inventory

# Endpoint to create a delivery
@app.post("/create_delivery")
def create_delivery(inventory_id: int, quantity: int, delivery_price: float, delivery_date: str):
    connection = get_db_connection()
    cursor = connection.cursor()
    query = """
                INSERT INTO Deliveries (inventory_id, quantity, delivery_price, status, delivery_date)
                VALUES (%s, %s, %s, 'pending', %s)
            """
    cursor.execute(query, (inventory_id, quantity, delivery_price, delivery_date))

    # Commit the transaction
    connection.commit()

    # Close the connection
    cursor.close()
    connection.close()

    return {"status": "success", "message": "Delivery created successfully."}

# Endpoint to analyze delivery
@app.post("/analyze_deliveries")
def get_analysis(delivery_ids: List[int] = Query(...)):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    placeholders = ",".join(["%s"] * len(delivery_ids))
    get_query = f"""
        SELECT d.*, i.product_id 
        FROM Deliveries d 
        JOIN Inventory i ON d.inventory_id = i.id
        WHERE d.delivery_id IN ({placeholders});
    """

    cursor.execute(get_query, delivery_ids)
    deliveries = cursor.fetchall()
    delivery_results = []

    for delivery in deliveries:
        product_id = delivery['product_id']

        # Query to get the delivery history for this product_id
        history_query = """
                    SELECT 
                        MIN(d.delivery_date) OVER () AS first_delivery_date,
                        MAX(d.delivery_date) OVER () AS last_delivery_date
                    FROM Deliveries d
                    JOIN Inventory i ON d.inventory_id = i.id
                    WHERE i.product_id = %s
                    -- AND d.status = 'approved'
                    ORDER BY d.delivery_date;
                """

        # Execute the history query for the current product_id
        cursor.execute(history_query, (product_id,))
        history = cursor.fetchall()

        get_product_info = """
            SELECT 
                d.delivery_price / d.quantity AS price_per_unit,
                d.quantity AS avg_quantity
            FROM Deliveries d
            JOIN Inventory i ON d.inventory_id = i.id
            WHERE i.product_id = %s
            AND d.delivery_date BETWEEN %s AND %s
            -- AND d.status = 'approved'
            -- GROUP BY d.delivery_date
            ORDER BY d.delivery_date;
        """

        first_delivery_date = history[0]['first_delivery_date']
        last_delivery_date = history[0]['last_delivery_date']
        df = pd.read_sql(get_product_info, connection, params=(product_id, first_delivery_date, last_delivery_date))

        delivery_result = analyze_isolation_forest_product(product_id, first_delivery_date, last_delivery_date, df, delivery)

        # Determine the new status based on the result
        new_status = 'flagged' if delivery_result == -1 else 'approved'

        # Update the delivery status in the database
        update_query = """
                    UPDATE Deliveries
                    SET status = %s
                    WHERE delivery_id = %s;
                """

        cursor.execute(update_query, (new_status, delivery['delivery_id']))
        connection.commit()

        delivery_results.append({
            'delivery_id': delivery['delivery_id'],
            'result': int(delivery_result)
        })

    cursor.close()
    connection.close()

    return JSONResponse(content=delivery_results)


@app.get("/evaluate")
def get_evaluation(product_id: int, start_date: str, end_date: str):
    connection = get_db_connection()
    query = f"""
            SELECT d.delivery_date, d.delivery_price / d.quantity AS price_per_unit,
                    d.quantity AS avg_quantity
            FROM Deliveries d
            JOIN Inventory i ON d.inventory_id = i.id
            WHERE i.product_id = %s
            AND d.delivery_date BETWEEN %s AND %s
            -- AND d.status = 'approved'
            -- GROUP BY d.delivery_date
            ORDER BY d.delivery_date;
        """
    df = pd.read_sql(query, connection, params=(product_id, start_date, end_date))
    evaluate_algorithms_on_product_data(product_id, start_date, end_date, df)
    connection.close()
    return df.to_dict(orient="records")
#
#
# @app.get("/kmeans_analysis")
# def get_kmeans_analysis(product_id: int, start_date: str, end_date: str):
#     connection = get_db_connection()
#     query = f"""
#             SELECT
#     --             d.delivery_id,
#     --             d.inventory_id,
#                 d.delivery_date,
#                 d.delivery_price / d.quantity AS price_per_unit,
#                 d.quantity as avg_quantity
#             FROM
#                 Deliveries d
#             JOIN
#                 Inventory i ON d.inventory_id = i.id
#             WHERE
#                 i.product_id = %s
#                 AND d.delivery_date BETWEEN %s AND %s
#             ORDER BY
#                 d.delivery_date;
#         """
#     df = pd.read_sql(query, connection, params=(product_id, start_date, end_date))
#     connection.close()
#     analyze_kmeans_product(product_id, start_date, end_date, df)
#     return df.to_dict(orient="records")
#
# @app.get("/dbscan_analysis")
# def get_dbscan_analysis(product_id: int, start_date: str, end_date: str):
#     connection = get_db_connection()
#     query = f"""
#             SELECT
#     --             d.delivery_id,
#     --             d.inventory_id,
#                 d.delivery_date,
#                 d.delivery_price / d.quantity AS price_per_unit,
#                 d.quantity as avg_quantity
#             FROM
#                 Deliveries d
#             JOIN
#                 Inventory i ON d.inventory_id = i.id
#             WHERE
#                 i.product_id = %s
#                 AND d.delivery_date BETWEEN %s AND %s
#             ORDER BY
#                 d.delivery_date;
#         """
#     df = pd.read_sql(query, connection, params=(product_id, start_date, end_date))
#     connection.close()
#     analyze_dbscan_product(product_id, start_date, end_date, df)
#     return df.to_dict(orient="records")
#
#
# @app.get("/isolation_forest_analysis")
# def get_isolation_forest_analysis(product_id: int, start_date: str, end_date: str):
#     connection = get_db_connection()
#     query = f"""
#             SELECT
#     --             d.delivery_id,
#     --             d.inventory_id,
#                 d.delivery_date,
#                 d.delivery_price / d.quantity AS price_per_unit,
#                 d.quantity as avg_quantity
#             FROM
#                 Deliveries d
#             JOIN
#                 Inventory i ON d.inventory_id = i.id
#             WHERE
#                 i.product_id = %s
#                 AND d.delivery_date BETWEEN %s AND %s
#             ORDER BY
#                 d.delivery_date;
#         """
#     df = pd.read_sql(query, connection, params=(product_id, start_date, end_date))
#     connection.close()
#     analyze_isolation_forest_product(product_id, start_date, end_date, df)
#     return df.to_dict(orient="records")
#
#
# @app.get("/zscore_analysis")
# def get_zscore_analysis(product_id: int, start_date: str, end_date: str):
#     connection = get_db_connection()
#     query = f"""
#                 SELECT
#         --             d.delivery_id,
#         --             d.inventory_id,
#                     d.delivery_date,
#                     d.delivery_price / d.quantity AS price_per_unit,
#                     d.quantity as avg_quantity
#                 FROM
#                     Deliveries d
#                 JOIN
#                     Inventory i ON d.inventory_id = i.id
#                 WHERE
#                     i.product_id = %s
#                     AND d.delivery_date BETWEEN %s AND %s
#                 ORDER BY
#                     d.delivery_date;
#             """
#     df = pd.read_sql(query, connection, params=(product_id, start_date, end_date))
#     connection.close()
#     analyze_zscore_product(product_id, start_date, end_date, df)
#     return df.to_dict(orient="records")
#
#
# @app.get("/iqr_analysis")
# def get_iqr_analysis(product_id: int, start_date: str, end_date: str):
#     connection = get_db_connection()
#     query = f"""
#                 SELECT
#         --             d.delivery_id,
#         --             d.inventory_id,
#                     d.delivery_date,
#                     d.delivery_price / d.quantity AS price_per_unit,
#                     d.quantity as avg_quantity
#                 FROM
#                     Deliveries d
#                 JOIN
#                     Inventory i ON d.inventory_id = i.id
#                 WHERE
#                     i.product_id = %s
#                     AND d.delivery_date BETWEEN %s AND %s
#                 ORDER BY
#                     d.delivery_date;
#             """
#     df = pd.read_sql(query, connection, params=(product_id, start_date, end_date))
#     connection.close()
#     analyze_iqr_product(product_id, start_date, end_date, df)
#     return df.to_dict(orient="records")
