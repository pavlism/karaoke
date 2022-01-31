const MRPTextArea_template = document.createElement('template');
MRPTextArea_template.innerHTML = `
	<style>
		textarea{
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

		textarea:focus {
			outline: none !important;
			border:1px solid #1ab394;
			border-color: #1ab394 !important;
		}
		textarea.error{
			border: 1px solid red;
			margin-bottom: 0px;
		}
		span{
			color:red;
			margin-left: 5px;
		}
		textarea.hidden { 
			display:none;
		}
	</style>
	<textarea></textarea>
    `;
	
	
class MRPTextArea extends HTMLElement {
	constructor() {
		super();
		this.addEventListener('input',this._handleChange);

		this.attachShadow({mode:'open'});
		this.shadowRoot.appendChild(MRPTextArea_template.content.cloneNode(true));
		this.textArea = this.shadowRoot.querySelector('textarea');

		var myObj = this.textArea;
		for(var key in myObj){
			if(key.search('on') === 0) {
				//myObj.addEventListener(key.slice(2), this._handleChange)
			}
		}

		this.currentCursorPosition = 0;
		Lib.Comp.setupDefualtProperties(this, 'textarea');
		
		if(this.getAttribute('rows')!== null){
			this.shadowRoot.querySelector('textarea').rows = this.getAttribute('rows');
		}

		if(this.getAttribute('cols') !== null){
			this.shadowRoot.querySelector('textarea').cols = this.getAttribute('cols');
		}
		
		if(this.getAttribute('place-holder') !== null){
			this.shadowRoot.querySelector('textarea').placeholder = this.getAttribute('place-holder');
		}
		
		if(this.getAttribute('max-length') !== null){
			this.shadowRoot.querySelector('textarea').maxLength = this.getAttribute('max-length');
		}
		
		if(this.getAttribute('max-length') !== null){
			this.shadowRoot.querySelector('textarea').maxLength = this.getAttribute('max-length');
		}
		
		if(this.getAttribute('regex') !== null){
			this.regex = this.getAttribute('regex');
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
		if(this.textArea.disabled){
			event.preventDefault();
			return false;
		}
		
		this.currentText = event.path[0].value;
		this._checkValidity();
		this.value = this.currentText;
		
		var triggerObj = {element:this, event:event, newValue:event.path[0].value};
		
		if(this.id !== ""){
			EventBroker.trigger(this.id + '_mrp-text-area_changed',triggerObj);
		}else if(this['class'] !== ""){
			EventBroker.trigger(this['class'] + '_mrp-text-area_changed',triggerObj);
		}else{
			EventBroker.trigger('mrp-text-area_changed',triggerObj);
		}
	}
	addText(text){
		this.textArea.value = text;
		var event = {};
		event.path = [];
		event.path.push({value:text});
		event.name = "addText()"
		event.target = this.textArea;
		this._handleChange(event);
	}
	getValue(){	
		return this.value;
	}
	setValue(text){	
		this.addText(text);
	}
	hide(){
		this.textArea.classList.add('hidden');
	}
	show(){
		this.textArea.classList.remove('hidden');
	}
	disable(){
		this.textArea.disabled = true;
		this.textArea.style.backgroundColor = '#e5e6e7'
	}
	enable(){
		this.textArea.disabled = false;
		this.textArea.style.backgroundColor = '#ffffff'
	}
	getCursorPosition(){
		return this.textArea.selectionStart;
	}
	insertTextAt(position, text, keepCursor = true){
		var left = this.currentText.substr(0,position);
		var right = this.currentText.substr(position, this.currentText.length);
		this.currentText = left + text + right;
		this.setValue(this.currentText);

		//make sure the cursor position changes
		if(keepCursor){
			this.textArea.addEventListener('select', this._resetCursorPosition,{once : true});
		}
	}
	insertTextAtCursor(text, keepCursor = true){
		var position = this.getCursorPosition();
		var left = this.currentText.substr(0,position);
		var right = this.currentText.substr(position, this.currentText.length);
		this.currentText = left + text + right;
		this.setValue(this.currentText);
		this.textArea.selectionStart = position;
		this.textArea.cursorPosition = position;
		this.currentCursorPosition = position;

		//make sure the cursor position changes
		if(keepCursor){
			this.textArea.addEventListener('select', this._resetCursorPosition,{once : true});
		}
	}
	_resetCursorPosition(event){
		this.selectionStart = this.cursorPosition;
		this.selectionEnd = this.cursorPosition;
	}
}

window.customElements.define('mrp-text-area', MRPTextArea);