const MRPcalendar_template = document.createElement('template');
MRPcalendar_template.innerHTML = `
	<link rel="stylesheet" href="libs/Calendar/main.css">
	<div id='calendar'></div>
	<mrp-calendar-event></mrp-calendar-event>
	
`
	
/*todo
	-using multiple calendars will mess up the eventBroker stuff	
	-setup ability to change single event in a group - ran into issues where changed one event in a group changed them all in the fullCalendar code
	-setup a weekly view - maybe
	-setup a today view - maybe
*/

class MRPCalendar extends HTMLElement {
	constructor() {
		super();
		this.addEventListener('click',this.handleClick);
			
		this.attachShadow({mode:'open'});
		this.shadowRoot.appendChild(MRPcalendar_template.content.cloneNode(true));
		
		this.calendarElement = this.shadowRoot.querySelector('#calendar');
		this.eventStorage = {};
		this.eventGroups = {};
		this.eventWindow = this.shadowRoot.querySelector('mrp-calendar-event');
		this.eventIDCounter = 0;
		this.eventGroupIDCounter = 0;
		
		EventBroker.listen('mrp-calendar-event-saved',this,this.handleEventChange);
		EventBroker.listen('mrp-calendar-eventMoved',this,this.handleEventMoved);

		this.calendar = new FullCalendar.Calendar(this.calendarElement, {
			eventClick: this.eventClick,
			eventDrop: this.eventMoved,
			initialDate: '2020-09-12',
			editable: true,
			selectable: true,
			businessHours: true,
			dayMaxEvents: true, // allow "more" link when too many events
			events: []
		});

		$(document).ready(function(){EventBroker.trigger('mrp-calendar-pageLoaded');}) 
		EventBroker.listen('mrp-calendar-pageLoaded',this,this.render);
		EventBroker.listen('mrp-calendar-eventClick',this,this.handleEventClicked);
	}
	render(){
		this.calendar.render();
	}
	eventMoved(info){
		EventBroker.trigger('mrp-calendar-eventMoved', info);
	}
	handleEventMoved(info){
		//If events are moved the fullCalendar events are updated fine but the stored events are not, so this function will update them
		if(Lib.JS.isDefined(info.event.groupId) && info.event.groupId !==''){
			var groupedEventIDs = this.eventGroups[info.event.groupId];
			for (var eventCounter = 0; eventCounter < groupedEventIDs.length; eventCounter++) {
				this.updateDatesOfEvent(this.calendar.getEventById(groupedEventIDs[eventCounter]));
			}
		}else{
			this.updateDatesOfEvent(info.event);
		}		
	}
	updateDatesOfEvent(calendarEvent){
		var newDate = calendarEvent.start;
		var strDate = newDate.getFullYear().toString() + '-' + String(newDate.getMonth() + 1).padStart(2, '0') + '-' + String(newDate.getDate()).padStart(2, '0');
		
		
		if(calendarEvent.end === null){
			var strEndDate = strDate;
		}else{
			var newEndDate = calendarEvent.end;
			var strEndDate = newEndDate.getFullYear().toString() + '-' + String(newEndDate.getMonth() + 1).padStart(2, '0') + '-' + String(newEndDate.getDate()).padStart(2, '0');
		}
		
		this.eventStorage[calendarEvent.id].date = strDate;
		this.eventStorage[calendarEvent.id].start = strDate + this.eventStorage[calendarEvent.id].start.substring(10,19);
		this.eventStorage[calendarEvent.id].end = strEndDate + this.eventStorage[calendarEvent.id].end.substring(10,19);
	}
	eventClick(info){
		EventBroker.trigger('mrp-calendar-eventClick', info);
	}
	handleEventClicked(info){
		
		if(this.eventWindow.isShowing){
			this.eventWindow.close();
			return false;
		}
		
		var eventID = info.event.id;
		//info.event.setProp('title',info.event.title + " clicked");
		var storedEvent = this.eventStorage[eventID];
		debugger;
		var calendarEvent = {};
		calendarEvent.title = storedEvent.title;
		calendarEvent.description = storedEvent.description;
		calendarEvent.date = storedEvent.date;
		calendarEvent.groupId = storedEvent.groupId;
		calendarEvent.numDays = storedEvent.numDays;
		calendarEvent.eventID = eventID;
		calendarEvent.orgObj = info;
		
		if(Lib.JS.isDefined(storedEvent.start) && storedEvent.start.length>10){
			calendarEvent.startTime = storedEvent.start.substring(11,19)
		}
		
		if(Lib.JS.isDefined(storedEvent.end) && storedEvent.end.length>10){
			calendarEvent.endTime = storedEvent.end.substring(11,19)
		}
		
		if(Lib.JS.isDefined(info.event.groupId) && info.event.groupId !==''){
			calendarEvent.numEvents = this.eventGroups[storedEvent.groupId].length;
		}else{
			calendarEvent.numEvents = 0;
		}
		
		this.eventWindow.show(calendarEvent);

		// change the border color just for fun
		//info.el.style.borderColor = 'red';
	}
	addEvents(events){
		for (var eventCounter = 0; eventCounter < events.length; eventCounter++) {
			this.addEvent(events[eventCounter]);
		}
	}
	handleEventChange(calendarEvent){		
		debugger;
		//An event was changed or created via the event window, now we need to update both the stored events and calendar events		
		//check for ID to see if new event of changed event
		if(Lib.JS.isDefined(calendarEvent.eventID) && !calendarEvent.changeThisEventOnly){
			
			if(Lib.JS.isDefined(calendarEvent.groupId) && calendarEvent.groupId !==''){
				var groupedEventIDs = this.eventGroups[calendarEvent.groupId];
				
				var numCurrentEvents = calendarEvent.numEvents;
				var numNeededEvents = calendarEvent.numRepeats;
				
				var numberToUpdate = numCurrentEvents;
				var numberToDelete = numCurrentEvents - numNeededEvents;
				var numberToAdd = numNeededEvents - numCurrentEvents;
				
				//update events
				for (var eventCounter = 0; eventCounter < numberToUpdate; eventCounter++) {
					calendarEvent.eventID = groupedEventIDs[eventCounter];
					calendarEvent.orgObj = {event:this.calendar.getEventById(groupedEventIDs[eventCounter])};
					calendarEvent.date = this.eventStorage[groupedEventIDs[eventCounter]].date;
					this.updateEvent(calendarEvent);
				}
				
				//delete events
				for (var eventCounter = 0; eventCounter < numberToDelete; eventCounter++) {
					var id = groupedEventIDs[groupedEventIDs.length - eventCounter-1];
					this.deleteEvent(id);
				}
				
				//add events
				this.addNewRepeatedEvents(calendarEvent.date, numberToAdd, calendarEvent);
			}else{
				this.updateEvent(calendarEvent);
			}
		}else if(calendarEvent.changeThisEventOnly){
			debugger;
			calendarEvent.orgObj = {event:this.calendar.getEventById(calendarEvent.eventID)};
			calendarEvent.date = this.eventStorage[calendarEvent.eventID].date;
			this.updateEvent(calendarEvent);
		}else{		
			if(calendarEvent.numRepeats === ''){
				this.createNewEvent(calendarEvent);
			}else{
				//if creating multiple events, create the first one as normal then change the dates for the rest
				calendarEvent.groupId = this.eventGroupIDCounter;
				this.createNewEvent(calendarEvent);
				
				var startDate = calendarEvent.year + '-' + calendarEvent.month + '-' + calendarEvent.day;
				this.addNewRepeatedEvents(startDate, parseInt(calendarEvent.numRepeats)-1, calendarEvent);
			}
			this.eventGroupIDCounter++;
		}			
	}
	deleteEvent(id){
		this.calendar.getEventById(id).remove();
		this.eventStorage[id] = undefined;
	}
	addNewRepeatedEvents(startDate, numToCreate, calendarEvent){
		for (var eventCounter = 0; eventCounter < numToCreate; eventCounter++) {
			var currentDate = this.getNewEndDate(startDate, 7*(eventCounter+1));
			
			calendarEvent.year = currentDate.substring(0,4);
			calendarEvent.month = currentDate.substring(5,7);
			calendarEvent.day = currentDate.substring(8,10);
			
			this.createNewEvent(calendarEvent);
		}
	}
	createNewEvent(calendarEvent){
		
		var newEvent = {};
		newEvent.title = calendarEvent.title;
		newEvent.id = calendarEvent.id;
		newEvent.date = calendarEvent.year + '-' + calendarEvent.month + '-' + calendarEvent.day;
		newEvent.numDays = calendarEvent.numDays;
		
		
		if(Lib.JS.isDefined(calendarEvent.groupId)){
			newEvent.groupId = calendarEvent.groupId;
		}
		
		if(Lib.JS.isDefined(calendarEvent.startTime) && calendarEvent.startTime !== ''){
			//start:'2020-09-09T16:00:00'
			newEvent.start = newEvent.date + 'T' + calendarEvent.startTime;
		}else{
			newEvent.start = newEvent.date
		}
		
		if(Lib.JS.isDefined(calendarEvent.endTime) && calendarEvent.endTime !== ''){
			newEvent.end = newEvent.date + 'T' + calendarEvent.endTime;
		}else{
			newEvent.end = newEvent.date
		}
		
		this.addEvent(newEvent);
	}
	updateEvent(calendarEvent){
		
		//check if deleting the event
		if(calendarEvent.deleteEvent){
			this.deleteEvent(calendarEvent.eventID);
			return false;
		}
		
		
		var currentEvent = this.eventStorage[calendarEvent.eventID];
		calendarEvent.orgObj.event.setProp('title',calendarEvent.title);
		this.eventStorage[calendarEvent.eventID].description = calendarEvent.description;
		
		//check for all day event
		if(Lib.JS.isUndefined(calendarEvent.numDays) || calendarEvent.numDays === ""){
			calendarEvent.orgObj.event.setAllDay(false);
			this.eventStorage[calendarEvent.eventID].start = calendarEvent.date + "T" + this.timeConverter(calendarEvent.startTime);
			calendarEvent.orgObj.event.setStart(currentEvent.start );
		
			this.eventStorage[calendarEvent.eventID].end = calendarEvent.date + "T" + this.timeConverter(calendarEvent.endTime);
			calendarEvent.orgObj.event.setEnd(currentEvent.end );
			currentEvent.numDays = '';
		}else{
			//else if all day event
			currentEvent.numDays = calendarEvent.numDays;
			currentEvent.end  = this.getNewEndDate(calendarEvent.date, calendarEvent.numDays);
			calendarEvent.orgObj.event.setEnd(currentEvent.end);
			currentEvent.start = currentEvent.date;
			calendarEvent.orgObj.event.setStart(currentEvent.start);
			calendarEvent.orgObj.event.setAllDay(true)
		}
	}
	addEvent(calendarEvent){
		calendarEvent.id = this.eventIDCounter;
		
		if(Lib.JS.isUndefined(calendarEvent.date)){
			calendarEvent.date = calendarEvent.start.substr(0,10);
		}
		
		if(Lib.JS.isUndefined(calendarEvent.start)){
			calendarEvent.start = calendarEvent.date;
		}
		
		if(Lib.JS.isUndefined(calendarEvent.end)){
			if(Lib.JS.isUndefined(calendarEvent.numDays) || calendarEvent.numDays === ""){
				calendarEvent.end = calendarEvent.start;
			}else{
				calendarEvent.end  = this.getNewEndDate(calendarEvent.start, calendarEvent.numDays);
			}
			
		}
		
		if(Lib.JS.isDefined(calendarEvent.groupId)){
			if(Lib.JS.isUndefined(this.eventGroups[calendarEvent.groupId])){
				this.eventGroups[calendarEvent.groupId] = [];
			}
			this.eventGroups[calendarEvent.groupId].push(calendarEvent.id);
		}
		
		//check the times to make sure they will work properly
		calendarEvent.end = this.checkTime(calendarEvent.end);
		calendarEvent.start = this.checkTime(calendarEvent.start);
		
		this.eventStorage[calendarEvent.id] = calendarEvent;
		this.calendar.addEvent(calendarEvent);
		this.eventIDCounter++;
	}
	getNewEndDate(start, numDays){
		var date = new Date(start);
		date.setDate(date.getDate() + (parseInt(numDays)+1));
		return date.getFullYear().toString() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
	}
	handleClick(event){
		var target = event.path[0];
		
		if(Lib.JS.isUndefined($(target).closest('td')[0])){
			return false;
		}
		
		
		var date = $(target).closest('td')[0].getAttribute('data-date');
		
		//check if clicked on existing event
		if(target.className === "fc-event-title-container" || target.className === "fc-event-title" || target.className ===  "fc-event-title fc-sticky"){
			//do nothing - clean up later
		}else{
			
			if(this.eventWindow.isShowing){
				this.eventWindow.close();
				return false;
			}
		
			debugger;
			var calendarEvent = {title:'',description:''};
			calendarEvent.year = date.substring(0,4);
			calendarEvent.month = date.substring(5,7);
			calendarEvent.day = date.substring(8,10);
			calendarEvent.eventNum = -1;
			this.eventWindow.show(calendarEvent);
		}
		return false;
		
		
		this.currentText = event.path[0].value;
		this.checkValidity();
		this.value = this.currentText;
		
		var triggerObj = {element:this, event:event, newValue:event.path[0].value};
		
		if(this.id !== ""){
			EventBroker.trigger(this.id + '_mrp-text-box_changed',triggerObj);
		}else if(this['class'] !== ""){
			EventBroker.trigger(this['class'] + '_mrp-text-box_changed',triggerObj);
		}else{
			EventBroker.trigger('mrp-text-box_changed',triggerObj);
		}
	}
	checkTime(dateTime){
		
		if(!dateTime.includes('T')){
			return dateTime;
		}
		
		var DELPOS = dateTime.search('T');
		var date = dateTime.substr(0,DELPOS);
		var time = dateTime.substr(DELPOS+1);
		
		time = this.timeConverter(time);
		
		return date + 'T' + time;
		
	}
	timeConverter(time){
		//this will conver differnt time strings into the one needed by the calendar object which is ##:##:##
		var hours = '';
		var minutes = '';
		var seconds = '';
		
		time = time.toUpperCase();
		
		var hourAdd = 0;
		
		if(time.includes('AM') || time.includes('PM')){
			if(time.includes('AM')){
				time = time.replace('AM','').trim();
			}else if(time.includes('PM')){
				time = time.replace('PM','').trim();
				hourAdd = 12;
				//hours = (parseInt(time) + 12).toString();
			}
		}
		
		var pieces = time.split(':');
		
		pieces[0] = (parseInt(pieces[0]) + hourAdd).toString()
		
		if(pieces[0].length ===1){
			hours = '0' + pieces[0];
		}else{
			hours = pieces[0];
		}
		
		if(Lib.JS.isUndefined(pieces[1]) || pieces[1].length ===0){
			minutes = '00';
		}else if(pieces[1].length ===1){
			minutes = '0' + pieces[1];
		}else{
			minutes = pieces[1];
		}
		
		if(Lib.JS.isUndefined(pieces[2]) || pieces[2].length ===0){
			seconds = '00';
		}else if(pieces[2].length ===1){
			seconds = '0' + pieces[2];
		}else{
			seconds = pieces[2];
		}
		return hours + ':' + minutes + ':' + seconds;
	}
}

window.customElements.define('mrp-calendar', MRPCalendar);