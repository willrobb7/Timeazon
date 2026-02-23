import React from "react";
import { useEffect, useState } from "react";
import "./Navbar.css";
import { NavLink } from "react-router-dom";
import BackendStatus from "./healthCheckButton.jsx"

const Navbar = () => {
  return (
    <div className="navbar">
      <div className="backend-status-wrapper">
    <BackendStatus />
    </div>
      <NavLink to="/">
        <img src="/timeazon.png" alt="Website Logo" className="logo" />
      </NavLink>

      <ul>
        <li><NavLink to="/time-portal">Homepage</NavLink></li>
        <li><NavLink to="/product">Shop</NavLink></li>
        <li><NavLink to="/sell">Sell</NavLink></li>
        <li><NavLink to ="/contact-us">Contact Us</NavLink></li>
        <li><NavLink to="/login">Login</NavLink></li>
      </ul>

      <div className="Search-bar">
        <input type="text" placeholder="Search" />
      </div>

      {/* Cart Button */}
      <div className="cart">
        <img src="/shoppingCart.png" alt="Cart" />
        <span className="cart-count">0</span>
      </div>
    </div>
  );
};


export default Navbar;
