define("pwge/game", ["pwge/runtime", "pwge/config", "pwge/canvas", "pwge/input", "pwge/loader", 'pwge/spriteManager', 'pwge/soundManager', 'pwge/boardManager', 'pwge/renderer', 'pwge/entity', "pwge/util", "util/PubSub", "util/ObjectPool", "pwge/domRenderer"], function(runtime, config, Canvas, Input, loader, spriteManager, soundManager, BoardManager, Renderer, Entity, util, PubSub, ObjectPool, DOMRenderer){
    /**
     * game module
     * @exports pwge/game
     * @requires pwge/runtime
     * @requires pwge/config
     * @requires pwge/canvas
     * @requires pwge/input
     * @requires pwge/loader
     * @requires pwge/spriteManager
     * @requires pwge/soundManager
     * @requires pwge/boardManager
     * @requires pwge/renderer
     * @requires pwge/entity
     * @requires pwge/util
     * @requires util/PubSub
     * @requires util/ObjectPool
     * @param {Object} conf 설정 객체
     */
    var Game = function(conf) {
        this.viewport = {};
        this._importModule("runtime", runtime);
        this._importModule("config", config);

        util.extend(this.config, conf);

        this._importModule("canvas", new Canvas(this));
        this._importModule("renderer", new Renderer(this));
        this._importModule("boardManager", new BoardManager(this));
        this._importModule("entityPool", new ObjectPool(Entity, config.entityPoolSize));

        this._importModule("loader", loader);
        this._importModule("spriteManager", spriteManager);
        this._importModule("input", new Input(this));
        this._importModule("soundManager", soundManager);

        if (this.config.debug) {
            require(["pwge/debug"], (function(Debug){
                this._importModule("debug", new Debug(this));
                this.debug.start();
            }).bind(this));
        }

        this._setContainer(this.config.container);
        this._setDesignResolution.apply(this, [this.config.resolution.width, this.config.resolution.height, this.config.resolution.quality] || [this.canvas.element.width, this.canvas.element.height, "low"]);
        this._setViewport(this.config.viewport, this.config.viewportAlign);

        if(this.config.domRendererSelector){
            this._importModule("domRenderer", new DOMRenderer(this.config.domRendererSelector, parseInt(this.canvas.element.style.width,10)/this.canvas.element.width, parseInt(this.canvas.element.style.height,10)/this.canvas.element.height));
        }

        if (this.config.resource) {
            this.loader.loadResources(this.config.resource).then((function(){
                this.trigger("ready");
            }).bind(this));
        }
    };
    Game.prototype = Object.create(PubSub.prototype);

    Game.prototype._setDesignResolution = function(w, h, quality) {
        var pixelRatio,
            PIXEL_RATIO = {
                "low" : 1,
                "mid" : 2,
                "high" : 3
            };

        this.viewport.quality = this.config.quality;
        this.viewport.designQuality = quality;
        this.viewport.designWidth = w;
        this.viewport.designHeight = h;

        switch (this.viewport.designQuality) {
            case "mid":
                w = Math.round(w / 2);
                h = Math.round(h / 2);
            break;
            case "high":
                w = Math.round(w / 3);
                h = Math.round(h / 3);
            break;
        }

        this.viewport.width = w;
        this.viewport.height = h;

        switch (this.viewport.quality) {
            case "auto":
                this.viewport.pixelRatio = Math.min(PIXEL_RATIO[this.config.maxQuality], this.runtime.pixelRatio * Math.round(this.viewport.containerWidth / w));
            break;
            case "low":
                this.viewport.pixelRatio = 1;
            break;
            case "mid":
                this.viewport.pixelRatio = 2;
            break;
            case "high":
                this.viewport.pixelRatio = 3;
            break;
        }

        this.viewport.imageRatio = Math.max( Math.floor(this.viewport.pixelRatio) / PIXEL_RATIO[this.viewport.designQuality], 1 / PIXEL_RATIO[this.viewport.designQuality] );

        //planet.webview
        if (this.runtime.planetWebview) {
            this.viewport.pixelRatio = this.viewport.containerWidth / w;
        }

        return this;
    };

    Game.prototype._setContainer = function(el) {
        this.container = el;
        if (el === window) {
            this.viewport.containerWidth = window.innerWidth;
            this.viewport.containerHeight = window.innerHeight;
        } else {
            this.viewport.containerWidth = el.offsetWidth;
            this.viewport.containerHeight = el.offsetHeight;
        }
        return this;
    };

    Game.prototype._setViewport = function(flag, align) {
        var w = this.viewport.width,
            h = this.viewport.height,
            cw = this.viewport.containerWidth,
            ch = this.viewport.containerHeight,
            rw = cw / w,
            rh = ch / h,
            ml,
            mt;

        switch (flag) {
            case "default" :
                break;
            case "scale_to_fit" :
                if (cw / ch > w / h) {
                    w *= rh;
                    h = ch;
                } else {
                    w = cw;
                    h *= rw;
                }
                break;
            case "stretch_to_fit" :
                w = cw;
                h = ch;
                break;
            case "scale_to_fit_width" :
                w = cw;
                h *= rw;
                break;
            case "scale_to_fit_height" :
                w *= rh;
                h = ch;
                break;
        }

        this.canvas.resize(w, h, this.viewport.pixelRatio);
        this.viewport.renderRatio = this.viewport.canvasWidth / this.viewport.designWidth;

        switch (align.vertical) {
            default:
            case "top":
                mt = 0;
                break;
            case "middle":
                mt = Math.round((ch - h) / 2);
                break;
            case "bottom":
                mt = ch - h;
                break;
        }
        switch (align.horizontal) {
            default:
            case "left":
                ml = 0;
                break;
            case "center":
                ml = Math.round((cw - w) / 2);
                break;
            case "right":
                ml = cw - w;
                break;
        }

        if (this.runtime.planetWebview) {
            this.viewport.width = this.viewport.canvasWidth;
            this.viewport.height = this.viewport.canvasHeight;
            this.viewport.ratioWidth = 1;
            this.viewport.ratioHeight = 1;
        } else {
            this.canvas.element.style.marginLeft = ml + "px";
            this.canvas.element.style.marginTop = mt + "px";

            this.viewport.width = w;
            this.viewport.height = h;
            this.viewport.ratioWidth = rw;
            this.viewport.ratioHeight = rh;
        }

        return this;
    };

    Game.prototype._importModule = function(moduleName, module) {
        this[moduleName] = module;
        this[moduleName]._owner = this;
    };

    return Game;
});