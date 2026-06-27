const fs = require('fs');

const files = [
  'src/components/HomeFour/Banner.js',
  'src/components/HomeFour/BothBusinessRealtySearch.js',
  'src/components/HomeFour/OnlyBusinessSearch.js'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  const oldGeoBlock = `if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const latitude = position.coords.latitude;
                        const longitude = position.coords.longitude;
                        setLat(latitude);
                        setLong(longitude);

                        // Store the location in localStorage
                        localStorage.setItem("lat", latitude);
                        localStorage.setItem("long", longitude);
                    },
                    (error) => {
                        console.error("Geolocation error:", {
                            code: error.code,
                            message: error.message,
                        });
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 5000,
                        maximumAge: 0
                    }
                );
            }`;

  const oldGeoBlockBanner = `if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            setLat(latitude);
            setLong(longitude);

            // Store the location in localStorage
            localStorage.setItem("lat", latitude);
            localStorage.setItem("long", longitude);
          },
          (error) => {
            console.error("Geolocation error:", {
              code: error.code,
              message: error.message,
            });
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          }
        );
      }`;

  const newGeoBlock = `
            const fetchIpLocation = async () => {
                try {
                    const res = await fetch('https://get.geojs.io/v1/ip/geo.json');
                    const data = await res.json();
                    if (data.latitude && data.longitude) {
                        setLat(parseFloat(data.latitude));
                        setLong(parseFloat(data.longitude));
                        localStorage.setItem("lat", data.latitude);
                        localStorage.setItem("long", data.longitude);
                    }
                } catch (err) {
                    console.error('IP Geolocation fallback failed:', err);
                }
            };

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const latitude = position.coords.latitude;
                        const longitude = position.coords.longitude;
                        setLat(latitude);
                        setLong(longitude);

                        // Store the location in localStorage
                        localStorage.setItem("lat", latitude);
                        localStorage.setItem("long", longitude);
                    },
                    (error) => {
                        console.error("Browser Geolocation error/denied. Falling back to IP Geolocation.");
                        fetchIpLocation();
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 5000,
                        maximumAge: 0
                    }
                );
            } else {
                fetchIpLocation();
            }
`;

  // Try replacing exact match or general match
  // We'll replace using regex to be safe with indentation
  const regex = /if\s*\(navigator\.geolocation\)\s*\{\s*navigator\.geolocation\.getCurrentPosition\([\s\S]*?maximumAge:\s*0\s*\}\s*\);\s*\}/g;
  
  if (regex.test(content)) {
      content = content.replace(regex, newGeoBlock);
      fs.writeFileSync(file, content);
      console.log('Fixed', file);
  } else {
      console.log('Could not match in', file);
  }
});
