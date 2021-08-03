const MRPFrom_template = document.createElement('template');
MRPFrom_template.innerHTML = `
	<style>
	</style>
	<slot></slot>
`


class MRPForm extends HTMLElement {
	constructor() {
		super();
		
		this.attachShadow({mode:'open'});
		this.shadowRoot.appendChild(MRPFrom_template.content.cloneNode(true));
		
		if(this.getAttribute('save') !== null){
			EventBroker.listen(this.getAttribute('save') + "_mrp-button_clicked", this, this.save);
		}
		
		if(this.getAttribute('saveAndClose') !== null){
			EventBroker.listen(this.getAttribute('saveAndClose') + "_mrp-button_clicked", this, this.saveAndClose);
		}
		
		if(this.getAttribute('cancel') !== null){
			EventBroker.listen(this.getAttribute('cancel') + "_mrp-button_clicked", this, this.close);
		}
	}
	saveAndClose(){
		this.save();
		this.close();
	}
	close(){
		EventBroker.trigger(this.id + '_form_exit');
		this.restore();
	}
	save(){
		var formObj = {};
		formObj = this.saveChildren(this, formObj)
		
		formObj['FormID'] = this.id;
		
		EventBroker.trigger('MRPForm_save', formObj);
	}
	saveChildren(currentElement, formObj){
		for(var childCounter =0;childCounter<currentElement.children.length;childCounter++){
			var id = currentElement.children[childCounter].id;

			if(currentElement.children[childCounter].getValue){
				var value = currentElement.children[childCounter].getValue();
				
				if(id===""){
					console.error("All elements with values in an mrp-form need to have an id, the following element is missing one", currentElement.children[childCounter]);
				}else if(Lib.JS.isDefined(formObj[id])){
					console.error("The following ID is repated: "+ id);
				}else{
					formObj[id] = value;
				}
				
			}
			if(currentElement.children[childCounter].childElementCount>0){
				formObj = this.saveChildren(currentElement.children[childCounter],formObj);
			}
		}
		return formObj;
	}
	restore(formObj){
		//formObj = JSON.parse('{"date":"a","PRONOM":"b","PRÉNOM":"c","NOM":"d","PRÉNOM2":"e","trans-OUI":true,"trans-non":true,"date-de-naissance":"f","ÂGE":"g","phone-home":"h","phone-mobile":"i","Peut-on-s’identifier-oui":true,"Peut-on-laisser-un-message-oui":true,"ADRESSE":"k","Peut-on-envoyer-du-courrier-oui":true,"COURRIEL":"","Peut-on-envoyer-des-courriels-oui":true,"RÉFÉRENCES":"","SERVICES-DEMANDÉS-individuel":true,"FormID":"form"}')
		this.restoreChild(this,formObj);
	}
	restoreChild(currentElement, formObj){
		for(var childCounter =0;childCounter<currentElement.children.length;childCounter++){
			var id = currentElement.children[childCounter].id;
			
			if(id !=="" && Lib.JS.isDefined(formObj[id])){
				currentElement.children[childCounter].setValue(formObj[id]);
			}
			
			if(currentElement.children[childCounter].childElementCount>0){
				this.restoreChild(currentElement.children[childCounter],formObj);
			}
		}
	}
}
window.customElements.define('mrp-form', MRPForm)