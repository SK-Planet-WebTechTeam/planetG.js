define("util/PubSub", function(){
    /**
     * util/PubSub 객체 모듈
     * 다른 객체에서 상속해서 사용한다.
     * @exports util/PubSub
     *
     * @example
     * //PubSub객체 생성
     * var pubsub = new PubSub();
     * pubsub.on("eventName", callbackFunction);
     *
     * @example
     * //PubSub 상속예제
     * var SomeClass = function() {
     *     //PubSub.apply(this, arguments); //생성자함수에서 하는 일이 없기 때문에 생략가능하다.
     * };
     * SomeClass.prototype = Object.create(PubSub.prototype);
     *
     * var ins = new SomeClass();
     * ins.on("eventName", callbackFunction);
     */
    var PubSub = function(){};

    /**
     * 이벤트를 발생시킨다.
     * @param  {String} eventName 이벤트명
     * @param  {Object} obj       이벤트핸들러에 전달할 객체
     * @return {Boolean}           이벤트핸들러에서 return false가 호출될경우 false를 리턴한다.
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

        var args = Array.prototype.splice.call(arguments, 1),
            ret = true, i, len;

        for (i = 0, len = this._eventHandler[eventName].length; i < len; i++) {
            if (typeof this._eventHandler[eventName][i] !== "undefined" && !this._eventHandler[eventName][i].apply(this, args)) {
                ret = false;
            }
        }

        return ret;
    };

    /**
     * 이벤트핸들러를 등록한다.
     * @param  {String} eventName 이벤트명
     * @param  {Function} handler   이벤트핸들러 함수
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
     * 이벤트핸들러를 해제한다.
     * @param  {String} eventName 이벤트명
     * @param  {Function} handler   이벤트핸들러 함수
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
     * 한번만 실행되는 이벤트핸들러를 등록한다.
     * 실행된 이후에는 자동으로 해제된다.
     * @param  {String} eventName 이벤트명
     * @param  {Function} handler   이벤트핸들러 함수
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
