class SongSettings{
	constructor(lyricData, videoPlayer){
		this.videoPlayer = videoPlayer;
		
		var firstLine = lyricData.split('\n')[0]
		this.saveLyrics = '';

		//Cehck first line to settings Object
		//if it does then setup the settings
		//TODO need the duration for legacy stuff can take out after updated all the lyrics settings
		if(firstLine.indexOf('{"speed":') ===0 || firstLine.indexOf('{"duration":') ===0){
			this.speed = JSON.parse(firstLine).speed || 100;
			
			//need to parse the timming
			this.timming = JSON.parse(firstLine).timming || {};
			
			this.volume = JSON.parse(firstLine).volume || 50;
			
			//setup lyrics
			var lines = lyricData.split('\n');
			lines.shift();
			this.lyrics = lines.join('\n');
			
		}else{
			//else if missing add in empty one
			this.speed = 100;
			this.timming = '{}';
			this.volume = 50;
			this.lyrics = lyricData;
		}
	}
	getSpeed(){
		return this.speed;
	}
	getTimming(){
		return this.timming;
	}
	getDuration(){
		//The lyrics need to run ass long as the song is playing, but we the user too see some of the lyrics at the start of the video
		//The animation speed is based on how long the animation will last, so it needs to last less then the song and start before zero.
		
		/*if(this.duration === -1 && Lib.JS.isDefined(this.videoPlayer)){
			this.duration = this.videoPlayer.duration;
			var startingPoint = Math.round(this.duration*0.3) * -1;
			this.duration = this.duration - startingPoint;
			this.duration = Math.round(this.duration*0.75);
			this.updateLyrics();
		}*/
		
		return this.videoPlayer.duration;
	}
	getStartingPoint(){
		if(this.startingPoint === -1 && Lib.JS.isDefined(this.videoPlayer)){
			var duration = this.videoPlayer.duration;
			this.startingPoint = Math.round(duration*0.3) * -1;
			this.updateLyrics();
		}
		
		return this.startingPoint;
	}
	getLyricsToSave(){
		return this.saveLyrics;
	}
	updateLyrics(){
		if(this.speed === -1 ||this.volume === -1 || this.lyrics === 'Lyrics Missing'){
			return false;
		}
				
		var settings = {speed:this.speed, volume:this.volume, timming:this.timming};
		this.saveLyrics = JSON.stringify(settings) + '\n' + this.lyrics;
		EventBroker.trigger('updateLyrics',this.lyrics);
	}

}

SongSettings.createEmpty = function(){
	return new SongSettings('');
}