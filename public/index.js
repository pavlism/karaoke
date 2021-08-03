const Index_template = document.createElement('template');
Index_template.innerHTML = `
	<viewer-page></viewer-page>
	<playlist-page></playlist-page>
`
class IndexPage extends HTMLElement {
	constructor() {
		super();		
		this.attachShadow({mode:'open'});
		this.shadowRoot.appendChild(Index_template.content.cloneNode(true));
			
		this.playListPage = this.shadowRoot.querySelector('playlist-page');
		this.viewPage = this.shadowRoot.querySelector('viewer-page');
		this.playListPage.hidden = true
		
		EventBroker.listen("playlistButton_mrp-button_clicked", this, this.showPlaylistScreen);
		EventBroker.listen("saveButton_mrp-button_clicked", this, this.showViewerScreen);
	}

	showPlaylistScreen(){
		this.viewPage.hidden = true;
		this.playListPage.hidden = false;
	}
	showViewerScreen(){
		this.viewPage.hidden = false;
		this.playListPage.hidden = true;
	}
}

window.customElements.define('index-page', IndexPage);