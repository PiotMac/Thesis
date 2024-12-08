from sklearn.cluster import KMeans, DBSCAN
from sklearn.ensemble import IsolationForest
from scipy.stats import zscore
import numpy as np
from sklearn.metrics import silhouette_score
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt
import seaborn as sns

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


def analyze_kmeans(product_id, df):
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

    clusters = df['cluster'].unique()
    cmap = plt.get_cmap("tab10")
    colors = [cmap(i / len(clusters)) for i in range(len(clusters))]  # Generate distinct colors for clusters

    plt.figure(figsize=(10, 6))

    for cluster, color in zip(clusters, colors):
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
        color="black",
        marker="x",
        s=100,
        alpha=0.9
    )

    # Customize the plot
    plt.title(f"KMeans analysis for Product ID = {product_id}", fontsize=14)
    plt.xlabel("Price Per Unit", fontsize=12)
    plt.ylabel("Quantity Delivered", fontsize=12)
    plt.legend()
    plt.grid(True)
    plt.savefig("test1")

    # Plot Silhouette Scores
    plt.figure(figsize=(10, 6))
    plt.plot(cluster_range, silhouette_scores, marker='o', color='green')
    plt.title("Silhouette Scores for K-Means Clustering")
    plt.xlabel("Number of Clusters")
    plt.ylabel("Silhouette Score")
    plt.grid(True)
    plt.tight_layout()
    plt.savefig("kmeans_silhouette_scores1.png")


def analyze_dbscan(product_id, df):
    # Preprocess data
    features = df[['price_per_unit', 'avg_quantity']].values
    scaler = StandardScaler()
    features_scaled = scaler.fit_transform(features)

    # Apply DBSCAN
    dbscan = DBSCAN(eps=0.15, min_samples=10)
    df['cluster'] = dbscan.fit_predict(features_scaled)
    print(df['cluster'].unique())

    # Plot the clusters
    plt.figure(figsize=(12, 6))
    unique_clusters = np.unique(df['cluster'])

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
                c="black",
                alpha=1.0,
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
    plt.title(f"DBSCAN Analysis for Product {product_id}")
    plt.xlabel("Quantity Delivered")
    plt.ylabel("Price Per Unit")
    plt.xticks(rotation=45)
    # plt.legend()
    plt.grid(True)
    plt.tight_layout()
    plt.savefig("dbscan_test")


def analyze_isolation_forest(product_id, df):
    # Preprocess data
    features_scaled = df[['avg_quantity', 'price_per_unit']].values

    # Apply Isolation Forest
    isolation_forest = IsolationForest(n_estimators=1000, max_samples='auto', contamination=0.05, random_state=42)
    df['anomaly'] = isolation_forest.fit_predict(features_scaled)

    estimator = isolation_forest.estimators_[0].tree_

    # Create a grid of points for decision boundary
    x_min, x_max = features_scaled[:, 0].min() - 0.1 * abs(features_scaled[:, 0].min()), features_scaled[:, 0].max() + 0.1 * abs(features_scaled[:, 0].max())
    y_min, y_max = features_scaled[:, 1].min() - 0.1 * abs(features_scaled[:, 1].min()), features_scaled[:, 1].max() + 0.1 * abs(features_scaled[:, 1].max())

    def plot_isolation_for_point(point, x_min, x_max, y_min, y_max, point_type):
        def recursive_plot(node, x_min, x_max, y_min, y_max):
            if estimator.children_left[node] == -1 and estimator.children_right[node] == -1:
                return

            feature = estimator.feature[node]
            threshold = estimator.threshold[node]

            if feature == 0:  # avg_quantity (x-axis)
                # threshold_original = scaler.inverse_transform([[threshold, 0]])[0][0]
                if point[0] <= threshold:  # The point falls into the left child
                    plt.plot([threshold, threshold], [y_min, y_max], color="black", linestyle="-",
                             alpha=1.0, zorder=3)
                    recursive_plot(estimator.children_left[node], x_min, threshold, y_min, y_max)
                else:  # The point falls into the right child
                    plt.plot([threshold, threshold], [y_min, y_max], color="black", linestyle="-",
                             alpha=1.0, zorder=3)
                    recursive_plot(estimator.children_right[node], threshold, x_max, y_min, y_max)

            elif feature == 1:  # price_per_unit (y-axis)
                # threshold_original = scaler.inverse_transform([[0, threshold]])[0][1]
                if point[1] <= threshold:  # The point falls into the lower child
                    plt.plot([x_min, x_max], [threshold, threshold], color="black", linestyle="-",
                             alpha=1.0, zorder=3)
                    recursive_plot(estimator.children_left[node], x_min, x_max, y_min, threshold)
                else:  # The point falls into the upper child
                    plt.plot([x_min, x_max], [threshold, threshold], color="black", linestyle="-",
                             alpha=1.0, zorder=3)
                    recursive_plot(estimator.children_right[node], x_min, x_max, threshold, y_max)

        # Plot the results
        plt.figure(figsize=(12, 8))

        recursive_plot(0, x_min, x_max, y_min, y_max)

        # Highlight the specific point
        plt.scatter(
            point[0],
            point[1],
            c="yellow" if point_type == "normal" else "red",
            s=200,  # Larger size for better visibility
            label=f"Separated {point_type.capitalize()} Point",
            edgecolors="black",
            linewidth=2,
            marker="*" if point_type == "anomaly" else "o",
            zorder=4,
        )

        # Plot normal points
        plt.scatter(
            normal_points[['avg_quantity', 'price_per_unit']].values[:, 0],
            normal_points[['avg_quantity', 'price_per_unit']].values[:, 1],
            label="Normal Points",
            c="blue",
            edgecolors='black',
            alpha=1.0,
            zorder=1,
        )

        # Plot anomalies
        plt.scatter(
            anomalies[['avg_quantity', 'price_per_unit']].values[:, 0],
            anomalies[['avg_quantity', 'price_per_unit']].values[:, 1],
            label="Anomalies",
            c="red",
            alpha=1.0,
            marker="x",
            zorder=1,
        )

        # Customize the plot
        if point_type == 'normal':
            title = f"Separating a normal point using Isolation Forest for Product {product_id}"
        else:
            title = f"Separating an anomaly using Isolation Forest for Product {product_id}"
        plt.title(title)
        plt.xlabel("Quantity Delivered")
        plt.ylabel("Price Per Unit")
        plt.legend()
        plt.xlim(x_min, x_max)
        plt.ylim(y_min, y_max)
        plt.savefig(f"isolation_forest_test_not_scaled_{point_type}")

    # Identify anomalies and normal points
    anomalies = df[df['anomaly'] == -1]
    normal_points = df[df['anomaly'] == 1]

    # Calculate anomaly scores
    df['anomaly_score'] = isolation_forest.score_samples(features_scaled)

    # Most anomalous point
    most_anomalous_point = df.loc[df['anomaly_score'].idxmin()]

    # Most normal point
    best_normal_point = df.loc[df['anomaly_score'].idxmax()]

    most_anomalous = [[most_anomalous_point['avg_quantity'], most_anomalous_point['price_per_unit']]][0]
    best_normal = [[best_normal_point['avg_quantity'], best_normal_point['price_per_unit']]][0]

    # Plot for the anomaly
    plot_isolation_for_point(most_anomalous, x_min, x_max, y_min, y_max, point_type="anomaly")

    # Plot for the normal point
    plot_isolation_for_point(best_normal, x_min, x_max, y_min, y_max, point_type="normal")


def analyze_zscore(product_id, df):
    # Preprocess data using Z-score normalization
    features = df[['price_per_unit', 'avg_quantity']].values
    mean = np.mean(features, axis=0)
    std = np.std(features, axis=0)
    features_zscore = (features - mean) / std  # Z-score normalization

    # Add normalized data back to the DataFrame for visualization
    df['price_per_unit_zscore'] = features_zscore[:, 0]
    df['avg_quantity_zscore'] = features_zscore[:, 1]

    # Plot the normalized data
    plt.figure(figsize=(10, 6))
    plt.scatter(
        df['avg_quantity_zscore'],
        df['price_per_unit_zscore'],
        color="blue",
        alpha=1.0
    )
    plt.title(f"Z-score Normalized Data for Product {product_id}")
    plt.xlabel("Average Quantity (Z-score)")
    plt.ylabel("Price Per Unit (Z-score)")
    plt.grid(True)
    plt.tight_layout()
    plt.savefig(f"zscore_plot.png")

    # Plot the original data
    plt.figure(figsize=(10, 6))
    plt.scatter(
        df['avg_quantity'],
        df['price_per_unit'],
        color="blue",
        alpha=1.0
    )
    plt.title(f"Original Data for Product {product_id}")
    plt.xlabel("Average Quantity")
    plt.ylabel("Price Per Unit")
    plt.grid(True)
    plt.tight_layout()
    plt.savefig(f"zscore_plot_original.png")


def analyze_iqr(product_id, df):
    # Define features to analyze
    features = df[['price_per_unit', 'avg_quantity']]

    # Calculate IQR for each feature
    Q1 = features.quantile(0.25)
    Q3 = features.quantile(0.75)
    IQR = Q3 - Q1
    k = 1.0

    # Determine lower and upper bounds for anomalies
    lower_bound = Q1 - k * IQR
    upper_bound = Q3 + k * IQR

    # Detect anomalies
    df['is_anomaly'] = ((features < lower_bound) | (features > upper_bound)).any(axis=1)

    # Plot the data with anomalies highlighted
    plt.figure(figsize=(10, 6))
    anomalies = df[df['is_anomaly']]
    non_anomalies = df[~df['is_anomaly']]

    plt.scatter(
        non_anomalies['avg_quantity'],
        non_anomalies['price_per_unit'],
        color='blue',
        label='Normal Points',
        alpha=0.7
    )
    plt.scatter(
        anomalies['avg_quantity'],
        anomalies['price_per_unit'],
        color='red',
        label='Anomalies',
        alpha=1.0,
        marker='x'
    )
    plt.title(f"IQR Anomaly Detection for Product {product_id}")
    plt.xlabel("Quantity Delivered")
    plt.ylabel("Price Per Unit")
    plt.legend()
    plt.grid(True)
    plt.tight_layout()
    plt.savefig(f"iqr_anomalies_plot_product_{product_id}.png")

    # Plot the normal distribution for each feature
    for column in ['price_per_unit', 'avg_quantity']:
        plt.figure(figsize=(10, 6))
        if column == 'price_per_unit':
            label = "Price Per Unit"
        else:
            label = "Quantity Delivered"
        sns.histplot(
            df[column], kde=True, bins=20, color='blue', label=f'Distribution'
        )
        plt.axvline(Q1[column], color='orange', linestyle='--', label='Q1')
        plt.axvline(Q3[column], color='green', linestyle='--', label='Q3')
        plt.axvline(lower_bound[column], color='red', linestyle='--', label='Lower Bound')
        plt.axvline(upper_bound[column], color='red', linestyle='--', label='Upper Bound')
        plt.title(f"Normal Distribution with IQR Bounds for {label} (Product {product_id})")
        plt.xlabel(label)
        plt.ylabel("Frequency")
        plt.legend()
        plt.tight_layout()
        plt.savefig(f"normal_distribution_{column}_product_{product_id}.png")
