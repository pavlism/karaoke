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
	</style>
	<select></select>
`

//add in the adlity to set a defualt value

class MRPDropDown extends HTMLElement {
	constructor() {
		super();
		
		this.addEventListener('input',this.handleChange);
			
		this.attachShadow({mode:'open'});
		this.shadowRoot.appendChild(MRPDropDown_template.content.cloneNode(true));

		Lib.Comp.setupDefualtProperties(this, 'select');
		
		if(this.getAttribute('value')==null){
			this.value = "";
		}else{
			this.value = this.getAttribute('value');
		}
		
		if(this.getAttribute('list')!=null){
			this.list = JSON.parse(this.getAttribute('list'));
			this.fillDropDown();
		}	
	}	
	addList(list){
		this.list = list;
		this.fillDropDown();
	}
	fillDropDown(){
		var htmlToR = [];
		
		if(this.value === ""){
			this.value = this.list[0];
		}
		
		var innerHTML = "";
		
		for (var optionCounter = 0; optionCounter < this.list.length; optionCounter++) {
			if(this.list[optionCounter] == this.value || this.index-1 === optionCounter){
				this.value = this.list[optionCounter];
				innerHTML =innerHTML + "<option value = '" + this.list[optionCounter] + "' selected>" + this.list[optionCounter] + "</option>"
				//htmlToR.push(html`<option value = ${element.list[optionCounter]} selected>${element.list[optionCounter]}</option>`);
			}else{
				innerHTML =innerHTML + "<option value = '" + this.list[optionCounter] + "'>" + this.list[optionCounter] + "</option>"
				//htmlToR.push(html`<option value = ${element.list[optionCounter]}>${element.list[optionCounter]}</option>`);
			}
		}
		this.shadowRoot.querySelector("select").innerHTML = innerHTML;
	}
	handleChange(event){		
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
}
window.customElements.define('mrp-drop-down', MRPDropDown);