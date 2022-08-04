const Index_template = document.createElement('template');
Index_template.innerHTML = `
	<viewer-page></viewer-page>
	<playlist-page></playlist-page>
	<main-menu-page></main-menu-page>
	<song-setup-page></song-setup-page>
`
class IndexPage extends HTMLElement {
	constructor() {
		super();		
		this.attachShadow({mode:'open'});
		this.shadowRoot.appendChild(Index_template.content.cloneNode(true));
			
		this.playListPage = this.shadowRoot.querySelector('playlist-page');
		this.viewPage = this.shadowRoot.querySelector('viewer-page');
		this.mainMenuPage = this.shadowRoot.querySelector('main-menu-page');
		this.songSetupPage = this.shadowRoot.querySelector('song-setup-page');

		EventBroker.listen("videoPlayerButton_mrp-button_clicked", this, this._showViewerScreen);
		EventBroker.listen("playlistButton_mrp-button_clicked", this, this._showPlaylistScreen);
		EventBroker.listen("tempPlaylistButton_mrp-button_clicked", this, this._showPlaylistScreen);
		EventBroker.listen("adminButton_mrp-button_clicked", this, this._showPlaylistScreen);
		EventBroker.listen("useSavedPlaylistButton_mrp-button_clicked", this, this._showViewerScreen);
		EventBroker.listen('switchToMainMenu',this, this._showMenu);
		EventBroker.listen('new song added by user',this, this._showNewSong);

		//uncomment this to start in new song mode
		//this._showNewSong();

		this._showMainMenu();
	}
	_showMenu(){
		this.viewPage.hidden = true;
		this.playListPage.hidden = true;
		this.mainMenuPage.hidden = false;
		this.songSetupPage.hidden = true;
	}
	_showPlaylistScreen(){
		this.viewPage.hidden = true;
		this.playListPage.hidden = false;
		this.mainMenuPage.hidden = true;
		this.songSetupPage.hidden = true;
	}
	_showViewerScreen(){
		this.viewPage.hidden = false;
		this.playListPage.hidden = true;
		this.mainMenuPage.hidden = true;
		this.songSetupPage.hidden = true;

	}
	_showMainMenu(){
		this.viewPage.hidden = true;
		this.playListPage.hidden = true;
		this.mainMenuPage.hidden = false;
		this.songSetupPage.hidden = true;
	}
	_showNewSong(){
		this.viewPage.hidden = true;
		this.playListPage.hidden = true;
		this.mainMenuPage.hidden = true;
		this.songSetupPage.hidden = false;
	}
}

window.customElements.define('index-page', IndexPage);