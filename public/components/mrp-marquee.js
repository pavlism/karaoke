const MRPMarquee_template = document.createElement('template');
MRPMarquee_template.innerHTML = `
	<style>
	#scroll-container {
	  height: 800px;
	  overflow: hidden;
	}

	#scroll-text {
	  height: 100%;
	  text-align: left;
	  
	  /* animation properties */
	  -moz-transform: translateY(100%);
	  -webkit-transform: translateY(100%);
	  transform: translateY(100%);
	  
	  -moz-animation: my-animation 5s linear 0s 1 paused forwards;
	  -webkit-animation: my-animation 5s 0s linear 1 paused forwards;
	  animation: my-animation 5s 0s linear 1 paused forwards;
	}

	/* for Firefox */
	@-moz-keyframes my-animation {
	  from { -moz-transform: translateY(100%); }
	  to { -moz-transform: translateY(-100%); }
	}

	/* for Chrome */
	@-webkit-keyframes my-animation {
	  from { -webkit-transform: translateY(100%); }
	  to { -webkit-transform: translateY(-100%); }
	}

	@keyframes my-animation {
	  from {
		-moz-transform: translateY(100%);
		-webkit-transform: translateY(100%);
		transform: translateY(100%);
	  }
	  to {
		-moz-transform: translateY(-100%);
		-webkit-transform: translateY(-100%);
		transform: translateY(-100%);
	  }
	}
	</style>
	<div id="scroll-container">
		<div id="scroll-text">
		</div>
	</div>
`

//TODO
//setup the pauses
//make this even if the user pauses on the video

class MRPMarquee extends HTMLElement {
	constructor() {
		super();			
		this.attachShadow({mode:'open'});
		this.shadowRoot.appendChild(MRPMarquee_template.content.cloneNode(true));
		this.lyricsDiv = this.shadowRoot.querySelector('#scroll-text');
		this.containter = this.shadowRoot.querySelector('#scroll-container');
		//this.div.style = this.style;
		this.containter.style.cssText = this.style.cssText;
		this.isPaused = true;
		this.firstPlaythrough = true;
		this.pauses = [];
		this.totalTimePauses = 0;
		this.timeouts = [];

		this.events = {};
		this.events.endedEarly = 'endedEarly';
		this.events.paused = 'paused';
		this.events.unpaused = 'unpaused';
		this.startParameters = {};
		this.externalPause = false;
		this.isPausedBeforeExternalPause = false;
	}
	restart(){
		this.start(this.startParameters.speed,this.startParameters.timing,this.startParameters.durationInSeconds);
	}
	pause(){
		this.externalPause = true;
		this.isPausedBeforeExternalPause = this.isPaused;
		this._pause();
	}
	unPause(){
		this.externalPause = false;
		if(!this.isPausedBeforeExternalPause){
			this._unPause();
		}
	}
	_pause(){
		this.lyricsDiv.style.animationPlayState = 'paused';
		this.isPaused = true;
		EventBroker.triggerBoth(this,this.events.paused,this.id + '_mrp-Marquee');
	}
	_unPause(){
		this.lyricsDiv.style.animationPlayState = 'running';
		this.isPaused = false;
		EventBroker.triggerBoth(this,this.events.unpaused,this.id + '_mrp-Marquee');
	}

	_calcStartingPont(duration){

		var lineHeight = this.lyricsDiv.children[1].offsetHeight;
		var extraPixelsBeyondHeight = this.lyricsDiv.scrollHeight - this.lyricsDiv.offsetHeight;

		//rough estimate
		var numExtraLines = Math.round(extraPixelsBeyondHeight/lineHeight);

		if(extraPixelsBeyondHeight <0){
			//if too small
			return 0;
		}else{
			//found some good measurments and averaged the rest outer - used the offset/duration to get the multipleyer numbers
			//at 2 lines return -14
			//at 13 lines return -107
			//at 25 lines return -147
			//at 37 lines return -170
			//at 48 lines return -184
			//at 60 lines return -194
			
			var multiplyer = -38.8;
			
			if(numExtraLines<13){
				multiplyer = -1*Math.round(1.69 * numExtraLines);
			}else if(numExtraLines<25){
				multiplyer = -1*Math.round(20.73 + 0.66 * (numExtraLines-12));
			}else if(numExtraLines<37){
				multiplyer = -1*Math.round(29.02 + 0.38 * (numExtraLines-24));
			}else if(numExtraLines<48){
				multiplyer = -1*Math.round(33.77 + 0.23 * (numExtraLines-36));
			}else if(numExtraLines<60){
				multiplyer = -1*Math.round(36.63 + 0.17 * (numExtraLines-48));
			}
			
			var startPoint = Math.round(multiplyer * duration /100);
			//console.log("startPoint: " + startPoint);
			return startPoint;
		}
	}
	start(speed = 100,timing = {endEarly:0},durationInSeconds = 100){
		//incase of disaply message option used
		this.lyricsDiv.style.height = '100%';

		//store the start parameters incase of restart
		this.startParameters.speed = speed;
		this.startParameters.timing = timing;
		this.startParameters.durationInSeconds = durationInSeconds;

		//remove any previous timeouts
		if(this.timeouts.length>0){
			for(let timeOutCounter = 0;timeOutCounter<this.timeouts.length;timeOutCounter++){
				clearInterval(this.timeouts[timeOutCounter]);
			}
		}

		//remove the pauses from the lyrics
		this.text = this._removeThePausesFromText();
		//console.log('speed:' + speed);

		//deal with ending early
		durationInSeconds = durationInSeconds - timing.endEarly;

		//deal with late start
		if(Lib.JS.isDefined(timing.startTime)){
			durationInSeconds = durationInSeconds - timing.startTime;
		}

		//speed = 100;
		this.durationInSeconds = Math.round(durationInSeconds*(100/speed) * 100) / 100;

		//not sure why 65%, but the text was scrolling too fast on default 65% seems
		this.durationInSeconds = this.durationInSeconds /0.70;
		this.durationInSeconds = this.durationInSeconds-this.totalTimePauses;
		
		this.containter.removeChild(this.lyricsDiv);
		this.lyricsDiv = document.createElement("div");
		this.lyricsDiv.id = "scroll-text";
		this.lyricsDiv.textContent = '';
		
		var lines = this.text.split('\n')
		for(var lineCounter = 0;lineCounter<lines.length;lineCounter++){
			var DIV =  document.createElement("DIV");
			DIV.style.minHeight = "1em";
			DIV.textContent = lines[lineCounter] + ' ';
			this.lyricsDiv.appendChild(DIV);
		}
		
		this.containter.appendChild(this.lyricsDiv)

		//get teh starting point
		this.startingPoint = this._calcStartingPont(this.durationInSeconds);

		//this.startingPoint = -194;
		this.lyricsDiv.style.animationDelay = this.startingPoint.toString() + 's';
		this.lyricsDiv.style.animationDuration = this.durationInSeconds.toString() + 's';
		this.lyricsDiv.style.animationPlayState = 'running';
		this.isPaused = false;
		
		var heightP = 100;
		//get the extra pixel neded to show everything
		var extraPixalsThatWontShow = this.lyricsDiv.scrollHeight - this.lyricsDiv.offsetHeight*2;
		
		//add in the extra part so the text ends up half way up
		extraPixalsThatWontShow = extraPixalsThatWontShow + this.lyricsDiv.offsetHeight/2
		var extraPercetage = Math.round(extraPixalsThatWontShow / this.lyricsDiv.offsetHeight*100);
		this.lyricsDiv.style.height = (heightP + extraPercetage)+ '%';
		
		//console.log('scrollHeight:' + this.lyricsDiv.scrollHeight);
		//console.log('heightP:' + (heightP + extraPercetage));
//		console.log('durationInSeconds:' + this.durationInSeconds);
		//console.log('startingPoint:' + this.startingPoint);

		this.startAtZero = true;

		if(Lib.JS.isDefined(timing.startTime)){
			var thisObj = this;
			setTimeout(function() {thisObj._pause()}, 50);
			this.startAtZero = false;
		}

		this.endEarly = false;
		if(Lib.JS.isDefined(timing.endEarly) && timing.endEarly>0){
			this.endEarly = true;
		}

		this.timing = timing;
		this._setupPauses()
		this.timer = 0;
		this.pauseCounter =0;
		EventBroker.listen("mrp-marquee_timmerTick", this, this._incrementTimer);
		this.secondInterval = setInterval(function () {EventBroker.trigger("mrp-marquee_timmerTick")}, 1000);
	}
	_incrementTimer(){
		if(!this.externalPause){
			this.timer++;
		}

		if(!this.startAtZero && this.timer >= this.timing.startTime){
			this.startAtZero = true;
			this._unPause();
		}

		if(Lib.JS.isDefined(this.timing.pauses[this.pauseCounter])){
			if(this.timer >= this.timing.pauses[this.pauseCounter].startTime && !this.timing.pauses[this.pauseCounter].pausedUsed){
				this._pause()
				this.timing.pauses[this.pauseCounter].pausedUsed = true;
			}

			if(this.timer >= this.timing.pauses[this.pauseCounter].endTime){
				this._unPause();
				this.pauseCounter++;
			}
		}

		if(this.endEarly && this.timer >= this.timing.endEarly){
			clearInterval(this.secondInterval);
			this._endEarly();
		}
	}
	_setupPauses(){
		for(var pauseCounter = 0;pauseCounter<this.timing.pauses.length;pauseCounter++){
			this.timing.pauses[pauseCounter].pausedUsed = false;
		}
	}
	_endEarly(){
		EventBroker.triggerBoth(this,this.events.endedEarly,this.id + '_mrp-Marquee');
	}
	_removeThePausesFromText(){
		this.pauses = [];
		this.totalTimePauses = 0;

		var lines = this.text.split('\n')
		for(var lineCounter = 0;lineCounter<lines.length;lineCounter++){
			if(lines[lineCounter].includes('{Pause')){
				var timing = this._getPauseTime(lines[lineCounter]);
				lines[lineCounter] = timing.line;
				this.pauses.push({whenToPause:lineCounter,pauseTime:timing.timeToPause + this.totalTimePauses})
				this.totalTimePauses = this.totalTimePauses + timing.timeToPause;
			}
		}
		return lines.join('\n');
	}
	_getPauseTime(line){
		//temp

		var leftBracketIndex = 0;
		var rightBracketIndex = 0;
		var timeToPause = 0;

		//looking for {Pause##}, can have multiple in one line
		do {
			leftBracketIndex = line.indexOf('{');
			rightBracketIndex = line.indexOf('}');
			timeToPause = timeToPause + parseInt(line.substr(leftBracketIndex+1,rightBracketIndex-1).replace('Pause',''));
			line = line.substr(0,leftBracketIndex) + line.substr(rightBracketIndex+1);
		} while (line.includes('{Pause'));
		//return the total timming to pauses and a clean line
		return {line,timeToPause};
	}
	addText(text){
		this.text = text;
		this.lyricsDiv.innerText = this.text;
	}
	getValues(){	
		//return this.list;
	}
	hide(){
		this.containter.hidden = true;
	}
	show(){
		this.containter.hidden = false;
	}
	disable(){
		//this.listUL.disabled = true;
		//this.listUL.style.backgroundColor = '#e5e6e7'
	}
	enable(){
		//this.listUL.disabled = false;
		//this.listUL.style.backgroundColor = '#ffffff'
	}
}
window.customElements.define('mrp-marquee', MRPMarquee);