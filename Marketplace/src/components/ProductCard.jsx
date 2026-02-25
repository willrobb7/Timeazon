export default function ProductCard({ product, onClick }) {

   const s3domain = "https://timeazon-static-images.s3.eu-west-2.amazonaws.com";

  const imageUrl = `${s3domain}/${product.image_url}`;

  return (
    <div className="product-card">
      <div className="card-frame">
        <div className="image-wrapper" onClick={onClick}>
          <img src={imageUrl} alt={product.name} />

          <button className="addToCart">+</button>
          <p className="addPrompt">Add To Cart</p>

          <div className="overlay" />

          <div className="card-info">
            <h3 className="title">{product.name}</h3>
            <h4 className="price">ⓣ{product.price_credit}</h4>
            <p className="starrating">★★★☆☆</p>
          </div>
        </div>
      </div>
    </div>
  );
}


// import { useEffect, useState } from "react"

// function toTitle(product) {
//   return product
//     .split("_")
//     .map(w => w.charAt(0).toUpperCase() + w.slice(1))
//     .join(" ")
// }

// export default function ProductCards() {
//   const baseUrl = import.meta.env.VITE_PRODUCT_CARDS_DOMAIN
//   const [products, setProducts] = useState([])
//   const [status, setStatus] = useState("loading")

//   useEffect(() => {
//     async function loadProducts() {
//       try {
//         const response = await fetch(`/api/products`)

//         if (!response.ok) {
//           throw new Error("API error")
//         }

//         const data = await response.json()
//         setProducts(data.products)
//         setStatus("ready")
//       } catch {
//         setStatus("error")
//       }
//     }

//     loadProducts()
//   }, [])

//   if (status === "loading") {
//     return <div>Loading products…</div>
//   }

//   if (status === "error") {
//     return <div>Failed to load products</div>
//   }

//   return (
    
//         <div>{products.map(product => {
//           const filename = `${product}.pdf`

//           return (
//             <div key={product}>
//               <div>{toTitle(product)}</div>

//               <button
                
//                 href={`${baseUrl}/${filename}`}
//                 target="_blank"
//                 rel="noreferrer"
//               >
                
//               </button>
//             </div>
            
//           )
//         })}
//       </div>
//   )
// }
