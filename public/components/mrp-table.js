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
			table.hidden { 
				display:none;
            }
			div.hidden { 
				display:none;
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

//add in the endabled/disabled functions
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
		this.addEventListener('click',this._handleClick);
		this.attachShadow({mode:'open'});
		this.shadowRoot.appendChild(MRPTable_template.content.cloneNode(true));
		this.disabled = false;
		
		this.table = this.shadowRoot.querySelector('table');
		this.searchDiv = this.shadowRoot.querySelector('div.search');
		this.downloadDiv = this.shadowRoot.querySelector('div.download');
		this.pagingDiv = this.shadowRoot.querySelector('div.paging');
		
		Lib.Comp.setupDefualtProperties(this, 'table');
	}
	loadData(data = []){
		if(data.length ==0){
			return false;
		}
		
		this.data = data;

		//setup Pagin
		this._handlePaging(this.data);

		//setup sorting stuff
		if(this.getAttribute('sort')===""){
			this.sort = true;
			if(this.getAttribute('sortCol')!=null){
				this.sortCol =  parseInt(this.getAttribute('sortCol'));
			}else{
				this.sortCol = 0;
			}
			this.sortIsAsc = true;
			
			this._handleSort(this.sortCol);
		}else{
			//add the rows and columns
			this._setupData(this.data);
		}

		//add the different options
		this._handleSearch();
		
		if(this.getAttribute('download')===""){
			this._addDownloadButtons();
		}
	}
	_handlePaging(data, currentPage = 1){
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

		pagingText = this._addPageButtons(this.numPages, pagingText);
			
		pagingText = pagingText + "<mrp-button primary primary id='"+this.id+"_next'>Next</mrp-button>";		
		
		this.shadowRoot.querySelector("div.paging").innerHTML = pagingText;	

		//setup button events
		if(Lib.JS.isUndefined(this._prevClickedEvent)){
			this._prevClickedEvent = EventBroker.listen(this.id + "_prev_mrp-button_clicked",this,this._prevClicked);
		}
		if(Lib.JS.isUndefined(this._nextClickedEvent)){
			this._nextClickedEvent = EventBroker.listen(this.id + "_next_mrp-button_clicked",this,this._nextClicked);
		}
		if(Lib.JS.isUndefined(this._pageClickedEvent)){
			this._pageClickedEvent = EventBroker.listen(this.id + "_page_mrp-button_clicked",this,this._pageClicked);
		}
	}
	_addPageButtons(numPages, pagingText){		
		//setup for 9 buttons total
		if(this.numPages ===1){
			pagingText = pagingText + "<mrp-button class='"+this.id+"_page'>1</mrp-button>";
			return pagingText;
		}
		
		var start = 1;
		var end = this.numPages;
		//adding 1 button
		if(1 === this.currentPage){
			pagingText = pagingText + "<mrp-button success class='"+this.id+"_page'>1</mrp-button>";
		}else{
			pagingText = pagingText + "<mrp-button class='"+this.id+"_page'>1</mrp-button>";
		}
		
		
		//adding extra buttons
		if(this.numPages >=7){
			start = this.currentPage - 2;

			if(this.numPages - start <5){
				start = this.numPages - 5;
			}
			
			if(start < 2){
				start = 2;
			}
			
			end = start + 4;
			
			if(end > this.numPages-1){
				end = this.numPages-1;
			}
		}else{
			if(start < 2){
				start = 2;
			}
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
	_prevClicked(){
		if(this.currentPage !== 1){
			this.currentPage = this.currentPage -1;
			this._handlePaging(this.data, this.currentPage);
			this._clearData();
			this._setupData(this.data);
		}
	}
	_nextClicked(){
		if(this.currentPage !== this.numPages){
			this.currentPage ++;
			this._handlePaging(this.data, this.currentPage);
			this._clearData();
			this._setupData(this.data);
		}
	}
	_pageClicked( event){
		this.currentPage = parseInt(event.element.innerText);
		this._handlePaging(this.data, this.currentPage);
		this._clearData();
		this._setupData(this.data);
	}
	
	
	_handleSearch(){
		if(this.getAttribute('search')===""){
			this.shadowRoot.querySelector("div.search").innerHTML = "Search:<mrp-text-box id='"+this.id+"_search'></mrp-text-box>";
			this.searchBox = this.shadowRoot.querySelector('#'+this.id+'_search');
			
			if(Lib.JS.isUndefined(this._searchChangedEvent)){
				this._searchChangedEvent = EventBroker.listen(this.id + "_search_mrp-text-box_changed",this,this._searchChanged);
			}
		}
		this.searchString = "";
	}
	_searchChanged(event){
		this.searchString = event.element.textContent + event.newValue;

		if(this.searchString ===""){
			this._handlePaging(this.data, this.currentPage);
			this._clearData();
			this._setupData(this.data);
			return false;
		}
		
		this.currentData = [];
		var rowPassed = true;		
		
		this.currentData.push(this.data[0]);
		
		for (var rowCounter = 1; rowCounter < this.data.length; rowCounter++) {
			rowPassed = false;
			for (var colCounter = 0; colCounter < this.numCol; colCounter++) {
				if(this.data[rowCounter][colCounter]!==null && this.data[rowCounter][colCounter].toString().toLowerCase().indexOf(this.searchString.toLowerCase()) >= 0){
					rowPassed = true;
					break;
				}
			}
			
			if(rowPassed){
				this.currentData.push(this.data[rowCounter]);
			}
		}
		this._handlePaging(this.currentData, this.currentPage);
		this._clearData();
		this._setupData(this.currentData);
	}

	_addDownloadButtons(){
		this.shadowRoot.querySelector("div.download").innerHTML = "<mrp-button primary id=" + this.id + "_print_Current>Print Current</mrp-button>"
		this.printBox = this.shadowRoot.querySelector('#'+this.id+'_print_Current');
	}
	_clearData(){
		//var table = this.shadowRoot.querySelector("thead");
		$(this.shadowRoot.querySelector("thead")).empty();
		$(this.shadowRoot.querySelector("tbody")).empty();
	}
	_setupData(data){
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
			row.setAttribute('row-num',rowCounter);
			currentRow++;
			for (var colCounter = 0; colCounter < this.numCol; colCounter++) {
				var cell = row.insertCell(colCounter);
				cell.innerHTML = data[rowCounter][colCounter];
			}
		}
	}
	_printData_excel(filename="report.xlsl", data = this.data){
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
	_printData(data, filename="report.csv") {
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

	_handleClick(event){
		if(this.disabled){
			event.preventDefault();
			return false;
		}
		
		if(this.sort && !isNaN(parseInt(event.path[0].getAttribute('col')))){
			//if the click was on a header and the sort option is true
			this._handleSort(parseInt(event.path[0].getAttribute('col')));
		}else if(event.path[1].id === this.id + "_print_Current" || event.path[0].id === this.id + "_print_Current"){
			//if the click was on a print button
			if(this.currentData.length ===0){
				this._printData(this.data);
			}else{
				this._printData(this.currentData);
			}
		}else if(event.path[1].id === this.id + "_print_All" || event.path[0].id === this.id + "_print_All"){
			//if the click was on a print button
			EventBroker.trigger(this.id + '_mrp-table_clicked_print_All',this.data);
		}else if(event.path[1].id === this.id + "_print_Each" || event.path[0].id === this.id + "_print_Each"){
			//if the click was on a print button
			EventBroker.trigger(this.id + '_mrp-table_clicked_print_Each',this.data);
		}
		
	
		var triggerObj = {element:this, event:event, newValue:event.path[0].value, row:this._buildRowObject(event)};
		
		if(this.id !== ""){
			EventBroker.trigger(this.id + '_mrp-table_clicked',triggerObj);
		}else if(this['class'] !== ""){
			EventBroker.trigger(this['class'] + '_mrp-table_clicked',triggerObj);
		}else{
			EventBroker.trigger('mrp-table_clicked',triggerObj);
		}
	}
	_buildRowObject(event){
		var rowNum = this._getRowClicked(event);
		
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
	_getRowClicked(event){
		for (var pathCounter = 0; pathCounter < event.path.length; pathCounter++) {
			//check for sort column 
			if(Lib.JS.isDefined(event.path[pathCounter].getAttribute)){
				if(!isNaN(parseInt(event.path[pathCounter].getAttribute('row-num')))){
					return parseInt(event.path[pathCounter].getAttribute('row-num'));
				}
			}
		}
	}
	_handleSort(column){
		//check for aorting asc or desc
		if(this.sortCol === column){
			this.sortIsAsc = !this.sortIsAsc;
		}
		
		this.sortCol = column;
		
		var data = this.data.slice();
		
		var sortFunction = this._getsortFunction(column, this.sortIsAsc);
		var headers = data.shift();
        data.sort(sortFunction);
        this.data = [];
		this.data.push(headers)
        this.data = this.data.concat(data);
		
		this._clearData();
		this._setupData(this.data);
	}
	_getsortFunction(sortIndex, isAsync) {
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
	show(){
		this.table.classList.remove('hidden');
		this.searchDiv.classList.remove('hidden');
		this.downloadDiv.classList.remove('hidden');
		this.pagingDiv.classList.remove('hidden');
	}
	hide(){
		this.table.classList.add('hidden');
		this.searchDiv.classList.add('hidden');
		this.downloadDiv.classList.add('hidden');
		this.pagingDiv.classList.add('hidden');
	}
	disable(){
		if(this.getAttribute('search')===""){
			this.searchBox.disable();
		}
		if(this.getAttribute('download')===""){
			this.printBox.disable();
		}
		if(this.getAttribute('pages')===""){
			var buttons = this.shadowRoot.querySelectorAll('mrp-button');
			for (var buttonCounter = 0; buttonCounter < buttons.length; buttonCounter++) {
				buttons[buttonCounter].disable();
			}
		}
		this.disabled = true;
	}
	enable(){
		if(this.getAttribute('search')===""){
			this.searchBox.enable();
		}
		if(this.getAttribute('download')===""){
			this.printBox.enable();
		}
		if(this.getAttribute('pages')===""){
			var buttons = this.shadowRoot.querySelectorAll('mrp-button');
			for (var buttonCounter = 0; buttonCounter < buttons.length; buttonCounter++) {
				buttons[buttonCounter].enable();
			}
		}
		this.disabled = false;
	}
}
window.customElements.define('mrp-table', MRPTable);