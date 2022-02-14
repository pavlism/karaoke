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
		<div><mrp-button primary huge id="test">test - file updates</mrp-button></div>
	</div>
`
class MainMenuPage extends HTMLElement {	
	constructor() {
		super();

		this.attachShadow({mode:'open'});
		this.shadowRoot.appendChild(MainMenu_template.content.cloneNode(true));

		this.button = this.shadowRoot.querySelector('#test');

		EventBroker.listen(this.button,this.button.events.clicked,this,this._test);
	}
	async _test(){
		debugger;
		var test = 701;
		const response = await Server.updateFile();
	}
}

window.customElements.define('main-menu-page', MainMenuPage);