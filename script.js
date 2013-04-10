var map;
var markers = [];
var dataPoints = {}
var pop;

$(document).ready(function(){
	$.getJSON('data.json', function(data) {
		dataPoints = data;
		initPopcorn();
		initGoogleMaps();
	});
});

var initPopcorn = function() {

	pop = Popcorn.youtube(
		'#video',
		'http://www.youtube.com/watch?v=i-vtDYgRgnU' );

	for ( var i = 0; i < dataPoints.locations.length; i++) {
		var cueFunction = (function(id) {
			return function () {
				displayPoint(markers[id], id);
			 };
		})(i);
		pop.cue( dataPoints.locations[i].cue, cueFunction);
	}

	// set time update
	pop.on( "timeupdate", function() {
		$('#currentTime').val(this.currentTime());
	});

	pop.mute();
	pop.play();
};


var initGoogleMaps = function() {

	// GOOGLE MAPS
	map = new GMap2($("#map").get(0));
	var sf = new GLatLng(37.760401, -122.434731);
	map.setCenter(sf, 12);

	// generate data points from data
	for (var i = 0; i < dataPoints.locations.length; i++) {
		var loc = dataPoints.locations[i];
	    var point = new GLatLng(loc.lat, loc.lng);
		marker = new GMarker(point);
		map.addOverlay(marker);
		markers[i] = marker;
	}

	$(markers).each(function(i, marker){
		$("<li />")
			.html(dataPoints.locations[i].title)
			.click(function(){
				playVideoAtTime(dataPoints.locations[i].cue);
				//displayPoint(marker, i);
			})
			.appendTo("#list");
		GEvent.addListener(marker, "click", function() {
			playVideoAtTime(dataPoints.locations[i].cue);
			//displayPoint(marker, i);
		});
	});
	$("#message").appendTo(map.getPane(G_MAP_FLOAT_SHADOW_PANE));
};

var displayPoint = function(marker, index) {
	$("#message").hide();
	$("#message").text(dataPoints.locations[index].title);
	var moveEnd = GEvent.addListener(map, "moveend", function(){
		var markerOffset = map.fromLatLngToDivPixel(marker.getLatLng());
		$("#message")
			.fadeIn()
			.css({ top: markerOffset.y, left: markerOffset.x });
		GEvent.removeListener(moveEnd);
	});
	map.panTo(marker.getLatLng());
}

var playVideoAtTime = function(time) {
	pop.pause(time);
	// timeout because popcorn and flash won't play well all the time
	setTimeout(function() {
		pop.play();
	}, 300);
}
