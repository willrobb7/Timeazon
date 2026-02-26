import { useState } from "react";
import "./sellItem.css"

export default function SellItem() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price_credit: "",
    image_url: "",
    era: ""
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          price_credit: Number(form.price_credit),
          image_url: form.image_url,
          era: form.era
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setMessage("Product created successfully.");

      // quick refresh back to catalogue
      window.location.href = "/product";

    } catch (err) {
      console.error(err);
      setMessage("Error creating product.");
    }
  };

  return (
    <div className="sell-container">
    <div class="sellItem">
      <h2 class="sellTitle">Sell an artifact</h2>

      <form className="addItemForm" onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <input
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        />

        <input
          name="price_credit"
          type="number"
          placeholder="Price"
          value={form.price_credit}
          onChange={handleChange}
          required
        />

        <input
          name="image_url"
          placeholder="Image URL"
          value={form.image_url}
          onChange={handleChange}
        />

        <input className="eraInput"
          name="era"
          placeholder="Era"
          value={form.era}
          onChange={handleChange}
        />

        <button className="sellButton" type="submit">Post Product</button>
      </form>

      {message && <p>{message}</p>}
    </div>
    </div>
  );
}
