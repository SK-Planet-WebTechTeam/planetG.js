define("pwge/runtime", function() {
    /**
     * runtime 모듈
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
         * devicePixelRatio 값
         * @type {Number}
         */
        this.devicePixelRatio = devicePixelRatio;

        /**
         * Canvas context의 backingStorePixelRatio
         * @type {Number}
         */
        this.backingStorePixelRatio = backingStoreRatio;

        /**
         * pixelRatio (devicePixelRatio / backingStorePixelRatio)
         * @type {Number}
         */
        this.pixelRatio = devicePixelRatio / backingStoreRatio;

        /**
         * planetWebview 적용여부
         * @type {Boolean}
         */
        this.planetWebview = (typeof context.flush === "function");
    }).call(runtime, document.createElement("canvas"));

    /**
     * ECMAScript5의 Object.defineProperty의 지원여부
     * @type {Boolean}
     */
    runtime.defineProperty = (typeof Object.defineProperty === "function");

    /**
     * HTMLAudioElement 지원여부
     * @type {Boolean}
     */
    runtime.HTMLAudioElement = window.HTMLAudioElement || false;

    /**
     * AudioContext 지원여부
     * @type {Boolean}
     */
    runtime.AudioContext = window.AudioContext || window.webkitAudioContext || false;

    if (/Android/.test(window.navigator.userAgent)) {
        runtime.AudioContext = window.AudioContext || false;
    }

    return runtime;
});