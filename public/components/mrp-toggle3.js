const MRPToggle_template = document.createElement('template');
MRPToggle_template.innerHTML = `
	<style>
input[type=checkbox]{
	height: 0;
	width: 0;
	visibility: hidden;
}

label {
	cursor: pointer;
	text-indent: -9999px;
	width: 120px;
	height: 50px;
	background: #5ad52c;
	display: block;
	border-radius: 100px;
	position: relative;
}

label:after {
	content: '';
	position: absolute;
	top: 5px;
	left: 5px;
	width: 40px;
	height: 40px;
	background: #fff;
	border-radius: 90px;
	transition: 0.3s;
	content: " - Remember this";
}

input:checked + label {
	background: red;
}

input:checked + label:after {
	left: calc(100% - 5px);
	transform: translateX(-100%);
}

label:active:after {
	width: 130px;
}

.container {
  width: 80%;
  height: 100px;
  margin: auto;
  padding: 10px;
}

.question {
  height: 100px;
  float: left;
  margin-right: 15px;
  font-size: 30px;
  margin-top: 20px;
}

.text {
	width: 40px;
  height: 100px;
  float: left;
  margin-right: 15px;
  font-size: 30px;
  margin-top: 20px;
  color:#5ad52c;
}

.toggle {
  height: 100px;
  float: left;
}


// centering
body {
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100vh;
}

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