import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; 
import './App.css'; 
import Header from "./components/header/Header"; 
import Home from "./components/home/Home"; 
import About from "./components/about/About"; 
import Sell from "./components/sell/Sell"; 
// import Popular from "./components/popular/Popular";

const App = () => {
  return (
    <Router> 
      <div className="main">
        <Header /> 
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} /> 
          <Route path="/sell" element={<Sell />} /> 
          {/* <Route path="/popular" element={<Popular />} />  */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
