//test
//test
//test
//test
//test
//test
const Navigation_template = document.createElement('template');
Navigation_template.innerHTML = `
	<style>
	nav {
	margin: 27px auto 0;

	position: relative;
	width: 310px;
	height: 50px;
	background-color: #34495e;
	border-radius: 8px;
	font-size: 0;
	margin-bottom: 20px;
}
nav a {
	line-height: 50px;
	height: 100%;
	font-size: 15px;
	display: inline-block;
	position: relative;
	z-index: 1;
	text-decoration: none;
	text-transform: uppercase;
	text-align: center;
	color: white;
	cursor: pointer;
}
nav .animation {
	position: absolute;
	height: 100%;
	top: 0;
	z-index: 0;
	transition: all .5s ease 0s;
	border-radius: 8px;
}
a:nth-child(1) {
	width: 100px;
}
a:nth-child(2) {
	width: 110px;
}
a:nth-child(3) {
	width: 100px;
}
a:nth-child(4) {
	width: 160px;
}
a:nth-child(5) {
	width: 120px;
}
nav .start-report, a:nth-child(1):hover~.animation {
	width: 100px;
	left: 0;
	background-color: #1abc9c;
}
nav .start-uplaod, a:nth-child(2):hover~.animation {
	width: 110px;
	left: 100px;
	background-color: #e74c3c;
}
nav .start-admin, a:nth-child(3):hover~.animation {
	width: 100px;
	left: 210px;
	background-color: #3498db;
}
nav .start-portefolio, a:nth-child(4):hover~.animation {
	width: 160px;
	left: 310px;
	background-color: #9b59b6;
}
nav .start-contact, a:nth-child(5):hover~.animation {
	width: 120px;
	left: 470px;
	background-color: #e67e22;
}
	</style>

	<nav>
	<a href="#">Report</a>
	<a href="#">Upload</a>
	<a href="#">Admin</a>
	<div class="animation start-uplaod"></div>
</nav>
`

class Navitgation extends HTMLElement {
	constructor() {
		super();
		this.addEventListener('click',this.handleClick);
		this.attachShadow({mode:'open'});
		this.shadowRoot.appendChild(Navigation_template.content.cloneNode(true));
	}
	handleClick(event){
		EventBroker.trigger("pageChanged", event.path[0].text);

		if(event.path[0].text==='Report'){
			this.shadowRoot.querySelector("div").className = "animation start-report";
		}
		
		if(event.path[0].text==='Upload'){
			this.shadowRoot.querySelector("div").className = "animation start-uplaod";
		}
		
		if(event.path[0].text==='Admin'){
			this.shadowRoot.querySelector("div").className = "animation start-admin";
		}
	}
}

window.customElements.define('navitgation-panel', Navitgation);