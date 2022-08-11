const TempPlaylist_template = document.createElement('template');
TempPlaylist_template.innerHTML = ``
class TempPlaylistPage extends PlaylistPage {
	constructor() {
		super();

		this.shadowRoot.appendChild(TempPlaylist_template.content.cloneNode(true));
		this.setupSavedPlayLists();
		this.songIndex = -1;
		this.songSettings = {};

		this.editSondDiv.hidden = true;
		this.savedMessageDiv.hidden = true;
		this.allPlaylists = {};
		this.playListLoadingStats = {loaded:false};

		//start the save buttons disabled until all the songlists are loaded
		this.disableSaves();
		this._getSongLists();

		this.playList = [];
		this.playlistUL.hide();
		this.tempView = true;
		this.tempPlayListTitle = DataBroker.trigger('tempPlayListTitle');
		this.listLoaded = false;

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
	_exit(){
		if(this.tempView){
			clearInterval(this.pingInterval);
		}
		EventBroker.trigger('switchToMainMenu');
	}
}

window.customElements.define('temp-play-list-page', TempPlaylistPage);