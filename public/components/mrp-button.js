const MRPButton_template = document.createElement('template');
MRPButton_template.innerHTML = `
	<style>
	button { 
                border-radius: 3px;
                padding: 7px 12px;
                font-size: 14px;
                line-height: 1.4;
                font-weight: 400;
                text-align: center;
                white-space: nowrap;
                vertical-align: middle;
                touch-action: manipulation;
                cursor: pointer;
                background-image: none;

                margin-bottom: 0; // For input.btn
                text-align: center;
                vertical-align: middle;
                border: 1px solid transparent;
                white-space: nowrap;
                margin-bottom: 5px; 

                background-color: #f2f2f2;
                border-color: rgb(231, 234, 236);
                color: rgb(103, 106, 108);
            }
            button:focus {
                background-color: #e6e6e6;
                border-color: #e6e6e6;
            }
            button:hover {
                background-color: #e6e6e6;
                border-color: #e6e6e6;
            }            
            button.primary { 
                background-color: #1ab394;
                border-color: #1ab394;
                color: #FFFFFF;
            }
            button.primary:focus, button.primary:hover {
                background-color: #18a689;
                border-color: #18a689;
            }
            button.success { 
                background-color: #1c84c6;
                border-color: #1c84c6;
                color: #FFFFFF;
            }
            button.success:focus, button.success:hover {
                background-color: #1a7bb9;
                border-color: #1a7bb9;
            }       
            button.info { 
                background-color: #23c6c8;
                border-color: #23c6c8;
                color: #FFFFFF;
            }
            button.info:focus, button.info:hover {
                background-color: #21b9bb;
                border-color: #21b9bb;
            }            
            button.warning { 
                background-color: #f9b66d;
                border-color: #f9b66d;
                color: #FFFFFF;
            }
            button.warning:focus, button.warning:hover {
                background-color: #f8ac59;
                border-color: #f8ac59;
            }
            button.danger { 
                background-color: #ef6776;
                border-color: #ef6776;
                color: #FFFFFF;
            }
            button.danger:focus, button.danger:hover {
                background-color: #ed5565;
                border-color: #ed5565;
            }
			button.disabled{
				background-color: #e5e6e7;
                border-color: #e5e6e7;
			}
			button.disabled:hover {
                background-color: #e5e6e7;
                border-color: #e5e6e7;
            } 
			button.huge { 
                padding: 10px 16px;
                font-size: 60px;
                line-height: 1.3333333;
            }
            button.large { 
                padding: 10px 16px;
                font-size: 18px;
                line-height: 1.3333333;
            }
            button.default { 
                padding: 7px 12px;
                font-size: 14px;
                line-height: 1.4;
            }
            
            button.small { 
                padding: 5px 10px;
                font-size: 12px;
                line-height: 1.5;
            }
            button.mini { 
                padding: 1px 5px;
                font-size: 12px;
                line-height: 1.5;
            }
			button.hidden { 
				display:none;
            }
	</style>
	<button><slot></slot></button>
`


class MRPButton extends HTMLElement {
	constructor() {
		super();
		this.addEventListener('click',this._handleClick);
		
		this.attachShadow({mode:'open'});
		this.shadowRoot.appendChild(MRPButton_template.content.cloneNode(true));
		this.button = this.shadowRoot.querySelector('button');

		Lib.Comp.setupDefualtProperties(this, 'button');
		
		var classname = this.getAttribute('class');
		
		if(classname ==null){
			classname = "";
		}
		
		this['classname'] = classname;
		
		if(this.getAttribute('primary')===""){
			classname = classname + " primary";
		}
		if(this.getAttribute('success')===""){
			classname = classname + " success";
		}
		if(this.getAttribute('info')===""){
			classname = classname + " info";
		}
		if(this.getAttribute('warning')===""){
			classname = classname + " warning";
		}
		if(this.getAttribute('danger')===""){
			classname = classname + " danger";
		}
		if(this.getAttribute('small')===""){
			classname = classname + " small";
		}
		if(this.getAttribute('mini')===""){
			classname = classname + " mini";
		}
		if(this.getAttribute('large')===""){
			classname = classname + " large";
		}
		if(this.getAttribute('huge')===""){
			classname = classname + " huge";
		}
		
		this['class'] = classname;
		this.shadowRoot.querySelector('button').className = classname;
		
		this.events = {};
		this.events.clicked = 'clicked';
		this.events.shown = 'shown';
		this.events.hidden = 'hidden';
		this.events.disabled = 'disabled';
		this.events.enabled = 'enabled';
	}
	_handleClick(event){
		if(this.button.disabled){
			event.preventDefault();
			return false;
		}
		
		var triggerObj = {element:this, event:event};
		if(this.id !== ""){
			EventBroker.trigger(this.id + '_mrp-button_clicked',triggerObj);
			EventBroker.trigger(this,this.events.clicked);
		}else if(this['classname'] !== ""){
			EventBroker.trigger(this['classname'] + '_mrp-button_clicked',triggerObj);
		}else{
			EventBroker.trigger('mrp-button_clicked',triggerObj);
		}
	}
	hide(){
		this.button.classList.add('hidden');
		EventBroker.trigger(this,this.events.hidden);
	}
	show(){
		this.button.classList.remove('hidden');
		EventBroker.trigger(this,this.events.shown);
	}
	disable(){
		this.button.disabled = true;
		this.button.classList.add('disabled');
		EventBroker.trigger(this,this.events.disabled);
	}
	enable(){
		this.button.disabled = false;
		this.button.classList.remove('disabled');
		EventBroker.trigger(this,this.events.enabled);
	}
}

window.customElements.define('mrp-button', MRPButton)