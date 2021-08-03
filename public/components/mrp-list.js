const MRPList_template = document.createElement('template');
MRPList_template.innerHTML = `
	<slot></slot>
	<ul></ul>
`

//add in the adlity to set a defualt value

class MRPList extends HTMLElement {
	constructor() {
		super();			
		this.attachShadow({mode:'open'});
		this.shadowRoot.appendChild(MRPList_template.content.cloneNode(true));
		this.listUL = this.shadowRoot.querySelector('ul');
		
		this.isAdvanced = false;
		if(this.getAttribute('advanced')!=null){
			this.isAdvanced = true;
		}
		
		EventBroker.listen("removeSongFromList_playList_mrp-button_clicked", this, this._removeFromList);
		EventBroker.listen("moveSongFromListUp_playList_mrp-button_clicked", this, this._moveUp);
		EventBroker.listen("moveSongFromListDown_playList_mrp-button_clicked", this, this._moveDown);
	}
	addList(list){
		//this.list = list;
		
		//
	}
	setList(list){
		this.list = list;
		this._fillList();
	}
	addItem(item){
		debugger;
	}
	_fillList(){				
		var innerHTML = "";
		
		for (var listCounter = 0; listCounter < this.list.length; listCounter++) {
			var value = this.list[listCounter];
			if(this.isAdvanced){
				innerHTML =innerHTML + "<li>" + value;
				
				innerHTML =innerHTML + "<mrp-button small success class='removeSongFromList_"+this.id+"' index="+listCounter+">remove</mrp-button>";
				
				if(listCounter == 0){
					innerHTML =innerHTML + "<mrp-button small class='moveSongFromListUp_"+this.id+"' index="+listCounter+">&#8593;</mrp-button>";
				}else{
					innerHTML =innerHTML + "<mrp-button small success class='moveSongFromListUp_"+this.id+"' index="+listCounter+">&#8593;</mrp-button>";
				}
				
				if(listCounter == this.list.length-1){
					innerHTML =innerHTML + "<mrp-button small class='moveSongFromListDown_"+this.id+"' index="+listCounter+">&#8595;</mrp-button>";
				}else{
					innerHTML =innerHTML + "<mrp-button small success class='moveSongFromListDown_"+this.id+"' index="+listCounter+">&#8595;</mrp-button>";
				}
				
				innerHTML =innerHTML + "</li>";
			}else{
				innerHTML =innerHTML + "<li>" + value + "</li>"	
			}
					
		}
		this.listUL.innerHTML = innerHTML;
		EventBroker.trigger("mrp-list_"+this.id+"_changed", this);
	}

	_removeFromList(triggerArgs){
		var index = Number(triggerArgs.element.getAttribute('index'));
		this.list.splice(index,1);
		this._fillList();
	}
	_moveUp(triggerArgs){
		var index = Number(triggerArgs.element.getAttribute('index'));
		
		if(index===0){
			return false;
		}
		
		var element = this.list.splice(index,1);
		this.list.splice(index-1,0,element[0]);
		this._fillList();
	}
	_moveDown(triggerArgs){
		var index = Number(triggerArgs.element.getAttribute('index'));
		
		if(index===this.list.length-1){
			return false;
		}
		
		var element = this.list.splice(index,1);
		this.list.splice(index+1,0,element[0]);
		this._fillList();
	}

	getValues(){	
		return this.list;
	}
	hide(){
		this.listUL.classList.add('hidden');
	}
	show(){
		this.listUL.classList.remove('hidden');
	}
	disable(){
		this.listUL.disabled = true;
		this.listUL.style.backgroundColor = '#e5e6e7'
	}
	enable(){
		this.listUL.disabled = false;
		this.listUL.style.backgroundColor = '#ffffff'
	}
}
window.customElements.define('mrp-list', MRPList);