const Viewer_template = document.createElement('template');
Viewer_template.innerHTML = `
`
class ViewerPage extends VideoPlayerPage {
	constructor() {
		super();

		this.shadowRoot.appendChild(Viewer_template.content.cloneNode(true));

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
		EventBroker.pageListen(this.randomizeButton, this.randomizeButton.events.clicked, this, this.randomizeSongList);
		EventBroker.pageListen(this.playlistSection, this.playlistSection.events.changed, this, this.setupPlayList);
		EventBroker.pageListen(this.lyricsObj, this.lyricsObj.events.endedEarly, this, this.nextVideo);
		EventBroker.pageListen(this.nextButton, this.nextButton.events.clicked, this, this.nextVideo);
		EventBroker.pageListen(this.pauseButton, this.pauseButton.events.clicked, this, this._pauseButtonPressed);
		EventBroker.pageListen(this.restartButton, this.restartButton.events.clicked, this, this._restartSong);
		EventBroker.pageListen(this.songListBox, this.songListBox.events.changed, this, this._changeSong);
		EventBroker.pageListen(this.exitButton, this.exitButton.events.clicked, this, this._exit);

		//this.setupSongList();

		this.songIndex = 0;
		this.isPaused = false;

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
		this.videoPlayer.hidden = true;

		this.pingInterval = Lib.JS.setInterval(this,this._loadTempPlayList, 3000);
	}
	async _loadTempPlayList(){
		const data = await Server.getPlayList(this.tempPlayListTitle);
		if(data){
			this.setSongList(JSON.parse(data), false);
			this.startButton.textContent = "Start";
			this.startButton.enable();
		}
	}
	_exit(){
		//turn off the interval
		if(this.tempView){
			clearInterval(this.pingInterval);
		}

		EventBroker.trigger('switchToMainMenu');
	}
}

window.customElements.define('viewer-page', ViewerPage);