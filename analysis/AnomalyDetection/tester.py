import random
import mysql.connector
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os
import pandas as pd
import numpy as np
from matplotlib import pyplot as plt
import seaborn as sns

# load_dotenv()
#
# # Connect to the database
# connection = mysql.connector.connect(
#     host=os.getenv("DB_HOST"),
#     port=os.getenv("DB_PORT"),
#     user=os.getenv("DB_USER"),
#     password=os.getenv("DB_PASSWORD"),
#     database=os.getenv("DB_NAME"),
# )
# cursor = connection.cursor()

# Query for average price per unit by date
# product_id = 758  # Replace with the desired product_id
# query = f"""
#     SELECT
#         d.delivery_date,
#         AVG(d.delivery_price / d.quantity) AS avg_price_per_unit,
#         AVG(d.quantity) AS avg_quantity
#     FROM
#         Deliveries d
#     JOIN
#         Inventory i ON d.inventory_id = i.id
#     WHERE
#         i.product_id = {product_id}
#         AND MONTH(d.delivery_date) BETWEEN 11 AND 12
#         AND YEAR(d.delivery_date) = 2023 -- Filter for the year 2023
#     GROUP BY
#         d.delivery_date
#     ORDER BY
#         d.delivery_date;
# """
#
# # Fetch data into a DataFrame
# df = pd.read_sql(query, connection)
# connection.close()
#
# # Convert delivery_date to datetime
# df['delivery_date'] = pd.to_datetime(df['delivery_date'])
#
# # Plot average price per unit over delivery dates
# plt.figure(figsize=(10, 6))
# plt.plot(df['delivery_date'], df['avg_price_per_unit'], marker='o', label="Average Price Per Unit")
#
# # Add a trendline
# # Convert dates to ordinal numbers for trendline calculation
# df['date_ordinal'] = df['delivery_date'].map(datetime.toordinal)
#
# # Fit a linear trendline using NumPy's polyfit
# z = np.polyfit(df['date_ordinal'], df['avg_price_per_unit'], 1)  # Linear trendline
# p = np.poly1d(z)
#
# # Add the trendline to the plot
# plt.plot(df['delivery_date'], p(df['date_ordinal']), "r--", label="Trendline")
#
# # Customize the plot
# plt.title(f"Average Price Per Unit for Product {product_id} Over Time")
# plt.xlabel("Delivery Date")
# plt.ylabel("Average Price Per Unit")
# plt.legend()
# plt.grid(True)
# plt.tight_layout()
#
# # Show the plot
# plt.show()

# # Fetch all inventory items
# cursor.execute("SELECT id, product_id FROM Inventory")
# inventory_data = cursor.fetchall()  # List of (inventory_id, product_id)
#
# Configuration
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
# product_id = 1
# cursor.execute(f"SELECT id, product_id FROM Inventory WHERE product_id = {product_id}")
# inventory_data = cursor.fetchall()  # List of (inventory_id, product_id)
#
# # Percentage of deliveries to be anomalous
# ANOMALY_PERCENTAGE = 1.0  # 10% of deliveries
#
# for inventory_id, product_id in inventory_data:
#     start_date = datetime(2024, 1, 1)
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
#         # Introduce anomalies for a small percentage of deliveries
#         is_anomalous = random.random() < ANOMALY_PERCENTAGE
#         anomaly_score = 0.0
#         status = 'approved'
#
#         if is_anomalous:
#             anomaly_type = random.choice(['price', 'quantity', 'both'])
#             if anomaly_type in ['price', 'both']:
#                 # Price anomaly: Inflate or deflate the price by a large margin
#                 delivery_price *= random.uniform(2, 5) if random.random() > 0.5 else random.uniform(0.1, 0.5)
#                 delivery_price = round(delivery_price, 2)
#                 anomaly_score += 0.5  # Increment anomaly score for price
#
#             if anomaly_type in ['quantity', 'both']:
#                 # Quantity anomaly: Extremely high or low quantity
#                 quantity = random.randint(1, 10) if random.random() > 0.5 else random.randint(500, 1000)
#                 anomaly_score += 0.5  # Increment anomaly score for quantity
#
#             # Mark as flagged
#             status = 'flagged'
#
#         # Insert into Deliveries table
#         cursor.execute("""
#             INSERT INTO Deliveries (inventory_id, quantity, delivery_price, status, anomaly_score, delivery_date)
#             VALUES (%s, %s, %s, %s, %s, %s)
#         """, (inventory_id, quantity, delivery_price, status, anomaly_score, delivery_date.strftime('%Y-%m-%d')))
#
#         # Update AnomalyThresholds table
#         # cursor.execute("""
#         #     INSERT INTO AnomalyThresholds (inventory_id, min_quantity, max_quantity, min_price, max_price)
#         #     VALUES (%s, %s, %s, %s, %s)
#         #     ON DUPLICATE KEY UPDATE
#         #         min_quantity = LEAST(min_quantity, %s),
#         #         max_quantity = GREATEST(max_quantity, %s),
#         #         min_price = LEAST(min_price, %s),
#         #         max_price = GREATEST(max_price, %s)
#         # """, (
#         #     inventory_id, quantity, quantity, delivery_price, delivery_price,
#         #     quantity, quantity, delivery_price, delivery_price
#         # ))
#
# # Commit changes
# connection.commit()
# cursor.close()
# connection.close()

# cursor.execute(f"SELECT delivery_id FROM Deliveries WHERE status = 'flagged' LIMIT 5")
# deliveries_data = cursor.fetchall()  # List of (inventory_id, product_id)
#
# for delivery in deliveries_data:
#     delivery_id = delivery[0]
#     cursor.execute(f"UPDATE Deliveries SET status = 'pending' WHERE delivery_id = {delivery_id}")
#
# connection.commit()
# cursor.close()
# connection.close()


# Wykres słupkowy dla metryki
def plot_metric_comparison(results_df, metric, save_path):
    plt.figure(figsize=(14, 8))
    sns.barplot(
        data=results_df,
        x="Distribution",
        y=metric,
        hue="Algorithm",
        errorbar=None
    )
    if metric == "Time":
        plt.yscale('log')
        plt.ylabel("Time (log scale)", fontsize=14)
    else:
        plt.ylabel(metric, fontsize=14)
    plt.title(f"{metric} by Algorithm and Distribution", fontsize=16)
    plt.xlabel("Distribution", fontsize=14)
    plt.legend(title="Algorithm", fontsize=12)
    plt.grid(axis='y', linestyle='--', alpha=0.7)
    plt.tight_layout()
    plt.savefig(save_path)


def plot_single_metric_heatmap_by_distribution(results_df, metric, save_path):
    # Grupowanie wyników według algorytmu i rozkładu danych
    summary = results_df.groupby(["Algorithm", "Distribution"])[metric].mean().unstack()

    # Tworzenie heatmapy
    plt.figure(figsize=(16, 8))
    sns.heatmap(
        summary,
        annot=True,
        fmt=".3f",
        cmap="coolwarm",
        cbar=True,
        linewidths=0.5,
        linecolor="gray"
    )
    plt.title(f"Average {metric} of Algorithms by Data Type", fontsize=16)
    plt.xlabel("Data Type", fontsize=14)
    plt.ylabel("Algorithm", fontsize=14)
    plt.tight_layout()
    plt.savefig(save_path)


def plot_algorithm_performance_heatmap(results_df, save_path):
    # Obliczanie średnich metryk dla każdego algorytmu
    summary = results_df.groupby("Algorithm")[["Precision", "Recall", "F1 Score"]].mean()

    # Tworzenie heatmapy
    plt.figure(figsize=(12, 6))
    sns.heatmap(
        summary,
        annot=True,
        fmt=".3f",
        cmap="viridis",
        cbar=True
    )
    plt.title("Average Performance of Algorithms", fontsize=16)
    plt.tight_layout()
    plt.savefig(save_path)
    # Grupowanie wyników według algorytmu i rozkładu danych
    # summary = results_df.groupby(["Algorithm", "Distribution"])[
    #     ["Accuracy", "Precision", "Recall", "F1 Score"]
    # ].mean().unstack()
    #
    # # Tworzenie heatmapy
    # plt.figure(figsize=(16, 8))
    # sns.heatmap(
    #     summary,
    #     annot=True,
    #     fmt=".3f",
    #     cmap="viridis",
    #     cbar=True,
    #     linewidths=0.5,
    #     linecolor="gray"
    # )
    # plt.title("Average Performance of Algorithms by Data Type", fontsize=16)
    # plt.xlabel("Data Type", fontsize=14)
    # plt.ylabel("Algorithm", fontsize=14)
    # plt.savefig(save_path)
    # plt.show()


def plot_metric_by_samples(results_df, metric, save_path):
    plt.figure(figsize=(14, 8))

    sns.lineplot(
        data=results_df,
        x="n_samples",
        y=metric,
        hue="Algorithm",
        linewidth=3,
        errorbar=None
    )
    # sns.lineplot(
    #     data=results_df,
    #     x="n_samples",
    #     y=metric,
    #     hue="Algorithm",
    #     style="Distribution",
    #     markers=True,
    #     dashes=False
    # )
    if metric == "Time":
        plt.yscale('log')
        plt.ylabel("Time (log scale)", fontsize=14)
    else:
        plt.ylabel(metric, fontsize=14)

    plt.title(f"{metric} by Sample Size and Algorithm", fontsize=16)
    plt.xlabel("Number of Samples", fontsize=14)
    plt.legend(title="Algorithm", fontsize=12)
    plt.grid(axis='both', linestyle='--', alpha=0.7)
    plt.tight_layout()
    plt.savefig(save_path)


# Ścieżka do pliku CSV
file_path = "comparison/anomaly_detection_results.csv"

# Wczytanie danych
results_df = pd.read_csv(file_path)
print(results_df.head())

# Generowanie wykresów dla każdej metryki
metrics = ["Precision", "Recall", "F1 Score", "Time"]
distributions = results_df["Distribution"].unique()
n_samples_unique = results_df["n_samples"].unique()
algorithms = results_df["Algorithm"].unique()

plot_algorithm_performance_heatmap(results_df, "comparison/all/algorithm_performance_heatmap.png")

for metric in metrics:
    plot_metric_comparison(results_df, metric, f"comparison/all/{metric}_comparison.png")
    plot_metric_by_samples(results_df, metric, f"comparison/all/{metric}_by_samples.png")
