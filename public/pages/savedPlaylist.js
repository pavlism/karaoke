const SavedList_template = document.createElement('template');
SavedList_template.innerHTML = ``

class SavedPlaylistPage extends VideoPlayerPage {
	//TODO later
	//play around with screen sizes - did not work well on lap top
	//have video loading while countdown is playing
	//should not be pulling for the temp list

	constructor() {
		super();

		this.shadowRoot.appendChild(SavedList_template.content.cloneNode(true));

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

		this.setupSongList();

		this.songIndex = 0;
		this.isPaused = false;

		this.videoPlayer.hidden = true;
		this.startButton.hide();
		this.startNewSongButton.hide();
		this.unpauseLyricsButton.hide()
		this.pauseLyricsButton.hide();
		this.endEarlyButton.hide();
		this.exitNoSaveButton.hide();
		this.temp.hide();
		this.playlistButton.hide();

		this.selectPlaylistDiv.hidden = false;
		this.songListSpan.hidden = false;
		this.songListBox.show();
		this.songTitleDiv.hidden = true
	}
	_exit(){
		EventBroker.trigger('switchToMainMenu');
	}
}

window.customElements.define('saved-playlist-page', SavedPlaylistPage);