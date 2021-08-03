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
		<div>
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
	start(durationInSeconds = 100, startingPoint = 0){
		this.durationInSeconds = durationInSeconds;
		this.startingPoint = startingPoint;
		
		this.containter.removeChild(this.lyricsDiv);
		this.lyricsDiv = document.createElement("div");
		this.lyricsDiv.id = "scroll-text";
		this.lyricsDiv.innerText = this.text;
		this.containter.appendChild(this.lyricsDiv)
		
		this.lyricsDiv.style.animationDelay = this.startingPoint.toString() + 's';
		this.lyricsDiv.style.webkitAnimationDelay = this.startingPoint.toString() + 's';
		
		this.lyricsDiv.style.animationDuration = this.durationInSeconds.toString() + 's';
		this.lyricsDiv.style.webkitAnimationDuration =  this.durationInSeconds.toString() + 's';
		this.lyricsDiv.style.animationPlayState = 'running';
		this.isPaused = false;
		
		//since the animation doesn't go all the way up for some reason I need to adjust the height of the inner div
		var numLines = this.text.split('\n').length;
		var newHeight = 110 + Math.round((numLines - 56)/3*10);
		this.lyricsDiv.style.height = newHeight + '%';
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