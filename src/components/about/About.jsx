import React, { useEffect, useState } from "react";
import { getData } from "../../firebase";
import styles from "../about/About.module.css";

const About = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const productsData = await getData();
      setProducts(productsData);
    };
    fetchData();
  }, []);

  const sortedProducts = [...products].sort((a, b) => b.timestamp - a.timestamp);

  const totalStock = sortedProducts.reduce((total, product) => total + Number(product.stock), 0);

  return (
    <div className={styles["about-container"]}>
      <h1>Products List</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
          </tr>
        </thead>
        <tbody>
          {sortedProducts.map((product) => (
            <tr key={product.id}>
              <td>{product.id}</td>
              <td>{product.name}</td>
              <td>{product.price} AZN</td>
              <td
                style={{
                  color: product.stock <= 30 ? "red" : "black", 
                }}
              >
                {product.stock} ədəd
              </td>
            </tr>
          ))}
          <tr>
            <td colSpan="3" style={{ fontWeight: "bold", textAlign: "right" }}>Total Stock:</td>
            <td style={{ fontWeight: "bold" }}>{totalStock} ədəd</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default About;



