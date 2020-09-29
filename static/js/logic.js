// var pointsURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQWhVn717WWm8wmujkDBrHPP2HF4FnpqiYwlxzjU6qdlL9pzPKabbgHzKxVuzbxEy4H5ZFaHtAIoLjd/pub?output=csv';
// var pointsURL = 'data/iwoc_prisons-Sheet1.csv'

//Dev copy
var pointsURLJSON = 'https://spreadsheets.google.com/feeds/list/1eCL-hrcGrkVN9dwWEasDI-oFfweaVJRqIIJ82MpwNo8/1/public/full?alt=json';

window.addEventListener('DOMContentLoaded', createMap)

let map;
let sidebar;
let panelID = "sidebar";

//Color palette for prison security levels, diverging brown to forest green
let levelColors = ['#8c510a','#d8b365','#f6e8c3','#0077bb','#c7eae5','#5ab4ac','#01665e'];

let securityLevels = {
  "All" : levelColors[0],
  "Min1" : levelColors[1],
  "Min2" : levelColors[2],
  "MinMed" : levelColors[3],
  // "MinMed" : '#0077bb',
  "Med" : levelColors[4],
  "Close" : levelColors[5],
  "Max" : levelColors[6] 
};

function getColor(stype) {
  switch (stype) {
    case 'All':
      return  '#8c510a';
    case 'Min1':
      return '#d8b365';
    case 'Min2':
      return '#f6e8c3';
    case 'MinMed':
      return '#0077bb';
    case 'Med':
      return '#c7eae5';
    case 'Close':
      return '#5ab4ac';
    case 'Max':
      return '#01665e';
    default:
      return '#111111';
  }
}

function createMap(prisons) {
  console.log("Creating map")

  // Create the tile layer that will be the background of our map
  var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    // maxZoom: 8,
    // minZoom: 9,
    id: "light-v10",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    // maxZoom: 8,
    // minZoom: 9,
    id: "dark-v10",
    accessToken: API_KEY
  });

  // Create a baseMaps object to hold the lightmap layer
  var baseMaps = {
    "Light Map": lightmap,
    "Dark Map": darkmap
  };

  // Create an overlayMaps object to hold the bikeStations layer
  var overlayMaps = {
    "Prisons": prisons
  };

  // // Use this link to get the geojson data.
  var link = "data/state_outlines.json";

  function filterMN(feature) {
    if (feature.properties.NAME === "Minnesota") return true
  }

  // Grabbing our GeoJSON data..
  d3.json(link, function(data) {
      // Creating a GeoJSON layer with the retrieved data
      L.geoJson(data, {
        style: function (feature) {
          return {
            color: '#C0C0C0',
            fillOpacity: 0
          };
        },
        filter: filterMN
      }).addTo(map);
  });

  // Create the map object with options, center of MN 46.7296° N, 94.6859° W
  map = L.map("map-id", {
    center: [46.5, -94.6859],
    zoom: 7,
    layers: [darkmap]
  });

  // Create Sidebar
  sidebar = L.control.sidebar('sidebar').addTo(map);

  

  // Draw markers
  addPoints();

  // Move zoom
  map.zoomControl.setPosition('topright');
  
  // // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
  // L.control.layers(baseMaps, overlayMaps, {
  //   collapsed: false
  // }).addTo(map);

  // Add legend
  createLegend(map);

  
  
}//end createMap()

function createLegend(myMap){
  var legend = L.control({position: 'bottomright'});
  // console.log("I am not legend");
  legend.onAdd = function (map) {
    // console.log("I am legend");
    var div = L.DomUtil.create('div', 'info-legend');
    labels = ['<strong>Security Level</strong>'],
    categories = ["All","Min1","Min2","MinMed","Med","Close","Max"];

    for (var i = 0; i < categories.length; i++) {
      // console.log("legend color: ",getColor(categories[i]));
      div.innerHTML += labels.push(
          '<i class="fas fa-circle" style="color:' + getColor(categories[i]) + '"></i> ' +
      (categories[i] ? categories[i] : '+'));
    //   div.innerHTML += labels.push(
    //     '<i class="fas fa-circle" style="background:' + "#111111" + '"></i> ' +
    // (categories[i] ? categories[i] : '+'));
      div.innerHTML = labels.join('<br>');
    };
    return div;
  }
  legend.addTo(myMap);
}

//Using JSON link
function addPoints() {
  let pointGroupLayer = L.layerGroup().addTo(map);

  // Choose marker type. Options are:
  // (these are case-sensitive, defaults to marker!)
  // marker: standard point with an icon
  // circleMarker: a circle with a radius set in pixels
  // circle: a circle with a radius set in meters
  let markerType = "circleMarker";

  // Marker radius
  // Will be in pixels for circleMarker, metres for circle
  // Ignore for point
  let markerRadius = 100;

  d3.json(pointsURLJSON, function (data) {
    console.log("JSON", data);
    // console.log("Facility: ", data.feed.entry[0].gsx$facility.$t)
    
    for (let row = 0; row < data.feed.entry.length; row++) {
      let marker;
      // let secColor;
      console.log("Facility data: ", data.feed.entry[row].gsx$facility.$t)
      
      if (markerType == "circleMarker") {
        console.log("Custody Level color: ",securityLevels[data.feed.entry[row].gsx$custodylevel.$t]);
        console.log("Color getColor: ", getColor(data.feed.entry[row].gsx$custodylevel.$t))
        secColor = securityLevels[data.feed.entry[row].gsx$custodylevel.$t];
        marker = L.circleMarker([data.feed.entry[row].gsx$lat.$t, data.feed.entry[row].gsx$lng.$t], {
          // radius: markerRadius,
          radius: parseInt(data.feed.entry[row].gsx$population.$t)/30,
          // color: `'${securityLevels[data.feed.entry[row].gsx$custodylevel.$t]}'`,
          // color: `'${secColor}'`,
          // color: '#0077bb',
          color: getColor(data.feed.entry[row].gsx$custodylevel.$t),
          opacity: 1,
          weight: 4
        });
        // marker.setStyle({ 
        //   color: `"${levelColors[4]}"`
        // });
      } else if (markerType == "circle") {
        console.log("Custody Level: ",data.feed.entry[row].gsx$custodylevel.$t);
        console.log("Custody Level color: ",securityLevels[data.feed.entry[row].gsx$custodylevel.$t]);
        marker = L.circle([data.feed.entry[row].gsx$lat.$t, data.feed.entry[row].gsx$lng.$t], {
          // radius: markerRadius,
          radius: parseInt(data.feed.entry[row].gsx$population.$t)*10,
          // color: `'${securityLevels[data.feed.entry[row].gsx$custodylevel.$t]}'`,
          // color: '#0077bb',
          opacity: 1,
          weight: 10
        });
      } else {
        marker = L.marker([data.feed.entry[row].gsx$lat.$t, data.feed.entry[row].gsx$lng.$t]);
      }
      marker.addTo(pointGroupLayer);

      // UNCOMMENT THIS LINE TO USE POPUPS
      marker.bindPopup(`<h4>${data.feed.entry[row].gsx$facility.$t}</h4>Address:  
        ${data.feed.entry[row].gsx$address.$t}`);

      // // COMMENT THE NEXT GROUP OF LINES TO DISABLE SIDEBAR FOR THE MARKERS
      // marker.feature = {
      //   properties: {
      //     name: data.feed.entry[row].gsx$facility.$t,
      //     address: data.feed.entry[row].gsx$address.$t,
      //   },
      // };
      // marker.on({
      //   click: function (e) {
      //     L.DomEvent.stopPropagation(e);
      //     // document.getElementById("sidebar-title").innerHTML =
      //     //   e.target.feature.properties.facility;
      //     document.getElementById("sidebar").innerHTML =
      //       e.target.feature.properties.name;
      //     sidebar.open(panelID);
      //   },
      // });
      // // COMMENT UNTIL HERE TO DISABLE SIDEBAR FOR THE MARKERS
      
      // Fill sidebar 
      const ul = document.getElementById('list');
      const newItem = document.createElement('li');

      newItem.appendChild(document.createTextNode(data.feed.entry[row].gsx$facility.$t));

      ul.appendChild(newItem).classList.add("nav-item");

      // // AwesomeMarkers is used to create fancier icons
      let icon = L.AwesomeMarkers.icon({
        icon: "asterisk",
        iconColor: "white",
        markerColor: "darkred",
        prefix: "fa",
        extraClasses: "fa-rotate-0",
      });
      if (!markerType.includes("circle")) {
        marker.setIcon(icon);
      }
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
