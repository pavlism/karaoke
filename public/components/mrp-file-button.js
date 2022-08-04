const MRPFileButton_template = document.createElement('template');
MRPFileButton_template.innerHTML = `
	<style>
	div {
		font-family: Verdana;
		font-size: 15px;
		color: #010101;
		line-height: 1.5;
		letter-spacing: .25px;
	}
	</style>
	
	<div style="padding: 10px;">
		<slot></slot>&nbsp&nbsp<input type="file" id="temp">
	</div>
`


class MRPFileButton extends HTMLElement {
	constructor() {
		super();
	
		this.attachShadow({mode:'open'});
		this.shadowRoot.appendChild(MRPFileButton_template.content.cloneNode(true));
		this.shadowRoot.querySelector("input").addEventListener('change',this._handleFileSelected);
		this.div = this.shadowRoot.querySelector('div');
		this.input = this.shadowRoot.querySelector('input');

		Lib.Comp.setupDefualtProperties(this, 'input');

		this.events = {};
		this.events.clicked = 'clicked';
		this.events.shown = 'shown';
		this.events.hidden = 'hidden';
		this.events.disabled = 'disabled';
		this.events.enabled = 'enabled';
		this.events.fileLoaded = 'fileLoaded';
		this.disabled = false

		EventBroker.listen(this.input.id + '_mrp-file-button_fileSelected', this, this._fileLoaded);
	}
	_fileLoaded(triggerObj){
		EventBroker.trigger(this,this.events.fileLoaded, triggerObj);
	}
	_handleFileSelected(event){
		if(this.disabled){
			return false;
		}

		var triggerObj = {element:this, event:event, files:event.target.files};
		if(this.id !== ""){
			EventBroker.trigger(this.id + '_mrp-file-button_fileSelected',triggerObj);
		}else if(this['class'] !== ""){
			EventBroker.trigger(this['class'] + '_mrp-file-button_fileSelected',triggerObj);
		}else{
			EventBroker.trigger('mrp-file-button_fileSelected',triggerObj);
		}
	}
	changeID(newID){
		this.id = newID;
		this.input.id = newID;
		EventBroker.listen(this.input.id + '_mrp-file-button_fileSelected', this, this._fileLoaded);
	}
	hide(){
		this.div.style.display = 'none';
		EventBroker.trigger(this,this.events.hidden);
	}
	show(){
		this.div.style.display = '';
		EventBroker.trigger(this,this.events.shown);
	}
	disable(){
		this.disabled = true;
		//this.button.classList.add('disabled');
		EventBroker.trigger(this,this.events.disabled);
	}
	enable(){
		this.disabled = false;
		//this.button.classList.remove('disabled');
		EventBroker.trigger(this,this.events.enabled);
	}
}

window.customElements.define('mrp-file-button', MRPFileButton)