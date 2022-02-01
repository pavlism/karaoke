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

//add in the adlity to set a defualt value

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

		this.events = {};
		this.events.endedEarly = 'endedEarly';
		this.events.paused = 'paused';
		this.events.unpaused = 'unpaused';
	}
	pause(){
		this.lyricsDiv.style.animationPlayState = 'paused'
		this.isPaused = true
		EventBroker.triggerBoth(this,this.events.paused,this.id + '_mrp-Marquee');
	}
	unPause(){
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

		//TODO remove below
		timing.endEarly = 120;

		debugger;

		//remove the pauses from the lyrics
		this.text = this._removeThePausesFromText();
		//console.log('speed:' + speed);

		//deal with ending early
		this._setupEarlyEnding(timing.endEarly, durationInSeconds);
		durationInSeconds = durationInSeconds - timing.endEarly;

		//speed = 100;
		this.durationInSeconds = Math.round(durationInSeconds*(100/speed) * 100) / 100;

		//not sure why 65%, but the text was scrolling too fast on default 65% seems
		this.durationInSeconds = this.durationInSeconds /0.70;

		this.durationInSeconds = this.durationInSeconds-this.totalTimePauses;

		//console.log('this.durationInSeconds:' + this.durationInSeconds);
		
		//this.durationInSeconds = 500;
		
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

		//setup the timmings for the pauses
		this._setupTimingForPauses(this.durationInSeconds);

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

		this._setupPausesTimeout();
	}
	_setupEarlyEnding(endEarly, duration){
		if(endEarly===0){
			return false;
		}

		Lib.JS.setTimeout(this,this._endEarly,(duration-endEarly) * 1000);
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
	_setupTimingForPauses(duration){
		//use the duration to estimated what time the pauses will show up.
		//Each line should see and equal amount of time on the screen, so duration/numlines *get real lines show* with give you how long each line will take
		var lineHeight = this.lyricsDiv.children[1].offsetHeight;

		//rough estimate
		var numLines = Math.round(this.lyricsDiv.scrollHeight/lineHeight);
		var timePerLine = duration/numLines;
		var timeInSecondsToPause = 0;

		//loop though each pause and setting the pause Object
		for(var pauseCounter = 0;pauseCounter<this.pauses.length;pauseCounter++){
			//then simple calcs to determine when to put in the pause
			timeInSecondsToPause = Math.round(this.pauses[pauseCounter].whenToPause * timePerLine);
			this.pauses[pauseCounter].whenToPause = timeInSecondsToPause;
		}
	}
	_setupPausesTimeout(){
		this.pauseCounter = 0;

		//if pauses exists
		if(this.pauses.length>0){
			//setup listener to listen after each second.

			for(var pauseCounter = 0;pauseCounter<this.pauses.length;pauseCounter++){
				Lib.JS.setTimeout(this,this._checkPauseTimeout,this.pauses[pauseCounter].whenToPause * 1000);
			}

		}else{
			this.pauses = [];
			this.pauseObj = {};
		}
	}
	_checkPauseTimeout(){
		var timeToPause = this.pauses[this.pauseCounter].pauseTime;
		this.pause();
		Lib.JS.setTimeout(this,this.unPause,timeToPause * 1000);
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