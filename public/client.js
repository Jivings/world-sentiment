var map;
var ajaxRequest;
var plotlist;
var plotlayers=[];

var map;

var defaultIcon = {
    iconUrl: 'my-icon.png',
};

var socket = io.connect('http://localhost');
socket.on('sentiment', function (t) {
  console.log(t);
  L.marker(t.geo, { icon : makeIcon(t) }).addTo(map);
});

function makeIcon(t) {
  var url = {
    0: '/imgs/negative.png',
    2: '/imgs/neutral.png',
    4: '/imgs/positive.png'
  };

  return L.icon({
    iconUrl: url[t.polarity],
    iconSize: [7, 7]
  });

}


function initmap() {
  // set up the map
  map = new L.Map('map');

  // create the tile layer with correct attribution
  var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  var osmAttrib='Map data © OpenStreetMap contributors';
  var osm = new L.TileLayer(osmUrl, {minZoom: 1, maxZoom: 12, attribution: osmAttrib});   

  // start the map in South-East England
  map.setView(new L.LatLng(51.3, 0.7), 2);
  map.addLayer(osm);


  setTimeout(function () {
    socket.emit('start')
  }, 2000);

  setTimeout(function () {
    socket.emit('stop');
  }, 25000)
}