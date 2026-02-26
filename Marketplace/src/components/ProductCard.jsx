export default function ProductCard({ product, onClick }) {

  

  return (
    <div className="product-card">
      <div className="card-frame">
        <div className="image-wrapper" onClick={onClick}>
          <img src={product.image_url} alt={product.name} />

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

