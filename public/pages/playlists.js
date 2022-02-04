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
			End Early(s):<mrp-text-box id='earlyEnding' number></mrp-text-box>
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
	//TODO

	//lyrics are sometimes getting saved to the wrong song

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
		this.earlyEnding = this.shadowRoot.querySelector('#earlyEnding');
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

		this._getSongLists();

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
		EventBroker.listen(this.exitButton, this.exitButton.events.clicked, this, this._exit);
	}

	tempFunc(){
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

		this.playlistTitleBox.setValue(this.tempPlayListTitle);
		this._loadTempPlayList(true);

		//disable the save buttons as nothing changed
		this.disableSaves();

		//remove actions list
		Server.deleteAllActions();

		this.pingInterval = Lib.JS.setInterval(this,this._checkForTempListActions, 3000);
	}
	async _loadTempPlayList(isFirstLoad = false){
		//load up the temp list
		const data = await Server.getPlayList(this.tempPlayListTitle);

		if(data ===''){
			this.playList = [];
			this.playlistUL.setList([]);
		}else{
			this.playList = JSON.parse(data);
			this.playlistUL.setList(JSON.parse(data));
		}
	}
	async _checkForTempListActions(){
		const data = await Server.getTempListActions(this.tempPlayListTitle);

		for(var actionCounter = 0;actionCounter<data.length;actionCounter++){
			if(Lib.JS.isDefined(data[actionCounter].remove)){
				var titleToRemove = data[actionCounter].remove;

				for(var songCounter = 0;songCounter<this.playList.length;songCounter++){
					if(this.playList[songCounter] === titleToRemove){
						this.playList.splice(songCounter,1);
						this.playlistUL.refresh();
						break;
					}
				}

				//update teh actions List
				Server.deleteAction('remove',titleToRemove);
			}
		}

		const response = await Server.updatePlayList(this.tempPlayListTitle,this.playList);
	}
	setupViewerForSavedPlaylist(){
		this.selectPlaylistDiv.hidden = false;
		this.tempView = false;
		this.clearButton.hide();
		this.editButton.show();
	}


	_exit(){
		if(this.tempView){
			clearInterval(this.pingInterval);
		}
	}
	_addPause(){
		this.songLyrics.insertTextAtCursor('{Pause10}');
	}
	_clearCurrentList(){
		this.playList = [];
		this.playlistUL.setList(this.playList);
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
	async _editSongWithoutLyrics(event, songIndex = 0){
		var songTitle = '';

		for(var songCounter =songIndex;songCounter<this.songList.length;songCounter++){
			//check if song settings exist, if they don't then go get them
			
			if(Lib.JS.isUndefined(this.songSettings[this.songList[songCounter]])){
				songTitle = this.songList[songCounter]
				const data = await Server.getSongLyrics(songTitle);
				this.songSettings[songTitle] = new SongSettings(data);
				this._editSongWithoutLyrics({},songIndex);
				return false;
			}else if(this.songSettings[this.songList[songCounter]].lyrics ==="Lyrics Missing"){
				this.editSong(this.songList[songCounter]);
				return false;
			}
		}
	}
	async editSong(songTitle = ''){
		if((songTitle ==='' && this.songListDD.getValue()==='') && this.songListDD.getIndex()===-1 ){
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

		const data = await Server.getSongLyrics(songTitle)

		this.songSettings = new SongSettings(data);
		this.volume.setValue(this.songSettings.volume);
		this.speed.setValue(this.songSettings.speed)
		this.songLyrics.setValue(this.songSettings.lyrics);
		this.earlyEnding.setValue(this.songSettings.timming.endEarly);
		this.songTitle.setValue(songTitle);
		this.editSondDiv.hidden = false;
	}
	async saveSong(){
		//get the new settings
		this.songSettings.speed = this.speed.getValue();
		this.songSettings.volume = this.volume.getValue();
		this.songSettings.lyrics = this.songLyrics.getValue();
        this.songSettings.timming.endEarly = parseInt(this.earlyEnding.getValue())

		//Save the new settings in the file
		this.songSettings.updateLyrics()
		
		//if title changed change the names of the files
		if(this.songTitle.getValue() !== this.songListDD.getValue()){
			this.updateSongTitle(this.songTitle.getValue(), this.songListDD.getValue());
		}
		
		//change the value in the list
		this.songListDD.updateCurrentSelection(this.songTitle.getValue());
		
		this._hideSongEdit();

		const response = await Server.updateSongLyrics(this.songTitle.getValue(), this.songSettings.getLyricsToSave());
		if(response.status !==200){
			this.lyricsdiv.firstElementChild.innerText = "An error happened check the server";
		}
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
	async updateSongTitle(newTitle, oldTitle){
		const response = await Server.updateSongTitle(newTitle,oldTitle);
		var index = this.songListDD.getIndex();
		this.songList[index] = newTitle;
		this.songListDD.updateCurrentSelection(newTitle);

		//need to update all the song lists
		this.updateAllPlayLists(newTitle, oldTitle);
	}
	async updateAllPlayLists(newTitle, oldTitle){
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
				const response = await Server.updatePlayList(key,JSON.stringify(this.allPlaylists[key]));
				this.numUpdated++;
				if(this.numUpdated == this.numListsToUpdate){
					this.enableSaves();
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
	async _getSongLists(){
		const data = await Server.getSongList();
		this.songList = data;
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
		if(!this.tempView && this.playlistTitleBox.getValue() === this.tempPlayListTitle){
			debugger;
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
	async addPlaylistToViewer(isExit = true){
		var playListTitle = this.playlistTitleBox.getValue();
		
		if(playListTitle ==='' && this.tempView){
			playListTitle = this.tempPlayListTitle;
		}

		const response = await Server.updatePlayList(playListTitle,this.playList);
		if(response.status ===200){
			if(isExit){
				EventBroker.trigger('newPlaylistAdded', playListTitle);
			}
			this.setupSavedPlayLists(playListTitle);
		}

		this.disableSaves();
	}
	_askRemovePlaylist(){
		this.areYouSureBox.show();
	}
	async removePlayList(){
		var playListTitle = this.playlistTitleBox.getValue();
		const response = await Server.deletePlayList(playListTitle, this.playList)
		if(response.status ===200){
			this.setupSavedPlayLists(playListTitle);
			this._clearList();
		}
	}
	async setupSavedPlayLists(titleToSelect){
		const data = await Server.getAllPlayLists();

		this.playListList = data;

		for(var listCounter=0;listCounter<data.length;listCounter++){
			if(data[listCounter] === this.tempPlayListTitle){
				data.splice(listCounter,1);
			}
		}

		data.unshift("New");
		this.playlistDD.addList(data);
		this.playlistDD.sortAlphabetically();
		if(Lib.JS.isDefined(titleToSelect)){
			this.playlistDD.setValue(titleToSelect)
		}
		this.getAllPlayLists(this.playListList);
	}
	async getAllPlayLists(listOfLists){
		this.playListLoadingStats.numToLoad = listOfLists.length;
		this.playListLoadingStats.numLoaded = 0;

		for(var listCounter = 0;listCounter<listOfLists.length;listCounter++){
			const data = await Server.getPlayList(listOfLists[listCounter]);

			this.playListLoadingStats.numLoaded++;

			if(Lib.JS.isDefined(data) && Lib.JS.isUndefined(data.errno)){
				this.allPlaylists[listOfLists[listCounter]] = JSON.parse(data);
			}

			if(this.playListLoadingStats.numLoaded == this.playListLoadingStats.numToLoad){
				this.playListLoadingStats.loaded = true;
			}
		}
	}
	async setupPlayList() {
		this.hideSongEditList();
		this.playlistUL.show();

		var playListName = this.playlistDD.getValue()

		if (playListName === "New") {
			//empty list
			this._clearList();
			return false;
		}

		const data = await Server.getPlayList(playListName)

		this.playList = JSON.parse(data);
		this.playlistUL.setList(JSON.parse(data));
		this.playlistTitleBox.setValue(playListName);
	}
	hidePlaylist(){
		//this.playList.length = 0;
		this.playlistUL.hide();
	}
	_showPlaylist(){
		this.playlistUL.show();
	}
	hideSongEditList(){
		this.editSondDiv.hidden = true;
	}
	_clearList(){
		this.playlistTitleBox.setValue('');
		this.playlistUL.setList([]);
		this.playList = [];
	}
}

window.customElements.define('playlist-page', PlaylistPage);