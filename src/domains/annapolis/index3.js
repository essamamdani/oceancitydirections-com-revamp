const Index3 = {
  swiper: [
    {
      title: process.env.NEXT_PUBLIC_NAME,
      subTitle: `Realty and Business Search for ${process.env.NEXT_PUBLIC_NAME}`,
      content: `Come enjoy restaurants, shops and hotels in the ${process.env.NEXT_PUBLIC_NAME} area`,
      img: `img/photo/photo-${process.env.NEXT_PUBLIC_FOLDER}-community1.jpg`,
      parallax: "-500",
      button: `Start exploring ${process.env.NEXT_PUBLIC_NAME}`,
      buttonLink: "#",
      buttonClasses: "d-none d-sm-inline-block",
      iconsRight: [
        {
          title: `${process.env.NEXT_PUBLIC_NAME} Travel Resources`,
          badge: "Explore",
          icon: "airplane-mode-1",
          link: `/business/search?categories=19000&location=${process.env.NEXT_PUBLIC_FOLDER}`,
        },
        {
          title: "Lots and Land",
          badge: `${process.env.NEXT_PUBLIC_NAME} Land Search`,
          icon: "suitcase-1",
          link: `/search?type=buy&q=${process.env.NEXT_PUBLIC_FOLDER}&propertyType=lot-land&pricemin=&pricemax=&bedrooms=`,
        },
        {
          title: `${process.env.NEXT_PUBLIC_NAME} Investment Opportunities`,
          content: "Commercial Property",
          icon: "image-gallery-1",
          link: `/search?type=buy&q=${process.env.NEXT_PUBLIC_FOLDER}&propertyType=commercial&pricemin=&pricemax=&bedrooms=`,
        },
      ],
    },
    {
      title: `Realty | Business | Community Search for ${process.env.NEXT_PUBLIC_NAME}`,
      content: `Come enjoy restaurants, shops and hotels in the ${process.env.NEXT_PUBLIC_NAME} area`,
      img: `img/photo/photo-${process.env.NEXT_PUBLIC_FOLDER}-community2.jpg`,
      parallax: "-500",
      button: "Start exploring",
      buttonLink: "#",
      buttonClasses: "d-md-none",
      blocks: [
        {
          title: "Annapolis Marina",
          location: "Annapolis City Marina",
          img: "img/photo/annapolis-marina.jpg",
          link: "/business/search?q=Annapolis+City+Marina&location=Annapolis+MD",
          stars: "5",
        },
        {
          title: "Maryland Inn",
          location: "A Ghostly Past!",
          img: "img/photo/annapolis-maryland-inn.jpg",
          link: "business/search?q=Tours&location=Annapolis+MD",
          stars: "4",
        },
        {
          title: "MD State Capital",
          location: "Explore the Maryland State Capital",
          img: "img/photo/state-capital-building.jpg",
          link: "business/search?categories=12000&location=Annapolis+MD",
          stars: "5",
        },
      ],
    },
    {
      title: process.env.NEXT_PUBLIC_DEFAULT_CITY,
      subTitle: "Sail into a new home today!",
      content: process.env.NEXT_PUBLIC_NAME,
      img: `img/photo/photo-${process.env.NEXT_PUBLIC_FOLDER}-community3.jpg`,
      parallax: "-500",
      iconsBottom: [
        {
          title: "Travel Resources",
          badge: "Explore",
          icon: "airplane-mode-1",
          link: "",
        },
        {
          title: "Vacation Properties",
          badge: "Investments",
          icon: "suitcase-1",
          link: "#",
        },
        {
          title: "Guide & gallery",
          content: "See more",
          icon: "image-gallery-1",
          link: "#",
        },
      ],
    },
  ],
  numberedBlocks: [
    {
      title: "Travel",
      content: `Visit ${process.env.NEXT_PUBLIC_DEFAULT_CITY}`,
    },
    {
      title: "Relax",
      content:
        "Annapolis",
    },
    {
      title: "Explore",
      content:
        "Annapolis",
    },
  ],
  imageDivider: "img/photo/places-divider.jpg",
  searchOptions: [
    {
      value: "small",
      label: "Restaurants",
    },
    {
      value: "medium",
      label: "Hotels",
    },
    {
      value: "large",
      label: "Cafes",
    },
    {
      value: "x-large",
      label: "Garages",
    },
  ],
  popular: {
    title: `Popular destinations in Greater ${process.env.NEXT_PUBLIC_NAME}`,
    content: `Fun things to do in ${process.env.NEXT_PUBLIC_DEFAULT_CITY}.`,
    button: "Take me there",
    places: [
      {
        title: "MD State Capital",
        subTitle: "Explore the Maryland State Buildings",
        img: "img/photo/state-capital-building.jpg",
        link: "/business/search?q=Government&location=annapolis",
      },
      {
        title: "History Tours",
        location: "A Ghostly Past!",
        img: "img/photo/annapolis-maryland-inn.jpg",
        link: "/business/search?q=History+Tours&location=annapolis",
      },
      {
        title: "Annapolis Marina",
        location: "Annapolis City Marina",
        img: "img/photo/annapolis-marina.jpg",
        link: "/business/search?q=Sunset&categories=13000",
      },
      {
        title: "U.S. Naval Academy",
        subTitle: "Explore the U.S. Naval Academy",
        img: "img/photo/state-capital-building.jpg",
        link: "/business/search?q=Naval+Academy&location=annapolis",
      },
      {
        title: "Annapolis MD Real Estate For Sale",
        subTitle: "Homes for sale in ZIP codes of 21401 21403 21409",
        img: "",
        link: "/county/anne-arundel/annapolis",
      },
      {
        title: "Crofton MD Real Estate For Sale",
        location: "Homes for sale in ZIP code 21114",
        img: "",
        link: "/county/anne-arundel/crofton",
      },
      {
        title: "Crownsville MD Real Estate For Sale",
        location: "Homes for sale in ZIP code of 21032",
        img: "",
        link: "/county/anne-arundel/crownsville",
      },
      {
        title: "Servera Park MD Real Estate For Sale",
        subTitle: "Homes for sale in ZIP code of 21146",
        img: "",
        link: "/county/anne-arundel/severna-park",
      },
    ],
  },
}
export default Index3
