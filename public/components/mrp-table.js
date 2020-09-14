const MRPTable_template = document.createElement('template');
MRPTable_template.innerHTML = `
	<style>
				.hiddenTable{
                display: none;
            }
            .selectBox{
                padding: 0px;
                margin: 0px;
                width: 70px;
            }
            dom-if{
                display: none;
            }
            .sortAsc {
                margin-left: 10px;
                border: solid black;
                border-width: 0 3px 3px 0;
                display: inline-block;
                padding: 3px;
                transform: rotate(-135deg);
                -webkit-transform: rotate(-135deg);
            }
            .sortDesc {
                margin-left: 10px;
                border: solid black;
                border-width: 0 3px 3px 0;
                display: inline-block;
                padding: 3px;
                transform: rotate(45deg);
                -webkit-transform: rotate(45deg);
            }
           

            span.object-toggle {
                font-style: normal;
                font-weight: bolder;
                -webkit-font-smoothing: antialiased;
                padding-right: 10px;
                font-size: 14px;
                color: #8c8c8c;
                text-shadow: 2px 2px 2px #9d9d9d;
            }

            span.object-toggle-show {
                font-style: normal;
                font-weight: bolder;
                -webkit-font-smoothing: antialiased;
                padding-right: 10px;
                font-size: 14px;
                color: #8c8c8c;
                text-shadow: 2px 2px 2px #9d9d9d;
            }

            span.object-toggle:before {
                content: "˃";
            }
            span.object-toggle-show:before {
                content: '˅';
            }

            div.properties{
                display:none;
                border-top: 1px solid rgb(221, 221, 221)
            }
            div.properties_row{
                display:table-row;
            }
            div.properties_cell{
                display:table-cell;
                padding-right: 5px;

            }
            
            table td, table th{
                color: rgb(103, 106, 108);
                padding: 8px;
                border: 1px solid #dddddd;
                text-align: left;
            } 

            table{
                border-spacing: 0px;
                width:100%;
                margin-bottom: 10px;
                margin-top: 10px;
                margin-left: 5px;
                margin-right: 5px;
            }
            .pages{
                margin-left: 5px;
            }
            .text{
                margin-left: 5px;
            }
            table > tbody > tr:nth-of-type(odd) {
                background-color: #f9f9f9;
            }

            table > thead > tr > th,
            table > tbody > tr > th,
            table > tfoot > tr > th,
            table > thead > tr > td,
            table > tbody > tr > td,
            table > tfoot > tr > td {
                padding: 8px;
            }

            table > thead > tr > th,
            table > tbody > tr > th,
            table > tfoot > tr > th{
                border: 1px solid #ddd;
                border-bottom: 2px solid #ddd;
            }

            table > thead > tr > td,
            table > tbody > tr > td,
            table > tfoot > tr > td {
                border: 1px solid #ddd;
            }

            table > tbody > tr:hover {
                background-color: #e8e8e8;
            }
            table > tbody > tr.selected{
                background-color: #efefef;
            }
	</style>
	<div class="search" style="display: inline-block;padding-left: 20px;"></div>
	<div class="download" style="display: inline-block;padding-left: 20px;"></div>
	<table>
            <thead>
            </thead>
            <tbody>
            </tbody>
        </table>
		<div class="paging"></div>
`

//TODO 
// get download buttons to work
//clean up the old code that is no longer used
//get objects to work in cells
//deal with button clicks in a cell
//enfore an id for the table


class MRPTable extends HTMLElement {
	constructor() {
		super();
		
		this.currentData = [];
		
		this.buttonEvents = {};
		this.addEventListener('click',this.handleClick);
		this.attachShadow({mode:'open'});
		this.shadowRoot.appendChild(MRPTable_template.content.cloneNode(true));
		Lib.Comp.setupDefualtProperties(this, 'table');
	}
	loadData(data = []){
		if(data.length ==0){
			return false;
		}
		
		this.data = data;

		//setup Pagin
		this.handlePaging(this.data);

		//setup sorting stuff
		if(this.getAttribute('sort')===""){
			this.sort = true;
			if(this.getAttribute('sortCol')!=null){
				this.sortCol =  parseInt(this.getAttribute('sortCol'));
			}else{
				this.sortCol = 0;
			}
			this.sortIsAsc = true;
			
			this.handleSort(this.sortCol);
		}else{
			//add the rows and columns
			this.setupData(this.data);
		}

		//add the different options
		this.handleSearch();
		
		if(this.getAttribute('download')===""){
			this.addDownloadButtons();
		}
	}
	handlePaging(data, currentPage = 1){
		if(this.getAttribute('pages')==null){
			this.pageSize = -1;
			return false;
		}
		
		if(this.getAttribute('pageSize')!=null){
			this.pageSize =  parseInt(this.getAttribute('pageSize'));
		}else{
			this.pageSize = 25;
		}
		
		this.numPages = Math.ceil((data.length -1) / this.pageSize);
		this.currentPage = currentPage;
		
		var pagingText = "";
		//setup for 9 buttons total
		//1 for prev
		//1 for next
		
		pagingText = pagingText + "<mrp-button primary id='"+this.id+"_prev'>Prev</mrp-button>";

		pagingText = this.addPageButtons(this.numPages, pagingText);
			
		pagingText = pagingText + "<mrp-button primary primary id='"+this.id+"_next'>Next</mrp-button>";		
		
		this.shadowRoot.querySelector("div.paging").innerHTML = pagingText;

		//setup button events
		if(Lib.JS.isUndefined(this.prevClickedEvent)){
			this.prevClickedEvent = EventBroker.listen(this.id + "_prev_mrp-button_clicked",this,this.prevClicked);
		}
		if(Lib.JS.isUndefined(this.nextClickedEvent)){
			this.nextClickedEvent = EventBroker.listen(this.id + "_next_mrp-button_clicked",this,this.nextClicked);
		}
		if(Lib.JS.isUndefined(this.pageClickedEvent)){
			this.pageClickedEvent = EventBroker.listen(this.id + "_page_mrp-button_clicked",this,this.pageClicked);
		}
	}
	addPageButtons(numPages, pagingText){
		if(this.numPages ===1){
			pagingText = pagingText + "<mrp-button class='"+this.id+"_page'>1</mrp-button>";
			return pagingText;
		}
		
		var start = 1;
		var end = this.numPages;
		
		//adding 1 buttons
		if(1 === this.currentPage){
			pagingText = pagingText + "<mrp-button success class='"+this.id+"_page'>1</mrp-button>";
		}else{
			pagingText = pagingText + "<mrp-button class='"+this.id+"_page'>1</mrp-button>";
		}
		
		//adding extra buttons
		if(this.numPages >=5){
			start = this.currentPage - 2;
			
			if(start < 2){
				start = 2;
			}
			
			end = start + 4;
			
			if(end > this.numPages-1){
				end = this.numPages-1;
			}
		}
		
		for (var buttonCounter = start; buttonCounter <= end; buttonCounter++) {
			if(buttonCounter === this.currentPage){
				pagingText = pagingText + "<mrp-button success class='"+this.id+"_page'>"+buttonCounter+"</mrp-button>";
			}else{
				pagingText = pagingText + "<mrp-button class='"+this.id+"_page'>"+buttonCounter+"</mrp-button>";
			}
		}
		
		if(this.numPages>1){
			if(this.numPages === this.currentPage){
				pagingText = pagingText + "<mrp-button success class='"+this.id+"_page'>"+this.numPages+"</mrp-button>";
			}else{
				pagingText = pagingText + "<mrp-button class='"+this.id+"_page'>"+this.numPages+"</mrp-button>";
			}
		}
		
		return pagingText;
	}
	prevClicked(tableComponent){
		if(tableComponent.currentPage !== 1){
			tableComponent.currentPage = tableComponent.currentPage -1;
			tableComponent.handlePaging(tableComponent.data, tableComponent.currentPage);
			tableComponent.clearData();
			tableComponent.setupData(tableComponent.data);
		}
	}
	nextClicked(tableComponent){
		if(tableComponent.currentPage !== tableComponent.numPages){
			tableComponent.currentPage ++;
			tableComponent.handlePaging(tableComponent.data, tableComponent.currentPage);
			tableComponent.clearData();
			tableComponent.setupData(tableComponent.data);
		}
	}
	pageClicked(tableComponent, event){
		tableComponent.currentPage = parseInt(event.element.innerText);
		tableComponent.handlePaging(tableComponent.data, tableComponent.currentPage);
		tableComponent.clearData();
		tableComponent.setupData(tableComponent.data);
	}
	
	
	handleSearch(){
		if(this.getAttribute('search')===""){
			this.shadowRoot.querySelector("div.search").innerHTML = "Search:<mrp-text-box id='"+this.id+"_search'></mrp-text-box>"
			
			if(Lib.JS.isUndefined(this.searchChangedEvent)){
				this.searchChangedEvent = EventBroker.listen(this.id + "_search_mrp-text-box_changed",this,this.searchChanged);
			}
		}
		this.searchString = "";
	}
	searchChanged(tableComponent,event){
		tableComponent.searchString = event.element.textContent + event.newValue;

		if(tableComponent.searchString ===""){
			tableComponent.handlePaging(tableComponent.data, tableComponent.currentPage);
			tableComponent.clearData();
			tableComponent.setupData(tableComponent.data);
			return false;
		}
		
		tableComponent.currentData = [];
		var rowPassed = true;		
		
		tableComponent.currentData.push(tableComponent.data[0]);
		
		for (var rowCounter = 1; rowCounter < tableComponent.data.length; rowCounter++) {
			rowPassed = false;
			for (var colCounter = 0; colCounter < tableComponent.numCol; colCounter++) {
				if(tableComponent.data[rowCounter][colCounter]!==null && tableComponent.data[rowCounter][colCounter].toString().toLowerCase().indexOf(tableComponent.searchString.toLowerCase()) >= 0){
					rowPassed = true;
					break;
				}
			}
			
			if(rowPassed){
				tableComponent.currentData.push(tableComponent.data[rowCounter]);
			}
		}
		tableComponent.handlePaging(tableComponent.currentData, tableComponent.currentPage);
		tableComponent.clearData();
		tableComponent.setupData(tableComponent.currentData);
	}
	
	
	
	addDownloadButtons(){
		this.shadowRoot.querySelector("div.download").innerHTML = "<mrp-button primary id=" + this.id + "_print_Current>Print Current</mrp-button>"
	}
	clearData(){
		//var table = this.shadowRoot.querySelector("thead");
		$(this.shadowRoot.querySelector("thead")).empty();
		$(this.shadowRoot.querySelector("tbody")).empty();
	}
	setupData(data){
		this.numCol = data[0].length;
		
		//setup the headers
		var row = this.shadowRoot.querySelector("thead").insertRow(0);
		
		for (var colCounter = 0; colCounter < this.numCol; colCounter++) {
			var th = document.createElement('th');
			if(this.sortCol === colCounter){
				if(this.sortIsAsc){
					th.innerHTML = data[0][colCounter] + "&#8657";
				}else{
					th.innerHTML = data[0][colCounter] + "&#8659";
				}
			}else{
				th.innerHTML = data[0][colCounter];
			}
			th.setAttribute('col',colCounter)
			row.appendChild(th);
		}
		
		var end = data.length;
		var start = 1;
		
		if(this.pageSize !== -1){
			start = ((this.currentPage-1) * this.pageSize)+1;
			end = start + this.pageSize;
			
			if(end > data.length){
				end = data.length;
			}
		}
		
		var currentRow = 0;
		
		for (var rowCounter = start; rowCounter < end; rowCounter++) {
			var row = this.shadowRoot.querySelector("tbody").insertRow(currentRow);
			currentRow++;
			for (var colCounter = 0; colCounter < this.numCol; colCounter++) {
				var cell = row.insertCell(colCounter);
				cell.innerHTML = data[rowCounter][colCounter];
			}
		}
	}
	printData_excel(data, filename="report.xlsl"){
		debugger;
		var wb = XLSX.utils.book_new();
		wb.Props = {
                Title: "SheetJS Tutorial",
                Subject: "Test",
                Author: "Red Stapler",
                CreatedDate: new Date(2017,12,19)
        };
		wb.SheetNames.push("Test Sheet");
		
		//var ws_data = [['hello' , 'world']];
		var ws_data = data;
		
		var ws = XLSX.utils.aoa_to_sheet(ws_data);
		
		wb.Sheets["Test Sheet"] = ws;
		
		var wbout = XLSX.write(wb, {bookType:'xlsx',  type: 'binary'});
		
		function s2ab(s) { 
			var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
			var view = new Uint8Array(buf);  //create uint8array as viewer
			for (var i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
			return buf;    
		}
		
		var blob = new Blob([s2ab(wbout)],{type:"application/octet-stream"});
		if (navigator.msSaveBlob) { // IE 10+
			navigator.msSaveBlob(blob, filename);
		} else {
			var link = document.createElement("a");
			if (link.download !== undefined) { // feature detection
				// Browsers that support HTML5 download attribute
				var url = URL.createObjectURL(blob);
				link.setAttribute("href", url);
				link.setAttribute("download", filename);
				link.style.visibility = 'hidden';
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			}
		}
	}
	printData(data, filename="report.csv") {
		var processRow = function (row) {
			var finalVal = '';
			for (var j = 0; j < row.length; j++) {
				var innerValue = row[j] === null ? '' : row[j].toString();
				if (row[j] instanceof Date) {
					innerValue = row[j].toLocaleString();
				};
				var result = innerValue.replace(/"/g, '""');
				if (result.search(/("|,|\n)/g) >= 0)
					result = '"' + result + '"';
				if (j > 0)
					finalVal += ',';
				finalVal += result;
			}
			return finalVal + '\n';
		};

		var csvFile = '';
		for (var i = 0; i < data.length; i++) {
			csvFile += processRow(data[i]);
		}

		var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
		if (navigator.msSaveBlob) { // IE 10+
			navigator.msSaveBlob(blob, filename);
		} else {
			var link = document.createElement("a");
			if (link.download !== undefined) { // feature detection
				// Browsers that support HTML5 download attribute
				var url = URL.createObjectURL(blob);
				link.setAttribute("href", url);
				link.setAttribute("download", filename);
				link.style.visibility = 'hidden';
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			}
		}
	}

	handleClick(event){
		if(this.sort && !isNaN(parseInt(event.path[0].getAttribute('col')))){
			//if the click was on a header and the sort option is true
			this.handleSort(parseInt(event.path[0].getAttribute('col')));
		}else if(event.path[1].id === this.id + "_print_Current" || event.path[0].id === this.id + "_print_Current"){
			//if the click was on a print button
			debugger;
			if(this.currentData.length ===0){
				this.printData(this.data);
			}else{
				this.printData(this.currentData);
			}
		}else if(event.path[1].id === this.id + "_print_All" || event.path[0].id === this.id + "_print_All"){
			//if the click was on a print button
			EventBroker.trigger(this.id + '_mrp-table_clicked_print_All',this.data);
		}else if(event.path[1].id === this.id + "_print_Each" || event.path[0].id === this.id + "_print_Each"){
			//if the click was on a print button
			EventBroker.trigger(this.id + '_mrp-table_clicked_print_Each',this.data);
		}
		
	
		var triggerObj = {element:this, event:event, newValue:event.path[0].value, row:this.buildRowObject(event)};
		
		if(this.id !== ""){
			EventBroker.trigger(this.id + '_mrp-table_clicked',triggerObj);
		}else if(this['class'] !== ""){
			EventBroker.trigger(this['class'] + '_mrp-table_clicked',triggerObj);
		}else{
			EventBroker.trigger('mrp-table_clicked',triggerObj);
		}
	}
	buildRowObject(event){
		var rowNum = this.getRowClicked(event);
		
		var row = {};
		row.rowNum = rowNum;
		
		if(Lib.JS.isUndefined(this.data[rowNum])){
			row.info = 'Row is missing or deleted';
			return row;
		}
		
		for (var colCounter = 0; colCounter < this.data[0].length; colCounter++) {
			//check if the header is not blank
			if(this.data[0][colCounter] !==""){
				row[this.data[0][colCounter]] = this.data[rowNum][colCounter];
			}
		}
		return row;
	}
	getRowClicked(event){
		for (var pathCounter = 0; pathCounter < event.path.length; pathCounter++) {
			//check for sort column 
			if(Lib.JS.isDefined(event.path[pathCounter].getAttribute)){
				if(!isNaN(parseInt(event.path[pathCounter].getAttribute('table-row')))){
					return parseInt(event.path[pathCounter].getAttribute('table-row'));
				}
			}
		}
	}
	handleSort(column){
		//check for aorting asc or desc
		if(this.sortCol === column){
			this.sortIsAsc = !this.sortIsAsc;
		}
		
		this.sortCol = column;
		
		var data = this.data.slice();
		
		var sortFunction = this.getsortFunction(column, this.sortIsAsc);
		var headers = data.shift();
        data.sort(sortFunction);
        this.data = [];
		this.data.push(headers)
        this.data = this.data.concat(data);
		
		this.clearData();
		this.setupData(this.data);
	}
	getsortFunction(sortIndex, isAsync) {
        //The sort function  used to sort the columns
        var multipliyer = -1;
        if (isAsync) {
            multipliyer = 1;
        }

        return function (a, b) {
            if (a[sortIndex] < b[sortIndex]) {
                return -1 * multipliyer;
            } else if (a[sortIndex] > b[sortIndex]) {
                return 1 * multipliyer;
            }

            return 0;
        };
    }
}
window.customElements.define('mrp-table', MRPTable);