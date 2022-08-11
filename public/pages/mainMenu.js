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
		<div><mrp-button primary huge file id="addNewSong">Add New Song</mrp-button></div>
		<mrp-alert id="newSongAlert"></mrp-alert>
	</div>
`
class MainMenuPage extends HTMLElement {	
	constructor() {
		super();
		
		//<source src="http://localhost:8080/api/video" type="video/mp4">
		this.attachShadow({mode:'open'});
		this.shadowRoot.appendChild(MainMenu_template.content.cloneNode(true));
		this.button = this.shadowRoot.querySelector('#videoPlayerButton');
		this.alert = this.shadowRoot.querySelector('#newSongAlert');
		this.newSongButton = this.shadowRoot.querySelector('#addNewSong');

		this.alert.setFile('Add a New Song', 'Use this button to find the video on your computer:');

		EventBroker.listen(this.newSongButton, this.newSongButton.events.clicked, this, this._newSongClicked);
		EventBroker.listen(this.alert, this.alert.events.clicked, this, this._newSongClicked);
		EventBroker.listen(this.alert, this.alert.events.fileLoaded, this, this._fileLoaded);
	}
	_newSongClicked(){
		this.alert.show();
	}
	_fileLoaded(triggerObj){
		//TODO move the file to to the videos folder vai the server
		var songTitle = "No Doubt - It's My Life (edited)";
		EventBroker.trigger("new song added by user", songTitle);

	}
}

window.customElements.define('main-menu-page', MainMenuPage);