const template = document.createElement('template');
template.innerHTML = `
	<style>
	h3 {
		color:coral;
	}
	</style>
	<div class="user-card">
		<h3></h3>
		<p><slot /></p>
	</div>
`



class UserCard extends HTMLElement{
	constructor(){
		super();
		
		this.attachShadow({mode:'open'});
		this.shadowRoot.appendChild(template.content.cloneNode(true));
		this.shadowRoot.querySelector('h3').innerText = 'hello ' + this.getAttribute('name')
	}
}

window.customElements.define('user-card', UserCard)