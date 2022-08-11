//Version 1.0

//Brokers are a set ob golbal static objects that can broker information between different objects.

if (Lib.JS.isUndefined(Broker)) {
    var Broker = {};

    var creation = function () {

        this.strConnections = [];
        this.objConnections = [];

        var log = new Logger('Broker.js', CLL.debug);

        this.addListener = function () {
            if(arguments.length ===3){
				this._addListenerString(arguments[0],arguments[1],arguments[2]);
			}else if(arguments.length ===4){
				this._addListenerObj(arguments[0],arguments[1],arguments[2],arguments[3]);
			}
        };
		this._addListenerObj = function (ID, event, listenerArgs, callback) {
			
            if (Lib.JS.isUndefined(EventBroker.objConnections[ID])) {
                EventBroker.objConnections[ID] = {};
            }
			
			if (Lib.JS.isUndefined(EventBroker.objConnections[ID][event])) {
                EventBroker.objConnections[ID][event] = [];
            }
			
            var eventObj = {listenerArgs: listenerArgs, callback: callback};
            EventBroker.objConnections[ID][event].push(eventObj);
            return eventObj;
        };
		this._addListenerString = function (connection, listenerArgs, callback) {
            if (Lib.JS.isUndefined(EventBroker.strConnections[connection])) {
                EventBroker.strConnections[connection] = [];
            }
            var eventObj = {connection: connection, listenerArgs: listenerArgs, callback: callback};
            EventBroker.strConnections[connection].push(eventObj);
            return eventObj;
        };


        this.addPageListener = function () {
            if(arguments.length ===3){
                this._addPageListenerString(arguments[0],arguments[1],arguments[2]);
            }else if(arguments.length ===4){
                this._addPageListenerObj(arguments[0],arguments[1],arguments[2],arguments[3]);
            }
        };
        this._addPageListenerObj = function (ID, event, listenerArgs, callback) {

            if (Lib.JS.isUndefined(EventBroker.objConnections[ID])) {
                EventBroker.objConnections[ID] = {};
            }

            if (Lib.JS.isUndefined(EventBroker.objConnections[ID][event])) {
                EventBroker.objConnections[ID][event] = [];
            }

            var eventObj = {listenerArgs: listenerArgs, callback: callback,page:true};
            EventBroker.objConnections[ID][event].push(eventObj);
            return eventObj;
        };
        this._addPageListenerString = function (connection, listenerArgs, callback) {
            if (Lib.JS.isUndefined(EventBroker.strConnections[connection])) {
                EventBroker.strConnections[connection] = [];
            }
            var eventObj = {connection: connection, listenerArgs: listenerArgs, callback: callback,page:true};
            EventBroker.strConnections[connection].push(eventObj);
            return eventObj;
        };

        //Used to remove a listeneter, used if you only want to listen to an event once
        this.remove = function (listener) {
            Lib.JS.remove(EventBroker.connection[listener.connection], listener);
        };
    };
    creation.call(Broker);
}


//The event broker is public static moderator object.  It allows any object to trigger and/or listen to custome events.
//Events must have unique string names.
if (Lib.JS.isUndefined(EventBroker)) {
    var EventBroker = Object.create(Broker);

    var creation = function () {
	
        var log = new Logger('EventBroker.js', CLL.debug);
		
		this.listenAll = 'EventBroker_all';

        this.pageListen = function () {
            if(arguments.length ===3){
                this._pageListenString(arguments[0],arguments[1],arguments[2]);
            }else if(arguments.length ===4){
                this._pageListenObj(arguments[0],arguments[1],arguments[2],arguments[3]);
            }
        }
        this._pageListenString = function (events, listenerArgs, callback) {
            if (!Lib.JS.isString(events) && !Lib.JS.isArray(events)) {
                log.error("The first paramater (events) must be a string or array of strings that represents the event to listen too");
            }

            if (Lib.JS.isUndefined(listenerArgs)) {
                log.error("The second paramater must be an object (listenerArgs) or the call back function")
            }

            if (!Lib.JS.isUndefined(callback) && !Lib.JS.isFunction(callback)) {
                log.error("The third paramater must be an function");
            }

            if (Lib.JS.isFunction(listenerArgs)) {
                callback = listenerArgs;
                listenerArgs = {};
            }

            if (Lib.JS.isArray(events)) {
                var listeners = [];
                var eventCounter = 0;
                for (eventCounter = 0; eventCounter < events.length; eventCounter++) {
                    listeners.push(this.addPageListener(events[eventCounter], listenerArgs, callback));
                }
            } else {
                return this.addPageListener(events, listenerArgs, callback);
            }
        };
        this._pageListenObj = function (obj, events, listenerArgs, callback) {
            if (Lib.JS.isUndefined(obj) || (Lib.JS.isUndefined(obj.id) && Lib.JS.isUndefined(obj.ID))) {
                log.error("The first paramater must be defined and have and unique id");
                return false;
            }

            var objID = obj.id || obj.ID;

            if (Lib.JS.isUndefined(events) || (!Lib.JS.isString(events) && !Lib.JS.isArray(events))) {
                log.error("The 2nd paramater (events) must be a string or array of strings that represents the event to listen too");
                return false;
            }

            if (Lib.JS.isUndefined(listenerArgs)) {
                log.error("The 3rd paramater must be an object (listenerArgs) or the call back function")
                return false;
            }

            if (Lib.JS.isUndefined(callback) || !Lib.JS.isFunction(callback)) {
                log.error("The 4th paramater must be an function");
                return false;
            }

            if (Lib.JS.isFunction(listenerArgs)) {
                callback = listenerArgs;
                listenerArgs = {};
            }

            if (Lib.JS.isArray(events)) {
                for (var eventCounter = 0; eventCounter < events.length; eventCounter++) {
                    this.addPageListener(objID, events[eventCounter], listenerArgs, callback);
                }
            } else {
                return this.addPageListener(objID, events, listenerArgs, callback);
            }
        };

		this.listen = function () {
			if(arguments.length ===3){
				this._listenString(arguments[0],arguments[1],arguments[2]);
			}else if(arguments.length ===4){
				this._listenObj(arguments[0],arguments[1],arguments[2],arguments[3]);
			}
		}
		this._listenObj = function (obj, events, listenerArgs, callback) {
			if (Lib.JS.isUndefined(obj) || (Lib.JS.isUndefined(obj.id) && Lib.JS.isUndefined(obj.ID))) {
                log.error("The first paramater must be defined and have and unique id");
				return false;
            }
			
			var objID = obj.id || obj.ID;
			 
            if (!Lib.JS.isString(events) && !Lib.JS.isArray(events)) {
                log.error("The 2nd paramater (events) must be a string or array of strings that represents the event to listen too");
				return false;
            }

            if (Lib.JS.isUndefined(listenerArgs)) {
                log.error("The 3rd paramater must be an object (listenerArgs) or the call back function")
				return false;
            }

            if (Lib.JS.isUndefined(callback) || !Lib.JS.isFunction(callback)) {
                log.error("The 4th paramater must be an function");
				return false;
            }

            if (Lib.JS.isFunction(listenerArgs)) {
                callback = listenerArgs;
                listenerArgs = {};
            }
			
            if (Lib.JS.isArray(events)) {
                for (var eventCounter = 0; eventCounter < events.length; eventCounter++) {
                    this.addListener(objID, events[eventCounter], listenerArgs, callback);
                }
            } else {
                return this.addListener(objID, events, listenerArgs, callback);
            }
        };
        this._listenString = function (events, listenerArgs, callback) {
            if (!Lib.JS.isString(events) && !Lib.JS.isArray(events)) {
                log.error("The first paramater (events) must be a string or array of strings that represents the event to listen too");
            }

            if (Lib.JS.isUndefined(listenerArgs)) {
                log.error("The second paramater must be an object (listenerArgs) or the call back function")
            }

            if (!Lib.JS.isUndefined(callback) && !Lib.JS.isFunction(callback)) {
                log.error("The third paramater must be an function");
            }

            if (Lib.JS.isFunction(listenerArgs)) {
                callback = listenerArgs;
                listenerArgs = {};
            }

            if (Lib.JS.isArray(events)) {
                var listeners = [];
                var eventCounter = 0;
                for (eventCounter = 0; eventCounter < events.length; eventCounter++) {
                    listeners.push(this.addListener(events[eventCounter], listenerArgs, callback));
                }
            } else {
                return this.addListener(events, listenerArgs, callback);
            }
        };

        this.triggerBoth = function (caller, event, eventString) {
            this._triggerSting(eventString + '_' + event,caller);
            this._triggerObj(caller,event);
        };
		this.trigger = function () {
            if(Lib.JS.isString(arguments[0])){
				this._triggerSting(arguments[0],arguments[1]);
			}else{
				this._triggerObj(arguments[0],arguments[1],arguments[2]);
			}
        };
		this._triggerObj = function (obj,event, triggerArgs) {
			if (Lib.JS.isUndefined(obj) || (Lib.JS.isUndefined(obj.id) && Lib.JS.isUndefined(obj.ID))) {
                log.error("The first paramater must be defined and have and unique id");
				return false;
            }
			
			var objID = obj.id || obj.ID;
			
			if (Lib.JS.isUndefined(EventBroker.objConnections[objID])) {
                log.debug('the event ' + objID + ':' + event + ' does not have any listeners');
                return false;
            }
			
			if (Lib.JS.isDefined(EventBroker.objConnections[objID][event]) && EventBroker.objConnections[objID][event].length) {
				for (var listenerCounter = 0; listenerCounter < EventBroker.objConnections[objID][event].length; listenerCounter++) {
					var listener = EventBroker.objConnections[objID][event][listenerCounter];

                    if(Lib.JS.isUndefined(listener.page) || (listener.page && listener.listenerArgs.shadowRoot.contains(obj))){
                        listener.callback.call(listener.listenerArgs, {target:obj,event,triggerArgs});
                    }
				}
            }
			
			if (Lib.JS.isDefined(EventBroker.objConnections[objID][this.listenAll]) && EventBroker.objConnections[objID][this.listenAll].length) {
				for (var listenerCounter = 0; listenerCounter < EventBroker.objConnections[objID][this.listenAll].length; listenerCounter++) {
					var listener = EventBroker.objConnections[objID][this.listenAll][listenerCounter];

                    if(Lib.JS.isUndefined(listener.page) || (listener.page && listener.listenerArgs.shadowRoot.contains(obj))){
                        listener.callback.call(listener.listenerArgs, {target: obj, event, triggerArgs});
                    }
				}
            }
        };
		this._triggerSting = function (event, triggerArgs) {
            triggerArgs = Lib.JS.setDefaultParameter(triggerArgs, {});

            if (Lib.JS.isUndefined(EventBroker.strConnections[event]) || EventBroker.strConnections[event].length === 0) {
                log.debug('the event ' + event + ' does not have any listeners');
                return false;
            }

            var listenerCounter = 0;

            for (listenerCounter = 0; listenerCounter < EventBroker.strConnections[event].length; listenerCounter++) {
                var listener = EventBroker.strConnections[event][listenerCounter];
                if(Lib.JS.isUndefined(listener.page) || (listener.page && listener.listenerArgs.shadowRoot.contains(triggerArgs))){
                    listener.callback.call(listener.listenerArgs, triggerArgs);
                }
            }
        };
        //Used to remove a listeneter, used if you only want to listen to an event once
    };
    creation.call(EventBroker);
}

//The data broker is public static moderator object.  It allows any object to trigger and/or listen to custome data calls.
//DataCalls must have unique string names.
if (Lib.JS.isUndefined(DataBroker)) {
    var DataBroker = Object.create(Broker);

    var creation = function () {

        var log = new Logger('DataBroker.js', CLL.debug);
		
        this.listen = function (dataCall, listenerArgs, callback) {

            if (!Lib.JS.isString(dataCall) && !Lib.JS.isArray(dataCall)) {
                log.error("The first paramater (dataCalls) must be a string or array of strings that represents the dataCall to listen too");
            }

            if (Lib.JS.isUndefined(listenerArgs)) {
                log.error("The second paramater must be an object (listenerArgs) or the call back function")
            }

            if (Lib.JS.isUndefined(callback) || (!Lib.JS.isFunction(callback) && !Lib.JS.isString(callback))) {
                log.error("The third paramater must be an function or a string");
            }

            if (Lib.JS.isFunction(listenerArgs)) {
                callback = listenerArgs;
                listenerArgs = {};
            }

            if (Lib.JS.isArray(dataCall)) {
                log.error("dataCall listeners must be unique");
            } else {
                return this.addListener(dataCall, listenerArgs, callback);
            }
        };
        this.trigger = function (dataCall, triggerArgs) {
            triggerArgs = Lib.JS.setDefaultParameter(triggerArgs, {});

            if (Lib.JS.isUndefined(DataBroker.strConnections[dataCall]) || DataBroker.strConnections[dataCall].length === 0) {
                log.debug('the dataCall ' + dataCall + ' does not have any listeners');
                return false;
            }

            var listener = DataBroker.strConnections[dataCall][0];
			
			//if the dataCall is a string an not a function then simply try pass the data on the listenerArgs object
			if(Lib.JS.isString(dataCall) && Lib.JS.isDefined(listener.listenerArgs[dataCall])){
				return listener.listenerArgs[dataCall];
			}
			
            return listener.callback(listener.listenerArgs, triggerArgs);
        };
    };
    creation.call(DataBroker);
}