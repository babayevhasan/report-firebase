import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  increment,
  query,
  orderBy,
  serverTimestamp,
  where,
  arrayUnion,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAS5ZZWGNV9JPlJW2U2PwXMWox0vSWCE7w",
  authDomain: "dashboard-d661e.firebaseapp.com",
  projectId: "dashboard-d661e",
  storageBucket: "dashboard-d661e.appspot.com",
  messagingSenderId: "351372412183",
  appId: "1:351372412183:web:fd116ba7ce4aad49466352",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const formatDateTime = (date) =>
  new Date(date).toLocaleString("tr-TR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

const formatDate = (date) =>
  new Date(date).toLocaleDateString("tr-TR");

const getWeekDateRange = (date) => {
  const current = new Date(date);
  const firstDay = current.getDate() - current.getDay() + 1;
  const lastDay = firstDay + 6;

  const start = new Date(current.setDate(firstDay));
  const end = new Date(current.setDate(lastDay));

  return { start: formatDate(start), end: formatDate(end) };
};

const getMonthYear = (date) =>
  new Date(date).toLocaleString("tr-TR", { month: "long", year: "numeric" });

const recordSalesReport = async (
  startDate,
  endDate,
  totalSales,
  totalItemsSold,
  productsSold,
  reportType
) => {
  try {
    const reportId =
      reportType === "weekly_reports" ? `${startDate} - ${endDate}` : startDate;
    const reportRef = doc(db, reportType, reportId);

    const reportExists = (
      await getDocs(collection(db, reportType))
    ).docs.some((doc) => doc.id === reportId);

    if (reportExists) {
      await updateDoc(reportRef, {
        totalSales: increment(totalSales),
        totalItemsSold: increment(totalItemsSold),
        productsSold: arrayUnion(...productsSold),
      });
    } else {
      await setDoc(reportRef, {
        startDate,
        endDate,
        totalSales,
        totalItemsSold,
        productsSold,
      });
    }
    console.log(`Hesabat Qeydedildi: ${reportType}, ${reportId}`);
  } catch (error) {
    console.error("Hesabat xətası:", error);
  }
};

const recordSale = async (productId, quantity, employeeName) => {
  try {
    const productRef = doc(db, "products", productId);
    const productSnapshot = await getDocs(collection(db, "products"));
    const productData = productSnapshot.docs.find(
      (doc) => doc.id === productId
    );

    if (!productData) throw new Error("Məhsul tapılmadı!");

    const productInfo = productData.data();
    const { name: productName, price: productPrice, sold = 0 } = productInfo;

    const employeeSnapshot = await getDocs(collection(db, "employees"));
    const employeeDoc = employeeSnapshot.docs.find(
      (doc) => doc.data().name === employeeName
    );

    if (!employeeDoc) throw new Error("İşçi tapılmadı!");

    await updateDoc(productRef, {
      stock: increment(-quantity),
      sold: increment(quantity),
    });
    await updateDoc(employeeDoc.ref, {
      sales: increment(quantity),
      totalSalesValue: increment(productPrice * quantity),
    });

    const totalPrice = productPrice * quantity;
    const saleDate = new Date();
    const formattedDateTime = formatDateTime(saleDate);

    const productSold = [
      {
        productName,
        quantity,
        totalPrice,
        productPrice,
        employeeName,
        date: formattedDateTime,
      },
    ];

    await addDoc(collection(db, "sales"), {
      productName,
      productPrice,
      quantity,
      employeeName,
      totalPrice,
      date: formattedDateTime,
      timestamp: serverTimestamp(),
    });

    const weekRange = getWeekDateRange(saleDate);
    const monthYear = getMonthYear(saleDate);

    await recordSalesReport(
      formatDate(saleDate),
      formatDate(saleDate),
      totalPrice,
      quantity,
      productSold,
      "daily_reports"
    );

    await recordSalesReport(
      monthYear,
      monthYear,
      totalPrice,
      quantity,
      productSold,
      "monthly_reports"
    );

    await recordSalesReport(
      weekRange.start,
      weekRange.end,
      totalPrice,
      quantity,
      productSold,
      "weekly_reports"
    );

  } catch (error) {
    console.error("Satış xətası:", error);
  }
};

const resetEmployeeSales = async () => {
  const employeesSnapshot = await getDocs(collection(db, "employees"));
  const currentMonth = new Date().toLocaleString("tr-TR", { month: "numeric" });

  employeesSnapshot.forEach(async (employeeDoc) => {
    const employeeData = employeeDoc.data();
    const lastResetMonth = employeeData.lastResetMonth || currentMonth;

    if (lastResetMonth !== currentMonth) {
      await updateDoc(employeeDoc.ref, {
        sales: 0,
        totalSalesValue: 0,
        lastResetMonth: currentMonth,
      });
      console.log(`${employeeData.name} üçün satış sıfırlandı.`);
    }
  });
};

setInterval(resetEmployeeSales, 30 * 24 * 60 * 60 * 1000);

const getData = async () => {
  const snapshot = await getDocs(collection(db, "products"));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

const addProduct = async (name, price, stock) =>
  await addDoc(collection(db, "products"), { name, price, stock, sold: 0 });

const deleteProduct = async (id) => await deleteDoc(doc(db, "products", id));

const getSales = async () => {
  const salesQuery = query(collection(db, "sales"), orderBy("timestamp", "asc"));
  const snapshot = await getDocs(salesQuery);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export { getData, addProduct, deleteProduct, recordSale, getSales, db };
