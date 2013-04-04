var map;
var markers = [];
var dataPoints = {}


$(document).ready(function(){
	$.getJSON('data.json', function(data) {
		dataPoints = data;
		initPopcorn();
		initGoogleMaps();
	});
});


var initPopcorn = function() {

	var footnote = $('#footnotediv');

	var pop = Popcorn.youtube(
		'#video',
		'http://www.youtube.com/watch?v=i-vtDYgRgnU' );

	// set all markers
	var inc = 0;
	for ( var i = 0; i < dataPoints.locations.length; i++) {
		pop.cue( dataPoints.locations[i].cue, function() {
			displayPoint(markers[inc], inc);
			inc++;
		});
	}

	// listen to timeupdate
	pop.on( "timeupdate", function() {
		footnote.text("timeupdate: " + this.currentTime());
	});

	pop.mute();
	pop.play();
};


var initGoogleMaps = function() {

	// GOOGLE MAPS
	map = new GMap2($("#map").get(0));
	var sanfran = new GLatLng(37.760401, -122.434731);
	map.setCenter(sanfran, 12);

	// setup 10 random points
	// var bounds = map.getBounds();
	// var southWest = bounds.getSouthWest();
	// var northEast = bounds.getNorthEast();
	// var lngSpan = northEast.lng() - southWest.lng();
	// var latSpan = northEast.lat() - southWest.lat();

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
				displayPoint(marker, i);
			})
			.appendTo("#list");
		GEvent.addListener(marker, "click", function(){
			displayPoint(marker, i);
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
