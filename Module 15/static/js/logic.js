// Get your dataset
const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Create the base layer for the map
const layer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}', {
    foo: 'bar',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// Create the map object
const myMap = L.map("map").setView([0, 0], 2);
layer.addTo(myMap);

// Create a layer group for the earthquake data
const earthquakelayer = new L.LayerGroup();

// Define base and overlay maps for layer control
const baseMaps = {
    "Global Earthquakes": layer
};

const overlayMaps = {
    "Earthquakes": earthquakelayer
};

// Add layer control to the map
L.control.layers(baseMaps, overlayMaps).addTo(myMap);

// Import dataset and process it
d3.json(url).then(function (data) {
    console.log(data);

    // Define functions for marker size and color
    function getRadius(mag) {
        return mag === 0 ? 1 : mag * 4;
    }

    function markerColor(depth) {
        if (depth < 10) {
            return "lightgreen";
        } else if (depth < 30) {
            return "yellow";
        } else if (depth < 50) {
            return "orange";
        } else if (depth >= 70) {
            return "red";
        } else {
            return "darkred";
        }
    }

    // Add GeoJSON layer with style, pointToLayer, and onEachFeature options
    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng);
        },
        style: function (feature) {
            return {
                opacity: 0.60,
                fillOpacity: 0.75,
                fillColor: markerColor(feature.geometry.coordinates[2]),
                color: "#000000",
                radius: getRadius(feature.properties.mag),
                stroke: true,
                weight: 0.5
            };
        },
        onEachFeature: function (feature, layer) {
            layer.bindPopup(
                "Magnitude: " + feature.properties.mag +
                "<br>Depth: " + feature.geometry.coordinates[2] +
                "<br>Location: " + feature.properties.place
            );
        }
    }).addTo(earthquakelayer);

    // Add earthquake layer to the map
    earthquakelayer.addTo(myMap);

    // Create a legend
    let legend = L.control({ position: 'bottomright' });

    legend.onAdd = function (map) {
        let div = L.DomUtil.create('div', 'info legend');
        let depth = [0, 10, 30, 50, 70];
        // Loop through depth intervals and generate a label with a colored square for each interval
        for (let i = 0; i < depth.length; i++) {
            div.innerHTML +=
                '<i style="background:' + markerColor(depth[i] + 1) + '"></i> ' +
                depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
        }
        return div;
    };

    // Add legend to the map
    legend.addTo(myMap);
});
