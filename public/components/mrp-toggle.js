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
		this.addEventListener('click',this.handleClick);
		
		this.attachShadow({mode:'open'});
		this.shadowRoot.appendChild(MRPToggle_template.content.cloneNode(true));
		
		this.shadowRoot.querySelector('.question').style.width = this.getAttribute('width') + "px";

		Lib.Comp.setupDefualtProperties(this, 'input');
		
		var className = "";
		
		if(this.getAttribute('checked')===""){
			this.shadowRoot.querySelector('input').checked = true;
		}
		
		if(this.getAttribute('disabled')===""){
			this.shadowRoot.querySelector('input').disabled = true;
			this.disabled = true;
		}
		
	}
	handleClick(event){
		if(this.disabled){
			return false;
		}
		
		if(this.shadowRoot.querySelector("input").checked){
			this.shadowRoot.querySelector(".text").textContent = "no";
			this.shadowRoot.querySelector(".text").style.color = "#5ad52c";
		}else{
			this.shadowRoot.querySelector(".text").textContent = "yes";
			this.shadowRoot.querySelector(".text").style.color = "red";
		}
		
		//this.checked = !this.checked;
		
		this.shadowRoot.querySelector('input').checked = !this.shadowRoot.querySelector('input').checked;
		
		var triggerObj = {element:this, event:event, newValue:this.checked};
		
		if(this.id !== ""){
			EventBroker.trigger(this.id + '_mrp-check-box_changed',triggerObj);
		}else if(this['class'] !== ""){
			EventBroker.trigger(this['class'] + '_mrp-check-box_changed',triggerObj);
		}else{
			EventBroker.trigger('mrp-check-box_changed',triggerObj);
		}
	}
}
window.customElements.define('mrp-toggle', MRPToggle);