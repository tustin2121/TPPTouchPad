// touchpad.js

var ENABLE_BLACKLIST = false;

var PREDEF_IMG = {
	0 : "fight",
	"fight" : "fight",
	"battle-fight" : "fight",
	1 : "battle-bag",
	"battle-bag" : "battle-bag",
	2 : "battle-pokemon",
	"battle-pokemon" : "battle-pokemon",
	
	5 : "text-upper",
	"text-upper" : "text-upper",
	"keyboard-upper" : "text-upper",
	6 : "text-lower",
	"text-lower" : "text-lower",
	"keyboard-lower" : "text-lower",
	7 : "text-other",
	"text-other" : "text-other",
	"keyboard-other" : "text-other",
	
	10 : "pokedex-main",
	"pokedex-main" : "pokedex-main",
	11 : "pokedex-info",
	"pokedex-info" : "pokedex-info",
	12 : "pokedex-size",
	"pokedex-size" : "pokedex-size",
	13 : "pokedex-cry",
	"pokedex-cry" : "pokedex-cry",
	
	20 : "bag",
	"bag" : "bag",
	21 : "pc-interface",
	"pc-interface" : "pc-interface",
	"pc" : "pc-interface",
	
	100 : "badgecase",
	"badgecase" : "badgecase",
	"badge-case" : "badgecase",
	101 : "sign-trainer-card",
	"sign-trainer-card" : "sign-trainer-card",
	"trainer-card" : "sign-trainer-card",
	"sign" : "sign-trainer-card",
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
	
	x++; y++; //adjust for stream correctness
	
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
	$("#screenSel").val(img);
	
	delete currHashmap["imgur"];
	currHashmap["screen"] = code;
	updateHash();
}

function setImage(src) {
	currImg = src;
	$(".screenimg").attr("src", src);
}

function openImgurDialog() {
	$("#imgurDlog").show();
	$("#imgurDlog .err").text("");
	$("#imgurDlog .linktext").val("");
}

function parseImgurLink() {
	var text = $("#imgurDlog .linktext").val();
	if (!text) return;
	
	var regex = /imgur\.com\/([a-zA-Z0-9]{7})/; //ID is assumed to always have 7 characters
	var res = regex.exec(text);
	
	if (!res || !res[1]) {
		$("#imgurDlog .err").text("Malformed Link!");
	} else {
		var id = res[1];
		loadImgur(id, function(){
			$("#imgurDlog").hide();
		});
	}
	
}

function loadImgur(id, callback) {
	console.info("Imgur ID = "+id);
	currImg = id;
	$("#touchpad .ajaxloader").show();
	
	if (ENABLE_BLACKLIST)
	{
		//TODO load blacklist via ajax, check if on blacklist, reject if so
		var blacklist;
		// $.ajax("black.list", {
		$.ajax("http://tustin2121.github.io/TPPTouchPad/black.list", {
			async: false,
			// cache: false,
			dataType: "text",
			success: function(data) {
				blacklist = data.split("\n");
			},
		});
		console.log(blacklist);
	}
	
	//load image via ajax
	$("<img src='http://i.imgur.com/"+id+".png'>").on("load", function(e)
	{
		console.log(e);
		
		//HACK! JQuery doesn't expose the return code onload, so we have to make
		// a hacky way of checking for a removed image... If the image is exactly
		// 161 x 81 pixels, it's highly likely that it is the "removed.png" image...
		// To be more precise, we'd need the API, but that requires registration.
		if (this.width == 161 && this.height == 81)
		{
			$("#touchpad .ajaxloader").hide();
			$("#imgurDlog .err").text("Image does not exist!");
			console.log("Guessing this is probably 'removed.png'!");
			return;
		}
		
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
			
			if (callback) callback();
		}
		else
		{	//error
			$("#touchpad .ajaxloader").hide();
			$("#imgurDlog .err").text("Image is not 256x192!");
			console.log("Not exact width/height!");
			return;
		}
	}).on("error", function()
	{
		$("#touchpad .ajaxloader").hide();
		$("#imgurDlog .err").text("Image does not exist!");
		console.warn("Imgur link failed!");
		return;
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
	$("#zoombutton").click(function(){
		$("#wrapper").toggleClass("x2");
	});
	
	$(".touchscreen").mouseup(producePoint);
	
	$("#screenSel").change(function(){
		var val = $("#screenSel").val();
		if (val == -1) openImgurDialog();
		else setPredefImg(val);
	});
	
	$("#imgurDlog .submit").click(parseImgurLink);
	$("#imgurDlog .cancel").click(function(){
		$("#imgurDlog").hide();
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