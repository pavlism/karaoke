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
			<mrp-button success>close</mrp-button>
		</div>
	</div>
`


class MRPAlert extends HTMLElement {
/*TODO
make it so the alert can be used as a click box
Make it so a timmer can work with it
make it so the text on the screen can be changed
add events to listen for to close and show teh alert box
*/

	constructor() {
		super();
		this.addEventListener('click',this.handleClick);
		
		this.attachShadow({mode:'open'});
		this.shadowRoot.appendChild(MRPAlert_template.content.cloneNode(true));

		Lib.Comp.setupDefualtProperties(this, 'div');
		
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
			return false;
		}
		
		
		
		if(event.path[0].id === "alertButton_" + this.id || event.path[1].id === "alertButton_" + this.id){
			this.triggerClose();
		}
		
		var triggerObj = {element:this, event:event};
		
		if(this.id !== ""){
			EventBroker.trigger(this.id + '_mrp-alert_clcked',triggerObj);
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
		}
		
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