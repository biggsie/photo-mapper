// console.log('hello from main.js');
 
var currentMap;
var marker;
var photoPageIndex = 0
var cityState;

var photoData = {
    'set' : 'public',
    'from' : photoPageIndex,
    'to' : photoPageIndex + 40,
    'minx' : '-180',
    'miny' : '-90',
    'maxx' : '180',
    'maxy' : '90',
    'size' : 'medium',
    'mapfilter' : 'true'
  };

$(document).ready(function() {
  currentMap = initializeMap();
  console.log(currentMap + 'has been created');
  getPanaramioImages(photoData);
  $('.fancybox').fancybox();
});

$('#next').click( function() {
   console.log('Click!')
   photoPageIndex = photoPageIndex + 40
   console.log(photoPageIndex);
   var photoData = {
    'set' : 'public',
    'from' : photoPageIndex,
    'to' : photoPageIndex + 40,
    'minx' : '-180',
    'miny' : '-90',
    'maxx' : '180',
    'maxy' : '90',
    'size' : 'medium',
    'mapfilter' : 'true'
  };
  ga('send', 'event', 'button', 'click', 'next');
  $( "#photos" ).empty();
  getPanaramioImages(photoData);
});

// attach click handler to images via event delegation
$('#photos').on('mouseover', '.imageBox', function() {
    $('.imageBox').toggleClass('.overState')
});

// attach click handler to images via event delegation
$('#photos').on('click', '.imageBox', function() {
    var lat = $(this).data("lat");
    var lon = $(this).data("lon");
    window.location.hash = '#lat=' + lat + '&lon=' + lon;
    console.log('Image clicked! Lat=' + lat + ' Lon=' + lon);
    placeMarker(lat,lon);


    var original_url = $(this).data('url').split("medium").join("original");
    
    var infoWidowContent = "<div id='infoBox'><p>" + $(this).data('title') + "</p><a href='"+ $(this).data('pageurl') + "' target='blank'>View in Panaramio</a><a class='fancybox' href="+ $(this).data('url') + "><img src=" + $(this).data('url') + "></a></div>";
    ga('send', 'event', 'photo', 'click', $(this).data('url'));
    console.log(infoWidowContent);
    var infowindow = new google.maps.InfoWindow({
        content: infoWidowContent
    });
    infowindow.open(currentMap,marker);
});

function initializeMap() {
  console.log('maps initialize called');
  var mapOptions = {
    center: new google.maps.LatLng(37.78000699, -122.394711971282),
    zoom: 8
  };

  var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
  marker =  new google.maps.Marker({
      position: {lat:37.78000699, lng:-122.394711971282}, 
      map: map
    });

  google.maps.event.addListener(map, 'click', function(e) {
    console.log('lat = ' + e.latLng.lat() + 'lon = ' + e.latLng.lng() );
    mapClicked(e.latLng.lat(),e.latLng.lng());
  });
  // console.log('Bounds = ' + map.getBounds());
  return map;
}

function mapClicked(lat,lon) {
  placeMarker(lat,lon);
  window.location.hash = '#lat=' + lat + '&lon=' + lon;
  ga('send', 'event', 'map', 'click', encodeURI(window.location));
  //getImagesWithLatLong(lat,Lng);
  var photoData = {
      'set' : 'public',
      'from' : '0',
      'to' : '40',
      'minx' : lon - .25,
      'miny' : lat - .25,
      'maxx' : lon + .25,
      'maxy' : lat + .25,
      'size' : 'medium',
      'mapfilter' : 'true'
  };
  $( "#photos" ).empty();
  getPanaramioImages(photoData);
  cityState = getLocation(lat,lon);
  console.log('about to pass to display' + cityState);
  showLocation(cityState);

}

function getPanaramioImages(photoData) {
  var url = 'http://www.panoramio.com/map/get_panoramas.php';

  $.ajax({
    "dataType" : "jsonp",
    "url" : url,
    "data" : photoData,
    "success" : getImagesRequest
  });
}

function getImagesRequest(photoFeed) {
  console.log('getImages has been called!');

  $.each(photoFeed.photos, function(index, photos) {
      // console.log(photos.photo_title);
    $( "#photos" ).append("<img src='" + photos.photo_file_url + "' class='imageBox' data-lat=" + photos.latitude +" data-lon=" + photos.longitude +  " data-pageUrl=" + photos.photo_url +  " data-title='" + photos.photo_title +  "' data-url=" + photos.photo_file_url + ">");
  });
    // $('#photos').show();
  }

function placeMarker(lat,lon) {
  console.log('placeMarker called, lat =' + lat + ' lon =' + lon + " map = " + currentMap);
  // clear old marker
  marker.setMap();
  currentMap.panTo({lat: lat, lng: lon});
  marker =  new google.maps.Marker({
      position: {lat: lat, lng: lon}, 
      map: currentMap
    });
  console.log('marker = ' + marker);
}

function getLocation(lat,lon) {
  var url = 'https://maps.googleapis.com/maps/api/geocode/json';
  var latLng = lat + ',' + lon;
  // console.log('latLng = ' + latLng);
  var data = { 
    'latlng' : latLng,
    'key' : 'AIzaSyAMD2fa_Kp1nkkhiVZzmcmiAY3mrJXuN1c'
        };
  
  console.log(data);

  $.ajax ({
    url: url,
    data: data,
    dataType: 'json'
  }).done(function(data) {
    var cityState = data.results[3].formatted_address
    console.log('just retrieved' + cityState);
    return cityState;
    console.log("SUCCESS!");
  }).fail(function(jqXHR, textStatus, errorThrown){
    console.log(data);
    console.log("FAIL!");
  });
}

function showLocation(cityState) {
  console.log('trying to display location:' + cityState);
  $('#nav-controls').html(cityState);
}



