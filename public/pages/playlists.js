const Playlist_template = document.createElement('template');
Playlist_template.innerHTML = `
	<mrp-alert id='errorAlert'></mrp-alert>
	<mrp-alert id='areYouSureAlert'></mrp-alert>
	<div id='selectPlaylistDiv'>
		Select Playlist <mrp-drop-down id="PlayList_playListSelection"></mrp-drop-down>
	</div>
	<div>
		<span id='playlistNameSpan'>Name of playlist:<mrp-text-box></mrp-text-box></span>
		Songs:<mrp-drop-down width='500px' searchable id='songList'></mrp-drop-down>
		<mrp-button primary id="addSongButton">Add</mrp-button>
		<mrp-button primary id="saveOnlyButton">Save</mrp-button>
		<mrp-button primary id="saveButton">Save & Play</mrp-button>
		<mrp-button primary id="deleteButton">Delete Playlist</mrp-button>
		<mrp-button primary id="editButton">Edit Song</mrp-button>
		<mrp-button primary id="editLyricsButton">Edit Next Song Without Lyrics</mrp-button>
		<mrp-button primary id="exitButton">Exit</mrp-button>
		<mrp-button primary id="clearButton">Clear List</mrp-button>
		<mrp-button primary id="temp2">temp</mrp-button>
		<mrp-button primary id="addButton">Add</mrp-button>
	</div>
	<mrp-list advanced id="playList">Play List</mrp-list>
	<div id="editSongDiv">
		<div>
			Song Title:<mrp-text-box id='songTitle' size='50'></mrp-text-box>
			Speed%:<mrp-text-box id='speed' number></mrp-text-box>
			Volume%:<mrp-text-box id='volume' number></mrp-text-box>
			<mrp-button primary id="saveSongButton">Save</mrp-button>
			<mrp-button primary id="saveSongCancelButton">Cancel</mrp-button>
			<mrp-button primary id="addPause">Add 10 second Pause</mrp-button>
		</div>
		<div>
			Lyrics:<mrp-text-area rows=20 cols=100 id='songLyrics'></mrp-text-area>
		</div>
	</dv>
	<div id="savedDiv">
		Save Complete
	</dv>
`
class PlaylistPage extends HTMLElement {
//todo
	//setup and end early settings and have the video end early
	//also have the time taken off the duration


	constructor() {
		super();
		
		this.attachShadow({mode:'open'});
		this.shadowRoot.appendChild(Playlist_template.content.cloneNode(true));
		this.songListDD = this.shadowRoot.querySelector('#songList');
		this.selectPlaylistDiv = this.shadowRoot.querySelector('#selectPlaylistDiv');
		this.playlistNameSpan = this.shadowRoot.querySelector('#playlistNameSpan');

		this.saveButton = this.shadowRoot.querySelector('#saveButton');
		this.saveButton.hide();
		this.saveOnlyButton = this.shadowRoot.querySelector('#saveOnlyButton');
		this.deleteButton = this.shadowRoot.querySelector('#deleteButton');
		this.editButton = this.shadowRoot.querySelector('#editButton');
		this.editLyricsButton = this.shadowRoot.querySelector('#editLyricsButton');
		this.exitButton = this.shadowRoot.querySelector('#exitButton');
		this.addPause = this.shadowRoot.querySelector('#addPause');
		this.tempButton = this.shadowRoot.querySelector('#temp2');
		this.tempButton.hide();

		this.playlistUL = this.shadowRoot.querySelector('mrp-list');
		this.playlistTitleBox = this.shadowRoot.querySelector('mrp-text-box');
		this.playlistDD = this.shadowRoot.querySelector('mrp-drop-down');
		
		this.editSondDiv = this.shadowRoot.querySelector('#editSongDiv');
		this.savedMessageDiv = this.shadowRoot.querySelector('#savedDiv');
		this.songTitle = this.shadowRoot.querySelector('#songTitle');
		this.speed = this.shadowRoot.querySelector('#speed');
		this.volume = this.shadowRoot.querySelector('#volume');
		this.songLyrics = this.shadowRoot.querySelector('#songLyrics');
		this.clearButton = this.shadowRoot.querySelector('#clearButton');
		
		this.errorBox = this.shadowRoot.querySelector('#errorAlert');
		this.areYouSureBox = this.shadowRoot.querySelector('#areYouSureAlert');
		this.areYouSureBox.setYesNo("Warning", "Are you sure you want to delete the playlist?");

		EventBroker.listen(this.addPause, this.addPause.events.clicked,this, this._addPause);
		EventBroker.listen(this.areYouSureBox, this.areYouSureBox.events.yes, this, this.removePlayList);
		EventBroker.listen("temp2_mrp-button_clicked", this, this.tempFunc);
		EventBroker.listen(this.clearButton,this.clearButton.events.clicked, this, this._clearCurrentList);
		
		this.setupSavedPlayLists();
		this.songIndex = -1;
		this.songSettings = {};
		
		this.editSondDiv.hidden = true;
		this.savedMessageDiv.hidden = true;
		this.allPlaylists = {};
		this.playListLoadingStats = {loaded:false};
		
		//start the save buttons disabled until all the songlists are loaded
		this.disableSaves();
		
		EventBroker.listen("addSongButton_mrp-button_clicked", this, this.addSongToList);
		EventBroker.listen("saveButton_mrp-button_clicked", this, this.saveButDontExit);
		EventBroker.listen("saveOnlyButton_mrp-button_clicked", this, this.addPlaylistToViewer);
		EventBroker.listen("PlayList_playListSelection_mrp-drop-down_changed", this, this.setupPlayList);
		EventBroker.listen("deleteButton_mrp-button_clicked", this, this._askRemovePlaylist);
		EventBroker.listen("mrp-list_playList_changed", this, this.updateList);
		EventBroker.listen("editButton_mrp-button_clicked", this, this.editSong);
		EventBroker.listen(this.editLyricsButton, this.editLyricsButton.events.clicked, this, this._editSongWithoutLyrics);
		EventBroker.listen("saveSongButton_mrp-button_clicked", this, this.saveSong);
		EventBroker.listen("saveSongCancelButton_mrp-button_clicked", this, this._hideSongEdit);
		
		this.setSongList();
		this.playList = [];
		this.playlistUL.hide();
		this.tempView = true;
		this.tempPlayListTitle = "1234_mrp_!!!!!";
		this.listLoaded = false;
		
		DataBroker.listen('tempPlayListTitle',this,'tempPlayListTitle');
		EventBroker.listen("tempPlaylistButton_mrp-button_clicked", this, this.setupViewerForTempPlaylist);
		EventBroker.listen("playlistButton_mrp-button_clicked", this, this.setupViewerForSavedPlaylist);
		EventBroker.listen("useSavedPlaylistButton_mrp-button_clicked", this, this.setupViewerForSavedPlaylist);
		EventBroker.listen("adminButton_mrp-button_clicked", this, this.setupViewerForSavedPlaylist);
		
		EventBroker.listen(this.playlistUL, this.playlistUL.events.listChanged, this, this._listChanged);
	}
	
	
	
	tempFunc(){
	}

	_addPause(){
		this.songLyrics.insertTextAtCursor('{Pause10}');
	}

	_clearCurrentList(){
		this.playList = [];
		this.playlistUL.setList(this.playList);
	}
	setupViewerForTempPlaylist(){	
		//hide select playlist
		this.selectPlaylistDiv.hidden = true;
		
		//hide name of playlist
		this.playlistNameSpan.hidden = true;
		
		//show the playlist
		this.playlistUL.show();
		
		//hide the buttons
		this.saveButton.hide();
		this.deleteButton.hide();
		this.editButton.hide();
		this.editLyricsButton.hide();
		
		//set viewbool
		this.tempView = true;

		this.shadowRoot.querySelector('#editSongDiv').id
		this.shadowRoot.querySelector('#editButton').hid
		
		//load up the temp list
		this._loadPlayList(this.tempPlayListTitle);
		
		//disable the save buttons as nothing changed
		this.disableSaves();
	}
	setupViewerForSavedPlaylist(){
		this.selectPlaylistDiv.hidden = false;
		this.tempView = false;
		this.clearButton.hide();
		this.editButton.show();
	}
	_listChanged(){
		if(!this.listLoaded){
			this.listLoaded = true;
		}else{
			this.enableSaves();
		}
	}
	disableSaves(){
		this.saveButton.disable();
		this.saveOnlyButton.disable();
	}
	enableSaves(){
		this.saveButton.enable();
		this.saveOnlyButton.enable();
	}
	_editSongWithoutLyrics(event, songIndex = 0){
		for(var songCounter =songIndex;songCounter<this.songList.length;songCounter++){
			//chec if song settings exist, if they don't then go get them
			
			if(Lib.JS.isUndefined(this.songSettings[this.songList[songCounter]])){
				this._getSongSettingsForList(this.songList[songCounter], songCounter);
				return false;
			}else if(this.songSettings[this.songList[songCounter]].lyrics ==="Lyrics Missing"){
				this.editSong(this.songList[songCounter]);
				return false;
			}
		}
	}
	_getSongSettingsForList(songTitle, songIndex){
		var apiCall = 'api/lyrics?name=' + songTitle;
		getLyrics(this, apiCall,songTitle,songIndex);
		
		async function getLyrics(component, apiCall,songTitle,songIndex){
			const response = await fetch(apiCall);
			const data = await response.json();

			if(data){
				component.songSettings[songTitle] = new SongSettings(data);
				component._editSongWithoutLyrics({},songIndex);
			}
		}
	}
	editSong(songTitle = ''){
		debugger;
		if((songTitle ==='' || this.songListDD.getValue()==='') && this.songListDD.getIndex()===-1 ){
			this.errorBox.setError('Error','Song title does not exist, please choose from the list');
			this.errorBox.show();
			return false;
		}
		
		
		
		this.hidePlaylist();
		this.savedMessageDiv.hidden = true;
		this.songIndex = 0;
		
		if(songTitle ==='' || !Lib.JS.isString(songTitle)){
			songTitle = this.songListDD.getValue();
		}
		
		var apiCall = 'api/lyrics?name=' + songTitle;
		
		
		
		getLyrics(this, apiCall,songTitle);
		
		async function getLyrics(component, apiCall,songTitle){
			const response = await fetch(apiCall);
			const data = await response.json();

			if(data){
				component.songSettings = new SongSettings(data);
				component.volume.setValue(component.songSettings.volume);
				component.speed.setValue(component.songSettings.speed)
				component.songLyrics.setValue(component.songSettings.lyrics);
				component.songTitle.setValue(songTitle);
				component.editSondDiv.hidden = false;
			}
		}
	}
	saveSong(){
		//get the new settings
		this.songSettings.speed = this.speed.getValue();
		this.songSettings.volume = this.volume.getValue();
		this.songSettings.lyrics = this.songLyrics.getValue();

		//Save the new settings in the file
		this.songSettings.updateLyrics()
		
		//if title changed change the names of the files
		if(this.songTitle.getValue() !== this.songListDD.getValue()){
			this.updateSongTitle(this.songTitle.getValue(), this.songListDD.getValue());
		}
		
		//change the value in the list
		this.songListDD.updateCurrentSelection(this.songTitle.getValue());
		
		this._hideSongEdit();
		
		
		this.addLyricsToDB(this.songTitle.getValue(), this.songSettings.getLyricsToSave());
		
	}
	_hideSongEdit(){
		//hide the edit info
		this.editSondDiv.hidden = true;
		
		//dispaly the saved info
		this.savedMessageDiv.hidden = false;
		
		//if a playlist was shown beforehand then re-show it
		if(this.songTitle.getValue() !==''){
			this._showPlaylist();
		}
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
			}else{
				component.lyricsdiv.firstElementChild.innerText = "An error happened check the server"
			}
		}
	}
	updateSongTitle(newTitle, oldTitle){
		var songInfo = {newTitle,oldTitle};
		
		addPlayList(this, songInfo);
		
		async function addPlayList(component, data){
			
			var options = {};
			options.method = 'POST';
			options.body=JSON.stringify(data);
			
			options.headers={'Content-Type':'application/json'}
			const response = await fetch('/api/changeSongTitle',options);
			
			if(response.status === 200){
				var index = component.songListDD.getIndex();
				component.songList[index] = data.newTitle;
				component.songListDD.updateCurrentSelection(data.newTitle);
			}else{
			}
		}
		
		//need to update all the song lists
		this.udpateAllPlayLists(newTitle, oldTitle);
	}
	udpateAllPlayLists(newTitle, oldTitle){
		this.disableSaves();
		var listChange = false;
		this.numListsToUpdate = Object.keys(this.allPlaylists).length;
		this.numUpdated = 0;
		
		EventBroker.trigger("songTitleChanged");
		
		for (const key in this.allPlaylists) {
			listChange = false;
			for(var songCounter = 0;songCounter<this.allPlaylists[key].length;songCounter++){
				if(this.allPlaylists[key][songCounter] == oldTitle){
					this.allPlaylists[key][songCounter] = newTitle;
					listChange = true;
				}
			}
			
			//update the list
			if(listChange){
				//if this is the current list then update the viewer
				EventBroker.trigger("PlaylistUpdate",{title:key, list:this.allPlaylists[key]});
				
				//update the list files
				var listInfo = {title:key,list:JSON.stringify(this.allPlaylists[key])};
				
				updatePlayList(this, listInfo);
				
				async function updatePlayList(component, data){
					
					var options = {};
					options.method = 'POST';
					options.body=JSON.stringify(data);
					
					options.headers={'Content-Type':'application/json'}
					const response = await fetch('/api/addPlaylist',options);
					
					if(response.status === 200){
					}else{
						debugger;
					}

					component.numUpdated++;
					if(component.numUpdated == component.numListsToUpdate){
						component.enableSaves();
					}
				}
			}else{
				this.numUpdated++;
			}
		}
		
		if(this.numUpdated == this.numListsToUpdate){
			this.enableSaves();
		}
		
	}
	updateList(list){
		this.playList = list.getValues();
	}
	setSongList(){
		var apiCall = 'api/songList';
		getSongList(this, apiCall);
		
		async function getSongList(component, apiCall){			
			const response = await fetch(apiCall);
			const data = await response.json();
			if(data){
				component.songList = data;
				component.addSongsToDropDown();
			}
		}
	}
	addSongsToDropDown(){
		this.songListDD.addList(this.songList);
	}
	addSongToList(){
		
		//need to test if the song exists
		if(!this.songList.includes(this.songListDD.getValue())){
			this.errorBox.setError('Error','Song title does not exist, please choose from the list');
			this.errorBox.show();
			return false;
		}
		
		//need to check the playlist doesn't have the temp name
		if(this.playlistTitleBox.getValue() === this.tempPlayListTitle){
			this.errorBox.setError('Error','The playlist title cannot be used please use another');
			this.errorBox.show();
			return false;
		}
		
		//need to check the playlist isn't blank
		if(this.playlistTitleBox.getValue() === ''){
			this.errorBox.setError('Error','The playlist title cannot be blank');
			this.errorBox.show();
			return false;
		}
		
		this.playList.push(this.songListDD.getValue());
		this.playlistUL.setList(this.playList);
		this._showPlaylist();
		this.enableSaves();
	}
	saveButDontExit(){
		this.addPlaylistToViewer(false);
	}
	addPlaylistToViewer(isExit = true){
		var playListTitle = this.playlistTitleBox.getValue();
		
		if(playListTitle ==='' && this.tempView){
			playListTitle = this.tempPlayListTitle;
		}
		
		var listInfo = {title:playListTitle,list:JSON.stringify(this.playList)};
		
		addPlayList(this, listInfo);
		
		this.disableSaves();
		
		async function addPlayList(component, data){
			
			var options = {};
			options.method = 'POST';
			options.body=JSON.stringify(data);
			
			options.headers={'Content-Type':'application/json'}
			const response = await fetch('/api/addPlaylist',options);
			
			if(response.status === 200){
				if(isExit){
					EventBroker.trigger('newPlaylistAdded', data.title);
				}
				component.setupSavedPlayLists(data.title);
			}else{
			}
		}
	}
	_askRemovePlaylist(){
		this.areYouSureBox.show();
	}
	removePlayList(){
		var playListTitle = this.playlistTitleBox.getValue();
		var listInfo = {title:playListTitle,list:JSON.stringify(this.playList)};
		
		addPlayList(this, listInfo);
		
		async function addPlayList(component, data){
			
			var options = {};
			//options.method = 'POST';
			options.method = 'DELETE';
			options.body=JSON.stringify(data);
			
			options.headers={'Content-Type':'application/json'}
			const response = await fetch('/api/playList',options);
			
			if(response.status === 200){
				component.setupSavedPlayLists(data.title);
				component._clearList();
			}else{
			}
		}
	}
	setupSavedPlayLists(titelToSelect){
		var apiCall = 'api/playlists';
		
		getPlayListList(this, apiCall,titelToSelect);
		
		async function getPlayListList(component, apiCall,titelToSelect){			
			const response = await fetch(apiCall);
			const data = await response.json();
			
			if(data){
				component.playListList = data;
				
				for(var listCounter=0;listCounter<data.length;listCounter++){
					if(data[listCounter] === component.tempPlayListTitle){
						data.splice(listCounter,1);
					}
				}
				
				data.unshift("New");
				component.playlistDD.addList(data);
				component.playlistDD.sortAlphabetically();
				if(Lib.JS.isDefined(titelToSelect)){
					component.playlistDD.setValue(titelToSelect)
				}
				component.getAllPlayLists(component.playListList);
			}
		}
	}
	getAllPlayLists(listOfLists){
		this.playListLoadingStats.numToLoad = listOfLists.length;
		this.playListLoadingStats.numLoaded = 0;
		
		for(var listCounter = 0;listCounter<listOfLists.length;listCounter++){
			var apiCall = 'api/playlist?name=' + listOfLists[listCounter];
			getPlayList(this, apiCall,listOfLists[listCounter]);
		}
		
		async function getPlayList(component, apiCall,playListName){			
			const response = await fetch(apiCall);
			const data = await response.json();
			
			if(data){
				component.playListLoadingStats.numLoaded++;
				if(Lib.JS.isDefined(data) && Lib.JS.isUndefined(data.errno)){
						component.allPlaylists[playListName] = JSON.parse(data);
				}
				
				if(component.playListLoadingStats.numLoaded == component.playListLoadingStats.numToLoad){
					component.playListLoadingStats.loaded = true;
					//commented out because if you save a list - you end up here and the save button will get re-enabled
					//component.enableSaves();
				}
			}else{
			}
		}
	}
	setupPlayList(){
		this.hideSongEditlist();
		this.playlistUL.show();
		
		var playListName = this.playlistDD.getValue()

		if(playListName==="New"){
			//empty list
			this._clearList();
			return false;
		}
		
		this._loadPlayList(playListName);
	}
	_loadPlayList(playListName){
		var apiCall = 'api/playlist?name=' + playListName;
		
		getPlayList(this, apiCall,playListName);
		
		async function getPlayList(component, apiCall,playListName){			
			const response = await fetch(apiCall);
			const data = await response.json();

			if(data){
				component.playList = JSON.parse(data);
				component.playlistUL.setList(JSON.parse(data));
				component.playlistTitleBox.setValue(playListName);
			}else{
			}
		}
	}
	hidePlaylist(){
		//this.playList.length = 0;
		this.playlistUL.hide();
	}
	_showPlaylist(){
		this.playlistUL.show();
	}
	hideSongEditlist(){
		this.editSondDiv.hidden = true;
	}
	_clearList(){
		this.playlistTitleBox.setValue('');
		this.playlistUL.setList([]);
		this.playList = [];
	}
}

window.customElements.define('playlist-page', PlaylistPage);