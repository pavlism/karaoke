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

		//EventBroker.listen("moveSongFromListDown_playList_mrp-button_clicked", this, this._moveDown);
	}
	pause(){
		this.lyricsDiv.style.animationPlayState = 'paused'
		this.isPaused = true
	}
	unPause(){
		this.lyricsDiv.style.animationPlayState = 'running';
		this.isPaused = false;
	}
	_calcStartingPont(duration){
		var lineHeight = this.lyricsDiv.children[1].offsetHeight;
		var extraPixelsBeyondHeight = this.lyricsDiv.scrollHeight - this.lyricsDiv.offsetHeight;
		
		//rough estimate
		var numExtraLines = Math.round(extraPixelsBeyondHeight/lineHeight);
		
		if(extraPixelsBeyondHeight <0){
			//iff too small
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
			console.log("startPoint: " + startPoint);
			return startPoint;
		}
	}
	start(speed = 100,timming = {},durationInSeconds = 100){

		//deal with the pauses
		this._dealWithPauses();

		//speed = 100;
		this.durationInSeconds = Math.round(durationInSeconds*(100/speed) * 100) / 100;		
		
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
		
		this.startingPoint = this._calcStartingPont(this.durationInSeconds);
		
		//this.startingPoint = -194;
		
		this.lyricsDiv.style.animationDelay = this.startingPoint.toString() + 's';
		this.lyricsDiv.style.webkitAnimationDelay = this.startingPoint.toString() + 's';
		
		
		this.lyricsDiv.style.animationDuration = this.durationInSeconds.toString() + 's';
		this.lyricsDiv.style.webkitAnimationDuration =  this.durationInSeconds.toString() + 's';
		this.lyricsDiv.style.animationPlayState = 'running';
		this.isPaused = false;
		
		var heightP = 100;
		//get the extra pixel neded to show everything
		var extraPixalsThatWontShow = this.lyricsDiv.scrollHeight - this.lyricsDiv.offsetHeight*2;
		
		//add in the extra part so the text ends up half way up
		extraPixalsThatWontShow = extraPixalsThatWontShow + this.lyricsDiv.offsetHeight/2
		var extraPercetage = Math.round(extraPixalsThatWontShow / this.lyricsDiv.offsetHeight*100);
		this.lyricsDiv.style.height = (heightP + extraPercetage)+ '%';
		
//		console.log('scrollHeight:' + this.lyricsDiv.scrollHeight);
//		console.log('heightP:' + (heightP + extraPercetage));
//		console.log('durationInSeconds:' + this.durationInSeconds);
//		console.log('startingPoint:' + this.startingPoint);
		
	}
	_dealWithPauses(){
		debugger;
		//remove the pauses from the lyrics

		//use the duration to estimated what time the pauses will show up.
		//Each line should see and equal amount of time on the screen, so duration/numlines *get real lines show* with give you how long each line will take
		//then simple calcs to determine when to put in the pause
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