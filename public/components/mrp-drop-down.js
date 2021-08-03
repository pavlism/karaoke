const MRPDropDown_template = document.createElement('template');
MRPDropDown_template.innerHTML = `
	<style>
	select{
		vertical-align: middle;
		background-color: #FFFFFF;
		background-image: none;
		border: 1px solid #e5e6e7;
		border-radius: 1px;
		color: inherit;
		padding: 6px 12px;
		transition: border-color 0.15s ease-in-out 0s, box-shadow 0.15s ease-in-out 0s;
		font-size: 14px;
		height: 32px;
		line-height: 1.42857143;
		box-shadow: none;
		margin: 5px;
	}

	select:focus {
		outline: none !important;
		border:1px solid #1ab394;
		border-color: #1ab394 !important;
	}
	select.hidden { 
		display:none;
	}
	</style>
	<select></select><slot></slot>
`

//add in the adlity to set a defualt value

class MRPDropDown extends HTMLElement {
	constructor() {
		super();
		
		this.addEventListener('input',this._handleChange);
			
		this.attachShadow({mode:'open'});
		this.shadowRoot.appendChild(MRPDropDown_template.content.cloneNode(true));

		Lib.Comp.setupDefualtProperties(this, 'select');
		this.dropDown = this.shadowRoot.querySelector('select');
		
		if(this.getAttribute('value')==null){
			this.value = "";
		}else{
			this.value = this.getAttribute('value');
		}
		
		this.values = [];
		if(this.getAttribute('values')!=null){
			this.values = JSON.parse(this.getAttribute('values'));
		}
		
		if(this.getAttribute('list')!=null){
			this.list = JSON.parse(this.getAttribute('list'));
			this._fillDropDown();
		}

	}	
	addList(list){
		this.list = list;
		this._fillDropDown();
	}
	_fillDropDown(){
		var htmlToR = [];
		
		if(this.value === ""){
			this.value = this.list[0];
		}
		
		var innerHTML = "";
		
		for (var optionCounter = 0; optionCounter < this.list.length; optionCounter++) {
			var value = this.list[optionCounter];
			var str = this.list[optionCounter];
			
			if(this.values.length >0 && this.values.length>optionCounter){
				value = this.values[optionCounter];
			}
			
			if(this.list[optionCounter] == this.value || this.index-1 === optionCounter){
				this.value = this.list[optionCounter];
				innerHTML =innerHTML + "<option value = '" + value.replaceAll("'","&#39;") + "' selected>" + str + "</option>"
			}else{
				innerHTML =innerHTML + "<option value = '" + value.replaceAll("'","&#39;") + "'>" + str + "</option>"
			}
		}
		this.shadowRoot.querySelector("select").innerHTML = innerHTML;
	}
	_handleChange(event){
		if(this.dropDown.disabled){
			event.preventDefault();
			return false;
		}
		
		var triggerObj = {element:this, event:event, newValue:event.path[0].value};
		this.value = event.path[0].value;
		
		if(this.id !== ""){
			EventBroker.trigger(this.id + '_mrp-drop-down_changed',triggerObj);
		}else if(this['class'] !== ""){
			EventBroker.trigger(this['class'] + '_mrp-drop-down_changed',triggerObj);
		}else{
			EventBroker.trigger('mrp-drop-down_changed',triggerObj);
		}
	}
	getValue(){	
		return this.value.replaceAll("&#39;","'");
	}
	setValue(newValue){	
		if(this.value === newValue){
			return false;
		}
		
		for (var optionCounter = 0; optionCounter < this.list.length; optionCounter++) {
			var value = this.list[optionCounter];
			if(value === newValue){
				this.shadowRoot.querySelector("select").children[optionCounter].selected = true;
			}
		}
	}
	sortAlphabetically(isAsc = true){
		if(isAsc){
			this.list.sort();
		}else{
			this.list.reverse();
		}
	}
	hide(){
		this.dropDown.classList.add('hidden');
	}
	show(){
		this.dropDown.classList.remove('hidden');
	}
	disable(){
		this.dropDown.disabled = true;
		this.dropDown.style.backgroundColor = '#e5e6e7'
	}
	enable(){
		this.dropDown.disabled = false;
		this.dropDown.style.backgroundColor = '#ffffff'
	}
}
window.customElements.define('mrp-drop-down', MRPDropDown);