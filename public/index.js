const Index_template = document.createElement('template');
Index_template.innerHTML = `
	<viewer-page></viewer-page>
	<main-menu-page></main-menu-page>
	<song-setup-page></song-setup-page>
	<saved-playlist-page></saved-playlist-page>
	<temp-play-list-page></temp-play-list-page>
	<admin-page></admin-page>
`
class IndexPage extends HTMLElement {
	constructor() {
		super();		
		this.attachShadow({mode:'open'});
		this.shadowRoot.appendChild(Index_template.content.cloneNode(true));
			
		this.viewPage = this.shadowRoot.querySelector('viewer-page');
		this.mainMenuPage = this.shadowRoot.querySelector('main-menu-page');
		this.songSetupPage = this.shadowRoot.querySelector('song-setup-page');
		this.savedPlaylistPage = this.shadowRoot.querySelector('saved-playlist-page');
		this.tempPlayListPage = this.shadowRoot.querySelector('temp-play-list-page');
		this.adminPage = this.shadowRoot.querySelector('admin-page');

		EventBroker.listen("videoPlayerButton_mrp-button_clicked", this, this._showViewerScreen);
		EventBroker.listen("playlistButton_mrp-button_clicked", this, this._showPlaylistScreen);
		EventBroker.listen("tempPlaylistButton_mrp-button_clicked", this, this._showPlaylistScreen);
		EventBroker.listen("adminButton_mrp-button_clicked", this, this._showAdmin);
		EventBroker.listen("useSavedPlaylistButton_mrp-button_clicked", this, this._showSavedPlaylist);
		EventBroker.listen('switchToMainMenu',this, this._showMenu);
		EventBroker.listen('new song added by user',this, this._showNewSong);

		//uncomment this to start in new song mode
		//this._showNewSong();

		this._showMainMenu();
	}
	_hideAll(){
		this.viewPage.hidden = true;
		this.mainMenuPage.hidden = true;
		this.songSetupPage.hidden = true;
		this.savedPlaylistPage.hidden = true;
		this.tempPlayListPage.hidden = true;
		this.adminPage.hidden = true;
	}
	_showAdmin(){
		this._hideAll();
		this.adminPage.hidden = false;
	}
	_showMenu(){
		this._hideAll();
		this.mainMenuPage.hidden = false;
	}
	_showPlaylistScreen(){
		this._hideAll();
		this.tempPlayListPage.hidden = false;
	}
	_showViewerScreen(){
		this._hideAll();
		this.viewPage.hidden = false;
	}
	_showMainMenu(){
		this._hideAll();
		this.mainMenuPage.hidden = false;
	}
	_showNewSong(){
		this._hideAll();
		this.songSetupPage.hidden = false;
	}
	_showSavedPlaylist(){
		this._hideAll();
		this.savedPlaylistPage.hidden = false;
	}
}

window.customElements.define('index-page', IndexPage);