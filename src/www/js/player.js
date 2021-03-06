Player = function (divname) {
	forcehtml5=false;
	this.playing=false;
	this.vol=0.5;
	if (swfobject.getFlashPlayerVersion().major<10||forcehtml5){
		this.mode='html5';
		this.sound = new Audio();
	} else {
		this.flname='radio';
		this.mode='flash';
		
		console.log('flash enabled');
		swfobject.embedSWF("/js/radio.swf", "radio", "0", "0", "11.0.0");
	}
	return this;

};

Player.prototype = {

	constructor: Player,
	
	play: function (path) {
		if (this.mode=='flash'){
			var p=this;
			if (getflashinstance(this.flname)){
				if (!this.playing||this.path!=path){
					getflashinstance(this.flname).play(path); 
					p.volume(p.vol);
					this.playing=true;
				}
			} else {
				setTimeout(function(){
					p.play(p.path);
					p.volume(p.vol);
				}, 400);
			}
		} else {
			this.sound.src=path;
			this.sound.loop='loop';
			this.sound.play();
			this.playing=true;
		}
		this.path=path;
	},
	

	stop: function () {
		if (this.mode=='flash'){
			getflashinstance(this.flname).stop(); 
		} else {
			this.sound.pause();
			this.sound.src='';
		}
		this.playing=false;
	},
	volume: function (vol) {
		if (vol){
			this.vol=vol;
			if (this.mode=='flash'){
				var p=this;
				if (getflashinstance(this.flname)){
					try{getflashinstance(this.flname).volume(vol);} catch(err) {} 
				} else {
					setTimeout(function(){
						p.volume(p.vol);
					}, 400);
				}
			} else {
				this.sound.volume=vol;
			}
			
		} else {
			return this.vol;
		}
	}
	
};
function getflashinstance(name){
	if (navigator.appName.indexOf("Microsoft") != -1) {
        return window[name];
    } else {
        return document[name];
    }
};

function setvolume(e){
	var pos=e.pageX-$('#volume .slider')[0].offsetLeft;
	if (pos<0){pos=0;}
	if (pos>125){pos=125;}
	$('#volume .slider .bar').width(pos);
	player.volume(pos/125);
	$.Storage.set("volume", (pos/125)*1000+' ');
	
}
function handle_storage(e) {
  if (!e) { 
  	e = window.event; 
  }
  if (e.key=='play'&&e.newValue=="true"){
  	player.stop();
  	$('#console .streamcontrol .stop').hide();
  	$('#console .streamcontrol .play').show();
  }
}

if (window.addEventListener) {
	window.addEventListener("storage", handle_storage, false);
} else {
	window.attachEvent("onstorage", handle_storage);
};

var player=null;

$(document).ready(function() {
	player=new Player();
	var vol=parseInt($.Storage.get("volume"));
	if (vol>0){
		vol=vol/1000;
		$('#volume .slider .bar').width(vol*125);
		player.volume(vol);
	}
	$('#console .streamcontrol .play').click( function (){
		player.play(client.channel.hi);
		$('#console .streamcontrol .play').hide();
		$('#console .streamcontrol .stop').show();
		$.Storage.set("play", 'true');
	});
	$('#console .streamcontrol .stop').click( function(){
		player.stop();
		$('#console .streamcontrol .stop').hide();
		$('#console .streamcontrol .play').show();
		$.Storage.set("play", 'false');
	});
	$('#console .streamcontrol .play').show();
	$('#console .streamcontrol .stop').hide();
	
	$('#volume .slider').bind('mousedown',function(e){
		e.preventDefault();
		setvolume(e);
		$(window).bind('mousemove', setvolume);
	    $(window).mouseup(function(){
	    	$(window).unbind('mousemove', setvolume);
	    });
	});
	
});
