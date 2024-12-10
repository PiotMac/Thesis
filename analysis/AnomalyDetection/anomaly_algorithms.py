from scipy.ndimage import gaussian_filter1d
from sklearn.cluster import KMeans, DBSCAN
from sklearn.datasets import make_blobs, make_moons, make_circles
from sklearn.ensemble import IsolationForest
from scipy.stats import zscore
import numpy as np
from sklearn.metrics import silhouette_score, precision_score, recall_score, f1_score, roc_auc_score, accuracy_score
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import NearestNeighbors
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
from kneed import KneeLocator
import time

# def detect_anomalies_dbscan():
#     product_id = 1
#     start_date = "2023-01-01"
#     end_date = "2023-12-30"
#     # Step 1: Extract Data
#     connection = get_db_connection()
#     query = """
#         SELECT
#             d.delivery_id,
#             d.inventory_id,
#             d.delivery_date,
#             d.delivery_price / d.quantity AS price_per_unit
#         FROM
#             Deliveries d
#         JOIN
#             Inventory i ON d.inventory_id = i.id
#         WHERE
#             i.product_id = %s
#             AND d.delivery_date BETWEEN %s AND %s
#         ORDER BY
#             d.delivery_date;
#     """
#     df = pd.read_sql(query, connection, params=(product_id, start_date, end_date))
#     connection.close()
#
#     # Step 2: Preprocess Data
#     features = df[['price_per_unit']].values
#     scaler = StandardScaler()
#     features_scaled = scaler.fit_transform(features)
#
#     # Step 3: Apply DBSCAN
#     dbscan = DBSCAN(eps=0.5, min_samples=5)
#     df['anomaly'] = dbscan.fit_predict(features_scaled)
#
#     # Step 4: Visualize Results
#     plt.figure(figsize=(10, 6))
#
#     # Normal Points
#     normal_points = df[df['anomaly'] != -1]
#     plt.scatter(
#         normal_points['delivery_date'],
#         normal_points['price_per_unit'],
#         label="Normal Deliveries",
#         c="blue",
#         alpha=0.7,
#     )
#
#     # Anomalies
#     anomalies = df[df['anomaly'] == -1]
#     plt.scatter(
#         anomalies['delivery_date'],
#         anomalies['price_per_unit'],
#         label="Anomalies",
#         c="red",
#         alpha=0.7,
#     )
#
#     # Customize Plot
#     plt.title(f"Price Per Unit Anomalies for Product {product_id}")
#     plt.xlabel("Delivery Date")
#     plt.ylabel("Price Per Unit")
#     plt.xticks(rotation=45)
#     plt.legend()
#     plt.grid(True)
#     plt.tight_layout()
#
#     # Show Plot
#     plt.show()


def analyze_kmeans_product(product_id, start_date, end_date, df):
    features = df[['price_per_unit', 'avg_quantity']].values
    scaler = StandardScaler()
    features_scaled = scaler.fit_transform(features)

    silhouette_scores = []
    cluster_range = range(2, 10)

    for n_clusters in cluster_range:
        kmeans = KMeans(n_clusters=n_clusters, n_init=10, random_state=42)
        kmeans.fit_predict(features_scaled)
        score = silhouette_score(features_scaled, kmeans.labels_)
        silhouette_scores.append(score)

    optimal_clusters = cluster_range[np.argmax(silhouette_scores)]

    kmeans = KMeans(n_clusters=optimal_clusters, n_init=10, random_state=42)
    df['cluster'] = kmeans.fit_predict(features_scaled)

    df['distance_to_center'] = np.linalg.norm(
        features_scaled - kmeans.cluster_centers_[df['cluster']], axis=1
    )


    # Set a threshold for anomalies (e.g., 95th percentile of distances)
    threshold = np.percentile(df['distance_to_center'], 95)
    # df['anomaly'] = df['distance_to_center'] > threshold

    unique_clusters = df['cluster'].unique()
    cmap = plt.get_cmap("tab10")
    colors = [cmap(i / len(unique_clusters)) for i in range(len(unique_clusters))]  # Generate distinct colors for clusters


    plt.figure(figsize=(10, 6))

    for cluster, color in zip(unique_clusters, colors):
        cluster_points = df[df['cluster'] == cluster]
        plt.scatter(
            cluster_points['avg_quantity'],
            cluster_points['price_per_unit'],
            label=f"Cluster {cluster}",
            alpha=1.0,
            color=color
        )

    # Plot anomalies
    anomalies = df[df['distance_to_center'] > threshold]
    plt.scatter(
        anomalies['avg_quantity'],
        anomalies['price_per_unit'],
        label="Anomaly",
        color="red",
        marker="x",
        s=200,
        alpha=1.0
    )

    # Customize the plot
    plt.title(f"KMeans analysis for Product {product_id}\n\n"
            f"Time interval: {start_date} till {end_date}", fontsize=14)
    plt.xlabel("Quantity Delivered", fontsize=12)
    plt.ylabel("Price Per Unit", fontsize=12)
    plt.legend(loc="best")
    plt.tight_layout()
    plt.grid(True)
    plt.savefig("kmeans_product")

    # Plot Silhouette Scores
    # plt.figure(figsize=(10, 6))
    # plt.plot(cluster_range, silhouette_scores, marker='o', color='green')
    # plt.title("Silhouette Scores for K-Means Clustering")
    # plt.xlabel("Number of Clusters")
    # plt.ylabel("Silhouette Score")
    # plt.grid(True)
    # plt.tight_layout()
    # plt.savefig("kmeans_silhouette_scores1.png")

def analyze_dbscan_product(product_id, start_date, end_date, df):
    # Preprocess data
    features = df[['price_per_unit', 'avg_quantity']].values
    scaler = StandardScaler()
    features_scaled = scaler.fit_transform(features)

    k = 5  # Default value for min_samples
    nbrs = NearestNeighbors(n_neighbors=k).fit(features_scaled)
    distances, _ = nbrs.kneighbors(features_scaled)
    # Sort distances for the elbow method
    distances_sorted = np.sort(distances[:, k - 1], axis=0)
    knee_locator = KneeLocator(range(len(distances_sorted)), distances_sorted, curve="convex", direction="increasing",
                               S=2)
    eps = distances_sorted[knee_locator.knee]
    # knee_locator.plot_knee()

    dbscan = DBSCAN(eps=eps, min_samples=k)
    df['cluster'] = dbscan.fit_predict(features_scaled)
    unique_clusters = df['cluster'].unique()

    # Plot the clusters
    plt.figure(figsize=(10, 6))

    # Generate a colormap for clusters
    cmap = plt.get_cmap("tab10")
    colors = [cmap(i / (len(unique_clusters) - 1)) for i in range(len(unique_clusters))]

    for cluster, color in zip(unique_clusters, colors):
        cluster_points = df[df['cluster'] == cluster]
        if cluster == -1:  # Anomalies
            plt.scatter(
                cluster_points['avg_quantity'],
                cluster_points['price_per_unit'],
                label="Anomalies",
                c="red",
                alpha=1.0,
                s=200,
                marker="x",
            )
        else:
            plt.scatter(
                cluster_points['avg_quantity'],
                cluster_points['price_per_unit'],
                label=f"Cluster {cluster}",
                c=color,
                alpha=1.0,
            )

    # Customize Plot
    plt.title(f"DBSCAN Analysis for Product {product_id}\n\n"
              f"Time interval: {start_date} till {end_date}", fontsize=14)
    plt.xlabel("Quantity Delivered")
    plt.ylabel("Price Per Unit")
    plt.xticks(rotation=45)
    plt.legend(loc="best")
    plt.grid(True)
    plt.tight_layout()
    plt.savefig("dbscan_product")


def analyze_isolation_forest_product(product_id, start_date, end_date, df, new_delivery):
    # Preprocess data
    features = df[['avg_quantity', 'price_per_unit']].values
    new_delivery['price_per_unit'] = float(new_delivery['delivery_price']) / new_delivery['quantity']

    new_delivery_data = {
        'avg_quantity': new_delivery['quantity'],
        'price_per_unit': new_delivery['price_per_unit']
    }

    # Append the new delivery to the dataset
    new_delivery_row = pd.DataFrame([new_delivery_data])
    features_with_new = np.vstack((features, new_delivery_row.values))

    scaler = StandardScaler()
    features_scaled = scaler.fit_transform(features_with_new)

    # Apply Isolation Forest
    isolation_forest = IsolationForest(n_estimators=1000, max_samples='auto', contamination=0.05, random_state=42)
    results = isolation_forest.fit_predict(features_scaled)

    df['results'] = results[:-1]  # Exclude the new delivery result for the original data
    new_delivery_result = results[-1]  # Result for the new delivery

    normal_points = df[df['results'] == 1]
    anomalies = df[df['results'] == -1]

    return new_delivery_result

    # plt.figure(figsize=(10, 6))
    #
    # plt.scatter(
    #     normal_points['avg_quantity'],
    #     normal_points['price_per_unit'],
    #     c='blue',
    #     label='Normal Points',
    #     alpha=1.0
    # )
    #
    # plt.scatter(
    #     anomalies['avg_quantity'],
    #     anomalies['price_per_unit'],
    #     c='red',
    #     marker='x',
    #     s=100,
    #     label='Anomalies',
    #     alpha=1.0
    # )
    #
    # # Plot the new delivery point
    # plt.scatter(
    #     new_delivery_data['avg_quantity'],
    #     new_delivery_data['price_per_unit'],
    #     c='green' if new_delivery_result == 1 else 'orange',
    #     marker='o',
    #     s=200,
    #     label='New Delivery (Normal)' if new_delivery_result == 1 else 'New Delivery (Anomaly)',
    #     alpha=1.0
    # )
    #
    # plt.title(f"IForest Analysis for Product {product_id}\n\n"
    #           f"Time interval: {start_date} till {end_date}", fontsize=14)
    # plt.xlabel("Quantity Delivered")
    # plt.ylabel("Price Per Unit")
    # plt.xticks(rotation=45)
    # plt.tight_layout()
    # plt.legend(loc="best")
    # plt.grid(True)
    # plt.tight_layout()
    # plt.savefig("iforest_new_product")

    # estimator = isolation_forest.estimators_[0].tree_

    # Create a grid of points for decision boundary
    # x_min, x_max = features_scaled[:, 0].min() - 0.1 * abs(features_scaled[:, 0].min()), features_scaled[:, 0].max() + 0.1 * abs(features_scaled[:, 0].max())
    # y_min, y_max = features_scaled[:, 1].min() - 0.1 * abs(features_scaled[:, 1].min()), features_scaled[:, 1].max() + 0.1 * abs(features_scaled[:, 1].max())
    #
    # def plot_isolation_for_point(point, x_min, x_max, y_min, y_max, point_type):
    #     def recursive_plot(node, x_min, x_max, y_min, y_max):
    #         if estimator.children_left[node] == -1 and estimator.children_right[node] == -1:
    #             return
    #
    #         feature = estimator.feature[node]
    #         threshold = estimator.threshold[node]
    #
    #         if feature == 0:  # avg_quantity (x-axis)
    #             # threshold_original = scaler.inverse_transform([[threshold, 0]])[0][0]
    #             if point[0] <= threshold:  # The point falls into the left child
    #                 plt.plot([threshold, threshold], [y_min, y_max], color="black", linestyle="-",
    #                          alpha=1.0, zorder=3)
    #                 recursive_plot(estimator.children_left[node], x_min, threshold, y_min, y_max)
    #             else:  # The point falls into the right child
    #                 plt.plot([threshold, threshold], [y_min, y_max], color="black", linestyle="-",
    #                          alpha=1.0, zorder=3)
    #                 recursive_plot(estimator.children_right[node], threshold, x_max, y_min, y_max)
    #
    #         elif feature == 1:  # price_per_unit (y-axis)
    #             # threshold_original = scaler.inverse_transform([[0, threshold]])[0][1]
    #             if point[1] <= threshold:  # The point falls into the lower child
    #                 plt.plot([x_min, x_max], [threshold, threshold], color="black", linestyle="-",
    #                          alpha=1.0, zorder=3)
    #                 recursive_plot(estimator.children_left[node], x_min, x_max, y_min, threshold)
    #             else:  # The point falls into the upper child
    #                 plt.plot([x_min, x_max], [threshold, threshold], color="black", linestyle="-",
    #                          alpha=1.0, zorder=3)
    #                 recursive_plot(estimator.children_right[node], x_min, x_max, threshold, y_max)
    #
    #     # Plot the results
    #     plt.figure(figsize=(12, 8))
    #
    #     recursive_plot(0, x_min, x_max, y_min, y_max)
    #
    #     # Highlight the specific point
    #     plt.scatter(
    #         point[0],
    #         point[1],
    #         c="yellow" if point_type == "normal" else "red",
    #         s=200,  # Larger size for better visibility
    #         label=f"Separated {point_type.capitalize()} Point",
    #         edgecolors="black",
    #         linewidth=2,
    #         marker="*" if point_type == "anomaly" else "o",
    #         zorder=4,
    #     )
    #
    #     # Plot normal points
    #     plt.scatter(
    #         normal_points[['avg_quantity', 'price_per_unit']].values[:, 0],
    #         normal_points[['avg_quantity', 'price_per_unit']].values[:, 1],
    #         label="Normal Points",
    #         c="blue",
    #         edgecolors='black',
    #         alpha=1.0,
    #         zorder=1,
    #     )
    #
    #     # Plot anomalies
    #     plt.scatter(
    #         anomalies[['avg_quantity', 'price_per_unit']].values[:, 0],
    #         anomalies[['avg_quantity', 'price_per_unit']].values[:, 1],
    #         label="Anomalies",
    #         c="red",
    #         alpha=1.0,
    #         marker="x",
    #         zorder=1,
    #     )
    #
    #     # Customize the plot
    #     if point_type == 'normal':
    #         title = f"Separating a normal point using Isolation Forest for Product {product_id}"
    #     else:
    #         title = f"Separating an anomaly using Isolation Forest for Product {product_id}"
    #     plt.title(title)
    #     plt.xlabel("Quantity Delivered")
    #     plt.ylabel("Price Per Unit")
    #     plt.legend()
    #     plt.xlim(x_min, x_max)
    #     plt.ylim(y_min, y_max)
    #     plt.savefig(f"isolation_forest_test_not_scaled_{point_type}")

    # Identify anomalies and normal points
    # anomalies = df[df['anomaly'] == -1]
    # normal_points = df[df['anomaly'] == 1]

    # Calculate anomaly scores
    # df['anomaly_score'] = isolation_forest.score_samples(features_scaled)

    # Most anomalous point
    # most_anomalous_point = df.loc[df['anomaly_score'].idxmin()]

    # Most normal point
    # best_normal_point = df.loc[df['anomaly_score'].idxmax()]
    #
    # most_anomalous = [[most_anomalous_point['avg_quantity'], most_anomalous_point['price_per_unit']]][0]
    # best_normal = [[best_normal_point['avg_quantity'], best_normal_point['price_per_unit']]][0]
    #
    # # Plot for the anomaly
    # plot_isolation_for_point(most_anomalous, x_min, x_max, y_min, y_max, point_type="anomaly")
    #
    # # Plot for the normal point
    # plot_isolation_for_point(best_normal, x_min, x_max, y_min, y_max, point_type="normal")


def analyze_zscore_product(product_id, start_date, end_date, df):
    # Preprocess data using Z-score normalization
    features = df[['price_per_unit', 'avg_quantity']].values
    mean = np.mean(features, axis=0)
    std = np.std(features, axis=0)
    features_zscore = (features - mean) / std  # Z-score normalization
    threshold = 2

    zscore_distance = np.sqrt(np.sum(features_zscore ** 2, axis=1))
    df['is_anomaly'] = zscore_distance > threshold

    normal_points = df[df['is_anomaly'] == False]
    anomalies = df[df['is_anomaly'] == True]

    plt.figure(figsize=(10, 6))

    plt.scatter(
        normal_points['avg_quantity'],
        normal_points['price_per_unit'],
        color='blue',
        label='Normal Points',
        alpha=1.0
    )

    plt.scatter(
        anomalies['avg_quantity'],
        anomalies['price_per_unit'],
        color='red',
        marker='x',
        s=100,
        label='Anomalies',
        alpha=1.0
    )

    plt.title(f"ZScore Analysis for Product {product_id}\n\n"
              f"Time interval: {start_date} till {end_date}", fontsize=14)
    plt.xlabel("Quantity Delivered")
    plt.ylabel("Price Per Unit")
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.legend(loc="best")
    plt.grid(True)
    plt.tight_layout()
    plt.savefig("zscore_product")

    # z_scores = np.abs(zscore(df[['feature_1', 'feature_2']].values, axis=0))
    # df['anomaly_score'] = np.max(z_scores, axis=1)  # Use maximum Z-score as the anomaly score
    # df['is_anomaly'] = df['anomaly_score'] > threshold

    # Add normalized data back to the DataFrame for visualization
    # df['price_per_unit_zscore'] = features_zscore[:, 0]
    # df['avg_quantity_zscore'] = features_zscore[:, 1]

    # Plot the normalized data
    # plt.figure(figsize=(10, 6))
    # plt.scatter(
    #     df['avg_quantity_zscore'],
    #     df['price_per_unit_zscore'],
    #     color="blue",
    #     alpha=1.0
    # )
    # plt.title(f"Z-score Normalized Data for Product {product_id}")
    # plt.xlabel("Average Quantity (Z-score)")
    # plt.ylabel("Price Per Unit (Z-score)")
    # plt.grid(True)
    # plt.tight_layout()
    # plt.savefig(f"zscore_plot.png")

    # Plot the original data
    # plt.figure(figsize=(10, 6))
    # plt.scatter(
    #     df['avg_quantity'],
    #     df['price_per_unit'],
    #     color="blue",
    #     alpha=1.0
    # )
    # plt.title(f"Original Data for Product {product_id}")
    # plt.xlabel("Average Quantity")
    # plt.ylabel("Price Per Unit")
    # plt.grid(True)
    # plt.tight_layout()
    # plt.savefig(f"zscore_product.png")


# def analyze_iqr(product_id, df):
#     # Define features to analyze
#     features = df[['price_per_unit', 'avg_quantity']]
#
#     # Calculate IQR for each feature
#     Q1 = features.quantile(0.25)
#     Q3 = features.quantile(0.75)
#     IQR = Q3 - Q1
#     k = 1.0
#
#     # Determine lower and upper bounds for anomalies
#     lower_bound = Q1 - k * IQR
#     upper_bound = Q3 + k * IQR
#
#     # Detect anomalies
#     df['is_anomaly'] = ((features < lower_bound) | (features > upper_bound)).any(axis=1)
#
#     # Plot the data with anomalies highlighted
#     plt.figure(figsize=(10, 6))
#     anomalies = df[df['is_anomaly']]
#     non_anomalies = df[~df['is_anomaly']]
#
#     plt.scatter(
#         non_anomalies['avg_quantity'],
#         non_anomalies['price_per_unit'],
#         color='blue',
#         label='Normal Points',
#         alpha=0.7
#     )
#     plt.scatter(
#         anomalies['avg_quantity'],
#         anomalies['price_per_unit'],
#         color='red',
#         label='Anomalies',
#         alpha=1.0,
#         marker='x'
#     )
#     plt.title(f"IQR Anomaly Detection for Product {product_id}")
#     plt.xlabel("Quantity Delivered")
#     plt.ylabel("Price Per Unit")
#     plt.legend()
#     plt.grid(True)
#     plt.tight_layout()
#     plt.savefig(f"iqr_anomalies_plot_product_{product_id}.png")
#
#     # Plot the normal distribution for each feature
#     for column in ['price_per_unit', 'avg_quantity']:
#         plt.figure(figsize=(10, 6))
#         if column == 'price_per_unit':
#             label = "Price Per Unit"
#         else:
#             label = "Quantity Delivered"
#         sns.histplot(
#             df[column], kde=True, bins=20, color='blue', label=f'Distribution'
#         )
#         plt.axvline(Q1[column], color='orange', linestyle='--', label='Q1')
#         plt.axvline(Q3[column], color='green', linestyle='--', label='Q3')
#         plt.axvline(lower_bound[column], color='red', linestyle='--', label='Lower Bound')
#         plt.axvline(upper_bound[column], color='red', linestyle='--', label='Upper Bound')
#         plt.title(f"Normal Distribution with IQR Bounds for {label} (Product {product_id})")
#         plt.xlabel(label)
#         plt.ylabel("Frequency")
#         plt.legend()
#         plt.tight_layout()
#         plt.savefig(f"normal_distribution_{column}_product_{product_id}.png")

def analyze_iqr_product(product_id, start_date, end_date, df):
    features_scaled = df[['avg_quantity', 'price_per_unit']].values
    Q1 = np.percentile(features_scaled, 25, axis=0)
    Q3 = np.percentile(features_scaled, 75, axis=0)
    IQR = Q3 - Q1
    lower_bound = Q1 - 1.0 * IQR
    upper_bound = Q3 + 1.0 * IQR

    # Anomalies are points outside the IQR bounds
    df['is_anomaly'] = ((features_scaled < lower_bound) | (features_scaled > upper_bound)).any(axis=1)

    normal_points = df[df['is_anomaly'] == False]
    anomalies = df[df['is_anomaly'] == True]

    plt.figure(figsize=(10, 6))

    plt.scatter(
        normal_points['avg_quantity'],
        normal_points['price_per_unit'],
        color='blue',
        label='Normal Points',
        alpha=1.0
    )

    plt.scatter(
        anomalies['avg_quantity'],
        anomalies['price_per_unit'],
        color='red',
        marker='x',
        s=100,
        label='Anomalies',
        alpha=1.0
    )

    plt.title(f"IQR Analysis for Product {product_id}\n\n"
              f"Time interval: {start_date} till {end_date}", fontsize=14)
    plt.xlabel("Quantity Delivered")
    plt.ylabel("Price Per Unit")
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.legend(loc="best")
    plt.grid(True)
    plt.tight_layout()
    plt.savefig("iqr_product")


# KMeans Detection
def analyze_kmeans(df, n_samples, distribution):
    start_time = time.time()

    features = df[['feature_1', 'feature_2']].values
    scaler = StandardScaler()
    features_scaled = scaler.fit_transform(features)

    silhouette_scores = []
    cluster_range = range(2, 10)

    for n_clusters in cluster_range:
        kmeans = KMeans(n_clusters=n_clusters, n_init=1, random_state=42)
        kmeans.fit_predict(features_scaled)
        score = silhouette_score(features_scaled, kmeans.labels_)
        silhouette_scores.append(score)

    optimal_clusters = cluster_range[np.argmax(silhouette_scores)]

    # Fit KMeans
    kmeans = KMeans(n_clusters=optimal_clusters, n_init=1, random_state=42)
    df['cluster'] = kmeans.fit_predict(features_scaled)

    # Calculate distances to cluster center
    df['distance_to_center'] = np.linalg.norm(features_scaled - kmeans.cluster_centers_[df['cluster']], axis=1)
    threshold = np.percentile(df['distance_to_center'], 95)  # 95th percentile
    df['is_anomaly'] = df['distance_to_center'] > threshold

    end_time = time.time()
    execution_time = end_time - start_time

    df['anomaly_score'] = df['distance_to_center']  # Use distance as anomaly score


    plt.figure(figsize=(10, 8))

    # Normalne dane
    normal_data = df[df['is_anomaly'] == False]
    plt.scatter(
        normal_data['feature_1'], normal_data['feature_2'],
        label="Normal Data", color="blue", alpha=1.0
    )

    # Anomalie
    anomalies = df[df['is_anomaly'] == True]
    plt.scatter(
        anomalies['feature_1'], anomalies['feature_2'],
        label="Anomalies", color="red", marker="x", alpha=1.0
    )

    # Dostosowanie wykresu
    plt.title("KMeans: Normal Data vs Anomalies", fontsize=14)
    plt.xlabel("Feature 1", fontsize=12)
    plt.ylabel("Feature 2", fontsize=12)
    plt.legend(fontsize=12)
    plt.grid(True)
    plt.tight_layout()
    plt.savefig(f"comparison/kmeans/kmeans_{distribution}_{n_samples}")

    return df, execution_time


# DBSCAN Detection
def analyze_dbscan(df, n_samples, distribution):
    start_time = time.time()

    features = df[['feature_1', 'feature_2']].values
    scaler = StandardScaler()
    features_scaled = scaler.fit_transform(features)

    k = 5  # Default value for min_samples
    nbrs = NearestNeighbors(n_neighbors=k).fit(features_scaled)
    distances, _ = nbrs.kneighbors(features_scaled)
    # Sort distances for the elbow method
    distances_sorted = np.sort(distances[:, k - 1], axis=0)
    knee_locator = KneeLocator(range(len(distances_sorted)), distances_sorted, curve="convex", direction="increasing", S=2)
    eps = distances_sorted[knee_locator.knee]
    # knee_locator.plot_knee()

    dbscan = DBSCAN(eps=eps, min_samples=k)
    df['cluster'] = dbscan.fit_predict(features_scaled)

    end_time = time.time()
    execution_time = end_time - start_time

    df['is_anomaly'] = df['cluster'] == -1
    unique_clusters = df['cluster'].unique()

    plt.figure(figsize=(10, 8))



    # Iteruj po klastrach i twórz wykres dla każdego
    for cluster_id in unique_clusters:
        cluster_points = df[df['cluster'] == cluster_id]
        if cluster_id == -1:  # Anomalie (noise)
            plt.scatter(
                cluster_points['feature_1'],
                cluster_points['feature_2'],
                color='red',
                marker='x',
                label='Anomalies',
                alpha=1.0
            )
        else:
            plt.scatter(
                cluster_points['feature_1'],
                cluster_points['feature_2'],
                label=f'Cluster {cluster_id}',
                alpha=1.0,
            )

    # Tytuł i osie
    plt.title("DBSCAN: Normal Data vs Anomalies", fontsize=14)
    plt.xlabel("Feature 1", fontsize=12)
    plt.ylabel("Feature 2", fontsize=12)
    plt.legend(fontsize=10)
    plt.grid(True)
    plt.savefig(f"comparison/dbscan/dbscan_{distribution}_{n_samples}")

    # Use density as anomaly score
    df['anomaly_score'] = distances[:, k - 1]
    df.loc[df['is_anomaly'], 'anomaly_score'] = distances[:, k - 1].max() + 1

    return df, execution_time


# Isolation Forest Detection
def analyze_isolation_forest(df, n_samples, distribution):
    start_time = time.time()

    features = df[['feature_1', 'feature_2']].values
    isolation_forest = IsolationForest(n_estimators=200, contamination=0.05, random_state=42)
    df['is_anomaly'] = isolation_forest.fit_predict(features) == -1  # -1 indicates anomaly

    end_time = time.time()
    execution_time = end_time - start_time

    df['anomaly_score'] = -isolation_forest.score_samples(features)  # Lower scores are more anomalous

    plt.figure(figsize=(10, 8))

    # Normalne dane
    normal_data = df[df['is_anomaly'] == False]
    plt.scatter(
        normal_data['feature_1'], normal_data['feature_2'],
        label="Normal Data", color="blue", alpha=1.0
    )

    # Anomalie
    anomalies = df[df['is_anomaly'] == True]
    plt.scatter(
        anomalies['feature_1'], anomalies['feature_2'],
        label="Anomalies", color="red", marker="x", alpha=1.0
    )

    # Dostosowanie wykresu
    plt.title("Isolation Forest: Normal Data vs Anomalies", fontsize=14)
    plt.xlabel("Feature 1", fontsize=12)
    plt.ylabel("Feature 2", fontsize=12)
    plt.legend(fontsize=12)
    plt.grid(True)
    plt.tight_layout()
    plt.savefig(f"comparison/isolation_forest/isolation_forest_{distribution}_{n_samples}")

    return df, execution_time


# Z-Score Detection
def analyze_zscore(df, n_samples, distribution):
    start_time = time.time()
    z_scores = np.abs(zscore(df[['feature_1', 'feature_2']].values, axis=0))
    df['anomaly_score'] = np.max(z_scores, axis=1)  # Use maximum Z-score as the anomaly score
    threshold = 2
    df['is_anomaly'] = df['anomaly_score'] > threshold
    end_time = time.time()
    execution_time = end_time - start_time

    plt.figure(figsize=(10, 8))

    # Normalne dane
    normal_data = df[df['is_anomaly'] == False]
    plt.scatter(
        normal_data['feature_1'], normal_data['feature_2'],
        label="Normal Data", color="blue", alpha=1.0
    )

    # Anomalie
    anomalies = df[df['is_anomaly'] == True]
    plt.scatter(
        anomalies['feature_1'], anomalies['feature_2'],
        label="Anomalies", color="red", marker="x", alpha=1.0
    )

    # Dostosowanie wykresu
    plt.title("Z-score: Normal Data vs Anomalies", fontsize=14)
    plt.xlabel("Feature 1", fontsize=12)
    plt.ylabel("Feature 2", fontsize=12)
    plt.legend(fontsize=12)
    plt.grid(True)
    plt.tight_layout()
    plt.savefig(f"comparison/zscore/zscore_{distribution}_{n_samples}")

    return df, execution_time


# IQR Detection
def analyze_iqr(df, n_samples, distribution):
    start_time = time.time()
    Q1 = df[['feature_1', 'feature_2']].quantile(0.25)
    Q3 = df[['feature_1', 'feature_2']].quantile(0.75)
    IQR = Q3 - Q1
    lower_bound = Q1 - 1.0 * IQR
    upper_bound = Q3 + 1.0 * IQR

    # Anomalies are points outside the IQR bounds
    df['is_anomaly'] = ((df < lower_bound) | (df > upper_bound)).any(axis=1)
    # Use the distance from the closest bound as the anomaly score
    df['anomaly_score'] = df.apply(
        lambda row: max(
            abs(row['feature_1'] - Q1['feature_1']) / IQR['feature_1'] if row['feature_1'] < lower_bound['feature_1'] else 0,
            abs(row['feature_1'] - Q3['feature_1']) / IQR['feature_1'] if row['feature_1'] > upper_bound['feature_1'] else 0,
            abs(row['feature_2'] - Q1['feature_2']) / IQR['feature_2'] if row['feature_2'] < lower_bound['feature_2'] else 0,
            abs(row['feature_2'] - Q3['feature_2']) / IQR['feature_2'] if row['feature_2'] > upper_bound['feature_2'] else 0,
        ),
        axis=1
    )
    end_time = time.time()
    execution_time = end_time - start_time

    plt.figure(figsize=(10, 8))

    # Normalne dane
    normal_data = df[df['is_anomaly'] == False]
    plt.scatter(
        normal_data['feature_1'], normal_data['feature_2'],
        label="Normal Data", color="blue", alpha=1.0
    )

    # Anomalie
    anomalies = df[df['is_anomaly'] == True]
    plt.scatter(
        anomalies['feature_1'], anomalies['feature_2'],
        label="Anomalies", color="red", marker="x", alpha=1.0
    )

    # Dostosowanie wykresu
    plt.title("IQR: Normal Data vs Anomalies", fontsize=14)
    plt.xlabel("Feature 1", fontsize=12)
    plt.ylabel("Feature 2", fontsize=12)
    plt.legend(fontsize=12)
    plt.grid(True)
    plt.tight_layout()
    plt.savefig(f"comparison/iqr/iqr_{distribution}_{n_samples}")

    return df, execution_time


# Generate Synthetic Data with Anomalies
def generate_synthetic_data(n_samples, anomaly_ratio, distribution):
    n_anomalies = int(n_samples * anomaly_ratio)
    n_normal = n_samples - n_anomalies

    if distribution == "normal":
        loc = np.random.uniform(-5, 5)
        scale = np.random.uniform(0.5, 2.0)
        normal_data = np.random.normal(loc=loc, scale=scale, size=(n_normal, 2))
    elif distribution == "blobs":
        n_centers = np.random.randint(2, 9)
        cluster_std = np.random.uniform(0.5, 2.0)
        normal_data, _ = make_blobs(n_samples=n_normal, n_features=2, centers=n_centers, cluster_std=cluster_std, random_state=42)
    elif distribution == "moons":
        noise = np.random.uniform(0.01, 0.1)
        normal_data, _ = make_moons(n_samples=n_normal, noise=noise, random_state=42)
    elif distribution == "circles":
        noise = np.random.uniform(0.01, 0.1)
        factor = np.random.uniform(0.3, 0.7)
        normal_data, _ = make_circles(n_samples=n_normal, noise=noise, factor=factor, random_state=42)
    else:
        raise ValueError("Unsupported distribution type.")

    x_min, x_max = normal_data[:, 0].min(), normal_data[:, 0].max()
    y_min, y_max = normal_data[:, 1].min(), normal_data[:, 1].max()

    anomalies = np.random.uniform(
        low=[x_min - 0.5 * abs(x_max - x_min), y_min - 0.5 * abs(y_max - y_min)],
        high=[x_max + 0.5 * abs(x_max - x_min), y_max + 0.5 * abs(y_max - y_min)],
        size=(n_anomalies, 2)
    )

    # Plot the data
    plt.figure(figsize=(8, 6))
    plt.scatter(normal_data[:, 0], normal_data[:, 1], label='Normal Data', alpha=1.0, color='blue')
    plt.scatter(anomalies[:, 0], anomalies[:, 1], label='Anomalies', alpha=1.0, color='red', marker='x')

    # Customize the plot
    plt.title("Synthetic Data: Normal vs Anomalies", fontsize=14)
    plt.xlabel("Feature 1", fontsize=12)
    plt.ylabel("Feature 2", fontsize=12)
    plt.legend(fontsize=12)
    plt.grid(True)
    plt.tight_layout()
    plt.savefig(f"comparison/fake_data/fake_data_{distribution}_{n_samples}")

    data = np.vstack([normal_data, anomalies])
    labels = np.array([0] * n_normal + [1] * n_anomalies)  # 0 = normal, 1 = anomaly
    return pd.DataFrame(data, columns=["feature_1", "feature_2"]), labels


# Evaluate Algorithms
def evaluate_algorithms():
    sample_sizes = range(500, 10100, 500)
    anomaly_ratio = 0.05
    kinds_of_data = ["normal", "blobs", "moons", "circles"]

    algorithms = {
        "KMeans": analyze_kmeans,
        "DBSCAN": analyze_dbscan,
        "Isolation Forest": analyze_isolation_forest,
        "Z-Score": analyze_zscore,
        "IQR": analyze_iqr
    }

    results = []

    for n_samples in sample_sizes:
        for distribution in kinds_of_data:
            data, ground_truth = generate_synthetic_data(n_samples, anomaly_ratio, distribution)
            print(
                f"Testing on: n_samples={n_samples}, distribution={distribution}")

            for name, algorithm in algorithms.items():
                df = data.copy()
                df, execution_time = algorithm(df, n_samples, distribution)

                # Obliczanie metryk
                accuracy = accuracy_score(ground_truth, df['is_anomaly'])
                precision = precision_score(ground_truth, df['is_anomaly'])
                recall = recall_score(ground_truth, df['is_anomaly'])
                f1 = f1_score(ground_truth, df['is_anomaly'])

                results.append({
                    "n_samples": n_samples,
                    "Distribution": distribution,
                    "Algorithm": name,
                    "Accuracy": accuracy,
                    "Precision": precision,
                    "Recall": recall,
                    "F1 Score": f1,
                    "Time": f"{execution_time:.4f}"
                })

    # Wyświetlanie wyników
    results_df = pd.DataFrame(results)
    print(results_df)
    return results_df


# Uruchomienie programu
# results_df = evaluate_algorithms()
#
# # Zapis wyników do pliku CSV
# results_df.to_csv("comparison/anomaly_detection_results.csv", index=False)


def evaluate_algorithms_on_product_data(product_id, start_date, end_date, df):
    algorithms = {
        "KMeans": analyze_kmeans_product,
        "DBSCAN": analyze_dbscan_product,
        "Isolation Forest": analyze_isolation_forest_product,
        "Z-Score": analyze_zscore_product,
        "IQR": analyze_iqr_product
    }

    for name, algorithm in algorithms.items():
        data = df.copy()
        algorithm(product_id, start_date, end_date, data)

