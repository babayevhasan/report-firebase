import React, { useEffect, useState } from "react";
import { getFirestore, collection, onSnapshot, query, orderBy } from "firebase/firestore";
import styles from "../popular/Popular.module.css";

const Popular = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const db = getFirestore(); // Firestore bağlantısını alın
    const productsCollection = collection(db, "products"); // 'products' koleksiyonunu alın
    const productsQuery = query(productsCollection, orderBy("sales", "desc")); // Verileri 'sales' sütununa göre sıralayın

    const unsubscribe = onSnapshot(productsQuery, (snapshot) => {
      const productsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productsData);
    });

    return () => unsubscribe(); // Bellek sızıntısını önlemek için aboneliği temizleyin
  }, []);

  return (
    <div className={styles["popular-container"]}>
      <h1>Most Popular Products</h1>
      <table>
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Sales</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.sales || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Popular;


