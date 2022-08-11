const Admin_template = document.createElement('template');
Admin_template.innerHTML = ``
class AdminPage extends PlaylistPage {
	constructor() {
		super();

		this.shadowRoot.appendChild(Admin_template.content.cloneNode(true));

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
		this.tempPlayListTitle = DataBroker.trigger('tempPlayListTitle');
		this.listLoaded = false;

		EventBroker.listen(this.playlistUL, this.playlistUL.events.listChanged, this, this._listChanged);
		EventBroker.listen(this.exitButton, this.exitButton.events.clicked, this, this._exit);

		this.selectPlaylistDiv.hidden = false;
		this.tempView = false;
		this.clearButton.hide();
		this.editButton.show();
	}
}

window.customElements.define('admin-page', AdminPage);