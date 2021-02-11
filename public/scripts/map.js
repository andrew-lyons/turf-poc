mapboxgl.accessToken = 'pk.eyJ1IjoiYXNseW9uczAwMSIsImEiOiJja2toZGhxN24wYTFrMm5xa2RjMnc1anJ5In0.AsWQMzFj8LJBKszWKEVDXw';
        var map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/light-v10',
            center: [-88.099845, 41.6354154],
            zoom: 8
            });
        var linestring = {
            'type': 'Feature',
            'geometry': {
                'type': 'LineString',
                'coordinates': []
            }
        };

        // Pass in date and timeFilter returns stores due for the change after the date
        fetch('https://andrew-lyons.github.io/turf-poc/public/json/mcd_hic_fc_p1.json')
            .then((res) => res.json())
            .then(data => timeFilter(data, "2/15/2021"))

var mcData =  {
    type: 'FeatureCollection',
    features: []
};

var myLocation = {
        type: 'Feature',
        properties: {
            Name: 'Me! #1',
        },
        geometry: {
            type: 'Point',
            coordinates: [-88.099845, 41.6354154]
        }
    };

map.on('load', function() {

    console.log(myLocation.geometry.coordinates)

    map.addLayer({
        id: 'mcData',
        type: 'symbol',
        source: {
            type: 'geojson',
            data: mcData
        },
        layout: {
            'icon-image': 'restaurant-15',
            'icon-allow-overlap': true
        },
        paint: { }
        });
    map.addLayer({
        id: 'myLocation',
        type: 'symbol',
        source: {
            type: 'geojson',
            data: myLocation
    },
        layout: {
            'icon-image': 'marker-15'
        },
        paint: { }
    });

    map.addSource('nearest-food', {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: []
        }
    });
});

var popup = new mapboxgl.Popup();

map.on('mousemove', function(e) {
  var features = map.queryRenderedFeatures(e.point, { layers: ['mcData', 'myLocation'] });
  if (!features.length) {
    popup.remove();
    return;
  }
  var feature = features[0];

  popup.setLngLat(feature.geometry.coordinates)
    .setHTML(feature.properties.Name)
    .addTo(map);

  map.getCanvas().style.cursor = features.length ? 'pointer' : '';
});



map.on('click', function(e) {

    const closestPoints = findClosest(139)

    map.getSource('nearest-food').setData({
        type: 'FeatureCollection',
        features: closestPoints
    });

    map.addLayer({
        id: 'nearest-food',
        type: 'circle',
        source: 'nearest-food',
        paint: {
            'circle-radius': 12,
            'circle-color': '#486DE0'
        }
    }, 'mcData');
});

// Find closest stores. Pings mcData.features in main scope, only takes in number of stores (i.e. 100 closest, 10 closest, etc.)
findClosest = (numStores) => {
    var i = 0;
    var closestPoints = [];

    tfC = turf.featureCollection(mcData.features)
    tpC = turf.point(myLocation.geometry.coordinates)

    while(i < numStores) {
        var geoJ = turf.nearestPoint(tpC, tfC)
        closestPoints.push(geoJ);
        var id = geoJ.properties.featureIndex;
        //remove from features point that was found
        mcData.features.splice(id, 1);
        i++;
    };
    //console.log(closestPoints)
    var storeNums = closestPoints.map((s) => {
        return s.properties.Name
    })
    console.log(storeNums)
};

// Filter displayed points based on date passed in
function timeFilter(data, date) {
    const dayMS = 86399000; //length of given day from 00:00:00 to 23:59:59 in ms, good enough for this use case

    var timeFiltered = data.map((entry) => {
        var daysOut = Math.floor((entry.date - Date.parse(date)) / dayMS)  // .floor() gives us accurate # days until due date
        
        //just change > to >= for INCLUSIVE, otherwise same-days are passed
        if (Math.sign(daysOut) <= 0) {
            return entry
        } else {
            console.log("")
        }
    });

    //Remove empty entries made from logic, can't skip in .map()
    var filteredArray = timeFiltered.filter((el) => {
        return el != null && el != undefined
    })

    // Set features to geoJSON returned from formatToGeo
    mcData.features = formatToGeo(filteredArray)
}

// Bring JSON to geoJSON format
function formatToGeo(data) {
    mcData_formatted = []
    for (i=0; i < data.length; i++) {
        mcData_formatted.push(
            {
                type: 'Feature',
                properties: {
                    Name: "Store #" + data[i].num,
                    Date: data[i].date

                },
                geometry: {
                    type: 'Point',
                    coordinates: [data[i].lon, data[i].lat]
                }
            }
        )
    }
    return mcData_formatted
}