import random
import mysql.connector
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os
import pandas as pd
import numpy as np
from matplotlib import pyplot as plt
import seaborn as sns

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

# # Fetch all inventory items
# cursor.execute("SELECT id, product_id FROM Inventory")
# inventory_data = cursor.fetchall()  # List of (inventory_id, product_id)
#
# # Configuration
# BASELINE_PRICE = 100  # Base price per unit
# QUANTITY = 100  # Quantity range for each delivery
# NUM_DELIVERIES = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]  # Number of deliveries per inventory_id
# configurations = ["ss", "sm", "sl", "ms", "mm", "ml", "ls", "lm", "ll"]
# weights = {
#     "mm": 95.0,
#     "sm": 1.0, "ms": 1.0, "ml": 1.0, "lm": 1.0,
#     "ss": 0.2, "sl": 0.2, "ls": 0.2, "ll": 0.2
# }
# probabilities = [weights[config] / sum(weights.values()) for config in configurations]
#
# # Generate and populate deliveries
# for inventory_id, product_id in inventory_data:
#     start_date = datetime(2020, 1, 1)
#     base_quantity = QUANTITY + int(product_id / 10.0)
#     base_price_per_unit = BASELINE_PRICE + product_id
#     delivery_num = np.random.choice(NUM_DELIVERIES)
#
#     for i in range(delivery_num):
#         chosen_config = np.random.choice(configurations, p=probabilities)
#
#         delivery_date = start_date + timedelta(days=random.randint(0, 1460))
#         quantity = int(np.random.normal(base_quantity, 0.05 * base_quantity))
#         price_per_unit = round(np.random.normal(base_price_per_unit, 0.05 * base_price_per_unit), 2)
#         status = 'approved'
#
#         if chosen_config[0] == "s":
#             quantity -= int(0.5 * quantity)
#             if chosen_config[1] == "s" or chosen_config[1] == "l":
#                 status = 'rejected'
#             if chosen_config[1] == "m":
#                 status = 'pending'
#         if chosen_config[0] == "l":
#             quantity += int(0.5 * quantity)
#             if chosen_config[1] == "s" or chosen_config[1] == "l":
#                 status = 'rejected'
#             if chosen_config[1] == "m":
#                 status = 'pending'
#         if chosen_config[1] == "s":
#             price_per_unit -= round(price_per_unit * 0.5, 2)
#         if chosen_config[1] == "l":
#             price_per_unit += round(price_per_unit * 0.5, 2)
#
#         delivery_price = round(price_per_unit * quantity, 2)
#
#         # Insert into Deliveries table
#         cursor.execute("""
#             INSERT INTO Deliveries (inventory_id, quantity, delivery_price, status, delivery_date)
#             VALUES (%s, %s, %s, %s, %s)
#         """, (inventory_id, quantity, delivery_price, status, delivery_date.strftime('%Y-%m-%d')))
#
# # Commit changes
# connection.commit()
# cursor.close()
# connection.close()
#
# print("Data generated and populated successfully!")

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


# # Ścieżka do pliku CSV
# file_path = "comparison/anomaly_detection_results.csv"
#
# # Wczytanie danych
# results_df = pd.read_csv(file_path)
# print(results_df.head())
#
# # Generowanie wykresów dla każdej metryki
# metrics = ["Precision", "Recall", "F1 Score", "Time"]
# distributions = results_df["Distribution"].unique()
# n_samples_unique = results_df["n_samples"].unique()
# algorithms = results_df["Algorithm"].unique()
#
# plot_algorithm_performance_heatmap(results_df, "comparison/all/algorithm_performance_heatmap.png")
#
# for metric in metrics:
#     plot_metric_comparison(results_df, metric, f"comparison/all/{metric}_comparison.png")
#     plot_metric_by_samples(results_df, metric, f"comparison/all/{metric}_by_samples.png")
