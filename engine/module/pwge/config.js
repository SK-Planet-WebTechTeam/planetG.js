define("pwge/config", function() {
    /**
     * config module
     * have default settings as properties.
     * @exports pwge/config
     */
    var config = {};

    /**
     * container element for canvas element.
     * viewport's size and arrangement is decided with this value.
     * @type {HTMLElement}
     * @default window
     */
    config.container = window;

    /**
     * set viewport 
     * "default", "scale_to_fit", "scale_to_fit_width", "scale_to_fit_height", "stretch_to_fit"
     * @type {String}
     * @default "default"
     */
    config.viewport = "default";

    /**
     * arrange left and right of viewport 
     * @type {Object}
     * @example
config.viewportAlign = {
    horizontal : "center", //"left", "right"
    vertical : "middle" //"top", "bottom"
};
     */
    config.viewportAlign = {
        horizontal : "center", //"left", "right"
        vertical : "middle" //"top", "bottom"
    };

    /**
     * set image quality
     * when set as "auto", devicePixelRatio and canvas context's backingStorePixelRatio is calculated and high resolution image is rendered automatically in high resolution (retina) display.
     * can be among "low", "mid", "high"; have huge influence on performance since canvas element is sized according to this setting. 
     * if not in retina display, canvas element size follows the value for resolution, disregard of other designated values.
     * @type {String}
     * @default "low"
     */
    config.quality = "low";


    /**
     * set maximun image quailty 
     * applies only when config.quality is set as "auto"
     * @type {String}
     * @default "low"
     */
    config.maxQuality = "low";

    /**
     * whether planet.webview is supported.
     * @type {Boolean}
     * @default true
     */
    config.planetWebview = true;

    /**
     * loader timeout(ms)
     * @type {Number}
     * @default 30000
     */
    config.loaderTimeout = 30000;

    /**
     * pool size for default board object  
     * @type {Number}
     * @default 16
     */
    config.boardPoolSize = 16;

    /**
     * pool size for default entity object
     * @type {Number}
     * @default 128
     */
    config.entityPoolSize = 128;

    /**
     * wthere canvas.clear() is called on each frame when rendering 
     * @type {Boolean}
     * @default true
     */
    config.clearCanvasOnEveryFrame = true;

    /**
     * whether debug mode is applied. can check fps meter.
     * @type {Boolean}
     * @default false
     */
    config.debug = false;

    return config;
});