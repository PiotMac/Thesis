import React, { useState } from 'react';
import ProductItem from './ProductItem';

const ProductList = () => {
  const [products] = useState([
    { id: 1, name: 'T-Shirt', price: 19.99 },
    { id: 2, name: 'Jeans', price: 49.99 },
    { id: 3, name: 'Jacket', price: 79.99 }
  ]);

  return (
    <div className="product-list">
      <h2>Our Products</h2>
      <div className="products">
        {products.map(product => (
          <ProductItem key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductList;
