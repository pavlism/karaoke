const Upload_template = document.createElement('template');
Upload_template.innerHTML = `
	<div style="padding-left: 757px;">
	<ul style="list-style-type:none;">
		<li><mrp-file-button primary id="Upload_MyEZClaim">Upload MyEZClaim Data:</mrp-file-button></li>
		<li><mrp-file-button primary id="Upload_UPS">Upload UPS:</mrp-file-button></li>
		<li><mrp-file-button primary id="Upload_DHL">Upload DHL:</mrp-file-button></li>
		<li><mrp-file-button primary>Upload ect:</mrp-file-button></li>
	</ul>
	<mrp-button primary id="print_reports">Print Merged and Unmerged</mrp-button>
	</div>
	<mrp-alert></mrp-alert>
`

class UploadPage extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({mode:'open'});
		this.shadowRoot.appendChild(Upload_template.content.cloneNode(true));
		
		EventBroker.listen("excel-file-parsed", this, this.parseExcelFile);
		
		EventBroker.listen("Upload_MyEZClaim_mrp-file-button_fileSelected", this, this.uploadMyEZClaimData);
		EventBroker.listen("Upload_MyEZClaim_fileReady", this, this.addMyEZClaimToDataBase);
		
		EventBroker.listen("Upload_DHL_mrp-file-button_fileSelected", this, this.uploadDHLData);
		EventBroker.listen("Upload_DHL_fileReady", this, this.addDHLToDataBase);
		
		EventBroker.listen("Upload_UPS_mrp-file-button_fileSelected", this, this.uploadUPSData);
		EventBroker.listen("Upload_UPS_fileReady", this, this.addUPSToDataBase);
	}	
	
	uploadMyEZClaimData(comoponent,event){	
		comoponent.triggerString = "Upload_MyEZClaim_fileReady";
		comoponent.excelToJSON(event.files[0]);
	}
	addMyEZClaimToDataBase(comoponent,data){
		
		//check fro empty sheet		
		if(data.length ===1 && data[0]['Claim Number']==''){
			return false;
		}

		comoponent.setupAlert("Uploading MyEZYClaim Data", "Uploading 1 out of " + data.length.toString());
		
		addRecord(comoponent, data, 0);
		
		async function addRecord(component, data, counter, error = ""){
			
			var options = {};
			options.method = 'POST';
			options.body=JSON.stringify(data[counter]);
			
			options.headers={'Content-Type':'application/json'}
			const response = await fetch('/api/record',options);
			
			if(response.status !=200){
				debugger;
				error = error + "Row # " + (counter+1).toString() + " was not added \n"
			}
			
			counter++;
			console.log(counter + "/" + data.length);
			component.shadowRoot.querySelector("mrp-alert").changeMessage("Uploading " + counter + " out of " + data.length.toString());
			if(counter < data.length){
				addRecord(component, data, counter, error);
			}else{
				if(error !==""){
					component.shadowRoot.querySelector("mrp-alert").changeMessage("Finsihed uploading all "+data.length.toString() + " records \n" + error);
				}else{
					component.shadowRoot.querySelector("mrp-alert").changeMessage("Finsihed uploading all "+data.length.toString() + " records");
				}
			}
			
		}
	}
	
	uploadDHLData(comoponent,event){	
		comoponent.triggerString = "Upload_DHL_fileReady";
		comoponent.excelToJSON(event.files[0]);
	}
	addDHLToDataBase(comoponent,data){
		comoponent.setupAlert("Uploading DHL Data", "Uploading 1 out of of " + data.length.toString());
		addRecord(comoponent, data, 0);
		
		async function addRecord(component, data, counter){
			
			var options = {};
			var error = '';
			options.method = 'POST';
			var paredData = {};
			paredData['DHL Comments'] = "no comment";
			paredData['PRO Number'] = "";
			paredData['AccountNumber'] = "";
			paredData['DHL_BolNumber'] = "";
			
			if(Lib.JS.isDefined(data[counter]['DHL COMMENTS'])){
				paredData['DHL Comments'] = data[counter]['DHL COMMENTS'];
			}
			
			paredData['PRO Number'] = data[counter]['ClaimCarrierTrackingNum'];
			paredData['AccountNumber'] = data[counter]['AccountNumber'];
			paredData['DHL_BolNumber'] = data[counter]['BOLNumber'];

			if(paredData['PRO Number'] !== ''){
				options.body=JSON.stringify(paredData);
			
				options.headers={'Content-Type':'application/json'}
				const response = await fetch('/api/dhl',options);
				
				if(response.status !=200){
					debugger;
					error = error + "Row # " + (counter+1).toString() + " was not added \n"
				}
			}

			counter++;
			console.log(counter + "/" + data.length);
			component.shadowRoot.querySelector("mrp-alert").changeMessage("Uploading " + counter + " out of " + data.length.toString());
			if(counter < data.length){
				addRecord(component, data, counter);
			}else{
				if(error !==""){
					component.shadowRoot.querySelector("mrp-alert").changeMessage("Finsihed uploading all "+data.length.toString() + " records \n" + error);
				}else{
					component.shadowRoot.querySelector("mrp-alert").changeMessage("Finsihed uploading all "+data.length.toString() + " records");
				}
			}
		}
	}
		
	uploadUPSData(comoponent,event){	
		comoponent.triggerString = "Upload_UPS_fileReady";
		comoponent.excelToJSON(event.files[0]);
	}
	addUPSToDataBase(comoponent,data){
		comoponent.setupAlert("Uploading UPS Data", "Uploading 1 out of of " + data.length.toString());
		addRecord(comoponent, data, 0);
		
		async function addRecord(component, data, counter){
			var options = {};
			var error = '';
			options.method = 'POST';
			var paredData = {};
			paredData['ClaimNum'] = "";
			paredData['CarrierComment'] = "no comment";
			paredData['PRO Number'] = "";			
			
			paredData['ClaimNum'] = data[counter]['Claim #'];
			paredData['CarrierComment'] = data[counter]['Claim Status'];
			paredData['PRO Number'] = data[counter]['Tracking #'];

			//if(paredData['PRO Number'] !== ''){
				options.body=JSON.stringify(paredData);
			
				options.headers={'Content-Type':'application/json'}
				const response = await fetch('/api/ups',options);
				
				if(response.status !=200){
					debugger;
					error = error + "Row # " + (counter+1).toString() + " was not added \n"
				}
			//}

			counter++;
			console.log(counter + "/" + data.length);
			component.shadowRoot.querySelector("mrp-alert").changeMessage("Uploading " + counter + " out of " + data.length.toString());
			if(counter < data.length){
				addRecord(component, data, counter);
			}else{
				if(error !==""){
					component.shadowRoot.querySelector("mrp-alert").changeMessage("Finsihed uploading all "+data.length.toString() + " records \n" + error);
				}else{
					component.shadowRoot.querySelector("mrp-alert").changeMessage("Finsihed uploading all "+data.length.toString() + " records");
				}
			}
		}
	}
	
	setupAlert(header, message){
		this.shadowRoot.querySelector("mrp-alert").changeHeader(header);
		this.shadowRoot.querySelector("mrp-alert").changeMessage(message);
		this.shadowRoot.querySelector("mrp-alert").show();
	}
	
	parseExcelFile(comoponent,rawData){
		var data = [];
		var row = 1;
		var col = 'A';
		var cell = '';
		var headerCounter = 0;
		
		//change header lines based on file
		if(comoponent.triggerString == "Upload_MyEZClaim_fileReady"){
			row = 5;
		}
		
		//get the headers
		
		var headers = [];
		
		do {
			if(Lib.JS.isDefined(rawData[col + row.toString()])){
				cell = rawData[col + row.toString()].v;
				col = comoponent.increasCol(col);
			}else{
				break;
			}

			headers.push(cell)
		}while (col !== 'BZ');
		
		//loop through rest of data
		row++;
		col = 'A';
		
		do {
			var rowObject = {};
			rowObject['Status Code'] = '';
			rowObject['Carrier Name'] = '';
			rowObject['Freight Bill (PRO) Document'] = '';
			rowObject['Consignee Name'] = '';
			rowObject['Consignee Address Line3'] = '';
			rowObject['Claim Number'] = '';
			rowObject['Claim Amount'] = '';
			rowObject['Date Filed'] = '';
			rowObject['Date Mailed'] = '';
			rowObject['Company Name'] = '';
			rowObject['Shipper Name'] = '';
			rowObject['Consignee Name1'] = '';
			rowObject['Reason Code'] = '';
			rowObject['Date Requested'] = '';
			rowObject['Shipment Date'] = '';
			rowObject['Date Paid (Last)'] = '';
			rowObject['Date Closed'] = '';
			rowObject['Date Filed1'] = '';
			rowObject['Date Mailed1'] = '';
			rowObject['Date Requested1'] = '';

			for (headerCounter = 0; headerCounter < headers.length; headerCounter++) {
				
				if(Lib.JS.isDefined(rawData[col + row.toString()])){
					cell = rawData[col + row.toString()].v;
					//check for quotes
					if(cell.toString().indexOf('"')>-1){
						console.log(cell);
						cell = Lib.JS.replaceQuotes(cell);
					}
					
					
					rowObject[headers[headerCounter]] = cell;
				}else{
					rowObject[headers[headerCounter]] = '';
				}
				col = comoponent.increasCol(col);
			}
			
			row++;
			data.push(rowObject);
			col = 'A';
			if(!Lib.JS.isDefined(rawData[col + row.toString()])){
				if(comoponent.isRowBlank(rawData, headers, row)){
					if(comoponent.isRowBlank(rawData, headers, row+1)){
						if(comoponent.isRowBlank(rawData, headers, row+2)){
							if(comoponent.isRowBlank(rawData, headers, row+3)){
								break;
							}
						}
					}else{
						row++;
					}
				}
			}			
		}while (row <= 50000);

		EventBroker.trigger(comoponent.triggerString,data);
	}
	isRowBlank(rawData, headers, row){
		var col = 'A'
		for (var headerCounter = 0; headerCounter < headers.length; headerCounter++) {
			if(Lib.JS.isDefined(rawData[col + row.toString()])){
				return false;
			}
			col = this.increasCol(col);
		}
		return true;
	}
	increasCol(col){
		var newCol = "";

		if(col =='Z'){
			newCol = "AA";
		}else if(col.length ==1){
			var ascii = col.charCodeAt(0);
			ascii = ascii + 1;		
			newCol = String.fromCharCode(ascii);
		}else{
			var ascii = col.charCodeAt(1);
			var firstLetter = col.substring(0, 1);
			ascii = ascii + 1;		
			newCol = firstLetter + String.fromCharCode(ascii);
		}
		
		return newCol;
	}
	excelToJSON(file) {
		
		//TODO change the screen dispaly to show updating database screen
		
		var reader = new FileReader();
		var triggerString = "text";

		reader.onload = function(e) {
			var data = e.target.result;
			var workbook = XLSX.read(data, {type: 'binary'});

			workbook.SheetNames.forEach(function(sheetName) {
				// Here is your object
				EventBroker.trigger("excel-file-parsed",workbook.Sheets[sheetName]);
			});

		};

		reader.onerror = function(ex) {
			debugger;
			console.log(ex);
		};

		reader.readAsBinaryString(file);
	};
}

window.customElements.define('uplaod-page', UploadPage);