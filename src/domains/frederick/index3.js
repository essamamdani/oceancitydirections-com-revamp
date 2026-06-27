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
          title: "Frederick MD",
          location: "Frederick Downtown",
          img: "img/photo/frederick-com1-downtown-sign.jpg",
          link: "https://frederickdirections.com/business/search?q=Downtown&location=frederick",
          stars: "5",
        },
        {
          title: "Carroll Creek",
          location: "Carroll Creek Park",
          img: "img/photo/frederick-com2-carroll-creek-park.jpg",
          link: "https://frederickdirections.com/business/search?categories=16000&location=frederick",
          stars: "4",
        },
        {
          title: "Monocacy",
          location: "Monocacy National Battlefield",
          img: "img/photo/frederick-com3-monocacy.jpg",
          link: "https://frederickdirections.com/business/search?q=Monocacy&location=&sw=39.36907539749303,-77.4225425720215&ne=39.42631511481708,-77.35344886779787#close",
          stars: "5",
        },
      ],
    },
    {
      title: process.env.NEXT_PUBLIC_DEFAULT_CITY,
      subTitle: "Find a new home today!",
      content: process.env.NEXT_PUBLIC_NAME,
      img: `img/photo/photo-${process.env.NEXT_PUBLIC_FOLDER}-community3.jpg`,
      parallax: "-500",
      iconsBottom: [
        {
          title: "Travel Resources",
          badge: "Explore",
          icon: "airplane-mode-1",
          link: "#",
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
        "Frederick",
    },
    {
      title: "Explore",
      content:
        "Frederick",
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
        title: "Monocacy Battlefield",
        subTitle: "National Battlefield",
        img: "img/photo/frederick-com4-monocacy-battlefield.jpg",
        link: "/business/d/4b6192c6f964a5204d182ae3-monocacy-national-battlefield-frederick-md-21704",
      },
      {
        title: "Winchester Hall",
        location: "Frederick Goverment Offices",
        img: "img/photo/frederick-com5-winchester-hall.jpg",
        link: "",
      },
      {
        title: "Museum of Frederick",
        location: "County History",
        img: "img/photo/frederick-com6-museum-history.jpg",
        link: "/business/search?q=Brewery&location=frederick",
      },
      {
        title: "Breweries",
        subTitle: "Brew Pubs and Local Craft Beer",
        img: "img/photo/frederick-com7-brewers-alley.jpg",
        link: "https://frederickdirections.com/business/search?q=Brewery&location=frederick",
      },
      {
        title: "Museum of Civil War Medicine",
        location: "National Museum",
        img: "img/photo/frederick-com8-war-medicine-musuem.jpg",
        link: "https://frederickdirections.com/business/d/4bafaa9af964a5207d153ce3-national-museum-of-civil-war-medicine-frederick-md-21701",
      },
      {
        title: "Frederick Hotels",
        location: "Frederick's Hotel Block",
        img: "img/photo/frederick-com9-hotels.jpg",
        link: "/business/search?q=Hotels&location=frederick",
      },
      {
        title: "Hessian Barracks",
        subTitle: "Downtown Frederick",
        img: "img/photo/frederick-com10-hessian-barracks.jpg",
        link: "/business/d/4f74748de4b0e7c6439b5e8b-hessian-barracks-frederick-md-21701",
      },
      {
        title: "Baker Park",
        location: "Parks and Outdoors",
        img: "img/photo/frederick-com11-baker-park.jpg",
        link: "/business/search?categories=16000&location=frederick",
      },
      {
        title: "Ballenger Creek",
        location: "Frederick MD",
        img: "img/photo/frederick-com12-ballenger-creek-park.jpg",
        link: "business/search?q=Ballenger+Park&location=frederick&sw=39.37315602769589,-77.45095252990723&ne=39.4017800839038,-77.41640567779541",
      },
    ],
  },
}
export default Index3
