// touchpad.js

var PREDEF_IMG = {
	0 : "fight",
	"fight" : "fight",
};

var AJAX_LOADERS = [
	"ajax_pokeball.gif",
	"ajax_greatball.gif",
	"ajax_ultraball.gif",
	"ajax_masterball.gif",
	"ajax_premiereball.gif",
	"ajax_cherishball.gif",
	"ajax_diveball.gif",
	"ajax_duskball.gif",
	"ajax_healball.gif",
	"ajax_luxuryball.gif",
	"ajax_netball.gif",
	"ajax_quickball.gif",
	"ajax_repeatball.gif",
	"ajax_safariball.gif",
	"ajax_safariball2.gif",
	"ajax_timerball.gif",
	"ajax_ultraball.gif",
];

var currHash = "";
var currHashmap = {};
var currImg = null;

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
	
	$("#resultpad .center").text(x+","+y);
}

function updateHash() {
	var hash = "";
	$.each(currHashmap, function(k, v) {
		if (hash) {
			hash += "&";
		}
		hash += k+"="+v;
	});

	window.location.hash = currHash = hash;
}

function setPredefImg(code) {
	var img = PREDEF_IMG[code];
	if (!img) return; //return if no such predef image
	
	setImage("screens/"+img+".png");
	
	delete currHashmap["imgur"];
	currHashmap["screen"] = code;
	updateHash();
}

function setImage(src) {
	currImg = src;
	$(".screenimg").attr("src", src);
}

function loadImgur(id) {
	console.info("Imgur ID = "+id);
	currImg = id;
	$("#touchpad .ajaxloader").show();
	
	//TODO load blacklist via ajax, check if on blacklist, reject if so
	//TODO load image via ajax
	$("<img src='http://i.imgur.com/"+id+".png'>").on("load", function(e)
	{
		console.log(e);
		// console.info(this, $(this).width(), $(this).height(), this.width, this.height);
		//check if image is EXACTLY 256 x 192px, reject otherwise
		if ( this.width == 256 && this.height == 192) 
		{
			$("#touchpad .ajaxloader").hide();
			
			// insert image into box, update hashmap
			setImage("http://i.imgur.com/"+id+".png");
			$("#screenSel").val("-1");
			
			delete currHashmap["screen"];
			currHashmap["imgur"] = id;
			updateHash();
		}
		else
		{
			//error
			console.log("Not exact width/height!");
		}
	}).on("error", function(){
		console.warn("Imgur link failed!");
	});
}

function parseHash() {
	var hash = window.location.hash.substr(1);
	console.log("Updating hash! ==> "+hash, "("+(currHash == hash)+")");
	if (!hash) return;
	if (currHash == hash) return;

	$.each(hash.split("&"), function(i, e) {
		try {
			e = e.split("=");
			
			switch (e[0]) {
				case "screen": { // screen param
					//switch to the given screen index/word
					if (e.length < 2) return; //discard if malformed
					var scrcode = e[1];
					
					setPredefImg(scrcode);
				} break;
				
				case "hlt": { //highlight area param
					var param = e[1].split(",");
					if (param.length != 4) return; //discard if malformed
					
					//TODO
					
					currHashmap["hlt"] = param;
				} break;
				
				case "imgur": { // check and load the given imgur file
					var imgurid = e[1];
					
					loadImgur(imgurid);
				} break;
			}
		} catch (e) {
			console.error("Error parsing a hashtag argument");
		}
	});
}
	

$(function(){ //jquery on ready
	// Setup!	
	$("#zoombutton").mouseup(function(){
		$("#wrapper").toggleClass("x2");
	});
	
	$(".touchscreen").mouseup(producePoint);
	
	$("#screenSel").change(function(){
		setPredefImg($("#screenSel").val());
	});

	$(".highlight").hide();	
	$(".ajaxloader").each(function(){
		var index = Math.floor(Math.random() * AJAX_LOADERS.length);
		$(this).attr("src", "ajax/"+AJAX_LOADERS[index]);
	});
	
	//Parse hash tag!
	parseHash();
	
	if ("onhashchange" in window) {
		//Browser supports the "hashchange" event!
		$(window).on("hashchange", parseHash);
	}
	
	if (!currImg) {
		//setPredefImg("fight");
		setImage("screens/fight.png");
	}
	
});