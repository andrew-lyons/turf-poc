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


var mcData =  {
    type: 'FeatureCollection',
    features: [
        { 
            type: 'Feature', 
            properties: { 
                Name: "McDonald's #1",
                Address: 'Lorem Ipsum Road' 
            }, 
            geometry: {
                type: 'Point',
                coordinates: [-81.449181, 39.420829]
            }
        },
        { type: 'Feature', properties: { Name: "McDonald's #2", Address: 'Lorem Ipsum Road' }, geometry: { type: 'Point', coordinates: [-81.547325, 39.390173] } },
        { type: 'Feature', properties: { Name: "McDonald's #3", Address: 'Lorem Ipsum Road' }, geometry: { type: 'Point', coordinates: [-81.530148, 39.269607] } },
        { type: 'Feature', properties: { Name: "McDonald's #4", Address: 'Lorem Ipsum Road' }, geometry: { type: 'Point', coordinates: [-81.196410, 39.396408] } },
        { type: 'Feature', properties: { Name: "McDonald's #5", Address: 'Lorem Ipsum Road' }, geometry: { type: 'Point', coordinates: [-82.803338, 39.872858] } },
    ]
};

var myLocation = {
    type: 'FeatureCollection',
    features: [
        { type: 'Feature', properties: { Name: 'Me! #1', Address: null }, geometry: { type: 'Point', coordinates: [-81.433140, 39.327393] } },
        { type: 'Feature', properties: { Name: 'Me! #2', Address: null }, geometry: { type: 'Point', coordinates: [-82.686895, 39.851353] } }
    ]
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
            features: [
            ]
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

    var myLocationFeatures = map.queryRenderedFeatures(e.point, { layers: ['myLocation'] });
    if (!myLocationFeatures.length) {
        return;
    }
  
    var myLocationFeature = myLocationFeatures[0];
  
    var nearestMcData = turf.nearest(myLocationFeature, mcData);

    top3()
    
    if (nearestMcData !== null) {
  
        map.getSource('nearest-food').setData({
            type: 'FeatureCollection',
            features: [nearestMcData]
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
    }
});



top3 = () => {

    // instantiate this for readability
    var me = myLocation.features[0].geometry.coordinates

    // Map through mcData (large geoJSON array) and return coordinate
    // distance function from turf. Then sort to get in ascending order
    // (smallest to largest) 
    var nearestArray = mcData.features.map((i) => {

        return turf.distance(i, me, 'miles').toFixed(2)

    }).sort(function(a, b) { return a - b; });

    // Hard coded names :(, distances are correct
    console.log(
        '\n',
        "Your closest 3 points are: ", '\n \n'
        + mcData.features[0].properties.Name + " at " + mcData.features[0].properties.Address + ", " +  nearestArray[0] + " miles away, ", '\n'
        + mcData.features[2].properties.Name + " at " + mcData.features[2].properties.Address + ", " +  nearestArray[1] + " miles away, and ", '\n'
        + mcData.features[1].properties.Name + " at " + mcData.features[1].properties.Address + ", " +  nearestArray[2] + " miles away!", '\n \n'
    )

    return nearestArray
}