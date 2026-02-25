import Carousel from "./Carousel";
import HomePageCard from "./Homepagecard";
import "./Homepage.css";

export default function Homepage(props) {
  const homepageItems = [
    {
      id: 1,
      title: "SHOP PAST",
      image: "/past.jpg",
    },
    {
      id: 2,
      title: "SHOP PRESENT",
      image: "/present.jpg",
    },
    {
      id: 3,
      title: "SHOP FUTURE",
      image: "/future.jpg",
    },
  ]

    return (
      <div className="app">
        <div className="hero-title">
        <h1>Timeazon - Shop the Future. Relive the Past.</h1>
        </div>
        <div className="homepage-row">
          {homepageItems.map((item) => (
            <HomePageCard
              key={item.id}
              image={item.image}
              title={item.title}
            />
          ))}
        </div>

        <div className="hero-title">
          <h2>Featured Products</h2>
        </div>
        <Carousel ></Carousel>
      </div>
    );
}

//testing comment
