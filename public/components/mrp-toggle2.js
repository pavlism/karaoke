const MRPToggle_template = document.createElement('template');
MRPToggle_template.innerHTML = `
	<style>


	</style>
	<div class="container">
		<div class="question"><slot></slot></div>
		<div class="text">no</div>
		<div class="toggle">
			<input type="checkbox" id="switch" />
			<label for="switch">Toggle</label>
		</div>
	</div>
`

class MRPToggle extends HTMLElement {
	constructor() {
		super();
	}
}
window.customElements.define('mrp-toggle', MRPToggle);