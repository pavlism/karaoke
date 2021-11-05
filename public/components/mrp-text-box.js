const MRPTextBox_template = document.createElement('template');
MRPTextBox_template.innerHTML = `
	<style>
		input{
			background-color: #FFFFFF;
			background-image: none;
			border: 1px solid #e5e6e7;
			border-radius: 1px;
			color: inherit;
			padding: 6px 12px;
			transition: border-color 0.15s ease-in-out 0s, box-shadow 0.15s ease-in-out 0s;
			font-size: 14px;
			line-height: 1.42857143;
			box-shadow: none;
			margin: 5px;
			box-sizing: border-box;
		}

		input:focus {
			outline: none !important;
			border:1px solid #1ab394;
			border-color: #1ab394 !important;
		}
		input.error{
			border: 1px solid red;
			margin-bottom: 0px;
		}
		span{
			color:red;
			margin-left: 5px;
		}
		input.hidden { 
			display:none;
		}
	</style>
	<input></input>
	<span></span>
`

//todo
//make the span invisible
//add error message to span
//setup regexexample to test error

class MRPTextBox extends HTMLElement {
	constructor() {
		super();
		this.addEventListener('input',this._handleChange);
			
		this.attachShadow({mode:'open'});
		this.shadowRoot.appendChild(MRPTextBox_template.content.cloneNode(true));

		Lib.Comp.setupDefualtProperties(this, 'input');
		this.textBox = this.shadowRoot.querySelector('input');
		
		if(this.getAttribute('password')===""){
			this.textBox.type = 'password';
		}

		if(this.getAttribute('size') !== null){
			this.textBox.size = this.getAttribute('size')
		}
		
		if(this.getAttribute('place-holder') !== null){
			this.textBox.placeholder = this.getAttribute('place-holder');
		}
		
		if(this.getAttribute('max-length') !== null){
			this.textBox.maxLength = this.getAttribute('max-length');
		}
		
		if(this.getAttribute('regex') !== null){
			this.regex = this.getAttribute('regex');
		}
		
		if(this.getAttribute('number') !== null){
			this.textBox.type = 'number';
		}
		
		this.value = '';
	}
	_checkError(element, valid){
		var htmlToR = [];
		
		if(valid){
			htmlToR.push(html``);
		}else{
			htmlToR.push(html`<br/><span>${element['error-msg']}</span>`);
		}
		
		return htmlToR;
	}
	_checkValidity(){
		if (this.regex !== '') {
			var text = this.currentText;
			var regex = new RegExp(this.regex);
			if (!regex.test(text)) {
				this.valid = false;
			}else{
				this.valid = true;
			}
		}
	}
	_handleChange(event){
		if(this.textBox.disabled){
			event.preventDefault();
			return false;
		}
		
		this.currentText = event.path[0].value;
		this._checkValidity();
		this.value = this.currentText;
		
		var triggerObj = {element:this, event:event, newValue:event.path[0].value};
		
		if(this.id !== ""){
			EventBroker.trigger(this.id + '_mrp-text-box_changed',triggerObj);
		}else if(this['class'] !== ""){
			EventBroker.trigger(this['class'] + '_mrp-text-box_changed',triggerObj);
		}else{
			EventBroker.trigger('mrp-text-box_changed',triggerObj);
		}
	}
	addText(text){
		this.shadowRoot.querySelector('input').value = text;
		var event = {};
		event.path = [];
		event.path.push({value:text});
		event.name = "addText()"
		this._handleChange(event);
	}
	getValue(){	
		return this.value;
	}
	setValue(text){	
		this.addText(text);
	}
	disable(){
		this.textBox.disabled = true;
		this.textBox.style.backgroundColor = '#e5e6e7'
	}
	enable(){
		this.textBox.disabled = false;
		this.textBox.style.backgroundColor = '#ffffff'
	}
	hide(){
		this.textBox.classList.add('hidden');
	}
	show(){
		this.textBox.classList.remove('hidden');
	}
}

window.customElements.define('mrp-text-box', MRPTextBox);