// var pointsURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQWhVn717WWm8wmujkDBrHPP2HF4FnpqiYwlxzjU6qdlL9pzPKabbgHzKxVuzbxEy4H5ZFaHtAIoLjd/pub?output=csv';
// var pointsURL = 'data/iwoc_prisons-Sheet1.csv'
var pointsURLJSON = 'https://spreadsheets.google.com/feeds/list/1crAheLCSIE4e6BQx_I1aPNox-yYz_Sg3fa2aGUc9wu4/1/public/full?alt=json';

window.addEventListener('DOMContentLoaded', createMap)

let map;
let sidebar;
let panelID = "sidebar-pane";

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

  addPoints();
  // Papa.parse(pointsURL, {
  //   download: true,
  //   header: true,
  //   complete: addPoints,
  // });
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

// Using CSV //////////////////////////////////////////////////////////
// function addPoints(data) {
//   console.log("Inside addPoints")
//   console.log("Passed data:")
//   console.log(data)
//   data = data.data;
//   let pointGroupLayer = L.layerGroup().addTo(map);

//   // Choose marker type. Options are:
//   // (these are case-sensitive, defaults to marker!)
//   // marker: standard point with an icon
//   // circleMarker: a circle with a radius set in pixels
//   // circle: a circle with a radius set in meters
//   let markerType = "marker";

//   // Marker radius
//   // Wil be in pixels for circleMarker, metres for circle
//   // Ignore for point
//   let markerRadius = 100;

//   for (let row = 0; row < data.length; row++) {
//     let marker;
//     if (markerType == "circleMarker") {
//       marker = L.circleMarker([data[row].lat, data[row].lng], {
//         radius: markerRadius,
//       });
//     } else if (markerType == "circle") {
//       marker = L.circle([data[row].lat, data[row].lng], {
//         radius: markerRadius,
//       });
//     } else {
//       marker = L.marker([data[row].lat, data[row].lng]);
//     }
//     marker.addTo(pointGroupLayer);

//     // UNCOMMENT THIS LINE TO USE POPUPS
//     marker.bindPopup('<h2>' + data[row].facility + "</h2>Address: " + data[row].address);

//     // COMMENT THE NEXT GROUP OF LINES TO DISABLE SIDEBAR FOR THE MARKERS
//     marker.feature = {
//       properties: {
//         name: data[row].facility,
//         address: data[row].address,
//       },
//     };
//     marker.on({
//       click: function (e) {
//         L.DomEvent.stopPropagation(e);
//         // document.getElementById("sidebar-title").innerHTML =
//         //   e.target.feature.properties.facility;
//         document.getElementById("sidebar-content").innerHTML =
//           e.target.feature.properties.name;
//         sidebar.open(panelID);
//       },
//     });
//     // COMMENT UNTIL HERE TO DISABLE SIDEBAR FOR THE MARKERS
//     console.log("Facility: ", data[row].facility)
//     // Fill sidebar
//     d3.select('#home')
//       .append('p')
//       .text(data[row].facility)

//     // AwesomeMarkers is used to create fancier icons
//     let icon = L.AwesomeMarkers.icon({
//       icon: "info-circle",
//       iconColor: "white",
//       markerColor: data[row].color,
//       prefix: "fa",
//       extraClasses: "fa-rotate-0",
//     });
//     if (!markerType.includes("circle")) {
//       marker.setIcon(icon);
//     }
//   }
// }

// function getData(){
//   const express = require('express');
//   const request = require('request');

//   const app = express();

//   app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', '*');
//     next();
//   });

//   app.get('/e', (req, res) => {
//     request(
//       { url: pointsURL },
//       (error, response, body) => {
//         if (error || response.statusCode !== 200) {
//           return res.status(500).json({ type: 'error', message: err.message });
//         }

//         Papa.parse(pointsURL, {
//           download: true,
//           header: true,
//           complete: addPoints,
//         });
//       }
//     )
//   });

//   const PORT = process.env.PORT || 3000;
//   app.listen(PORT, () => console.log(`listening on ${PORT}`));
// }
//END USING CSV


//Using JSON link
function addPoints() {

  // var prisonDict = d3.json(pointsURLJSON, function(data){
  //   console.log("JSON",data);
  // });

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

  d3.json(pointsURLJSON, function (data) {
    console.log("JSON", data);
    // console.log("Facility: ", data.feed.entry[0].gsx$facility.$t)
    for (let row = 0; row < data.feed.entry.length; row++) {
      console.log("row: ", row)
      console.log("Facility: ", data.feed.entry[row].gsx$facility.$t)
      let marker;
      if (markerType == "circleMarker") {
        marker = L.circleMarker([data.feed.entry[row].gsx$lat.$t, data.feed.entry[row].gsx$lng.$t], {
          radius: markerRadius,
        });
      } else if (markerType == "circle") {
        marker = L.circle([data.feed.entry[row].gsx$lat.$t, data.feed.entry[row].gsx$lng.$t], {
          radius: markerRadius,
        });
      } else {
        marker = L.marker([data.feed.entry[row].gsx$lat.$t, data.feed.entry[row].gsx$lng.$t]);
      }
      marker.addTo(pointGroupLayer);

      // UNCOMMENT THIS LINE TO USE POPUPS
      marker.bindPopup('<h2>' + data.feed.entry[row].gsx$facility.$t + "</h2>Address: " + data.feed.entry[row].gsx$address.$t);

      // COMMENT THE NEXT GROUP OF LINES TO DISABLE SIDEBAR FOR THE MARKERS
      marker.feature = {
        properties: {
          name: data.feed.entry[row].gsx$facility.$t,
          address: data.feed.entry[row].gsx$address.$t,
        },
      };
      marker.on({
        click: function (e) {
          L.DomEvent.stopPropagation(e);
          // document.getElementById("sidebar-title").innerHTML =
          //   e.target.feature.properties.facility;
          document.getElementById("sidebar-content").innerHTML =
            e.target.feature.properties.name;
          sidebar.open(panelID);
        },
      });
      // COMMENT UNTIL HERE TO DISABLE SIDEBAR FOR THE MARKERS
      
      // Fill sidebar
      d3.select('#home')
        .append('p')
        .text(data.feed.entry[row].gsx$facility.$t)

      // // AwesomeMarkers is used to create fancier icons
      // let icon = L.AwesomeMarkers.icon({
      //   icon: "info-circle",
      //   iconColor: "white",
      //   markerColor: data[row].color,
      //   prefix: "fa",
      //   extraClasses: "fa-rotate-0",
      // });
      // if (!markerType.includes("circle")) {
      //   marker.setIcon(icon);
      // }
    }
  });
}

// function getData(){
//   var prisonDict = d3.json(pointsURLJSON, function(data){
//     console.log(data);
//   });
//   return prisonDict;
// }

// function fillSidebar(data){
//   d3.select('#home')
//     .append('p')
//     .text(data.facility)
// }


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
