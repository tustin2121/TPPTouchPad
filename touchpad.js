// touchpad.js

$(function(){ //jquery on ready
	$("#zoombutton").mouseup(function(){
		$("#wrapper").toggleClass("x2");
	});
	
	function producePoint(e) { 
		var tp = $("#touchpad");
		var x = e.pageX - tp.offset().left - 4; //four is the border width
		var y = e.pageY - tp.offset().top - 4;
		
		if ($("#wrapper").hasClass("x2")) {
			x = Math.floor(x / 2);
			y = Math.floor(y / 2);
		}
		
		//sanity check: don't report invalid numbers!
		if (x < 0 || x > 256) return;
		if (y < 0 || y > 192) return;
		
		$("#resultpad").text(x+","+y);
	}
	
	$("#touchpad").mouseup(producePoint);
});