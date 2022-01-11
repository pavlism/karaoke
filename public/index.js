const Index_template = document.createElement('template');
Index_template.innerHTML = `
	<viewer-page></viewer-page>
	<playlist-page></playlist-page>
	<main-menu-page></main-menu-page>
`
class IndexPage extends HTMLElement {
	constructor() {
		super();		
		this.attachShadow({mode:'open'});
		this.shadowRoot.appendChild(Index_template.content.cloneNode(true));
			
		this.playListPage = this.shadowRoot.querySelector('playlist-page');
		this.viewPage = this.shadowRoot.querySelector('viewer-page');
		this.mainMenuPage = this.shadowRoot.querySelector('main-menu-page');
		this.playListPage.hidden = true;
		this.viewPage.hidden = true;
		
		EventBroker.listen("videoPlayerButton_mrp-button_clicked", this, this.showViewerScreen);
		EventBroker.listen("playlistButton_mrp-button_clicked", this, this.showPlaylistScreen);
		EventBroker.listen("adminButton_mrp-button_clicked", this, this.showPlaylistScreen);
		EventBroker.listen("useSavedPlaylistButton_mrp-button_clicked", this, this.showViewerScreen);
		
		
		
		EventBroker.listen("exitButton_mrp-button_clicked", this, this.showMenu);
		
		
	}

	showMenu(){
		this.viewPage.hidden = true;
		this.playListPage.hidden = true;
		this.mainMenuPage.hidden = false;
	}
	showPlaylistScreen(){
		this.viewPage.hidden = true;
		this.playListPage.hidden = false;
		this.mainMenuPage.hidden = true;
	}
	showViewerScreen(){
		this.viewPage.hidden = false;
		this.playListPage.hidden = true;
		this.mainMenuPage.hidden = true;
	}
	showMainMenu(){
		this.viewPage.hidden = true;
		this.playListPage.hidden = true;
		this.mainMenuPage.hidden = false;
	}
}

window.customElements.define('index-page', IndexPage);