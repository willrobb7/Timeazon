import React from "react";
import "./App.css";
import ProductCatalogue from "./pages/ProductCatalogue";
import products from "./components/products";
import ProductCards from './components/ProductCard'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProductPage from "./components/Productpage";
import Layout from "./Layout/Layout";
import Carousel from "./components/Carousel";
import Error from "./components/Error"
import ContactUs from "./components/ContactUs";
import Login from "./components/Login";
import TimePortal from "./components/TimePortal";
import Signup from "./components/Signup";
import PasswordReset from "./components/passwordreset";
import SellItem from "./pages/SellItem";


const App = () => {
  return (
    <Routes>
    {/* Layout route */}
    <Route path="/" element={<Layout />}>
     <Route index element={<Carousel/>} />
     <Route path="login" element={<Login />} />
     <Route path="signup" element={<Signup />} />
     <Route path="PasswordReset" element={<PasswordReset />} />   
      <Route path="product" element={<ProductCatalogue />} />
      <Route path="product/:id" element={<ProductPage products={products} />} />
      {/* /:id is for each of the product ids - for the individual pages*/}
      <Route path="time-portal" element={<TimePortal />} />
      <Route path="sell" element={<SellItem />} />
      <Route path="contact-us" element={<ContactUs />} />
      <Route path="*" element={<Error />} />
      
      
    </Route>
  </Routes>
  );
};

export default App;
