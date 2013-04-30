var map
	, pop
	, infoWindow
	, markers = []
	, pic_locations = "pics/"
	, video_url = 'http://www.youtube.com/watch?v=i-vtDYgRgnU';

$(document).ready(function(){
	$.getJSON('data.json', function(data) {
		markers = data.markers;
		initPopcorn();
		initGoogleMaps();
	});
});

var initPopcorn = function() {

	pop = Popcorn('#video');

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
    zoom: 14,
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

	// append image to image_pane
	$('#image').empty();
	var img = $("<img />").attr('src', pic_locations + marker.pic)
    	.load(function() {
    		var i = img[0];
    		var rect_ratio = $('#image').height() / $('#image').width();
    		var img_ratio = i.height / i.width;
    		// landscape
    		if (img_ratio < rect_ratio) { 
    			img.css({
    				'width' : '100%',
    				'margin-top' : ($('#image').height() / 2) - (i.height / 2) + "px"
    			});
    			// portrait
    		} else { 
    			img.css({'height' : '100%' });
    		}
    		img.hide();
    		$('#image').append(img);
    		img.fadeIn(250);
    	});

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