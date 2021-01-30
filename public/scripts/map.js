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

    while(i < 13) {
        console.log(tpC)
        console.log(myLocation.geometry)
        var geoJ = turf.nearestPoint(tpC, tfC)
        console.log(geoJ)
        closestPoints.push(geoJ);
        var id = geoJ.properties.featureIndex;
        console.log(geoJ.properties)
        //remove from features point that was found
        mcData.features.splice(id, 0);
        i++;
    };

    // This is where the issue is I think. Not sure why, but it only highlights
    // first feature in the array. If you do closestPoints[0] or [1] etc. it breaks?
    console.log(closestPoints)
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

formatToGeo = (data) => {
    for (i=0; i < data.length; i++) {
        mcData.features.push(
            {
                type: 'Feature',
                properties: {
                    Name: data[i].name,
                    Address: data[i].address
                },
                geometry: {
                    type: 'Point',
                    coordinates: [data[i].lonlat[0], data[i].lonlat[1]]
                }
            }
        )
    }
}