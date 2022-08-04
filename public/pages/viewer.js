const Viewer_template = document.createElement('template');
Viewer_template.innerHTML = `
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
class ViewerPage extends HTMLElement {
	//TODO

	//update to extend from VideoPlayerPage - then fix stuff up


	//have video loading while countdown is playing
    //clicking next needs to pause the video, as it keeps playing while the countdown is active
	//test video on laptop for slow loading videos - don't speak
	//make sure video is fully loaded before playing (validate on laptop)

	//do last, some song settings are using older first line vars, so check them all and update them - //for older values of timming -- //TODO need the duration for legacy stuff can take out after updated all the lyrics settings


	//TODO later
	//play around with screen sizes - did not work well on lap top
	//setup a better way to test/edit song setttings
	//add in a randomize button to playlist
	//setup a second video object for the next song, this way no loading time
	//maybe add a fade out a few seconds before ending and moving to the next song

	constructor() {
		super();

		this.attachShadow({mode:'open'});
		this.shadowRoot.appendChild(Viewer_template.content.cloneNode(true));
		this.videoPlayer = this.shadowRoot.querySelector('#videoPlayer');
		this.countdownPlayer = this.shadowRoot.querySelector('#countdownPlayer');
		this.videoPlayer.hidden = true;

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

		this.startNewSongButton.hide();
		this.pauseLyricsButton.hide();
		this.unpauseLyricsButton.hide();
		this.exitNoSaveButton.hide();
		this.endEarlyButton.hide();

		//setup videp player events
		this.videoPlayer.onloadedmetadata = function() {EventBroker.trigger('videoLoaded', this)};
		this.videoPlayer.onpause  = function() {EventBroker.trigger('videoPaused', this)};
		this.videoPlayer.onplay   = function() {EventBroker.trigger('videoPlayed', this)};
		this.videoPlayer.onvolumechange   = function() {EventBroker.trigger('VolumeChanged', this)};
		this.videoPlayer.addEventListener('ended',function() {EventBroker.trigger('videoEnded', this)},false);
		this.countdownPlayer.addEventListener('ended',function() {EventBroker.trigger('countDownEnded', this)},false);

		this.countdownPlayer.volume = .2;
		this.isFirstPlay = true;

		this.setupSavedPlayLists();
		this.currentSongTitle = '';

		this.pauseButton.disable();

		this.songSettings = SongSettings.createEmpty();
		this.tempView = true;

		EventBroker.listen("videoPlayerButton_mrp-button_clicked", this, this.setupViewerForTempPlaylist);
		EventBroker.listen("useSavedPlaylistButton_mrp-button_clicked", this, this.setupViewerForSavedPlaylist);

		EventBroker.pageListen("usePlayList", this, this.setSongList);
		EventBroker.pageListen("newPlaylistAdded", this, this.setupSavedPlayLists);
		EventBroker.pageListen("videoEnded", this, this.videoEnded);
		EventBroker.pageListen("videoLoaded", this, this.setLyrics);
		EventBroker.pageListen("videoPaused", this, this.videoPaused);
		EventBroker.pageListen("videoPlayed", this, this.videoPlayed);
		EventBroker.pageListen("PlaylistUpdate", this, this.updatePlaylist);
		EventBroker.pageListen("songTitleChanged", this, this.setupSongList);
		EventBroker.pageListen("countDownEnded", this, this.countDownEnded);
		EventBroker.pageListen("VolumeChanged", this, this._volumeChanged);
		EventBroker.pageListen(this.startButton, this.startButton.events.clicked, this, this.startPlayer);
		EventBroker.pageListen(this.temp, this.temp.events.clicked, this, this.tempFunc);
		EventBroker.pageListen(this.randomizeButton, this.randomizeButton.events.clicked, this, this.randomizeSongList);
		EventBroker.pageListen(this.playlistSection, this.playlistSection.events.changed, this, this.setupPlayList);
		EventBroker.pageListen(this.lyricsObj, this.lyricsObj.events.endedEarly, this, this.nextVideo);
		EventBroker.pageListen(this.nextButton, this.nextButton.events.clicked, this, this.nextVideo);
		EventBroker.pageListen(this.pauseButton, this.pauseButton.events.clicked, this, this._pauseButtonPressed);
		EventBroker.pageListen(this.restartButton, this.restartButton.events.clicked, this, this._restartSong);
		EventBroker.pageListen(this.songListBox, this.songListBox.events.changed, this, this._changeSong);

		this.setupSongList();

		this.songIndex = 0;
		this.isPaused = false;

	}

	tempFunc(){
		debugger;
	}

	setupViewerForTempPlaylist(){
		//hide the drop playlist selection drop down
		this.selectPlaylistDiv.hidden = true;

		//change the text on the next button to start
		this.startButton.textContent = "Start - Playlist Loading";
		this.startButton.disable();
		this.nextButton.disable();

		//hide the playlists button
		this.playlistButton.hide();

		//hide the randomize button
		this.randomizeButton.hide();

		this.songListSpan.hidden = true;
		this.songListBox.hide();

		//hide the temp button
		this.temp.hide();

		this.songTitleDiv.hidden = true

		//get the temp playlist name
		this.tempPlayListTitle = DataBroker.trigger('tempPlayListTitle');
		this._loadTempPlayList();
		this.pingInterval = Lib.JS.setInterval(this,this._loadTempPlayList, 3000);
	}
	setupViewerForSavedPlaylist(){
		this.selectPlaylistDiv.hidden = false;
		this.tempView = false;

		this.songListSpan.hidden = false;
		this.songListBox.show();
		this.playlistButton.show();

		//hide the randomize button
		this.randomizeButton.show();
		this.songTitleDiv.hidden = true
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
		debugger;
		var songTitle = event.target.getValue();
		var songIndex = this.songList.indexOf(songTitle);

		//set the current song to the one before this one and then go to the next song
		this.songIndex = this.songList.indexOf(songTitle)-1;
		this.nextVideo();
	}
	_restartSong(){
		//restart the lyrics
		this.lyricsObj.restart();

		//restart the video
		this.videoPlayer.currentTime = 0;
	}
	_exit(){
		//turn off the interval
		if(this.tempView){
			clearInterval(this.pingInterval);
		}

		EventBroker.trigger('switchToMainMenu');
	}
	async _loadTempPlayList(){
		const data = await Server.getPlayList(this.tempPlayListTitle);
		if(data){
			this.setSongList(JSON.parse(data), false);
			this.startButton.textContent = "Start";
			this.startButton.enable();
		}
	}
	videoPaused(){
		this.lyricsObj.pause();
	}
	videoPlayed(){
		this.lyricsObj.unPause();
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
	startVideo(){
		this.lyricsObj.addText(this.getCurrentSongTitle() + '\n\n' + this.songSettings.lyrics);
		this.lyricsObj.start(this.songSettings.getSpeed(),this.songSettings.getTimming(),this.songSettings.getDuration());

		//set volume
		this.videoPlayer.volume = this.songSettings.volume/100; 
	}
	temp(){
		this.lyricsObj.show();
	}
	getCurrentSongTitle(){
		return this.songList[this.songIndex];
	}
	async setupSongList(){
		const data = await Server.getSongList();
		this.setSongList(data,false);
		this.fullSongList = data;
	}
	setSongList(list, loadVideo = true){
		this.songList = list;
		this.songListBox.addList(list);

		if(loadVideo){
			this.startPlayer();
		}
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
	nextVideo(action){
		//if the countdown is hidden then a real video is playing so now it's time to switch
		if(this.countdownPlayer.hidden){
			this._playCountdown();
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
	loadVideo(){
		this.videoPlayer.src = "http://localhost:8080/api/video?name=" + this.songList[this.songIndex];
		this.videoPlayer.autoplay = true;
	}
	videoEnded(){
		this.countdownPlayer.hidden = true;
		this.nextVideo();
	}
	countDownEnded(){
		this.countdownPlayer.hidden = false;
		this.nextVideo();
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
}

window.customElements.define('viewer-page', ViewerPage);