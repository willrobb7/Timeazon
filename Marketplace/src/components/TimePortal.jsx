import Carousel from "./Carousel";
import HomePageCard from "./Homepagecard";

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
        <div className="homepage-row">
          {homepageItems.map((item) => (
            <HomePageCard
              key={item.id}
              image={item.image}
              title={item.title}
            />
          ))}
        </div>
        
        <Carousel ></Carousel>
      </div>
    );
}

//testing comment
