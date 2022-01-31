const MainMenu_template = document.createElement('template');
MainMenu_template.innerHTML = `
<style>
.center {
  margin: auto;
  width: 60%;
  padding: 10px;
}
</style>

	<div class="center">
		<div><mrp-button primary huge id="videoPlayerButton">Video Player</mrp-button></div>
		<div><mrp-button primary huge id="tempPlaylistButton">Setup Playlist</mrp-button></div>
		<div><mrp-button primary huge id="adminButton">Admin</mrp-button></div>
		<div><mrp-button primary huge id="useSavedPlaylistButton">Use Saved Playlist</mrp-button></div>
	</div>
`
class MainMenuPage extends HTMLElement {	
	constructor() {
		super();
		
		//<source src="http://localhost:8080/api/video" type="video/mp4">
		this.attachShadow({mode:'open'});
		this.shadowRoot.appendChild(MainMenu_template.content.cloneNode(true));
		
		this.button = this.shadowRoot.querySelector('#videoPlayerButton');
	}
}

window.customElements.define('main-menu-page', MainMenuPage);