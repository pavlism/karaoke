import { LitElement,css, html } from 'lit-element';



class MRPTextArea extends LitElement {
	static get styles() {
    return css`
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
    `;
  }
	static get properties() { 
		var properties = {};
		properties.id = {type: String};
		properties['class'] = {type: String};
		properties.regex = {type: String};
		properties.name = {type: String};
		properties.value = {type: String};
		properties.valid = {type: Boolean};
		properties.currentText = {type: String};
		properties.placeholder = {type: String};
		properties.rows = {type: String};
		properties.cols = {type: String};
		properties['error-msg'] = {type: String};
		return properties;
	}	
	constructor() {
		super();
		this.id = "";
		this['class'] = "";
		this.regex = "";
		this.valid = true;
		this.name = "";
		this.value = "";
		this.rows = "4";
		this.cols = "50";
		this.currentText = "";
		this.placeholder = "";
		this['error-msg'] = "";
		this.addEventListener('input',this.handleChange);
	}	
	render(){
		return html`
			<textarea id = ${this.id} rows = ${this.rows} cols = ${this.cols} class=${this.class}></textarea>
		`;
	}
	handleChange(event){
		this.currentText = event.path[0].value;
		this.value = this.currentText;
		
		var triggerObj = {element:this, event:event, newValue:event.path[0].value};
		
		if(this.id !== ""){
			EventBroker.trigger(this.id + '_mrp-drop-down_changed',triggerObj);
		}else if(this['class'] !== ""){
			EventBroker.trigger(this['class'] + '_mrp-drop-down_changed',triggerObj);
		}else{
			EventBroker.trigger('mrp-drop-down_changed',triggerObj);
		}
	}
}
customElements.define('mrp-text-area', MRPTextArea);