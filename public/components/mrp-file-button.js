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
		this.shadowRoot.querySelector("input").addEventListener('change',this.handleFileSelected);
		
		Lib.Comp.setupDefualtProperties(this, 'input');
	}
	handleFileSelected(event){
		var triggerObj = {element:this, event:event, files:event.target.files};
		if(this.id !== ""){
			EventBroker.trigger(this.id + '_mrp-file-button_fileSelected',triggerObj);
		}else if(this['class'] !== ""){
			EventBroker.trigger(this['class'] + '_mrp-file-button_fileSelected',triggerObj);
		}else{
			EventBroker.trigger('mrp-file-button_fileSelected',triggerObj);
		}
	}
}

window.customElements.define('mrp-file-button', MRPFileButton)