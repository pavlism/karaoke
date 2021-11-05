const Playlist_template = document.createElement('template');
Playlist_template.innerHTML = `
	<div>
		Select Playlist <mrp-drop-down id="PlayList_playListSelection"></mrp-drop-down>
	</div>
	<div>
	Name of playlist:<mrp-text-box></mrp-text-box>
	Songs:<mrp-drop-down id='songList'></mrp-drop-down>
	<mrp-button primary id="addSongButton">Add</mrp-button>
	<mrp-button primary id="saveOnlyButton">Save</mrp-button>
	<mrp-button primary id="saveButton">Save & Play</mrp-button>
	<mrp-button primary id="deleteButton">Delete</mrp-button>
	<mrp-button primary id="editButton">Edit</mrp-button>
	</div>
	<mrp-list advanced id="playList">Play List</mrp-list>
	<div id="editSongDiv">
		Song Title:<mrp-text-box id='songTitle' size='50'></mrp-text-box>
		Duration:<mrp-text-box id='duration'  number></mrp-text-box>
		Starting Point:<mrp-text-box id='startingPoint'  number></mrp-text-box>
		Volume:<mrp-text-box id='volume'  number></mrp-text-box>
		Lyrics:<mrp-text-area id='songLyrics'></mrp-text-area>
		<mrp-button primary id="saveSongButton" number>Save</mrp-button>
	</dv>
	<div id="savedDiv">
		Save Complete
	</dv>
`
class PlaylistPage extends HTMLElement {
//todo	
	
	//if current list is playing when song title changes, then re-load it.
	
	//after a song is edited, close the dit window
	//add are you sure to delete
	//playlist names need to be unique
	//add exit button
	//don't save a playlist without a name

	constructor() {
		super();
		
		this.attachShadow({mode:'open'});
		this.shadowRoot.appendChild(Playlist_template.content.cloneNode(true));
		this.songListDD = this.shadowRoot.querySelector('#songList');

		this.saveButton = this.shadowRoot.querySelector('#saveButton');
		this.saveOnlyButton = this.shadowRoot.querySelector('#saveOnlyButton');
		this.playlistUL = this.shadowRoot.querySelector('mrp-list');
		this.playlistTitleBox = this.shadowRoot.querySelector('mrp-text-box');
		this.playlistDD = this.shadowRoot.querySelector('mrp-drop-down');
		
		this.editSondDiv = this.shadowRoot.querySelector('#editSongDiv');
		this.savedMessageDiv = this.shadowRoot.querySelector('#savedDiv');
		this.songTitle = this.shadowRoot.querySelector('#songTitle');
		this.duration = this.shadowRoot.querySelector('#duration');
		this.startingPoint = this.shadowRoot.querySelector('#startingPoint');
		this.volume = this.shadowRoot.querySelector('#volume');
		this.songLyrics = this.shadowRoot.querySelector('#songLyrics');
		
		this.setupSavedPlayLists();
		
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
		EventBroker.listen("deleteButton_mrp-button_clicked", this, this.removePlayList);
		EventBroker.listen("mrp-list_playList_changed", this, this.updateList);
		EventBroker.listen("editButton_mrp-button_clicked", this, this.editSong);
		EventBroker.listen("saveSongButton_mrp-button_clicked", this, this.saveSong);
		
		this.setSongList();
		this.playList = [];
	}
	disableSaves(){
		this.saveButton.disable();
		this.saveOnlyButton.disable();
	}
	enableSaves(){
		this.saveButton.enable();
		this.saveOnlyButton.enable();
	}
	editSong(){
		this.savedMessageDiv.hidden = true;
		var apiCall = 'api/lyrics?name=' + this.songListDD.getValue();
		
		getLyrics(this, apiCall);
		
		async function getLyrics(component, apiCall){			
			const response = await fetch(apiCall);
			const data = await response.json();

			if(data){
				component.songSettings = new SongSettings(data);
				component.duration.setValue(component.songSettings.duration);
				component.startingPoint.setValue(component.songSettings.startingPoint);
				component.volume.setValue(component.songSettings.volume);
				component.songLyrics.setValue(component.songSettings.lyrics);
				component.songTitle.setValue(component.songListDD.getValue())
				component.editSondDiv.hidden = false;
			}
		}
		
		
	}
	saveSong(){
		//get the new settings
		this.songSettings.duration = this.duration.getValue();
		this.songSettings.startingPoint = this.startingPoint.getValue();
		this.songSettings.volume = this.volume.getValue();
		
		//Save the new settings in the file
		this.songSettings.updateLyrics()
		
		//if title changed change the names of the files
		if(this.songTitle.getValue() !== this.songListDD.getValue()){
			this.updateSongTitle(this.songTitle.getValue(), this.songListDD.getValue());
		}
		
		//change the value in the list
		this.songListDD.updateCurrentSelection(this.songTitle.getValue());
		
		//hide the edit info
		this.editSondDiv.hidden = true;
		
		//dispaly the saved info
		this.savedMessageDiv.hidden = false;
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
		this.playList.push(this.songListDD.getValue());
		this.playlistUL.setList(this.playList);
	}
	saveButDontExit(){
		this.addPlaylistToViewer(false)
	}
	addPlaylistToViewer(isExit = true){
		EventBroker.trigger("usePlayList", this.playList);
		
		var playListTitle = this.playlistTitleBox.getValue();
		var listInfo = {title:playListTitle,list:JSON.stringify(this.playList)};
		
		addPlayList(this, listInfo);
		
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
				if(data != 'playlist Missing'){
						component.allPlaylists[playListName] = JSON.parse(data);
				}
				
				if(component.playListLoadingStats.numLoaded == component.playListLoadingStats.numToLoad){
					component.playListLoadingStats.loaded = true;
					component.enableSaves();
				}
			}else{
			}
		}
	}
	setupPlayList(){
		
		var playListName = this.playlistDD.getValue()

		if(playListName==="New"){
			//empty list
			this._clearList();
			return false;
		}
		
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
	_clearList(){
		this.playlistTitleBox.setValue('');
		this.playlistUL.setList([]);
		this.playList = [];
	}
}

window.customElements.define('playlist-page', PlaylistPage);