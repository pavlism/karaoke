const Viewer_template = document.createElement('template');
Viewer_template.innerHTML = `
	<div>
		Select Playlist <mrp-drop-down id="Viewer_playListSelection"></mrp-drop-down>
	</div>
	<div id='lyrics' style="width: 25%;float: left;">
		<mrp-marquee style="max-height: 800px;overflow: hidden;font-size: x-large;"></mrp-marquee>
		<div id="songTitleForAddLyrics"></div>
		<mrp-text-area primary id="lyricsBox"></mrp-text-area>
		<mrp-button primary id="addLyrics" style="display: block;">Add Lyrics</mrp-button>
	</div>
	
	<video id="videoPlayer" controls style="width: 75%;max-height: 800px;"></video>
	
	
	<mrp-button primary id="startButton">Next</mrp-button>
	<mrp-button primary id="playlistButton">Playlists</mrp-button>
	<mrp-button primary id="randomizeButton">Randomize</mrp-button>
	<mrp-button primary id="temp">temp</mrp-button>
`
class ViewerPage extends HTMLElement {
	//TODO
	
	
	
	//add in pause between songs
	
	//add restart song button
	//add in setting for start time of lyrics
	//add in pause features
	//pause should prob be taken from total time
	//change the setting to have a speed setting instead of the songe lenght and starting point
	
	
	constructor() {
		super();
		
		//<source src="http://localhost:8080/api/video" type="video/mp4">
		this.attachShadow({mode:'open'});
		this.shadowRoot.appendChild(Viewer_template.content.cloneNode(true));

		this.videoPlayer = this.shadowRoot.querySelector('#videoPlayer');
		this.videoPlayer.addEventListener('ended',this.videoEnded,false);
		this.lyricsdiv = this.shadowRoot.querySelector('#lyrics');
		this.addLyricsButton = this.shadowRoot.querySelector('#addLyrics');
		this.addLyricsBox = this.shadowRoot.querySelector('#lyricsBox');
		this.songTitleForAddLyrics = this.shadowRoot.querySelector('#songTitleForAddLyrics');
		this.lyricsObj = this.shadowRoot.querySelector('mrp-marquee');
		this.playListBox = this.shadowRoot.querySelector('mrp-drop-down');
		this.setupSavedPlayLists();
		
		this.songSettings = SongSettings.createEmpty();
		
		//setup videp player events
		this.videoPlayer.onloadedmetadata = function() {EventBroker.trigger('videoLoaded', this)};
		this.videoPlayer.onpause  = function() {EventBroker.trigger('videoPaused', this)};
		this.videoPlayer.onplay   = function() {EventBroker.trigger('videoPlayed', this)};
		
		EventBroker.listen("startButton_mrp-button_clicked", this, this.nextVideo);
		EventBroker.listen("addLyrics_mrp-button_clicked", this, this.addLyrics);
		EventBroker.listen("usePlayList", this, this.setSongList);
		EventBroker.listen("newPlaylistAdded", this, this.setupSavedPlayLists);
		EventBroker.listen("videoEnded", this, this.nextVideo);
		EventBroker.listen("Viewer_playListSelection_mrp-drop-down_changed", this, this.setupPlayList);
		EventBroker.listen("randomizeButton_mrp-button_clicked", this, this.randomizeSongList);
		EventBroker.listen("temp_mrp-button_clicked", this, this.temp);
		EventBroker.listen("videoLoaded", this, this.startVideo);
		EventBroker.listen("videoPaused", this, this.videoPaused);
		EventBroker.listen("videoPlayed", this, this.videoPlayed);
		EventBroker.listen("updateLyrics", this, this.updateLyrics);
		EventBroker.listen("PlaylistUpdate", this, this.updatePlaylist);
		EventBroker.listen("songTitleChanged", this, this.setupSongList);

		this.setupSongList();
		this.songIndex = 0;
	}
	videoPaused(){
		this.lyricsObj.pause();
	}
	videoPlayed(){
		this.lyricsObj.unPause();
	}
	startVideo(){
		this.lyricsObj.addText(this.getCurrentSongTitle() + '\n\n' + this.songSettings.lyrics);
		this.lyricsObj.start(this.songSettings.getDuration(),this.songSettings.getStartingPoint());
		
		//set voloume
		this.videoPlayer.volume = this.songSettings.volume/100; 
	}
	temp(){
		this.lyricsObj.show();
	}
	showAddingLyrics(){
		this.addLyricsButton.show();
		this.addLyricsBox.show();
		this.lyricsObj.hide();
		this.songTitleForAddLyrics.innerText = this.getCurrentSongTitle()
	}
	hideAddingLyrics(){
		this.addLyricsButton.hide();
		this.addLyricsBox.hide();
		this.lyricsObj.show();
	}
	getCurrentSongTitle(){
		return this.songList[this.songIndex];
	}
	updateLyrics(newLyrics){
		var songTitle = this.getCurrentSongTitle();
		var lyrics = newLyrics;
		this.addLyricsToDB(songTitle,lyrics);
	}
	addLyrics(){
		//get the current song name
		//get some lyrics
		
		var songTitle = this.getCurrentSongTitle();
		var lyrics = this.addLyricsBox.getValue();
		this.addLyricsToDB(songTitle,lyrics);
	}
	addLyricsToDB(songTitle, lyrics){
		var lyricInfo = {songTitle,lyrics};
		
		addSongLyrics(this, lyricInfo);
		
		async function addSongLyrics(component, data){
			
			var options = {};
			options.method = 'POST';
			options.body=JSON.stringify(data);
			
			options.headers={'Content-Type':'application/json'}
			const response = await fetch('/api/addLyrics',options);
			
			if(response.status === 200){
				component.setLyrics();
			}else{
				component.lyricsdiv.firstElementChild.innerText = "An error happened check the server"
			}
			component.addLyricsBox.setValue('')
		}
	}
	setupSongList(){
		var apiCall = 'api/songList';
		
		getSongList(this, apiCall);
		
		async function getSongList(component, apiCall){			
			const response = await fetch(apiCall);
			const data = await response.json();
			
			if(data){
				component.setSongList(data);
				component.fullSongList = data;
			}
		}
	}
	setSongList(list){
		this.songList = list;
		this.loadVideo();
	}
	setLyrics(){
		var apiCall = 'api/lyrics?name=' + this.songList[this.songIndex];
		
		getLyrics(this, apiCall);
		
		async function getLyrics(component, apiCall){			
			const response = await fetch(apiCall);
			const data = await response.json();

			if(data){
				
				component.songSettings = new SongSettings(data, component.videoPlayer);
				
				//Get the settings fromt the first line of the data

				if(data === "Lyrics Missing"){
					component.showAddingLyrics();
				}else{
					component.hideAddingLyrics();
				}
			}else{
				component.lyricsdiv.firstElementChild.innerText = component.getCurrentSongTitle() + '\n\n' +'lyrics missing';
				component.showAddingLyrics();
			}
		}
	}
	nextVideo(action){
		this.songIndex++;
		if(this.songIndex >= this.songList.length){
			this.songIndex = 0;
		}
		this.loadVideo();
	}
	loadVideo(){
		this.videoPlayer.src = "http://localhost:8080/api/video?name=" + this.songList[this.songIndex];
		this.videoPlayer.autoplay = true;
		
		
		
		this.setLyrics();
	}
	
	videoEnded(){
		EventBroker.trigger("videoEnded", this);
	}
	setupSavedPlayLists(listJustAdded){
		var apiCall = 'api/playlists';
		
		getPlayListList(this, apiCall, listJustAdded);
		
		async function getPlayListList(component, apiCall, listJustAdded){			
			const response = await fetch(apiCall);
			const data = await response.json();
			
			if(data){
				component.playListList = data;
				data.unshift("All");
				component.playListBox.addList(data);
				component.playListBox.sortAlphabetically();
				
				if(Lib.JS.isDefined(listJustAdded)){
					component.playListBox.setValue(listJustAdded);
				}
			}
		}
	}
	setupPlayList(){
		
		var playListName = this.playListBox.getValue()

		if(playListName==="All"){
			this.setSongList(this.fullSongList);
			return false;
		}
		
		var apiCall = 'api/playlist?name=' + playListName;
		
		getPlayList(this, apiCall);
		
		async function getPlayList(component, apiCall){			
			const response = await fetch(apiCall);
			const data = await response.json();

			if(data){
				component.setSongList(JSON.parse(data));
			}else{
			}
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
		debugger;
		//if the current list is updated
		if(this.playListBox.getValue() == playlistInfo.title){
			
		}
	}
}

window.customElements.define('viewer-page', ViewerPage);