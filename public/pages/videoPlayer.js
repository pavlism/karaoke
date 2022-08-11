const VideoPlayer_template = document.createElement('template');
VideoPlayer_template.innerHTML = `
	<div id="selectPlaylistDiv">
		Select Playlist <mrp-drop-down id="playListSelection"></mrp-drop-down>
		<span id="songListSpan">Songs:<mrp-drop-down width='500px' searchable id='songListBox'></mrp-drop-down></span>
	</div>
	<div id='lyrics' style="width: 25%;float: left;">
		<div id='songTitle' style="width: 25%;float: left;">
			Song Title:<mrp-text-box id='songTitleBox' size='50'></mrp-text-box>
			Lyrics:<mrp-text-area rows=20 cols=50 id='songLyrics'></mrp-text-area>
		</div>
		<mrp-marquee id='lyricsScrolling' style="max-height: 800px;overflow: hidden;font-size: x-large;"></mrp-marquee>
		<div id='nextSongDiv' style="max-height: 800px;overflow: hidden;font-size: x-large;margin-top: 50%;"></div>
	</div>
	
	<video id="videoPlayer" controls style="width: 75%;max-height: 800px;"></video>
	<video id="countdownPlayer" controls style="width: 75%;max-height: 800px;"></video>

	<mrp-button primary id="startButton">Start</mrp-button>
	<mrp-button primary id="startNewSongButton">Start</mrp-button>
	<mrp-button primary id="unpauseLyricsButton">Unpause Lyrics</mrp-button>
	<mrp-button primary id="pauseLyricsButton">Pause Lyrics</mrp-button>
	<mrp-button primary id="nextButton">Next</mrp-button>
	<mrp-button primary id="playlistButton">Playlists</mrp-button>
	<mrp-button primary id="randomizeButton">Randomize</mrp-button>
	<mrp-button primary id="pauseButton">Pause</mrp-button>
	<mrp-button primary id="endEarly">End Early</mrp-button>
	<mrp-button primary id="restartButton">restart</mrp-button>
	<mrp-button primary id="exitButton">Exit</mrp-button>
	<mrp-button primary id="exitNoSaveButton">Exit with Saving</mrp-button>
	
	<mrp-button primary id="temp">temp</mrp-button>
	
`
class VideoPlayerPage extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({mode:'open'});
		this.shadowRoot.appendChild(VideoPlayer_template.content.cloneNode(true));
		this.videoPlayer = this.shadowRoot.querySelector('#videoPlayer');
		this.countdownPlayer = this.shadowRoot.querySelector('#countdownPlayer');

		this.lyricsdiv = this.shadowRoot.querySelector('#lyrics');
		this.songListSpan = this.shadowRoot.querySelector('#songListSpan');
		this.songListBox = this.shadowRoot.querySelector('#songListBox');
		this.selectPlaylistDiv = this.shadowRoot.querySelector('#selectPlaylistDiv');
		this.lyricsObj = this.shadowRoot.querySelector('mrp-marquee');
		this.playListBox = this.shadowRoot.querySelector('mrp-drop-down');
		this.nextSongDiv = this.shadowRoot.querySelector('#nextSongDiv');

		this.startButton = this.shadowRoot.querySelector('#startButton');
		this.nextButton = this.shadowRoot.querySelector('#nextButton');
		this.playlistButton = this.shadowRoot.querySelector('#playlistButton');
		this.randomizeButton = this.shadowRoot.querySelector('#randomizeButton');
		this.pauseButton = this.shadowRoot.querySelector('#pauseButton');
		this.exitButton = this.shadowRoot.querySelector('#exitButton');
		this.restartButton = this.shadowRoot.querySelector('#restartButton');
		this.temp = this.shadowRoot.querySelector('#temp');
		this.songTitleDiv = this.shadowRoot.querySelector('#songTitle');
		this.songTitleBox = this.shadowRoot.querySelector('#songTitleBox');
		this.songLyricsBox = this.shadowRoot.querySelector('#songLyrics');
		this.startNewSongButton = this.shadowRoot.querySelector('#startNewSongButton');
		this.pauseLyricsButton = this.shadowRoot.querySelector('#pauseLyricsButton');
		this.unpauseLyricsButton = this.shadowRoot.querySelector('#unpauseLyricsButton');
		this.playlistSection = this.shadowRoot.querySelector('#playListSelection');
		this.exitNoSaveButton = this.shadowRoot.querySelector('#exitNoSaveButton');
		this.endEarlyButton = this.shadowRoot.querySelector('#endEarly');

		this.tempPlayListTitle = "1234_mrp_!!!!!";
		DataBroker.listen('tempPlayListTitle',this,'tempPlayListTitle');
	}
	startVideo(){
		this.lyricsObj.addText(this.getCurrentSongTitle() + '\n\n' + this.songSettings.lyrics);
		this.lyricsObj.start(this.songSettings.getSpeed(),this.songSettings.getTimming(),this.songSettings.getDuration());

		//set volume
		this.videoPlayer.volume = this.songSettings.volume/100;
	}
	async setLyrics(){
		const data = await Server.getSongLyrics(this.songList[this.songIndex])
		if(data){
			this.songSettings = new SongSettings(data,this.songList[this.songIndex], this.videoPlayer);
			//Get the settings from the first line of the data
			this.startVideo();
		}else{
			this.lyricsdiv.firstElementChild.innerText = this.getCurrentSongTitle() + '\n\n' +'lyrics missing';
		}
	}
	startPlayer(){
		this.songIndex = 0;
		this.currentSongTitle = this.songList[this.songIndex];
		this.startButton.hide();
		this.nextButton.enable();
		this.pauseButton.enable();
		this.isPaused = false;

		this.countdownPlayer.src = "http://localhost:8080/api/video?name=5 Second Countdown";
		this.countdownPlayer.autoplay = true;
		this._setupCountdownLyrics();
		this._disableAllButtons();
	}
	_setupCountdownLyrics(){

		if(this.isFirstPlay){
			var message = "Next Song: " + this.songList[this.songIndex];
		}else{
			var message = "Next Song: " + this.songList[this.songIndex+1];
		}
		this.nextSongDiv.textContent = message;
		this.nextSongDiv.hidden = false;
		this.lyricsObj.hide();
	}
	async setupSavedPlayLists(listJustAdded){
		const data = await Server.getAllPlayLists();

		if(data) {
			this.playListList = data;
			data.unshift("All");
			this.playListBox.addList(data);
			this.playListBox.sortAlphabetically();

			if (Lib.JS.isDefined(listJustAdded)) {
				this.playListBox.setValue(listJustAdded);
			}
		}
	}
	async setupPlayList(playListName){
		//if a playslit wasn't sent in then grab it from the text box
		if(Lib.JS.isUndefined(playListName) || !Lib.JS.isString(playListName)){
			playListName = this.playListBox.getValue();
		}else{
			playListName = this.tempPlayListTitle;
		}

		if(playListName==="All"){
			this.setSongList(this.fullSongList);
			return false;
		}

		const data = await Server.getPlayList(playListName);
		if(data){
			this.setSongList(JSON.parse(data));
		}
	}
	randomizeSongList(){


		for(var randomCounter = 0;randomCounter<10000;randomCounter++){
			var R1 = Lib.JS.getRandomInt(0,this.songList.length-1);
			var R2 = Lib.JS.getRandomInt(0,this.songList.length-1);
			var temp = this.songList[R1];
			this.songList[R1] = this.songList[R2];
			this.songList[R2] = temp;
		}

		this.loadVideo();
	}
	updatePlaylist(playlistInfo){
		//if the current list is updated
		if(this.playListBox.getValue() == playlistInfo.title){
			this.songList = playlistInfo.list;
			this.songListBox.addList(list);
		}
	}
	countDownEnded(){
		this.countdownPlayer.hidden = false;
		this.nextVideo();
	}
	videoEnded(){
		this.countdownPlayer.hidden = true;
		this.nextVideo();
	}
	loadVideo(){
		this.videoPlayer.src = "http://localhost:8080/api/video?name=" + this.songList[this.songIndex];
		this.videoPlayer.autoplay = true;
	}
	nextVideo(action){
		//if the countdown is hidden then a real video is playing so now it's time to switch
		if(this.countdownPlayer.hidden){
			this._playCountdown();
			this.videoPlayer.pause();
			return false;
		}

		this._enableAllButtons();
		this.lyricsObj.show();
		this.nextSongDiv.hidden = true;

		this.videoPlayer.hidden = false;
		this.countdownPlayer.hidden = true;

		this.songIndex++;
		if(this.isFirstPlay){
			this.songIndex--;
			this.isFirstPlay = false;
		}

		if(this.songIndex >= this.songList.length){
			this.songIndex = 0;
		}

		if(this.tempView){
			//when a song ends it needs add a remove action to the actions on the server
			Server.addTempListAction('remove',this.currentSongTitle);
		}

		this.loadVideo();
		this.currentSongTitle = this.songList[this.songIndex];
	}
	_disableAllButtons(){
		this.nextButton.disable();
		this.playlistButton.disable();
		this.randomizeButton.disable();
		this.pauseButton.disable();
		this.restartButton.disable();
		this.exitButton.disable();
	}
	_enableAllButtons(){
		this.nextButton.enable();
		this.playlistButton.enable();
		this.randomizeButton.enable();
		this.pauseButton.enable();
		this.restartButton.enable();
		this.exitButton.enable();
	}
	_playCountdown(){
		//setup the video player
		this.videoPlayer.hidden = true;
		this.countdownPlayer.hidden = false;
		this.countdownPlayer.currentTime = 0;
		this.countdownPlayer.play();

		//change the lyrics to match the next video
		this._setupCountdownLyrics();

		this._disableAllButtons();
	}
	setSongList(list, loadVideo = true){
		this.songList = list;
		this.songListBox.addList(list);

		if(loadVideo){
			this.startPlayer();
		}
	}
	async setupSongList(){
		const data = await Server.getSongList();
		this.setSongList(data,false);
		this.fullSongList = data;
	}
	getCurrentSongTitle(){
		return this.songList[this.songIndex];
	}
	temp(){
		this.lyricsObj.show();
	}
	_pauseButtonPressed(){
		if(this.videoPlayer.paused){
			this.videoPlayer.play();
			this.pauseButton.textContent = 'Pause'
		}else{
			this.videoPlayer.pause();
			this.pauseButton.textContent = 'Resume'
		}
	}
	videoPlayed(){
		this.lyricsObj.unPause();
	}
	videoPaused(){
		this.lyricsObj.pause();
	}
	_restartSong(){
		//restart the lyrics
		this.lyricsObj.restart();

		//restart the video
		this.videoPlayer.currentTime = 0;
	}
	_volumeChanged(videoObject){
		//need to update setting for the song

		//see if the volume changed
		if(this.songSettings.volume !== videoObject.volume * 100){
			this.songSettings.volume = videoObject.volume * 100;
			Server.updateSongLyrics(this.songSettings.songTitle, this.songSettings.getLyricsToSave());
		}
	}
	_changeSong(event){
		var songTitle = event.target.getValue();
		var songIndex = this.songList.indexOf(songTitle);

		if(songIndex === -1){
			return false;
		}

		this.videoPlayer.pause();
		//set the current song to the one before this one and then go to the next song
		this.songIndex = this.songList.indexOf(songTitle)-1;
		this.nextVideo();
	}
}

window.customElements.define('video-player-page', VideoPlayerPage);