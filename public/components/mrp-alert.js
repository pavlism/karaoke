const MRPAlert_template = document.createElement('template');
MRPAlert_template.innerHTML = `
	<style>
		div.alert{
			position:fixed;
			top: 30%;
			left:50%;
			width:400px;
			margin-top:-100px;
			margin-left:-200px;
			background-color:white;
			border:2px solid #111;
			box-shadow:3px 3px 8px rgba(0,0,0,0.3);
			border-radius:3px;
			text-align:center;
			z-index:21;
		}
		
		div.hidden{
			display:none;
		}

		h2{
			padding:0.5em;
			margin:0;
			font-weight:normal;
			border-bottom:1px solid #ddd;
			background-color:#1c84c6;
			color:#FFF;
		}

		div.footer{
			width:100%;
		}

		div.message {
			margin:15px;
		}
	</style>
	<div class="hidden">
		<h2 class="titleElement"></h2>
		<div class="message"></div>
		<div class="footer">
			<mrp-button id="close" success>close</mrp-button>
			<mrp-button id="yes" success>Yes</mrp-button>
			<mrp-button id="no" success>No</mrp-button>
			<mrp-file-button id="file"></mrp-file-button>
		</div>
	</div>
`


class MRPAlert extends HTMLElement {
/*TODO
make it so the alert can be used as a click box
Make it so a timmer can work with it
make it so the text on the screen can be changed
add events to listen for to close and show teh alert box
setup different styles of boxes, so instead of using setError() or setYesNo(), the style can be passed in like with the buttons
setup the ability to pass in the header and message as an attribute
*/

	constructor() {
		super();
		this.addEventListener('click',this.handleClick);
		
		this.attachShadow({mode:'open'});
		this.shadowRoot.appendChild(MRPAlert_template.content.cloneNode(true));
		this.closeButton = this.shadowRoot.querySelector('#close');
		this.yesButton = this.shadowRoot.querySelector('#yes');
		this.noButton = this.shadowRoot.querySelector('#no');
		this.fileButton = this.shadowRoot.querySelector('#file');
		this.titleElement = this.shadowRoot.querySelector('.titleElement');

		this.yesButton.id = this.id + '_' + this.yesButton.id;
		this.noButton.id = this.id + '_' + this.noButton.id;
		this.fileButton.changeID(this.id + '_' + this.fileButton.id);

		EventBroker.listen(this.fileButton, this.fileButton.events.fileLoaded, this, this._fileLoaded);
		
		//setup default type - close only
		this.yesButton.hide();
		this.noButton.hide();
		this.fileButton.hide();
		
		Lib.Comp.setupDefualtProperties(this, 'div');
		
		this.events = {};
		this.events.clicked = 'clicked';
		this.events.shown = 'shown';
		this.events.hidden = 'hidden';
		this.events.yes = 'yes';
		this.events.no = 'no';
		this.events.closed = 'closed';
		this.events.fileLoaded = 'fileLoaded';
	}
	_fileLoaded(triggerObj){
		EventBroker.trigger(this,this.events.fileLoaded, triggerObj.triggerArgs);
		this.close();
	}
	setError(title, message){
		this.changeHeader(title);
		this.changeMessage(message);
		this.titleElement.style.backgroundColor = '#ef6776';
		this.closeButton.show();
		this.yesButton.hide();
		this.noButton.hide();
		this.fileButton.hide();
	}
	setInfo(title, message){
		this.changeHeader(title);
		this.changeMessage(message);
		this.titleElement.style.backgroundColor = '#1c84c6';
		this.closeButton.show();
		this.yesButton.hide();
		this.noButton.hide();
		this.fileButton.hide();
	}
	setYesNo(title, message){
		this.changeHeader(title);
		this.changeMessage(message);
		this.closeButton.hide();
		this.yesButton.show();
		this.noButton.show();
		this.fileButton.hide();
	}
	setFile(title, message){
		this.changeHeader(title);
		this.changeMessage(message);
		this.closeButton.show();
		this.yesButton.hide();
		this.noButton.hide();
		this.fileButton.show();
	}
	changeHeader(header){
		this.shadowRoot.querySelector(".titleElement").textContent = header;
	}
	changeMessage(message){
		this.shadowRoot.querySelector(".message").textContent = message;
	}
	handleClick(event){
		//check if the close button was pressed
		if(event.path[3] === this.shadowRoot.querySelector('mrp-button') || event.path[2] === this.shadowRoot.querySelector('mrp-button')){
			this.close();

			if(this.shadowRoot.querySelector('mrp-button').id === 'close'){
				EventBroker.trigger(this,this.events.closed);
			}else if(this.shadowRoot.querySelector('mrp-button').id === 'yes'){
				EventBroker.trigger(this,this.events.yes);
			}else if(this.shadowRoot.querySelector('mrp-button').id === 'no'){
				EventBroker.trigger(this,this.events.no);
			}
			return false;
		}

		if(event.path[0].id === "alertButton_" + this.id || event.path[1].id === "alertButton_" + this.id){
			//this.triggerClose();
		}
		
		var triggerObj = {element:this, event:event};

		if(event.path[3].id === 'yes' || event.path[2] === 'yes' || event.path[2].id === 'yes' ){
			triggerObj.answer = 'yes';
			this.close();
			EventBroker.trigger(this,this.events.yes);
		}else if(event.path[3].id === 'no' || event.path[2] === 'no' || event.path[2].id === 'no'){
			triggerObj.answer = 'no';
			this.close();
			EventBroker.trigger(this,this.events.no);
		}
		
		if(this.id !== ""){
			EventBroker.trigger(this.id + '_mrp-alert_clcked',triggerObj);
			EventBroker.trigger(this,this.events.clicked);
		}else if(this['class'] !== ""){
			EventBroker.trigger(this['class'] + '_mrp-alert_clcked',triggerObj);
		}else{
			EventBroker.trigger('mrp-alert_clcked',triggerObj);
		}
	}
	addTimer(){
		debugger;
	}
	show(){
		if(this.shadowRoot.querySelector(".hidden")!= null){
			this.shadowRoot.querySelector(".hidden").className = 'alert';
			EventBroker.trigger(this,this.events.shown);
		}
	}
	hide(){
		this.close();
		EventBroker.trigger(this,this.events.hidden);
	}
	close(){
		if(this.shadowRoot.querySelector(".alert")!= null){
			this.shadowRoot.querySelector(".alert").className = 'hidden';
		}
		return false;
		
		clearTimeout(this.timeout);
		
		this.toggle = false;
		
		var triggerObj = {element:this, event:event};
		
		if(this.id !== ""){
			EventBroker.trigger(this.id + '_mrp-alert_closed',triggerObj);
		}else if(this['class'] !== ""){
			EventBroker.trigger(this['class'] + '_mrp-alert_closed',triggerObj);
		}else{
			EventBroker.trigger('mrp-alert_closed',triggerObj);
		}
	}
}
window.customElements.define('mrp-alert', MRPAlert)