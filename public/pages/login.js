const Login_template = document.createElement('template');
Login_template.innerHTML = `
	<div class="login-box-div" style="margin-left: 45%;margin-top: 5%;">
	User Name <mrp-text-box id="login_userName"></mrp-text-box><br>
	Password <mrp-text-box id="login_password" password></mrp-text-box><br>
	<mrp-button id="login_button">Log In</mrp-button>
	<div id="login-error" style="font-size: x-large;color: red;display: none;">Incorrect Username or password</div>
	</div>
`

class LoginPage extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({mode:'open'});
		this.shadowRoot.appendChild(Login_template.content.cloneNode(true));

		EventBroker.listen("login_button_mrp-button_clicked", this, this.checkLogin);		
	}
	checkLogin(component){
		var username = component.shadowRoot.querySelector('#login_userName').currentText;
		var password = component.shadowRoot.querySelector('#login_password').currentText;
		var apiCall = 'api/login/?username=' + username + '&password=' + password;
		
		setupTable(component, apiCall);
		
		async function setupTable(component, apiCall){			
			const response = await fetch(apiCall);
			const data = await response.json();
			
			debugger;
			
			if(data){
				cleanDB(component);
		
				async function cleanDB(component){			
					const response = await fetch('api/clean');
					const data = await response.json();
					
					EventBroker.trigger('login Successful');
				}
			}else{
				component.shadowRoot.querySelector('#login-error').style.display = '';
			}
		}
	}
}

window.customElements.define('login-page', LoginPage);