mapboxgl.accessToken = 'pk.eyJ1IjoiYXNseW9uczAwMSIsImEiOiJja2toZGhxN24wYTFrMm5xa2RjMnc1anJ5In0.AsWQMzFj8LJBKszWKEVDXw';
        var map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/light-v10',
            center: [-81.455, 39.415],
            zoom: 8
            });
        var linestring = {
            'type': 'Feature',
            'geometry': {
                'type': 'LineString',
                'coordinates': []
            }
        };

        fetch('https://andrew-lyons.github.io/turf-poc/public/json/mcd_hic_fc_p1.json')
            .then((res) => res.json())
            .then(data => formatToGeo(data))

var mcData =  {
    type: 'FeatureCollection',
    features: []
};

var myLocation = {
        type: 'Feature',
        properties: {
            Name: 'Me! #1',
            Address: null
        },
        geometry: {
            type: 'Point',
            coordinates: [-81.433140, 39.327393]
        }
    };

map.on('load', function() {

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

    //findClosest(a) takes int that just plugs into the while loop like before
    const closestPoints = findClosest(100)

    //checkTime(a, b) returns stores that are due AFTER the first param, non-inclusive. Second param is array to further filter
    const timeFilteredPoints = checkTime("4/20/2021", closestPoints)

    map.getSource('nearest-food').setData({
        type: 'FeatureCollection',
        features: timeFilteredPoints
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

// Bring JSON to geoJSON format
formatToGeo = (data) => {
    for (i=0; i < data.length; i++) {
        mcData.features.push(
            {
                type: 'Feature',
                properties: {
                    Name: data[i].num,
                    Address: data[i].addr,
                    Date: timeFilter(data[i])

                },
                geometry: {
                    type: 'Point',
                    coordinates: [data[i].lon, data[i].lat]
                }
            }
        )
    }
    console.log(mcData.features.length)
}

findClosest = (numStores) => {
    var i = 0;
    var closestPoints = [];

    tfC = turf.featureCollection(mcData.features)
    tpC = turf.point(myLocation.geometry.coordinates)

    // Kept this in map.on click, but could be set up to work with map.on load
    while(i < numStores) {
        var geoJ = turf.nearestPoint(tpC, tfC)
        closestPoints.push(geoJ);
        var id = geoJ.properties.featureIndex;
        //remove from features point that was found
        mcData.features.splice(id, 1);
        i++;
    };
    return closestPoints
};

checkTime = (date, closestPoints) => {
    const dayMS = 86399000; //length of given day from 00:00:00 to 23:59:59 in ms, good enough for this use case
    var dueStores = [];
    var lateStores = [];

    var timeFiltered = closestPoints.map((entry) => {
        var daysOut = Math.floor((entry.properties.Date - Date.parse(date)) / dayMS)  // .floor() gives us accurate # days until due date
        
        //just change > to >= for INCLUSIVE, otherwise same-days are passed
        if (Math.sign(daysOut) > 0) {
            dueStores.push("Store #" + entry.properties.Name + " is due in " + daysOut + " days")
            return entry
        } else {
            lateStores.push("Store #" + entry.properties.Name + " was due " + Math.abs(daysOut) + " days ago!")
        }
    });

    //Remove empty entries made from logic, can't skip in .map()
    var filteredArray = timeFiltered.filter((el) => {
        return el != null && el != undefined
    })

    console.log([dueStores, lateStores]) //Not sure if usable but might be a nice cherry

    return(filteredArray)
};

timeFilter = (obj) => {
    console.log(obj.date)
}