define("util/PubSub", function(){
    /**
     * util/PubSub object module
     * it is designated to be used as a base object for inheritance.
     * @exports util/PubSub
     *
     * @example
     * //PubSub object construction
     * var pubsub = new PubSub();
     * pubsub.on("eventName", callbackFunction);
     *
     * @example
     * //PubSub inheritance example
     * var SomeClass = function() {
     *     //PubSub.apply(this, arguments); //it can be ommitted since constructor is empty as of now
     * };
     * SomeClass.prototype = Object.create(PubSub.prototype);
     *
     * var ins = new SomeClass();
     * ins.on("eventName", callbackFunction);
     */
    var PubSub = function(){};

    /**
     * trigger an event
     * @param  {String} eventName the name of an event
     * @param  {Object} obj       an object to be called upon with an event handler
     * @return {Boolean}          return the result of an event handler
     * @example
     * pubsub.trigger("customEventName", something, somethingElse);
     */
    PubSub.prototype.trigger = function(eventName, obj){
        if (typeof this._eventHandler === "undefined") {
            this._eventHandler = {};
            return false;
        }
        if (typeof this._eventHandler[eventName] === "undefined") {
            return false;
        }

        var args = [], ret = true, i, len;

        for (i = 1, len = arguments.length; i < len; i++) {
            args.push(arguments[i]);
        }

        for (i = 0, len = this._eventHandler[eventName].length; i < len; i++) {
            if (typeof this._eventHandler[eventName][i] !== "undefined" && !this._eventHandler[eventName][i].apply(this, args)) {
                ret = false;
            }
        }

        return ret;
    };

    /**
     * register an event handler on an event
     * @param  {String} eventName the name of an event
     * @param  {Function} handler   an event handler
     * @return {util/PubSub}
     * @example
     * pubsub.on("customEventName", handlerFunction);
     * pubsub.on("customEventName anotherEventName", handlerFunction);
     */
    PubSub.prototype.on = function(eventName, handler) {
        var eventNames = eventName.split(" ");
        if (eventNames.length > 1) {
            eventNames.forEach(function(s){
                this.on.call(this, s, handler);
            }, this);
            return this;
        }

        if (typeof this._eventHandler === "undefined") {
            this._eventHandler = {};
        }
        if (typeof this._eventHandler[eventName] === "undefined") {
            this._eventHandler[eventName] = [];
        }

        if (typeof handler === "undefined" && typeof eventName !== "string") { //object
            for (var key in eventName) {
                this.on(key, eventName[key]);
            }
            return this;
        }

        this._eventHandler[eventName].push(handler);
        return this;
    };

    /**
     * de-register an event handler
     * @param  {String} eventName the name of an event
     * @param  {Function} handler an event handler
     * @return {util/PubSub}
     * @example
     * pubsub.off("customEventName", handlerFunction);
     * pubsub.off("customEventName anotherEventName", handlerFunction);
     */
    PubSub.prototype.off = function(eventName, handler) {
        var eventNames = eventName.split(" ");
        if (eventNames.length > 1) {
            eventNames.forEach(function(s){
                this.off.call(this, s, handler);
            }, this);
            return this;
        }

        if (typeof this._eventHandler === "undefined") {
            this._eventHandler = {};
            return this;
        }
        if (typeof this._eventHandler[eventName] === "undefined") {
            return this;
        }

        if (typeof handler === "undefined") { //off all
            delete this._eventHandler[eventName];
            return this;
        }

        var handlers = this._eventHandler[eventName], i = handlers.length;
        while (i--) {
            if (handlers[i] === handler) {
                handlers.splice(i, 1); //FIFO
                return this;
            }
        }
        return this;
    };

    /**
     * register an event handler that will be called only once.
     * after being executed, the event handler will be de-registered automatically
     * @param  {String} eventName the name of an event
     * @param  {Function} handler the event hanler function
     * @return {util/PubSub}
     * @example
     * pubsub.on("customEventName", handlerFunction);
     * pubsub.on("customEventName anotherEventName", handlerFunction);
     */
    PubSub.prototype.once = function(eventName, handler) {
        var eventNames = eventName.split(" ");
        if (eventNames.length > 1) {
            eventNames.forEach(function(s){
                this.once.call(this, s, handler);
            }, this);
            return this;
        }

        if (typeof this._eventHandler === "undefined") {
            this._eventHandler = {};
        }
        if (typeof this._eventHandler[eventName] === "undefined") {
            this._eventHandler[eventName] = [];
        }

        if (typeof handler === "undefined" && typeof eventName !== "string") {
            for (var key in eventName) {
                this.once(key, eventName[key]);
            }
            return this;
        }

        var newHander = function(obj){
            handler.call(this, obj);
            this.off(eventName, newhandler);
        };
        this._eventHandler[eventName].push(newHandler);

        return this;
    };

    return PubSub;
});
