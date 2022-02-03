const Viewer_template = document.createElement('template');
Viewer_template.innerHTML = `
	<div id="selectPlaylistDiv">
		Select Playlist <mrp-drop-down id="Viewer_playListSelection"></mrp-drop-down>
	</div>
	<div id='lyrics' style="width: 25%;float: left;">
		<mrp-marquee id='lyricsScrolling' style="max-height: 800px;overflow: hidden;font-size: x-large;"></mrp-marquee>
		<div id="songTitleForAddLyrics"></div>
	</div>
	
	<video id="videoPlayer" controls style="width: 75%;max-height: 800px;"></video>

	<mrp-button primary id="startButton">Start</mrp-button>
	<mrp-button primary id="nextButton">Next</mrp-button>
	<mrp-button primary id="playlistButton">Playlists</mrp-button>
	<mrp-button primary id="randomizeButton">Randomize</mrp-button>
	<mrp-button primary id="temp">temp</mrp-button>
	
`
class ViewerPage extends HTMLElement {
	//TODO


	//have the current song removed from the temp playlist - once completed


	//have the startbutton look for the temp playListBox
	//grey out start button until temp play list exists
	//next button doesn't change the title at the bottom - id=songTitleForAddLyrics
	//once a song is played remove it from the list
	//if playlist changes then update autp randomize it

	//using the next button before lyric scrolling ends messes up the next one
	//make sure video is fully loaded before playing (validate on laptop)
	//add in main menu botton

	//play around with screen sizes - did not work well on lap top
	//add restart song button
	//add in setting for start time of lyrics
	//add in pause features
	//pause should prob be taken from total time
	//change the setting to have a speed setting instead of the songe lenght and starting point
	//add a restart button
	//remove ability to add lyrics when playing a song
	//show what is next

	//force the video to be a scpecific size
	//test video on laptop for slow loading videos - don't speak

	//maybe add a fade out a few seconds before ending and moving to the next song
	
	//ENOENT: no such file or directory, stat 'public/videos/Tiësto .mp4' - somthing wierd happened and it crashed to server


	//do last, some song settings are using older first line vars, so check them all and update them - //for older values of timming -- //TODO need the duration for legacy stuff can take out after updated all the lyrics settings


	//TODO later
	//setup a better way to test/edit song setttings

	constructor() {
		super();

		this.attachShadow({mode:'open'});
		this.shadowRoot.appendChild(Viewer_template.content.cloneNode(true));

		this.videoPlayer = this.shadowRoot.querySelector('#videoPlayer');
		this.videoPlayer.addEventListener('ended',this.videoEnded,false);
		this.lyricsdiv = this.shadowRoot.querySelector('#lyrics');
		this.songTitleForAddLyrics = this.shadowRoot.querySelector('#songTitleForAddLyrics');
		this.selectPlaylistDiv = this.shadowRoot.querySelector('#selectPlaylistDiv');
		this.lyricsObj = this.shadowRoot.querySelector('mrp-marquee');
		this.playListBox = this.shadowRoot.querySelector('mrp-drop-down');

		this.startButton = this.shadowRoot.querySelector('#startButton');
		this.nextButton = this.shadowRoot.querySelector('#nextButton');
		this.playlistButton = this.shadowRoot.querySelector('#playlistButton');
		this.randomizeButton = this.shadowRoot.querySelector('#randomizeButton');
		this.editSongButton = this.shadowRoot.querySelector('#editSong');
		this.temp = this.shadowRoot.querySelector('#temp');
		
		this.setupSavedPlayLists();
		this.currentSongTitle = '';
		
		this.songSettings = SongSettings.createEmpty();
		this.tempView = true;
		
		//setup videp player events
		this.videoPlayer.onloadedmetadata = function() {EventBroker.trigger('videoLoaded', this)};
		this.videoPlayer.onpause  = function() {EventBroker.trigger('videoPaused', this)};
		this.videoPlayer.onplay   = function() {EventBroker.trigger('videoPlayed', this)};
		
		EventBroker.listen("startButton_mrp-button_clicked", this, this.startPlayer);
		EventBroker.listen("usePlayList", this, this.setSongList);
		EventBroker.listen("newPlaylistAdded", this, this.setupSavedPlayLists);
		EventBroker.listen("videoEnded", this, this.nextVideo);
		EventBroker.listen(["Viewer_playListSelection_mrp-drop-down_changed"], this, this.setupPlayList);
		EventBroker.listen("randomizeButton_mrp-button_clicked", this, this.randomizeSongList);
		EventBroker.listen("temp_mrp-button_clicked", this, this.tempFunc);
		EventBroker.listen("videoLoaded", this, this.setLyrics);
		EventBroker.listen("videoPaused", this, this.videoPaused);
		EventBroker.listen("videoPlayed", this, this.videoPlayed);
		EventBroker.listen("PlaylistUpdate", this, this.updatePlaylist);
		EventBroker.listen("songTitleChanged", this, this.setupSongList);
		EventBroker.listen("videoPlayerButton_mrp-button_clicked", this, this.setupViewerForTempPlaylist);
		EventBroker.listen("useSavedPlaylistButton_mrp-button_clicked", this, this.setupViewerForSavedPlaylist);

		EventBroker.listen(this.lyricsObj, this.lyricsObj.events.endedEarly, this, this.nextVideo);
		EventBroker.listen(this.nextButton, this.nextButton.events.clicked, this, this.nextVideo);

		//this.setupSongList();

		this.songIndex = 0;
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

		//hide the temp button
		this.temp.hide();



		//get the temp playlist name
		this.tempPlayListTitle = DataBroker.trigger('tempPlayListTitle');
		this._loadTempPlayList();
		this.pingInterval = Lib.JS.setInterval(this,this._loadTempPlayList, 3000);
	}
	setupViewerForSavedPlaylist(){
		this.selectPlaylistDiv.hidden = false;
		this.tempView = false;
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
	startVideo(){
		this.lyricsObj.addText(this.getCurrentSongTitle() + '\n\n' + this.songSettings.lyrics);
		this.lyricsObj.start(this.songSettings.getSpeed(),this.songSettings.getTimming(),this.songSettings.getDuration());
		
		//set voloume
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
		
		if(loadVideo){
				this.loadVideo();
		}
	}
	async setLyrics(){
		const data = await Server.getSongLyrics(this.songList[this.songIndex])
		if(data){
			this.songSettings = new SongSettings(data, this.videoPlayer);
			//Get the settings from the first line of the data
			this.startVideo();
		}else{
			this.lyricsdiv.firstElementChild.innerText = this.getCurrentSongTitle() + '\n\n' +'lyrics missing';
		}
	}
	startPlayer(){
		this.songIndex = 0;
		this.currentSongTitle = this.songList[this.songIndex];
		this.loadVideo();
		this.startButton.hide();
		this.nextButton.enable();
	}
	nextVideo(action){
		this.songIndex++;
		if(this.songIndex >= this.songList.length){
			this.songIndex = 0;
		}
		//when a song ends it needs add a remove action to the actions on the server
		Server.addTempListAction('remove',this.currentSongTitle);

		this.loadVideo();
		this.currentSongTitle = this.songList[this.songIndex];
	}
	loadVideo(){
		this.videoPlayer.src = "http://localhost:8080/api/video?name=" + this.songList[this.songIndex];
		this.videoPlayer.autoplay = true;
	}
	videoEnded(){
		EventBroker.trigger("videoEnded", this);
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

		for(var randomCounter = 0;randomCounter<100;randomCounter++){
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
		}
	}
}

window.customElements.define('viewer-page', ViewerPage);