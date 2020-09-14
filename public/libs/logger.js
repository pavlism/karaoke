//Logging object, this is used to log informaiton at different levels to the console window on the client side and the
//console window n the server side.

var Const = new (function () {
    this.LogLevel = new (function () {
        this.trace = 0;
        this.debug = 1;
        this.info = 2;
        this.warn = 3;
        this.error = 4;
        this.traceOnly = 5;
        this.debugOnly = 6;
        this.infoOnly = 7;
        this.warnOnly = 8;
        this.off = 9;
    })();
})();

CLL = Const.LogLevel;

//Logger used on the client side
Logger = function (fileName, level) {
    //console.log('setup log for: ' + fileName);
    var logLevel = level;

    this.trace = function (message) {
        if (logLevel <= CLL.trace || logLevel=== CLL.traceOnly) {
            console.log('%c Trace: [' + fileName + "] " + message, 'color:grey');
        }
    };
    this.debug = function (message) {
        if (logLevel <= CLL.debug || logLevel=== CLL.debugOnly) {
            console.log('%c Debug: [' + fileName + "] " + message, 'color:blue');
        }
    };
    this.info = function (message) {
        if (logLevel <= CLL.info || logLevel=== CLL.infoOnly) {
            console.log('%c Info: [' + fileName + "] " + message, 'color:black');
        }
    };
    this.warn = function (message) {
        if (logLevel <= CLL.warn || logLevel=== CLL.warnOnly) {
            console.log('%c Warn: [' + fileName + "] " + message, 'color:#EEC900');
        }
    };
    this.error = function (message) {
        if (logLevel <= CLL.error) {
            console.log('%c Error: [' + fileName + "] " + message, 'color:red');
        }
    };
    this.trace(fileName + ' load');
};

//Logger used on the server side
LoggerServer = function (fileName, level) {
    var logLevel = level;

    this.trace = function (message) {
        if (logLevel <= CLL.trace || logLevel=== CLL.traceOnly) {
            console.log('Trace: [' + fileName + "] " + message);
        }
    };
    this.debug = function (message) {
        if (logLevel <= CLL.debug || logLevel=== CLL.debugOnly) {
            console.log('\x1b[36m%s\x1b[0m','Debug: [' + fileName + "] " + message);
        }
    };
    this.info = function (message) {
        if (logLevel <= CLL.info || logLevel=== CLL.infoOnly) {
            console.info('\x1b[33m%s\x1b[0m','Info: [' + fileName + "] " + message);
        }
    };
    this.warn = function (message) {
        if (logLevel <= CLL.warn || logLevel=== CLL.warnOnly) {
            console.log('\x1b[32m%s\x1b[0m','Warn: [' + fileName + "] " + message);
        }
    };
    this.error = function (message) {
        if (logLevel <= CLL.error) {
            console.error('\x1b[31m%s\x1b[0m','Error: [' + fileName + "] " + message);
        }
    };
    this.trace(fileName + ' load');
};