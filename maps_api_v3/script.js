var map
	, pop
	, infoWindow
	, markers = []
	, video_url = 'http://www.youtube.com/watch?v=i-vtDYgRgnU';

$(document).ready(function(){
	$.getJSON('../data.json', function(data) {
		markers = data.markers;
		initPopcorn();
		initGoogleMaps();
	});
});

var initPopcorn = function() {

	pop = Popcorn.youtube('#video', video_url );

	for ( var i = 0; i < markers.length; i++) {
		var cueFunction = (function(key) {
			return function () {
				selectMarker(markers[key], false);
			 };
		})(i);
		pop.cue( markers[i].cue, cueFunction);
	}

	// set time update
	pop.on( "timeupdate", function() {
		$('#currentTime').val(this.currentTime());
	});

	pop.mute();
	pop.play();
};

var initGoogleMaps = function() {

	// create map centered on SF
  var mapOptions = {
    center: new google.maps.LatLng(37.760401, -122.434731), // san francisco
    zoom: 15,
    disableDefaultUI: true,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map = new google.maps.Map(document.getElementById("map"), mapOptions);

  // info window
  infoWindow = new google.maps.InfoWindow({content: ""});

	// create map markers
	$(markers).each(function(i, loc) {
		markers[i].mapMarker = new google.maps.Marker({
			position : new google.maps.LatLng(loc.lat, loc.lng),
			map : map
		});
		google.maps.event.addListener(markers[i].mapMarker, 'click', function() {
			selectMarker(markers[i], true);
		});
	});
};

var selectMarker = function(marker, forcePlay) {
	infoWindow.content = marker.title;
	infoWindow.open(map, marker.mapMarker);
	map.panTo(marker.mapMarker.getPosition());
	if (forcePlay)
		playVideoAtTime(marker.cue);
}

var playVideoAtTime = function(time) {
	pop.pause(time);
	// timeout because popcorn and flash won't coorporate all the time
	setTimeout(function() {
		pop.play();
	}, 300);
}