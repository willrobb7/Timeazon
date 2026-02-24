import { useParams } from "react-router-dom";
import { useState } from "react";
import { BackButton } from "./BackButton.jsx";
import "./ProductPage.css"

export default function ProductPage({ products }) {
  console.log(products);
  const { id } = useParams();
  

  const product = products.find(
    p => p.id === Number(id)
  );

  if (!product) {
    return <h2>Product not found</h2>;
  }

  return (
    <div className="productPageElements">
      <BackButton className="productPageBackButton"/>
      <div className="pageImage">
      <img src={product.image} className="productPageImage"/>
      </div>
      <div className="productDetails">
      <h2>{product.title}</h2>
      <p>{product.description}</p>
      <h3>{product.price}</h3>
      </div>
    </div>
  );
}


