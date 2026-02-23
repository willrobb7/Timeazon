import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import EraSelect from "../components/EraSelect";
import "./ProductCatalogue.css";

export default function ProductCatalogue() {
  const [products, setProducts] = useState([]);
  const [selectedEra, setSelectedEra] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        setProducts(data.products);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load products:", err);
        setLoading(false);
      });
  }, []);

  const allEras = [...new Set(products.map(p => p.era))];

  const filteredProducts = selectedEra
    ? products.filter(p => p.era === selectedEra)
    : products;

  if (loading) return <h2>Loading products...</h2>;

  return (
    <div className="app">
      <h1>Featured Products</h1>

      <div className="product-row">
        {filteredProducts.map(product => (
          <Link key={product.id} to={`/product/${product.id}`}>
            <ProductCard product={product} />
          </Link>
        ))}
      </div>

      <EraSelect
        eras={allEras}
        selected={selectedEra}
        onChange={setSelectedEra}
      />
    </div>
  );
}
