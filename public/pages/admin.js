const Admin_template = document.createElement('template');
Admin_template.innerHTML = `
	<div style="padding-left: 757px;">
	<ul style="list-style-type:none;">
		<li><mrp-button primary>Manage Users</mrp-button></li>
	</ul>
	</div>
`

class AdminPage extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({mode:'open'});
		this.shadowRoot.appendChild(Admin_template.content.cloneNode(true));
	}

}

window.customElements.define('admin-page', AdminPage);