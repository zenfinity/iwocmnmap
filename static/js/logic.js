// var pointsURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQWhVn717WWm8wmujkDBrHPP2HF4FnpqiYwlxzjU6qdlL9pzPKabbgHzKxVuzbxEy4H5ZFaHtAIoLjd/pub?output=csv';
var pointsURL = 'data/iwoc_prisons-Sheet1.csv'
window.addEventListener('DOMContentLoaded', createMap)

let map;
let sidebar;

function createMap(prisons) {
  console.log("Creating map")

  // Create the tile layer that will be the background of our map
  var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 8,
    id: "light-v10",
    accessToken: API_KEY
  });

  // Create a baseMaps object to hold the lightmap layer
  var baseMaps = {
    "Light Map": lightmap
    // "Dark Map": darkmap
  };

  // Create an overlayMaps object to hold the bikeStations layer
  var overlayMaps = {
    "Prisons": prisons
  };

  // Create the map object with options, center of MN 46.7296° N, 94.6859° W
  map = L.map("map-id", {
    center: [46.7296, -94.6859],
    zoom: 7,
    layers: [lightmap]
  });

  // Create Sidebar
  sidebar = L.control.sidebar('sidebar').addTo(map);

  // Use PapaParse to load data from Google Sheets
  // And call the respective functions to add those to the map.
  // Papa.parse(geomURL, {
  //   download: true,
  //   header: true,
  //   complete: addGeoms,
  // });
  console.log("Before Parse")
  Papa.parse(pointsURL, {
    download: true,
    header: true,
    complete: addPoints,
  });
  console.log("After Parse")

  // Move zoom
  // new L.Control.Zoom({ position: 'topright' }).addTo(map);
  // Change the position of the Zoom Control to a newly created placeholder.
  map.zoomControl.setPosition('topright');
  // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(map);
}


function addPoints(data) {
  console.log("Inside addPoints")
  console.log("Passed data:")
  console.log(data)
  data = data.data;
  let pointGroupLayer = L.layerGroup().addTo(map);

  // Choose marker type. Options are:
  // (these are case-sensitive, defaults to marker!)
  // marker: standard point with an icon
  // circleMarker: a circle with a radius set in pixels
  // circle: a circle with a radius set in meters
  let markerType = "marker";

  // Marker radius
  // Wil be in pixels for circleMarker, metres for circle
  // Ignore for point
  let markerRadius = 100;

  for (let row = 0; row < data.length; row++) {
    let marker;
    if (markerType == "circleMarker") {
      marker = L.circleMarker([data[row].lat, data[row].lng], {
        radius: markerRadius,
      });
    } else if (markerType == "circle") {
      marker = L.circle([data[row].lat, data[row].lng], {
        radius: markerRadius,
      });
    } else {
      marker = L.marker([data[row].lat, data[row].lng]);
    }
    marker.addTo(pointGroupLayer);

    // UNCOMMENT THIS LINE TO USE POPUPS
    //marker.bindPopup('<h2>' + data[row].name + '</h2>There's a ' + data[row].description + ' here');

    // COMMENT THE NEXT GROUP OF LINES TO DISABLE SIDEBAR FOR THE MARKERS
    marker.feature = {
      properties: {
        name: data[row].name,
        description: data[row].description,
      },
    };
    marker.on({
      click: function (e) {
        L.DomEvent.stopPropagation(e);
        document.getElementById("sidebar-title").innerHTML =
          e.target.feature.properties.name;
        document.getElementById("sidebar-content").innerHTML =
          e.target.feature.properties.description;
        sidebar.open(panelID);
      },
    });
    // COMMENT UNTIL HERE TO DISABLE SIDEBAR FOR THE MARKERS

    // AwesomeMarkers is used to create fancier icons
    let icon = L.AwesomeMarkers.icon({
      icon: "info-circle",
      iconColor: "white",
      markerColor: data[row].color,
      prefix: "fa",
      extraClasses: "fa-rotate-0",
    });
    if (!markerType.includes("circle")) {
      marker.setIcon(icon);
    }
  }
}


// function createMarkers(response, tabletop) {

//   // Pull the "stations" property off of response.data
//   var facilities = response.data.facility;

//   // Initialize an array to hold prison markers
//   var prisonMarkers = [];

//   // Loop through the stations array
//   for (var index = 0; index < facilities.length; index++) {
//     var facility = facilities[index];

//     // For each station, create a marker and bind a popup with the station's name
//     var prisonMarker = L.marker([facility.lat, facility.lng])
//       .bindPopup("<h3>" + facility.facility + "<h3><h3>Prison Population: " + facility.population + "</h3>");

//     // Add the marker to the bikeMarkers array
//     prisonMarkers.push(prisonMarker);
//   }
  

//   // Create a layer group made from the prison markers array, pass it into the createMap function
//   createMap(L.layerGroup(prisonMarkers));
// }


// // Perform an API call to the showInfo function which get gDoc spreadsheet and returns JSON. Call createMarkers when complete
// var prisonInfo = showInfo;

// d3.json(prisonInfo, createMarkers);
