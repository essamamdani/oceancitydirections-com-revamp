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
                    "title": "Federal Hill",
                    "location": "Fed Hill",
                    "img": "img/photo/federal-hill.jpg",
                   // "link": `/business/search?q=Fed+Hill&location=${process.env.NEXT_PUBLIC_NAME}`,
                    "link": `/county/baltimore-city/baltimore/21230/federal-hill-historic-district`,
                    "stars": "4"
                },
                {
                    "title": "Fells Point",
                    "location": "Explore Fells Point",
                    "img": "img/photo/fells-point.jpg",
                    "link": `/business/search?q=Fells+Point&location=${process.env.NEXT_PUBLIC_NAME}`,
                    "stars": "4"
                },
                {
                    "title": "M&T Stadium",
                    "location": "Ravens!",
                    "img": "img/photo/m-and-t-stadium.jpg",
                    "link": `/business/search?q=stadiums&location=${process.env.NEXT_PUBLIC_NAME}`,
                    "stars": "5"
                }
            ]
        },
        {
            "title": process.env.NEXT_PUBLIC_DEFAULT_CITY,
            "subTitle": "Sail into a new home today!",
            "content": process.env.NEXT_PUBLIC_NAME,
            "img": `img/photo/photo-${process.env.NEXT_PUBLIC_FOLDER}-community3.jpg`,
            "parallax": "-500",
            "iconsBottom": [
                {
                    "title": "Travel Resources",
                    "badge": "Explore",
                    "icon": "airplane-mode-1",
                    "link": `/business/search?q=Airport&location=baltimore`
                },
                {
                    "title": "Vacation Properties",
                    "badge": "Investments",
                    "icon": "suitcase-1",
                    "link": "#"
                },
                {
                    "title": "Guide & gallery",
                    "content": "See more",
                    "icon": "image-gallery-1",
                    "link": "#"
                }
            ]
        }
    ],
    "numberedBlocks": [
        {
            "title": "Travel",
            "content": `Visit ${process.env.NEXT_PUBLIC_DEFAULT_CITY}`
        },
        {
            "title": "Relax",
            "content": "Crabs and Beer"
        },
        {
            "title": "Explore",
            "content": "Walk through History"
        }
    ],
    "imageDivider": "img/photo/places-divider.jpg",
    "searchOptions": [
        {
            "value": "small",
            "label": "Restaurants"
        },
        {
            "value": "medium",
            "label": "Hotels"
        },
        {
            "value": "large",
            "label": "Cafes"
        },
        {
            "value": "x-large",
            "label": "Garages"
        }
    ],
    "popular": {
        "title": `Popular destinations in Greater ${process.env.NEXT_PUBLIC_NAME}`,
        "content": `Fun things to do in ${process.env.NEXT_PUBLIC_DEFAULT_CITY}.`,
        "button": "Take me there",
        "places": [
            {
                "title": "Inner Harbor",
                "subTitle": "Walk the Inner Harbor",
                "img": "img/photo/inner-harbor-hard-rock.jpg",
                "link": `/business/search?q=Harbor&location=${process.env.NEXT_PUBLIC_NAME}`
            },
            {
                "title": "National Aquarium",
                "subTitle": `Visit downtown ${process.env.NEXT_PUBLIC_DEFAULT_CITY}`,
                "img": "img/photo/national-aquarium.jpg",
                "link": `/business/search?q=Aquarium&location=${process.env.NEXT_PUBLIC_NAME}`
            },
            {
                "title": "Downtown Dining Options",
                "subTitle": `Celebrate in ${process.env.NEXT_PUBLIC_DEFAULT_CITY}`,
                "img": "img/photo/dining-baltimore.jpg",
                "link": "/business/search?categories=13000&location=Inner+Harbor"
            },
            {
                "title": "Sports Stadiums",
                "subTitle": "Orioles and Ravens",
                "img": "img/photo/camden-yards.jpg",
                "link": `/business/search?q=stadiums&location=${process.env.NEXT_PUBLIC_NAME}`
            },
            {
                "title": "Museums",
                "subTitle": "Science and the Arts",
                "img": "img/photo/baltimore-museums.jpg",
                "link": `/business/search?q=Museum&location=${process.env.NEXT_PUBLIC_NAME}`
            },
            {
                "title": "Federal Hill",
                "subTitle": `South ${process.env.NEXT_PUBLIC_DEFAULT_CITY} Peninsula`,
                "img": "img/photo/federal-hill.jpg",
                "link": `/business/search?q=Fed+Hill&location=${process.env.NEXT_PUBLIC_NAME}`
            },
            {
                "title": "Fells Point",
                "subTitle": "Be part of the Wild",
                "img": "img/photo/fells-point.jpg",
                "link": `/business/search?q=Fells+Point&location=${process.env.NEXT_PUBLIC_NAME}`
            },
            {
                "title": "Parks and Landmarks",
                "subTitle": `Outdoor in ${process.env.NEXT_PUBLIC_DEFAULT_CITY}`,
                "img": "img/photo/patterson-park.jpg",
                "link": `/business/search?categories=16000&location=${process.env.NEXT_PUBLIC_NAME}`
            },
            {
                "title": "Gaming in ${process.env.NEXT_PUBLIC_DEFAULT_CITY}",
                "subTitle": "Arts and Entertainment",
                "img": "img/photo/horseshoe-casino.jpg",
                "link": `/business/search?categories=10000&location=${process.env.NEXT_PUBLIC_NAME}`
            }
        ]
    }
};
export default Index3;