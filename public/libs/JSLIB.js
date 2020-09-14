//V0.11

//A library used to make JS coding easier and add some simple function to JS

if (typeof JSLib === 'undefined') {
    var JSLib = {};
    
    if (typeof Lib === 'undefined') {
            Lib = {};
        }

    var creation = function (Lib) {
        var log = new Logger('Lib.JS.js', CLL.error);

        
        Lib.JS = {};
		Lib.JS.isArray = function (array) {
            log.trace("CreateNewArray");
            return array.isArray();
        };
		
		
        /**
         * This will create a new copy of the array passed in, instead of pointing to the old array
         * 
         * @param array {array} The array the will be copied
         * @return {array} Returns a new array not connected to the old one.
         */
        Lib.JS.CreateNewArray = function (array) {
            log.trace("CreateNewArray");
            return array.slice();
        };
        /**
         * This will verify that the callback exsits and is a function
         * 
         * @param callback {Function} the string you want to look at.
         * @return {Boolean} Returns true if the callback is a function and exists
         */
        Lib.JS.verifyCallback = function (callback) {
            log.trace("verifyCallback");
            var isValidFunction = true;

            if (Lib.JS.isUndefined(callback) || !Lib.JS.isFunction(callback)) {
                isValidFunction = false;
            }

            return isValidFunction;
        };
        /**
         * This will look at through a @stringValue for anything the matches the @delimiter.  It will then return the position of
         * the @delimiter found after skipping a number of then determined by @numDel -1.
         * Example: @stringValue "http://localhost:3030/Students" but you want the position of the third "/"
         *      Lib.JS.GetPosWithSkip("http://localhost:3030/Students", "/", 3)
         * 
         * @param stringVal {String} the string you want to look at.
         * @param delimiter {String} the deilimter your looking for.
         * @param numDel {Number} number of delimters to skip, defaults to .
         * @return {String} Returns some sample string, will return -1 if their are fewer delimters than (@numDelToSkip)
         */
        Lib.JS.getPosition = function (stringVal, delimiter, numDel) {
            log.trace("GetPosWithSkip");
            Lib.JS.setDefaultParameter(numDel, 0);
            var currentDelPos = 0;
            var totalDelPos = 0;
            for (var delCounter = 0; delCounter < numDel - 1; delCounter++) {
                currentDelPos = stringVal.indexOf(delimiter);
                stringVal = stringVal.right(currentDelPos);
                totalDelPos = totalDelPos + currentDelPos + 1;
            }
            totalDelPos = totalDelPos + stringVal.indexOf(delimiter);
            return totalDelPos;
        };
        /**
         * This will insert @stringToInsert into @stringVal to the left of position @position
         * Example: Lib.JS.insertAt("0123456", 4, '**') = "0123**456"
         * 
         * @param stringVal {String} the string you want to look at.
         * @param position {Number} the poistion.
         * @param stringToInsert {String} the string you want to insert.
         * @return {String} Returns This will return everything in the string to the Rigth of the @position
         */
        Lib.JS.insertAt = function (stringVal, position, stringToInsert) {
            log.trace("Left");
            var left = stringVal.left(position);
            var right = stringVal.right(position - 1);
            stringVal = left + stringToInsert + right;

            return stringVal;
        };
        /**
         * This will replace all, instead of the normal JS replace that only replaces the first 
         * instance it finds.
         * 
         * @param string {string} the string you want to replace parts of.
         * @param search {string} the string patterns you want replaced
         * @param replacement {string} the string pattern to the search pattern to be replaced with.
         * @return {string} Returns the original string exect it will convert all the search patterns to replacement
         */
        Lib.JS.replace = function (string, search, replacement) {
            log.trace("replace");
            return string.replace(new RegExp(search, 'g'), replacement);
        };
		
		Lib.JS.replaceQuotes = function (string) {
            log.trace("replaceQuotes");
			var newString = "";
			
			for (charCounter = 0; charCounter < string.length; charCounter++) {
				if(string.charAt(charCounter) == '"'){
					newString = newString + '\\' + string.charAt(charCounter);
				}else{
					newString = newString + string.charAt(charCounter);
				}
			}
			return newString;
        };
		
        /**
         * This will check to see if an obejct is empty.  And empty obejct has 0 properties and is an object.
         * 
         * @param object {object} the object ot test
         * @return {boolean} Returns true if the object is empty, false if not.
         */
        Lib.JS.IsEmptyObject = function (object) {
            log.trace("IsEmptyObject");
            if (Object.keys(object).length === 0 && object.constructor === Object) {
                return true;
            }
            return false;
        };
        /**
         * This will convert a string value to a integer.  If the string is not a number then it default to a 0;
         * 
         * @param stringValue {string} the string to be converted into an ingeter.
         * @return {int} Returns the integer value of the string, or 0 it strin gis not a integer.
         */
        Lib.JS.StringToInt = function (stringValue) {
            log.trace("StringToInt");
            var number = 0;
            if (Lib.JS.isNumber(stringValue)) {
                number = parseInt(stringValue);
            }
            return number;
        };
        /**
         * This will check if a date value is a valid date.  It will check if the date/month/year combo is actauly value, assuming the dd/mmm/yyyy format
         * for example 32/14/2013 is not a valid date even though the format is correct.
         * 
         * @param date {date} the date to check
         * @return {boolean} Returns true if the date is valid, false if not
         */
        Lib.JS.isDate = function (date) {
            log.trace("isDate");
            date = date.toString();
            var datePieces = date.split("/");

            if (datePieces.length !== 3) {
                return false;
            }

            if (!$.isNumeric(datePieces[0]) || !$.isNumeric(datePieces[2])) {
                return false;
            }

            var day = parseInt(datePieces[0]);
            var month = datePieces[1];
            var year = parseInt(datePieces[2]);

            if (day > 31 || day < 0) {
                return false;
            }

            if (year > 5000 || year < 0) {
                return false;
            }

            var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            if (months.indexOf(month) === -1) {
                return false;
            }

            if (month === "Feb" && day > 28) {
                return false;
            }

            if (month === "Apr" || month === "Jun" || month === "Sep" || month === "Nov") {
                if (day > 30) {
                    return false;
                }
            }

            return true;
        };
        /**
         * This will log an error if the error exists, otherwise it will trace log that the error is undifined.
         * 
         * @param log {logger} the logger to use
         * @param error {string} the erro string
         * @return {boolean} Returns true is their is an error and false no error exists
         */
        Lib.JS.logError = function (log, error) {
            log.trace("logError");
            if (typeof error !== 'undefined') {
                log.error("Error:" + error);
                return true;
            } else {
                log.trace("Error:undefined");
            }
            return false;
        };
        /**
         * This will check if a string is empty or undifined
         * 
         * @param string {string} the string to check
         * @return {boolean} Returns true if the string is empty, false if not
         */
        Lib.JS.isSTREmpty = function (string) {
            log.trace("isSTREmpty");
            log.debug("string:" + string);

            if (typeof string === 'undefined') {
                return true;
            }

            if (string === "") {
                return true;
            }

            return false;
        };
        /**
         * This will go through a template and erase all the values form input DOM objects on that templte
         * 
         * @param template {template}
         */
        Lib.JS.clearInputs = function (template) {
            log.trace("clearInputs");
            //clear text boxes
            template.$('input').each(function () {
                template.$(this).val("");
            });

            template.$('textarea').each(function () {
                template.$(this).val("");
            });

            //un tick tick boxes
            template.$('input:checkbox').each(function () {
                template.$(this).prop("checked", false);
            });
        };
        /**
         * This will return the defaultVal if the parameter is undefined
         * 
         * @param template {template}
         */
        Lib.JS.setDefaultParameter = function (parameter, defaultVal) {
            log.trace("setDefaultParameter");
            if (Lib.JS.isUndefined(parameter)) {
                parameter = defaultVal;
            }
            return parameter;
        };
        /**
         * This will check a series of parameters to make sure they are not undifined
         * 
         * @param parameterArray {2D Array} An array, where each element is an array with 2 eleements.  [0] is the parameters to check, and [1] is the logs error message
         * @param otherLog {Logger} The Logger to use to errors
         * @returns (boolean) Returns false if all parameters are defined, return true one or more of the parameters are undifined
         */
        Lib.JS.checkParameters = function (parameterArray, otherLog) {
            log.trace("checkParameters");
            var parameterCounter = 0;
            var isFail = false;
            for (parameterCounter = 0; parameterCounter < parameterArray.length; parameterCounter++) {
                if (parameterArray[parameterCounter].length !== 2) {
                    log.error("Wrong number of parameters");
                    otherLog.error("Wrong number of parameters");
                    return true;
                }
                if (Lib.JS.isUndefined(parameterArray[parameterCounter][0])) {
                    otherLog.error(parameterArray[parameterCounter][1]);
                    isFail = true;
                }
            }
            return isFail;
        };
        /**
         * This will check a single parameters to make sure it is not undifined
         * 
         * @param parameter {object} An object to test
         * @param errorMessage {string} The error message to use if the paramter fails
         * @param otherLog {Logger} The Logger to use to errors
         * @returns (boolean) Returns false if the parameter is defined else return true
         */
        Lib.JS.checkParameter = function (parameter, errorMessage, otherLog) {
            log.trace("checkParameter");
            if (typeof parameter === 'undefined') {
                otherLog.error(errorMessage);
                return true;
            }
            return false;
        };
        /**
         * This will check an object to see if it is not undifined and not null
         * 
         * @param parameter {object} An object to test
         * @returns (boolean) Returns false if the parameter is defined else return true
         */
        Lib.JS.isDefined = function (parameter) {
            log.trace("isDefined");
            if (!Lib.JS.isUndefined(parameter) && !Lib.JS.isNull(parameter)) {
                return true;
            }
            return false;
        };
        /**
         * This will check an object to see if it is undifined
         * 
         * @param parameter {object} An object to test
         * @returns (boolean) Returns false if the parameter is defined else return true
         */
        Lib.JS.isUndefined = function (parameter) {
            log.trace("isUndefined");
            if (typeof parameter === 'undefined') {
                return true;
            }
            return false;
        };
        /**
         * This will check an object to see if it is undifined or an empty string
         * 
         * @param parameter {object} An object to test
         * @returns (boolean) Returns false if the parameter is defined else return true
         */
        Lib.JS.isUndefinedOrEmpty = function (parameter) {
            log.trace("isUndefined");
            if (Lib.JS.isUndefined(parameter) || parameter === "") {
                return true;
            }
            return false;
        };
        /**
         * This will check an object to see if it is null
         * 
         * @param parameter {object} An object to test
         * @returns (boolean) Returns false if the parameter is not null else return true
         */
        Lib.JS.isNull = function (parameter) {
            log.trace("isNull");
            if (parameter === null && typeof parameter === "object") {
                return true;
            }
            return false;
        };
        /**
         * This will check an object to see if it is a number
         * 
         * @param parameter {object} An object to test
         * @returns (boolean) Returns true is the parameter is a number else false
         */
        Lib.JS.isNumber = function (parameter) {
            log.trace("isInt");
            return $.isNumeric(parameter);
        };
        /**
         * This will check an object to see if it is a string
         * 
         * @param parameter {object} An object to test
         * @returns (boolean) Returns true is the parameter is a string else false
         */
        Lib.JS.isString = function (parameter) {
            log.trace("isString");
            if (typeof parameter === 'string') {
                return true;
            }
            return false;
        };
        /**
         * This will check an object to see if it is a array
         * 
         * @param parameter {object} An object to test
         * @returns (boolean) Returns true is the parameter is a array else false
         */
        Lib.JS.isArray = function (parameter) {
            log.trace("isArray");
            if (parameter.constructor === Array) {
                return true;
            }
            return false;
        };
        /**
         * This will check an object to see if it is a function
         * 
         * @param parameter {object} An object to test
         * @returns (boolean) Returns true is the parameter is a function else false
         */
        Lib.JS.isFunction = function (parameter) {
            log.trace("isFunction");
            if (typeof parameter === 'function') {
                return true;
            }
            return false;
        };
        /**
         * This will check an object to see if it is a bit
         * 
         * @param parameter {object} An object to test
         * @returns (boolean) Returns true is the parameter is a bit else false
         */
        Lib.JS.isBit = function (parameter) {
            log.trace("isBit");
            if (typeof parameter === 'boolean') {
                return true;
            } else if (typeof parameter === 'number' && (parameter === 0 || parameter === 1)) {
                return true;
            } else if (typeof parameter === 'string' && (parameter.toLowerCase() === 'true' || parameter.toLowerCase() === 'false')) {
                return true;
            }
            return false;
        };
        /**
         * This will get the row of a table given it's click event
         * 
         * @param event {event} The click event created when a user clicks on a table
         * @returns (<TR>) Returns the row number the user clicked on.
         */
        Lib.JS.getRowNumClicked = function (event) {
            log.trace("getRowNumClicked");
            var row = $(event.target).parents('tr').index();
            return row;
        };
        /**
         * This will get the row number of a table given it's click event
         * 
         * @param event {event} The click event created when a user clicks on a table
         * @returns (int) Returns the row number the user clicked on.
         */
        Lib.JS.getTableRowNumFromEvent = function (event) {
            log.trace("getTableRowNumFromEvent");
            var rowNum = $(event.target).parent()[0].rowIndex - 1;
            return rowNum;
        };
        /**
         * This will is designed to add strings to a string delimted list.  It simply chekc if the list is empty, if it is then
         * the list become the newItem else it appends it with the delimter
         * 
         * @param list {string} The list of delmited strings
         * @param newItem {string} The string to add to the list
         * @param delimiter {string}
         * @returns (string) Returns the lsit with the newItem added to the list
         */
        Lib.JS.addToStringList = function (list, newItem, delimiter) {
            log.trace("addToStringList");
            if (list === "") {
                list = list + newItem;
            } else {
                list = list + delimiter + newItem;
            }
            return list;
        };
        /**
         * This will create OOP inheritence
         * 
         * @param child {object}
         * @param parent {object}
         */
        Lib.JS.inheritsFrom = function (child, parent) {
            log.trace("inheritsFrom");
            child.prototype = Object.create(parent.prototype);
        };
        /**
         * This will add all the properites from the giver object to the receiver object
         * 
         * @param receiver {object}
         * @param giver {object}
         * @returns (object) Returns the new receiver
         */
        Lib.JS.combineObjects = function (receiver, giver) {
            log.trace("combineObjects");
            //this will take add all the properites from the giver object to the receiver object
            receiver = Lib.JS.setDefaultParameter(receiver, {});
            giver = Lib.JS.setDefaultParameter(giver, {});

            for (var property in giver) {
                if (Lib.JS.isUndefined(receiver[property])) {
                    receiver[property] = giver[property];
                }
            }

            return receiver;
        };
        /**
         * This will push all the elements from the giver array to the receiver array.  The giver elements end up at the end of
         * the reciver array.
         * 
         * @param receiver {object}
         * @param giver {object}
         * @returns (object) Returns the new receiver
         */
        Lib.JS.combineArrays = function (receiver, giver) {
            log.trace("combineArrays");
            //this will take add all the properites from the giver object to the receiver object
            receiver = Lib.JS.setDefaultParameter(receiver, []);
            giver = Lib.JS.setDefaultParameter(giver, []);

            var giverCounter = 0;
            for (giverCounter = 0; giverCounter < giver.length; giverCounter++) {
                receiver.push(giver[giverCounter]);
            }

            return receiver;
        };
        /**
         * This will remove an object from an array
         * 
         * @param array {array}
         * @param object {object}
         */
        Lib.JS.remove = function (array, object) {
            var index = array.indexOf(object);
            if (index > -1) {
                array.splice(index, 1);
            }
        };
        /**
         * This will take an array of objects, and extract the property from all of those objects.
         * 
         * @param array {array}
         * @param property {property}
         * @returns (array) Returns a list of object properties
         */
        Lib.JS.getPropertyList = function (array, property) {
            var list = [];
            var arrayCounter = 0;
            for (arrayCounter = 0; arrayCounter < array.length; arrayCounter++) {
                list.push(array[arrayCounter][property]);
            }
            return list;
        };
        /**
         * This will add a new row to a HTML table that is a copy the row based on the row number
         * 
         * @param tableID {string}
         * @param rowNum {int}
         * @param template {template}
         */
        Lib.JS.duplicateRow = function (tableID, rowNum, template) {
            var rowToCopy = template.$('#' + tableID).find('tr:nth-child(' + rowNum + ')');

            var trNew = rowToCopy.clone();
            rowToCopy.after(trNew);
            template.$(trNew).find('textarea, input').each(function (index) {
                template.$(this).val("");
            });
        };
        /**
         * This will check an number to see if it is odd
         * 
         * @param num {int} An object to test
         * @returns (boolean) Returns true is the num is odd else false
         */
        Lib.JS.isOdd = function (num) {
            if (num % 2 === 0) {
                return false;
            } else {
                return true;
            }
        }
        /**
         * This will check an number to see if it is even
         * 
         * @param num {int} An object to test
         * @returns (boolean) Returns true is the num is even else false
         */
        Lib.JS.isEven = function (num) {
            if (num % 2 === 0) {
                return true;
            } else {
                return false;
            }
        };
        /**
         * This will replace the itemToReplace with itemToAdd in array
         * 
         * @param array {array}
         * @param itemToReplace {object}
         * @param itemToAdd {object}
         * @returns (boolean) Returns new array.
         */
        Lib.JS.replaceArrayItem = function (array, itemToReplace, itemToAdd) {
            var index = array.indexOf(itemToReplace);
            array.splice(index, 1);
            array.splice(index, 0, itemToAdd);
            return array;
        };
        /**
         * This will create a brand new copy of an object instead of creating a pointer to the object
         * 
         * @param object {object}
         * @returns (object) Returns new object
         */
        Lib.JS.copyObject = function (object) {
            return JSON.parse(JSON.stringify(object));
        };
        /**
         * This will copy all the properties from one object to another
         * 
         * @param copyFrom {object}
         * @param CopyTo {object}
         */
        Lib.JS.copyProperties = function (copyFrom, CopyTo) {
            for (var property in copyFrom) {
                CopyTo[property] = copyFrom[property];
            }
        };
        /**
         * This will count the number of properites an object has
         * 
         * @param object {object}
         * @returns {int} Retruns the number of properties
         */
        Lib.JS.getNumProperties = function (object) {
            return Object.keys(object).length;
        };
        /**
         * This will take an array of string and contactinate them into 1 string
         * 
         * @param array {array}
         * @returns {string} Retruns the new string
         */
        Lib.JS.arrayToString = function (array) {
            array = Lib.JS.setDefaultParameter(array, []);
            var returnString = "";
            for (var counter = 0; counter < array.length; counter++) {
                returnString = returnString + array[counter].toString();
            }
            return returnString;
        };
        /**
         * This will take a 2D array and create a string.  You can add in row an dcol delimiters.
         * 
         * @param array {array} The array the will be copied
         * @param colDel {string} The column delimiter, blank by default
         * @param rowDel {string} The row delimiter, blank by default
         * @return {array} Returns a new array not connected to the old one
         */
        Lib.JS.array2DToString = function (array, colDel = '', rowDel = '') {
            log.trace("arrayToString");
            var str = '';
            for (var rowCounter = 0; rowCounter < array.length; rowCounter++) {
                var row = '';
                for (var colCounter = 0; colCounter < array[rowCounter].length; colCounter++) {
                    if (row === '') {
                        row = array[rowCounter][colCounter];
                    } else {
                        row = row + colDel + array[rowCounter][colCounter];
                    }
                }
                if (str === '') {
                    str = row;
                } else {
                    str = str + rowDel + row;
                }
            }
            return str;
        };
        /**
         * This will generate a randome int using the min and max as the range, inclusive
         * Lib.JS.getRandomInt(1,5) -> can get 1,2,3,4,5
         * 
         * @param min {int}
         * @param max {int}
         * @returns {int} Retruns random int between min and max
         */
        Lib.JS.getRandomInt = function (min, max) {		//Gets a random number
            var randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
            return Math.round(randomNum);
        };
        /**
         * This will generate a boolean value
         * 
         * @returns {boolean}
         */
        Lib.JS.getRandomBool = function () {		//Gets a boolean value
            var randomNumber = Lib.JS.getRandomInt(0, 1);
            if (randomNumber === 1) {
                return true;
            } else {
                return false;
            }
        };
        /**
         * This will create a formateed date the is today + numDaysMod
         * 
         * @param numDaysMod {int}
         * @returns {date} Retruns formateed date
         */
        Lib.JS.getFormatedDate = function (numDaysMod) {
            numDaysMod = Lib.JS.setDefaultParameter(numDaysMod, 0);
            var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            var date = new Date(new Date().getTime() + 24 * 60 * 60 * 1000 * numDaysMod);
            var day = date.getDate();
            var month = date.getMonth();
            var year = date.getFullYear();

            if (day < 10) {
                day = '0' + day;
            }
            date = day + '-' + monthNames[month] + '-' + year;
            return date;
        }
        /**
         * This will creat a blob object from a file string
         * 
         * @param fileString {string} The file as a string
         * @param fileType {string} The file type (.txt, .xls etc.)
         * @return {Object} Returns a file blob
         */
        Lib.JS.getBlobFromFileString = function (fileString, fileType) {
            var binaryObject = fileString;
            var binary = atob(binaryObject.split(',')[1]);
            var array = [];
            for (var i = 0; i < binary.length; i++) {
                array.push(binary.charCodeAt(i));
            }
            var blob = new Blob([new Uint8Array(array)], {type: fileType});
            return blob;

        };
    };
    creation.call(JSLib, Lib);
}