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
            link: `/search?type=buy&q=${process.env.NEXT_PUBLIC_FOLDER}&propertyType=Commercial&pricemin=&pricemax=&bedrooms=`,
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
                    "title": "Philadelphia",
                    "location": "Philadelphia",
                    "img": "",
                    "link": ``,
                    "stars": "5"
                },
                {
                    "title": "Philadelphia",
                    "location": "Philadelphia",
                    "img": "",
                    "link": ``,
                    "stars": "4"
                },
                {
                    "title": "Philadelphia",
                    "location": "Eagles!",
                    "img": "",
                    "link": ``,
                    "stars": "5"
                }
            ]
        },
        {
            "title": process.env.NEXT_PUBLIC_DEFAULT_CITY,
            "subTitle": "Philadelphia!",
            "content": process.env.NEXT_PUBLIC_NAME,
            "img": `img/photo/photo-${process.env.NEXT_PUBLIC_FOLDER}-community3.jpg`,
            "parallax": "-500",
            "iconsBottom": [
                {
                    "title": "Travel Resources",
                    "badge": "Explore",
                    "icon": "airplane-mode-1",
                    "link": "#"
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
            "content": "Philadelphia"
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
                "title": "Philadelphia",
                "subTitle": "Philadelphia",
                "img": "",
                "link": ``
            },
            {
                "title": "Philadelphia",
                "subTitle": ``,
                "img": "",
                "link": ``
            },
            {
                "title": "Downtown Dining Options",
                "subTitle": `Celebrate in ${process.env.NEXT_PUBLIC_DEFAULT_CITY}`,
                "img": "",
                "link": "/business/search?categories=13000&location=Philadelphia"
            },
            {
                "title": "Sports Stadiums",
                "subTitle": "",
                "img": "",
                "link": `/business/search?q=stadiums&location=${process.env.NEXT_PUBLIC_NAME}`
            },
            {
                "title": "Museums",
                "subTitle": "Science and the Arts",
                "img": "",
                "link": `/business/search?q=Museum&location=${process.env.NEXT_PUBLIC_NAME}`
            },
            {
                "title": "",
                "subTitle": ``,
                "img": "",
                "link": ``
            },
            {
                "title": "",
                "subTitle": "",
                "img": "",
                "link": ``
            },
            {
                "title": "Parks and Landmarks",
                "subTitle": `Outdoor in ${process.env.NEXT_PUBLIC_DEFAULT_CITY}`,
                "img": "",
                "link": `/business/search?categories=16000&location=${process.env.NEXT_PUBLIC_NAME}`
            },
            {
                "title": "Gaming in ${process.env.NEXT_PUBLIC_DEFAULT_CITY}",
                "subTitle": "Arts and Entertainment",
                "img": "",
                "link": `/business/search?categories=10000&location=${process.env.NEXT_PUBLIC_NAME}`
            }
        ]
    }
};
export default Index3;