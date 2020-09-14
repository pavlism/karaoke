const MRPCheckBox_template = document.createElement('template');
MRPCheckBox_template.innerHTML = `
	<style>
	div{
                width: 100%;
                height: 100%;
                display: flex;
                flex-wrap: wrap;
                align-items: center;
            }
            div > span {
                margin-left: 10px;
            }
            div > label {
                display: block;
                position: relative;
                cursor: pointer;
                color:#676C6A;
                height: 20px;
                width: 20px;
                background: #FFF;
                border: 2px solid #ccc;
                margin-left: 5px;
				margin-bottom: 2px;
            }
            div input {
                position: absolute;
                z-index: -1;
                opacity: 0;
            }
            
            span.checkMark {
                left: 20px;
                width: 5px;
                height: 10px;
                border: solid #FFF;
                border-width: 0 2px 2px 0;
                transform: rotate(45deg);
                position: relative;
                z-index: 1;
				top: -2px;
            }
            div.enabled:hover > label{
                background: #FFF;
                border: 2px solid #1ab394;
            }      
            
            div > input:not([disabled]):checked ~ label {
                background: #1ab394;
                border: 2px solid #1ab394;
            }
            
            div > input:not([disabled]) ~ span {
                cursor: pointer;
            }
            
            div input:disabled ~ label {
                background: #e6e6e6;
                opacity: 0.6;
                pointer-events: none;
            }
            div input:disabled:not([checked]) ~ span.checkMark {
                left: 20px;
                width: 5px;
                height: 10px;
                border: solid #F0F0F0;
                border-width: 0 2px 2px 0;
                transform: rotate(45deg);
                position: relative;
                z-index: 1;
            }
            div input:disabled:checked ~ span.checkMark {
                left: 20px;
                width: 5px;
                height: 10px;
                border: solid #7b7b7b;
                border-width: 0 2px 2px 0;
                transform: rotate(45deg);
                position: relative;
                z-index: 1;
            }
	</style>
	<div>
		<input type="checkbox" style='display: none;'/>
		<span class='checkMark' on-click="handleClick"></span>
		<label on-click="handleClick"></label>
		<span on-click="handleClick"><slot></slot></span>
	</div>
`



class MRPCheckBox extends HTMLElement {
	constructor() {
		super();	
		this.addEventListener('click',this.handleClick);
		
		this.attachShadow({mode:'open'});
		this.shadowRoot.appendChild(MRPCheckBox_template.content.cloneNode(true));

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
window.customElements.define('mrp-check-box', MRPCheckBox);