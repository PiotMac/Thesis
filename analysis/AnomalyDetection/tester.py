import random
import mysql.connector
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os
import pandas as pd
import numpy as np
from matplotlib import pyplot as plt

load_dotenv()

# Connect to the database
connection = mysql.connector.connect(
    host=os.getenv("DB_HOST"),
    port=os.getenv("DB_PORT"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    database=os.getenv("DB_NAME"),
)
cursor = connection.cursor()

# Query for average price per unit by date
product_id = 758  # Replace with the desired product_id
query = f"""
    SELECT 
        d.delivery_date, 
        AVG(d.delivery_price / d.quantity) AS avg_price_per_unit,
        AVG(d.quantity) AS avg_quantity
    FROM 
        Deliveries d
    JOIN 
        Inventory i ON d.inventory_id = i.id
    WHERE 
        i.product_id = {product_id}
        AND MONTH(d.delivery_date) BETWEEN 11 AND 12
        AND YEAR(d.delivery_date) = 2023 -- Filter for the year 2023
    GROUP BY 
        d.delivery_date
    ORDER BY 
        d.delivery_date;
"""

# Fetch data into a DataFrame
df = pd.read_sql(query, connection)
connection.close()

# Convert delivery_date to datetime
df['delivery_date'] = pd.to_datetime(df['delivery_date'])

# Plot average price per unit over delivery dates
plt.figure(figsize=(10, 6))
plt.plot(df['delivery_date'], df['avg_price_per_unit'], marker='o', label="Average Price Per Unit")

# Add a trendline
# Convert dates to ordinal numbers for trendline calculation
df['date_ordinal'] = df['delivery_date'].map(datetime.toordinal)

# Fit a linear trendline using NumPy's polyfit
z = np.polyfit(df['date_ordinal'], df['avg_price_per_unit'], 1)  # Linear trendline
p = np.poly1d(z)

# Add the trendline to the plot
plt.plot(df['delivery_date'], p(df['date_ordinal']), "r--", label="Trendline")

# Customize the plot
plt.title(f"Average Price Per Unit for Product {product_id} Over Time")
plt.xlabel("Delivery Date")
plt.ylabel("Average Price Per Unit")
plt.legend()
plt.grid(True)
plt.tight_layout()

# Show the plot
plt.show()

# # Fetch all inventory items
# cursor.execute("SELECT id, product_id FROM Inventory")
# inventory_data = cursor.fetchall()  # List of (inventory_id, product_id)
#
# # Configuration
# BASELINE_PRICE = 100  # Base price per unit
# TREND_FACTOR = 0.02   # 2% monthly increase
# FLUCTUATION_RANGE = 0.1  # ±10% fluctuation
# QUANTITY_RANGE = (50, 200)  # Quantity range for each delivery
# NUM_DELIVERIES = 150  # Number of deliveries per inventory_id
#
# # Generate and populate deliveries
# for inventory_id, product_id in inventory_data:
#     start_date = datetime(2023, 1, 1)
#     base_quantity = random.randint(*QUANTITY_RANGE)  # Consistent quantity per product_id
#     price_per_unit = BASELINE_PRICE + product_id  # Unique price per product_id
#
#     for delivery_num in range(NUM_DELIVERIES):
#         # Simulate increasing price trend with fluctuations
#         month = delivery_num // 10  # Increase trend every 10 deliveries
#         trend_multiplier = (1 + TREND_FACTOR) ** month
#         fluctuation = random.uniform(1 - FLUCTUATION_RANGE, 1 + FLUCTUATION_RANGE)
#         delivery_price = round(price_per_unit * base_quantity * trend_multiplier * fluctuation, 2)
#         quantity = random.randint(base_quantity - 10, base_quantity + 10)  # Slight variation
#
#         # Generate delivery date
#         delivery_date = start_date + timedelta(days=random.randint(0, 365))
#
#         # Insert into Deliveries table
#         cursor.execute("""
#             INSERT INTO Deliveries (inventory_id, quantity, delivery_price, status, anomaly_score, delivery_date)
#             VALUES (%s, %s, %s, %s, %s, %s)
#         """, (inventory_id, quantity, delivery_price, 'approved', 0.0, delivery_date.strftime('%Y-%m-%d')))
#
#         # Update AnomalyThresholds table
#         cursor.execute("""
#             INSERT INTO AnomalyThresholds (inventory_id, min_quantity, max_quantity, min_price, max_price)
#             VALUES (%s, %s, %s, %s, %s)
#             ON DUPLICATE KEY UPDATE
#                 min_quantity = LEAST(min_quantity, %s),
#                 max_quantity = GREATEST(max_quantity, %s),
#                 min_price = LEAST(min_price, %s),
#                 max_price = GREATEST(max_price, %s)
#         """, (
#             inventory_id, quantity, quantity, delivery_price, delivery_price,
#             quantity, quantity, delivery_price, delivery_price
#         ))
#
# # Commit changes
# connection.commit()
# cursor.close()
# connection.close()

# print("Data generated and populated successfully!")