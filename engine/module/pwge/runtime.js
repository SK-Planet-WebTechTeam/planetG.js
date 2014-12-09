define("pwge/runtime", function() {
    /**
     * runtime module
     * @exports pwge/runtime
     */
    var runtime = {};

    (function(canvas){
        var context = canvas.getContext("2d"),
            devicePixelRatio = window.devicePixelRatio || 1,
            backingStoreRatio = context.webkitBackingStorePixelRatio ||
                                context.mozBackingStorePixelRatio ||
                                context.msBackingStorePixelRatio ||
                                context.oBackingStorePixelRatio ||
                                context.backingStorePixelRatio || 1;

        /**
         * devicePixelRatio value
         * @type {Number}
         */
        this.devicePixelRatio = devicePixelRatio;

        /**
         * backingStorePixelRatio of Canvas context
         * @type {Number}
         */
        this.backingStorePixelRatio = backingStoreRatio;

        /**
         * pixelRatio (devicePixelRatio / backingStorePixelRatio)
         * @type {Number}
         */
        this.pixelRatio = devicePixelRatio / backingStoreRatio;

        /**
         * on/off indicator of planetWebview (SK planet internal acceleration engine)
         * @type {Boolean}
         */
        this.planetWebview = (typeof context.flush === "function");
    }).call(runtime, document.createElement("canvas"));

    /**
     * check if Object.defineProperty is supported
     * @type {Boolean}
     */
    runtime.defineProperty = (typeof Object.defineProperty === "function");

    /**
     * check if HTMLAudioElement is supported
     * @type {Boolean}
     */
    runtime.HTMLAudioElement = window.HTMLAudioElement || false;

    /**
     * check if AudioContext is supported
     * @type {Boolean}
     */
    runtime.AudioContext = window.AudioContext || window.webkitAudioContext || false;

    if (/Android/.test(window.navigator.userAgent)) {
        runtime.AudioContext = window.AudioContext || false;
    }

    return runtime;
});