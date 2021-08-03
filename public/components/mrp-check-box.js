const MRPCheckBox_template = document.createElement('template');
MRPCheckBox_template.innerHTML = `
	<style>
	label.hidden { 
		display:none;
	}
    </style>
    <label class="checkbox-inline">
        <input type="checkbox" value=""><slot></slot>
    </label>
`
class MRPCheckBox extends HTMLElement {
	constructor() {
		super();	
		this.addEventListener('click',this._handleClick);
		
		this.attachShadow({mode:'open'});
		this.shadowRoot.appendChild(MRPCheckBox_template.content.cloneNode(true));

		Lib.Comp.setupDefualtProperties(this, 'input');
		this.inputBox = this.shadowRoot.querySelector('input');
		this.label = this.shadowRoot.querySelector('label');
		
		var className = "";
		
		if(this.getAttribute('checked')===""){
			this.inputBox.checked = true;
		}
		
		if(this.getAttribute('disabled')===""){
			this.disable();
		}
		
		if(this.getAttribute('left')===""){
			var slot = this.shadowRoot.querySelector('slot');
			var parent = $(this.inputBox).parent();
			$(slot).prependTo(parent)
		}
	}
	_handleClick(event){
		if(this.button.disabled){
			event.preventDefault();
			return false;
		}
		
		if(event.path[0].type !== "checkbox"){
			return false;
		}
		
		var triggerObj = {element:this, event:event, newValue:this.inputBox.checked};
		
		if(this.id !== ""){
			EventBroker.trigger(this.id + '_mrp-check-box_changed',triggerObj);
		}else if(this['class'] !== ""){
			EventBroker.trigger(this['class'] + '_mrp-check-box_changed',triggerObj);
		}else{
			EventBroker.trigger('mrp-check-box_changed',triggerObj);
		}
	}
	tick(){
		var event = {};
		event.name = "tick()"
		this._handleClick(event);
	}
	getValue(){
		if(this.disabled){
			return false;
		}
		
		return this.inputBox.checked;
	}
	setValue(newValue){
		if(this.disabled){
			return false;
		}
		this.inputBox.checked = newValue;
	}
	hide(){
		this.label.classList.add('hidden');
	}
	show(){
		this.label.classList.remove('hidden');
	}
	disable(){
		this.inputBox.disabled = true;
		this.disabled = true;
	}
	enable(){
		this.inputBox.disabled = false;
		this.disabled = false;
	}
}
window.customElements.define('mrp-check-box', MRPCheckBox);