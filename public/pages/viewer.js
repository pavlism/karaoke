const Viewer_template = document.createElement('template');
Viewer_template.innerHTML = `
	Viewer
	<div id='lyrics'></div>
`
class ViewerPage extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({mode:'open'});
		this.shadowRoot.appendChild(Viewer_template.content.cloneNode(true));

	}
}

window.customElements.define('viewer-page', ViewerPage);