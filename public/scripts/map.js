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

    var i = 0;
    var closestPoints = [];

    tfC = turf.featureCollection(mcData.features)
    tpC = turf.point(myLocation.geometry.coordinates)

    // Kept this in map.on click, but could be set up to work with map.on load
    while(i < 100) {
        var geoJ = turf.nearestPoint(tpC, tfC)
        console.log(geoJ)
        closestPoints.push(geoJ);
        var id = geoJ.properties.featureIndex;
        //remove from features point that was found
        mcData.features.splice(id, 1);
        i++;
    };

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

// Bring JSON to geoJSON format
formatToGeo = (data) => {
    for (i=0; i < data.length; i++) {
        mcData.features.push(
            {
                type: 'Feature',
                properties: {
                    Name: data[i].num,
                    Address: data[i].addr,
                    Date: data[i].date

                },
                geometry: {
                    type: 'Point',
                    coordinates: [data[i].lon, data[i].lat]
                }
            }
        )
    }
}