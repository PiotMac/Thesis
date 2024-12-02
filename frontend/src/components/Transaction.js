import React from "react";

const Transaction = ({ index, transaction }) => {
  function formatDate(dateString) {
    const date = new Date(dateString);

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    // Extract day, month, and year
    const day = date.getUTCDate();
    const month = monthNames[date.getUTCMonth()];
    const year = date.getUTCFullYear();

    return `${day} ${month} ${year}`;
  }

  return (
    <div className="transaction-all-container">
      <div className="transaction-headers-container">
        <div className="transaction-headers">
          <h1 className="transaction-header">Transaction #{index + 1}</h1>
          <h1 className="transaction-header">
            Total price: {transaction.total_price.toFixed(2)}$
          </h1>
          <h1 className="transaction-header">
            {formatDate(transaction.transaction_date)}
          </h1>
        </div>
      </div>
      <div className="transaction-container">
        {transaction.items.map((item) => (
          <div className="transaction-item">
            <div className="transaction-item-left">
              <h1>{item.product.name}</h1>
              <h2 id="transaction-item-brand">{item.product.brand}</h2>
              <h2>Size: {item.product.size.name}</h2>
              <div id="color-transaction-product-container">
                <h2>Color: </h2>
                <div
                  style={{
                    height: "2.67em",
                    aspectRatio: "1",
                    backgroundColor: `rgb(${item.product.color.red},${item.product.color.green},${item.product.color.blue}`,
                    borderRadius: "5px",
                    border: "black solid 2px",
                  }}
                ></div>
              </div>
              <h2>Quantity: {item.transaction_quantity}</h2>
            </div>
            <div className="transaction-item-right">
              <div className="transaction-item-right-top">
                {item.transaction_quantity > 1 && (
                  <h2>Per piece: {item.product.price.toFixed(2)}$</h2>
                )}
                <h1>
                  {(item.transaction_quantity * item.product.price).toFixed(2)}$
                </h1>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Transaction;
