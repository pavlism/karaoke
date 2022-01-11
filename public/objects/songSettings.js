class SongSettings{
	constructor(lyricData, videoPlayer){
		var firstLine = lyricData.split('\n')[0]
		
		//Cehck first line to settings Object
		//if it does then setup the settings
		if(firstLine.indexOf('{"duration":') ===0){
			this.duration = JSON.parse(firstLine).duration;
			this.startingPoint = JSON.parse(firstLine).startingPoint;
			this.volume = JSON.parse(firstLine).volume;
			
			//setup lyrics
			var lines = lyricData.split('\n');
			lines.shift();
			this.lyrics = lines.join('\n');
			
		}else{
			//else if missing add in empty one
			this.duration = -1;
			this.startingPoint = -1;
			this.videoPlayer = videoPlayer;
			this.volume = 100;
			this.lyrics = lyricData;
		}
	}
	getDuration(){
		//The lyrics need to run ass long as the song is playing, but we the user too see some of the lyrics at the start of the video
		//The animation speed is based on how long the animation will last, so it needs to last less then the song and start before zero.
		
		if(this.duration === -1 && Lib.JS.isDefined(this.videoPlayer)){
			this.duration = this.videoPlayer.duration;
			var startingPoint = Math.round(this.duration*0.3) * -1;
			this.duration = this.duration - startingPoint;
			this.duration = Math.round(this.duration*0.75);
			this.updateLyrics();
		}
		
		return this.duration;
	}
	getStartingPoint(){
		if(this.startingPoint === -1 && Lib.JS.isDefined(this.videoPlayer)){
			var duration = this.videoPlayer.duration;
			this.startingPoint = Math.round(duration*0.3) * -1;
			this.updateLyrics();
		}
		
		return this.startingPoint;
	}
	updateLyrics(){
		if(this.startingPoint === -1 ||this.duration === -1 || this.lyrics === 'Lyrics Missing'){
			return false;
		}
				
		var settings = {duration:this.duration, startingPoint:this.startingPoint, volume:this.volume};
		var newLyrics = JSON.stringify(settings) + '\n' + this.lyrics
		EventBroker.trigger('updateLyrics',newLyrics);
	}
}

SongSettings.createEmpty = function(){
	return new SongSettings('');
}