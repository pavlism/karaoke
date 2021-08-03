const MRPCalendarEvent_template = document.createElement('template');
MRPCalendarEvent_template.innerHTML = `
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
			text-align: left;
		}
	</style>
	<div class="hidden">
		<h2 class="titleElement"></h2>
		<div class="message">
			<div>Title:<mrp-text-box id='title'></mrp-text-box></div>
			<div>Description:<mrp-text-area id='description'></mrp-text-area></div>
			<div>All Day:<mrp-check-box id='allDay'></mrp-check-box></div>
			<div id='timeStartDiv'>Start Time:<mrp-text-box id='timeStart'></mrp-text-box></div>
			<div id='timeEndDiv'>End Time:<mrp-text-box id='timeEnd'></mrp-text-box></div>
			<div id='numDaysDiv' class='hidden'>Num Days:<mrp-text-box id='numDays'></mrp-text-box></div>
			<div>Repeat Event Every Week:<mrp-check-box id='repeatEvent'></mrp-check-box></div>
			<div id='numRepeatsDiv' class='hidden'>Number of weeks to repeat event:<mrp-text-box id='numRepeats'></mrp-text-box></div>
		</div>
		<div class="footer">
			<mrp-button success id='mrp-calendar-event-save'>save</mrp-button>
			<mrp-button success id='mrp-calendar-event-delete'>delete</mrp-button>
			<mrp-button success id='mrp-calendar-event-close'>close</mrp-button>
		</div>
	</div>
	<mrp-alert id='mrp-calendar-event-message-box'></mrp-alert>
`


class MRPCalendarEvent extends HTMLElement {

	constructor() {
		super();
		this.addEventListener('click',this.handleClick);
		
		this.attachShadow({mode:'open'});
		this.shadowRoot.appendChild(MRPCalendarEvent_template.content.cloneNode(true));

		this.titleBox = this.shadowRoot.querySelector('#title');
		this.descriptionBox = this.shadowRoot.querySelector('#description');
		this.startTime = this.shadowRoot.querySelector('#timeStart');
		this.endTime = this.shadowRoot.querySelector('#timeEnd');
		this.allDayBox = this.shadowRoot.querySelector('#allDay');
		this.repeatEventBox = this.shadowRoot.querySelector('#repeatEvent');
		this.numRepeatsBox = this.shadowRoot.querySelector('#numRepeats');
		this.numDaysBox = this.shadowRoot.querySelector('#numDays');
		this.closeButton = this.shadowRoot.querySelector('#mrp-calendar-event-close');
		this.messageBox = this.shadowRoot.querySelector('mrp-alert');
		this.messageBox.setYesNo();
		this.isShowing = false;

		Lib.Comp.setupDefualtProperties(this, 'div');
		EventBroker.listen('mrp-calendar-event-save_mrp-button_clicked',this,this.updateEvent);
		EventBroker.listen('allDay_mrp-check-box_changed',this,this.allDayChanged);
		EventBroker.listen('repeatEvent_mrp-check-box_changed',this,this.repeatsChanged);
		EventBroker.listen('mrp-calendar-event-message-box_mrp-alert_clcked',this,this.checkMessageBoxAnswer);
		EventBroker.listen('mrp-calendar-event-delete_mrp-button_clicked',this,this.deleteEvents);
	}
	allDayChanged(event){
		if(event.newValue){
			this.startTime.disable();
			this.endTime.disable();
			this.shadowRoot.querySelector('#timeStartDiv').className = 'hidden';
			this.shadowRoot.querySelector('#timeEndDiv').className = 'hidden';
			this.shadowRoot.querySelector('#numDaysDiv').className = '';
			this.numDaysBox.setValue('1');
		}else{
			this.startTime.enable();
			this.endTime.enable();
			this.shadowRoot.querySelector('#timeStartDiv').className = '';
			this.shadowRoot.querySelector('#timeEndDiv').className = '';
			this.shadowRoot.querySelector('#numDaysDiv').className = 'hidden';
			this.numDaysBox.setValue('');
		}
	}
	repeatsChanged(event){
		if(event.newValue){
			this.shadowRoot.querySelector('#numRepeatsDiv').className = '';
			this.numRepeatsBox.setValue('2');
		}else{
			this.shadowRoot.querySelector('#numRepeatsDiv').className = 'hidden';
			this.numRepeatsBox.setValue('');
		}
	}
	deleteEvents(){
		this.calendarEvent.deleteEvent = true;
		this.finishUpdate();
	}
	updateEvent(){
		this.calendarEvent.title = this.titleBox.getValue();
		this.calendarEvent.description = this.descriptionBox.getValue();
		this.calendarEvent.startTime = this.startTime.getValue();
		this.calendarEvent.endTime = this.endTime.getValue();
		this.calendarEvent.numDays = this.numDaysBox.getValue();
		this.calendarEvent.deleteEvent = false;
		
		if(this.calendarEvent.numDays !=='' && this.calendarEvent.numDays !=='0'){
			this.calendarEvent.startTime = '';
			this.calendarEvent.endTime = '';
		}
		
		this.calendarEvent.numRepeats = this.numRepeatsBox.getValue();
		
		this.finishUpdate();
		
		/*
		allows for a message box to be popped up - feature turned off for now
		if(this.calendarEvent.numRepeats !== ''){
			this.messageBox.changeHeader('Warning');
			this.messageBox.changeMessage('Do you want the changes to affect all the events?');
			this.messageBox.show();
		}else{
			this.finishUpdate();
		}*/
	}
	checkMessageBoxAnswer(messageBoxObj){
		//check to make sure the user clikced the yes or no butttons
		if(Lib.JS.isUndefined(messageBoxObj.answer)){
			return false;
		}
		
		
		if(messageBoxObj.answer ==='yes'){
			this.calendarEvent.changeThisEventOnly = false;
		}else{
			this.calendarEvent.changeThisEventOnly = true;
		}
		this.finishUpdate();
	}
	finishUpdate(){
		EventBroker.trigger('mrp-calendar-event-saved', this.calendarEvent);
		this.close();
	}
	changeHeader(header){
		this.shadowRoot.querySelector(".titleElement").textContent = header;
	}
	changeMessage(message){
		this.shadowRoot.querySelector(".message").textContent = message;
	}
	handleClick(event){
		//check if the close button was pressed
		if(event.path[3] === this.closeButton || event.path[2] === this.closeButton){
			this.close();
			return false;
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
	show(calendarEvent){
		this.calendarEvent = calendarEvent;
		if(this.shadowRoot.querySelector(".hidden")!= null){
			this.shadowRoot.querySelector(".hidden").className = 'alert';
		}
		
		this.setupField(this.titleBox, calendarEvent.title);
		this.setupField(this.descriptionBox, calendarEvent.description);
		this.setupField(this.startTime, calendarEvent.startTime);
		this.setupField(this.endTime, calendarEvent.endTime);
		
		
		//if an all day event
		if(Lib.JS.isDefined(calendarEvent.numDays) && calendarEvent.numDays !==''){
			this.allDayChanged({newValue:true});
			this.allDayBox.setValue(true);
		}
		
		this.setupField(this.numDaysBox, calendarEvent.numDays);
		
		//if reapeted event
		if(calendarEvent.numEvents>0){
			this.repeatEventBox.setValue(true);
			this.repeatsChanged({newValue:true});
			this.numRepeatsBox.setValue(calendarEvent.numEvents);
		}

		this.isShowing = true;
	}
	setupField(field, property){
		if(Lib.JS.isDefined(property)){
			field.addText(property);
		}else{
			field.addText('');
		}
	}
	close(){
		if(this.shadowRoot.querySelector(".alert")!= null){
			this.shadowRoot.querySelector(".alert").className = 'hidden';
		}
		this.isShowing = false;
		
		//reset the changes from the allday checkbox
		this.allDayBox.setValue(false);
		this.repeatEventBox.setValue(false);
		this.allDayChanged({newValue:false});
		this.repeatsChanged({newValue:false});
	}
}
window.customElements.define('mrp-calendar-event', MRPCalendarEvent)