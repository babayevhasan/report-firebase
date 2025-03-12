import React, { useEffect, useState } from "react";
import { getData, recordSale } from "../../firebase"; 
import { db } from "../../firebase";  
import { getDocs, collection, updateDoc, doc } from "firebase/firestore";
import styles from "./Sell.module.css"; 

const Sell = () => {
  const [products, setProducts] = useState([]); 
  const [employees, setEmployees] = useState([]); 
  const [selectedProduct, setSelectedProduct] = useState(""); 
  const [selectedEmployee, setSelectedEmployee] = useState(""); 
  const [quantity, setQuantity] = useState(1); 
  const [isButtonDisabled, setIsButtonDisabled] = useState(false); 

  useEffect(() => {
    const fetchData = async () => {
      const productsData = await getData(); 
      setProducts(productsData); 

      const employeeSnapshot = await getDocs(collection(db, "employees"));
      const employeesData = employeeSnapshot.docs.map(doc => ({
        id: doc.id, 
        name: doc.data().name,
        sales: doc.data().sales || {},
        totalSalesValue: doc.data().totalSalesValue || {},
      }));
      setEmployees(employeesData);
    };
    fetchData();
  }, []);

  const getWeeklyDateRange = () => {
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay();
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - dayOfWeek); 
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); 

    const formatDate = (date) => date.toISOString().split('T')[0];

    return `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`;
  };

  const handleSell = async () => {
    if (!selectedProduct || !selectedEmployee || quantity <= 0) {
      alert("BÜTÜN MƏLUMATLARI DOLDUR!");
      return;
    }

    const product = products.find(p => p.id === selectedProduct);
    
    if (product.stock < quantity) {
      alert("KİFAYƏT QƏDƏR MƏHSUL YOXDUR");
      return;
    }

    setIsButtonDisabled(true);

    const weeklyRange = getWeeklyDateRange();

    await recordSale(selectedProduct, quantity, selectedEmployee);

    const employee = employees.find(emp => emp.name === selectedEmployee);

    const employeeRef = doc(db, "employees", employee.id);
    const updatedSales = { ...employee.sales, [weeklyRange]: (employee.sales[weeklyRange] || 0) + quantity };
    
    const updatedTotalSalesValue = {
      ...employee.totalSalesValue,
      [weeklyRange]: (employee.totalSalesValue[weeklyRange] || 0) + (product.price * quantity),
    };

    await updateDoc(employeeRef, {
      sales: updatedSales,
      totalSalesValue: updatedTotalSalesValue,
    });

    const updatedProducts = await getData();
    setProducts(updatedProducts);

    const updatedEmployees = await getDocs(collection(db, "employees"));
    setEmployees(updatedEmployees.docs.map(doc => ({
      id: doc.id, 
      name: doc.data().name,
      sales: doc.data().sales || {},
      totalSalesValue: doc.data().totalSalesValue || {},
    })));

    alert("MƏHSUL SATILDI!");

    setSelectedProduct("");
    setSelectedEmployee("");
    setQuantity(1);

    setIsButtonDisabled(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.form}>
        <label>İşçi Seçimi:</label>
        <select value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)}>
          <option value="">İşçi Seçimi</option>
          {employees.map(emp => (
            <option key={emp.id} value={emp.name}>{emp.name}</option>
          ))}
        </select>

        <label>Məhsul Seçimi:</label>
        <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>
          <option value="">Məhsul Seç</option>
          {products.map(product => (
            <option key={product.id} value={product.id}>
              {product.name} ({product.price} TL) - Stok: {product.stock}
            </option>
          ))}
        </select>

        <label>Adet:</label>
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={e => setQuantity(Number(e.target.value))}
        />

        <button onClick={handleSell} disabled={isButtonDisabled}>Satışı Təsdiqlə</button>
      </div>
    </div>
  );
};

export default Sell;


