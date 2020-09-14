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
		this.addEventListener('input',this.handleChange);
			
		this.attachShadow({mode:'open'});
		this.shadowRoot.appendChild(MRPTextBox_template.content.cloneNode(true));

		Lib.Comp.setupDefualtProperties(this, 'input');
		
		if(this.getAttribute('password')===""){
			this.shadowRoot.querySelector('input').type = 'password'
		}
		
		//placeholder="${this.placeholder}" value="${this.value}"
	}
	checkError(element, valid){
		var htmlToR = [];
		
		if(valid){
			htmlToR.push(html``);
		}else{
			htmlToR.push(html`<br/><span>${element['error-msg']}</span>`);
		}
		
		return htmlToR;
	}
	checkValidity(){
		if (this.regex !== '') {
			var text = this.currentText;
			var regex = RegExp(this.regex);
			if (!regex.test(text)) {
				this.valid = false;
			}else{
				this.valid = true;
			}
		}
	}
	handleChange(event){
		this.currentText = event.path[0].value;
		this.checkValidity();
		this.value = this.currentText;
		
		var triggerObj = {element:this, event:event, newValue:event.path[0].value};
		
		if(this.id !== ""){
			EventBroker.trigger(this.id + '_mrp-text-box_changed',triggerObj);
		}else if(this['class'] !== ""){
			EventBroker.trigger(this['class'] + '_mrp-text-box_changed',triggerObj);
		}else{
			EventBroker.trigger('mrp-mrp-text-box_changed',triggerObj);
		}
	}
}

window.customElements.define('mrp-text-box', MRPTextBox);