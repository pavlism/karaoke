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
	<select></select><mrp-text-box width='100px'></mrp-text-box><datalist></datalist><slot></slot>
`

//test all the function of both options

class MRPDropDown extends HTMLElement {
	constructor() {
		super();
		
		this.addEventListener('input',this._handleChange);
		this.addEventListener('click',this._handleClick);
			
		this.attachShadow({mode:'open'});
		this.shadowRoot.appendChild(MRPDropDown_template.content.cloneNode(true));

		Lib.Comp.setupDefualtProperties(this, 'select');
		this.dropDown = this.shadowRoot.querySelector('select');
		this.input = this.shadowRoot.querySelector('mrp-text-box');
		this.datalist = this.shadowRoot.querySelector('datalist');
		this.searchable = false;
		
		//if a value is set then use that as the defualt value
		if(this.getAttribute('value')==null){
			this.value = "";
		}else{
			this.value = this.getAttribute('value');
		}
		
		//if ID is set then pass then to the textbox as well
		if(this.getAttribute('id')!==null){
			this.input.id = this.getAttribute('id')+"_text-box";
		}
		
		//if a width is set then pass that to the textbox
		if(this.getAttribute('width') !== null){
			this.input.setAttribute('width',this.getAttribute('width'));
		}
		
		//if searchable is enabled then keep the text box, else remove it
		if(this.getAttribute('searchable')===""){
			this.dropDown.remove();
			this.searchable = true;
			this.datalist.id = this.getAttribute('id') + '_datalist_MRPDropDown';
			this.input.addList(this.datalist);
			this.input.setValue(this.value);
		}else{
			this.datalist.remove();
			this.input.remove();
		}
		
		this.values = [];
		this.selectionIndex = -1;
		if(this.getAttribute('values')!=null){
			this.values = JSON.parse(this.getAttribute('values'));
		}
		
		if(this.getAttribute('list')!=null){
			this.list = JSON.parse(this.getAttribute('list'));
			this._fillDropDown();
		}
		
		this.events = {};
		this.events.clicked = 'clicked';
		this.events.changed = 'changed';
		this.events.shown = 'shown';
		this.events.hidden = 'hidden';
		this.events.disabled = 'disabled';
		this.events.enabled = 'enabled';

	}
	_handleClick(event){
		if(this.dropDown.disabled){
			event.preventDefault();
			return false;
		}
		
		
		//if you click on the arrow then blank the text box
		var relativeLeftPos = event.offsetX - event.path[0].offsetLeft;
		var width = this.offsetWidth;
		
		if(width - relativeLeftPos < 65 && width - relativeLeftPos > 35){
			this.value = '';
			this.input.setValue('')
		}
		
		var triggerObj = {element:this, event:event};
		if(this.id !== ""){
			EventBroker.trigger(this.id + '_mrp-drop-down_clicked',triggerObj);
			EventBroker.trigger(this,this.events.clicked);
		}else if(this['classname'] !== ""){
			EventBroker.trigger(this['classname'] + '_mrp-drop-down_clicked',triggerObj);
		}else{
			EventBroker.trigger('mrp-drop-down_clicked',triggerObj);
		}
	}
	addList(list){
		if(Lib.JS.isUndefined(this.list)){
			this.list = list;
			this._fillDropDown();
		}else{
			this.list = list;
			this._replaceList();
		}

	}
	_replaceList() {
		if(this.searchable){
			//clear the input box
			this.input.removeList();
			
			//clear teh data list
			while (this.datalist.firstChild) {
				this.datalist.removeChild(this.datalist.firstChild);
			}
			//refile the data list
			this._fillDropDown();
			
			//send the data list back to the input box
			this.input.addList(this.datalist);
		}else{
			//clear the list
			while (this.dropDown.firstChild) {
				this.dropDown.removeChild(this.dropDown.firstChild);
			}
			//re-fill the list
			this._fillDropDown();
		}
	}
	_fillDropDown(){
		var htmlToR = [];
		
		if(this.value === "" && !this.searchable){
			this.value = this.list[0];
		}
		
		var innerHTML = "";
		
		for (var optionCounter = 0; optionCounter < this.list.length; optionCounter++) {
			var value = this.list[optionCounter];
			var str = this.list[optionCounter];
			
			if(this.values.length >0 && this.values.length>optionCounter){
				value = this.values[optionCounter];
			}
			
			//create the new option
			var newOption = document.createElement("option");
			//not sure why this is here, but maybe it was needed??
			//newOption.value = value.replaceAll("'","&#39;");
			newOption.value = value;
			newOption.setAttribute('id',optionCounter);			
			
			//if a defualt value is selected
			if(this.list[optionCounter] == this.value || this.index-1 === optionCounter){
				this.value = this.list[optionCounter];
				this.selectionIndex = optionCounter;
				newOption.selected = true;
			}else{
				newOption.selected = false;
			}
			
			//if searchable then use the data list else use the dropDown list
			if(this.searchable){
				this.datalist.insertAdjacentElement('beforeEnd',newOption);
			}else{
				newOption.text = newOption.value;
				this.dropDown.insertAdjacentElement('beforeEnd',newOption);
			}
		}
	}
	_handleChange(event){
		if(this.dropDown.disabled){
			event.preventDefault();
			return false;
		}
		
		var triggerObj = {element:this, event:event, newValue:event.path[0].value};
		this.value = event.path[0].value;
		
		if(this.searchable){
			this.selectionIndex = -1;
		}else{
			this.selectionIndex = this.dropDown.selectedIndex;
		}
		
		if(this.id !== ""){
			EventBroker.trigger(this.id + '_mrp-drop-down_changed',triggerObj);
			EventBroker.trigger(this,this.events.changed);
		}else if(this['class'] !== ""){
			EventBroker.trigger(this['class'] + '_mrp-drop-down_changed',triggerObj);
		}else{
			EventBroker.trigger('mrp-drop-down_changed',triggerObj);
		}
	}
	getValue(){	
		return this.value;
	}
	getIndex(){	
		if(this.selectionIndex !==-1){
			return this.selectionIndex;
		}

		if(Lib.JS.isUndefined){
			return -1;
		}
		
		
		for(var itemCounter = 0;itemCounter<this.list.length;itemCounter++){
			if(this.list[itemCounter] = this.value){
				return itemCounter;
			}
		}
		return -1;
	}
	setValue(newValue){
		if(this.value === newValue){
			return false;
		}
		
		for (var optionCounter = 0; optionCounter < this.list.length; optionCounter++) {
			var value = this.list[optionCounter];
			if(value === newValue){
				if(this.searchable){
					this.input.setValue(newValue);
				}else{
					this.shadowRoot.querySelector("select").children[optionCounter].selected = true;
				}
				this.value = newValue;
			}
		}
	}
	updateCurrentSelection(newValue){
		this.list[this.selectionIndex] = newValue;
		//clear the fill down first, then re-laod it
		this._replaceList();
		this.setValue(newValue);		
	}
	sortAlphabetically(isAsc = true){
		if(isAsc){
			this.list.sort();
		}else{
			this.list.reverse();
		}
		this._replaceList();
	}
	hide(){
		this.dropDown.classList.add('hidden');
		EventBroker.trigger(this,this.events.hidden);
	}
	show(){
		this.dropDown.classList.remove('hidden');
		EventBroker.trigger(this,this.events.shown);
	}
	disable(){
		this.dropDown.disabled = true;
		this.dropDown.style.backgroundColor = '#e5e6e7'
		EventBroker.trigger(this,this.events.disabled);
	}
	enable(){
		this.dropDown.disabled = false;
		this.dropDown.style.backgroundColor = '#ffffff';
		EventBroker.trigger(this,this.events.enabled);
	}
}
window.customElements.define('mrp-drop-down', MRPDropDown);