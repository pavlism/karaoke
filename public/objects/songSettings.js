class SongSettings{
	constructor(lyricData, songTitle, videoPlayer){
		this.videoPlayer = videoPlayer;
		this.songTitle = songTitle;

		var firstLine = lyricData.split('\n')[0]
		this.saveLyrics = '';

		//Cehck first line to settings Object
		//if it does then setup the settings
		//TODO need the duration for legacy stuff can take out after updated all the lyrics settings
		if(firstLine.indexOf('{"speed":') ===0 || firstLine.indexOf('{"duration":') ===0){
			this.speed =  JSON.parse(firstLine).speed;

			if(Lib.JS.isUndefined(this.speed)){
				this.speed =  100;
			}

			this.volume =  JSON.parse(firstLine).volume;

			if(Lib.JS.isUndefined(this.volume)){
				this.volume =  50;
			}

			//need to parse the timming
			this.timming = {endEarly:0,startTime:0,};
			if(Lib.JS.isDefined(JSON.parse(firstLine).timming)){
				this.timming = JSON.parse(firstLine).timming;	
			}

			if(Lib.JS.isUndefined(this.timming.pauses)){
				this.timming.pauses = [];
			}

			//for older values of timming
			if(Object.keys(this.timming).length === 0){
				this.timming = {endEarly:0,startTime:0, pauses:[]};
			}
			
			//setup lyrics
			var lines = lyricData.split('\n');
			lines.shift();
			this.lyrics = lines.join('\n');
			
		}else{
			//else if missing add in empty one
			this.speed = 100;
			this.timming = {endEarly:0,startTime:0,pauses:[]};
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
		if(this.saveLyrics===""){
			this.updateLyrics();
		}
		return this.saveLyrics;
	}
	updateLyrics(){
		if(this.speed === -1 ||this.volume === -1 || this.lyrics === 'Lyrics Missing'){
			return false;
		}
				
		var settings = {speed:this.speed, volume:this.volume, timming:this.timming};
		this.saveLyrics = JSON.stringify(settings) + '\n' + this.lyrics;
	}
	addPause(startTime, endTime){
		this.timming.pauses.push({startTime,endTime});
		this.updateLyrics();
	}
	addEndEarly(time){
		this.timming.endEarly = time;
	}
	addStart(time){
		this.timming.startTime = time;
	}
}

SongSettings.createEmpty = function(){
	return new SongSettings('');
}