const SongSetup_template = document.createElement('template');
SongSetup_template.innerHTML = `
	<mrp-alert id="songSavedAlert"></mrp-alert>
`
class SongSetupPage extends VideoPlayerPage {
	//TODO

	//check to make sure song is new

	constructor() {
		super();
		this.shadowRoot.appendChild(SongSetup_template.content.cloneNode(true));

		this.songSavedAlert = this.shadowRoot.querySelector('#songSavedAlert');
		this.songSavedAlert.setInfo("Song Save", "The song has been save you will be taken back to the main menu");

		this.selectPlaylistDiv.hidden = true;
		this.tempView = false;

		this.songListSpan.hidden = false;
		this.songListBox.hide();
		this.playlistButton.hide();

		//hide the randomize button
		this.randomizeButton.hide();
		this.nextButton.hide();
		this.playlistButton.hide();
		this.pauseButton.hide();

		this.videoPlayer.onloadedmetadata = function() {EventBroker.trigger('SongSetupPage_videoLoaded', this)};
		EventBroker.listen("SongSetupPage_videoLoaded", this, this._videoLoaded);
		EventBroker.listen("new song added by user", this, this._handleNewSong);
		EventBroker.pageListen(this.startNewSongButton, this.startNewSongButton.events.clicked, this, this._startVideo);
		EventBroker.pageListen(this.pauseLyricsButton, this.pauseLyricsButton.events.clicked, this, this._pauseLyrics);
		EventBroker.pageListen(this.unpauseLyricsButton, this.unpauseLyricsButton.events.clicked, this, this._unPauseLyrics);

		EventBroker.pageListen(this.exitButton, this.exitButton.events.clicked, this, this._saveExit);
		EventBroker.pageListen(this.exitNoSaveButton, this.exitNoSaveButton.events.clicked, this, this._exitNoSave);
		EventBroker.pageListen(this.endEarlyButton, this.endEarlyButton.events.clicked, this, this._endEarly);
		EventBroker.pageListen(this.songSavedAlert, this.songSavedAlert.events.closed, this, this._exitNoSave);

		this.exitButton.changeText("Save and Exit");

		this.countdownPlayer.hidden = true;
		this.videoPlayer.hidden = false;
		this.startButton.hide();
		this.songTitle = '';
		this.startNewSongButton.show();
		this.pauseLyricsButton.show();
		this.unpauseLyricsButton.show();
		this.pauseIndex = 0;
		this.unpauseLyricsButton.textContent = "Start Lyrics";
		this.lyricsStarted = false;

		var songTitle = "No Doubt - It's My Life (edited)";
		EventBroker.trigger("new song added by user", songTitle);

		this.exitNoSaveButton.show();
		this.endEarlyButton.show();
		this.restartButton.hide();
		this.endEarlyButton.disable();
		this.exitNoSaveButton.disable();
		this.exitButton.disable();
		this.temp.hide();
	}
	_getCurrentTime(){
		return Math.round(this.videoPlayer.currentTime);
	}
	_endEarly(){
		this.songSettings.addEndEarly(this._getCurrentTime());
		this.endEarlyButton.changeText("End Saved")
		this.endEarlyButton.disable();
		this.videoPlayer.pause();
	}
	_exitNoSave(){
		EventBroker.trigger('switchToMainMenu');
	}
	async _saveExit(){
		//save the song settings
		this.songSettings.updateLyrics();
		const response = await Server.updateSongLyrics(this.songTitleBox.value, this.songSettings.getLyricsToSave());
		if(response.status !==200){
			this.lyricsdiv.firstElementChild.innerText = "An error happened check the server";
		}else{
			//pop a message saying song saved
			//then return to main menu
			this.songSavedAlert.show();
		}
	}
	_pauseLyrics(){
		this.lyricsObj.pause();

		//get new pause index
		this.pauseStart = this._getCurrentTime();
		this.pauseLyricsButton.disable();
		this.unpauseLyricsButton.enable();
	}
	_unPauseLyrics(){
		if(!this.lyricsStarted){
			var lyrics = this.songLyricsBox.getValue();
			this.lyricsObj.addText(this.songTitle + '\n\n' + lyrics);
			this.lyricsObj.start(this.songSettings.getSpeed(),this.songSettings.getTimming(),this.songSettings.getDuration());
			this.lyricsStarted = true;
			this.songSettings.addStart(this._getCurrentTime());
			this.unpauseLyricsButton.changeText("Unpause Lyrics");
		}else{
			this.lyricsObj.unPause();
			this.songSettings.addPause(this.pauseStart, this._getCurrentTime());
		}

		this.unpauseLyricsButton.disable();
		this.pauseLyricsButton.enable();
	}
	async _handleNewSong(songTitle){
		this.songTitle = songTitle;
		this.startNewSongButton.disable();
		this.pauseLyricsButton.disable();
		this.unpauseLyricsButton.disable();
		this.restartButton.disable();

		//add song title to title box
		this.songTitleBox.setValue(songTitle);

		//Check for lyrics file
		const data = await Server.getSongLyrics(songTitle);

		//If one found then fill things out else leave stuff blank
		if(data === 'Lyrics Missing'){
			this.songLyricsBox.setValue("Add the Lyrics here then hit the start button");
		}else{
			//TODO for editing a song
			//debugger;
		}

		//load the song but don't start the player
		this._loadVideo(songTitle)

		//The user should then have a start lyrics button, and a pause lyrics button, and an end early button and a reveiw button
	}
	_startVideo(){
		//hide the lyrics box
		this.songLyricsBox.hidden = true

		//save the lyrics
		var lyrics = this.songLyricsBox.getValue();

		this.songSettings = new SongSettings(lyrics, this.songTitle, this.videoPlayer);
		this.pauseLyricsButton.enable();
		this.unpauseLyricsButton.enable();
		this.videoPlayer.play();
		this.startNewSongButton.hide()
		this.pauseLyricsButton.disable();
		this.endEarlyButton.enable();
		this.exitNoSaveButton.enable();
		this.exitButton.enable();
	}
	_videoLoaded(){
		this.startNewSongButton.enable();
	}
	_loadVideo(songTitle){
		this.videoPlayer.src = "http://localhost:8080/api/video?name=" + songTitle;
		this.videoPlayer.autoplay = false;
	}
}

window.customElements.define('song-setup-page', SongSetupPage);