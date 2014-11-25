define("pwge/canvas", function(){
    /**
     * canvas constructor itself
     * @class
     * @exports pwge/canvas
     * @param {pwge/game}
     */
    var Canvas = function(owner) {
        this.setElement(owner.config.canvas);
    };

    /**
     * set el into this.element if it is a canvas element
     * if not, el is considered as a container element, thus create a canvas element as the child of el
     * @param {HTMLCanvasElement | HTMLElement} el canvas element
     */
    Canvas.prototype.setElement = function(el){
        if (el.tagName.toLowerCase() === "canvas") {
            this.container = el.parentNode;
            this.element = el;
        } else {
            this.container = el;
            this.element = document.createElement("canvas");
            el.appendChild(this.element);
        }

        this.ctx = el.getContext("2d");

        return this;
    };

    /**
     * resize canvas with the given width, height, and pixel ratios accordingly
     * @param  {Number} w width
     * @param  {Number} h height
     * @return {canvas}   this
     */
    Canvas.prototype.resize = function(w, h, pixelRatio){
        if (typeof pixelRatio === "undefined") {
            pixelRatio = 1;
        }

        this._owner.viewport.canvasWidth = this.width = this.element.width = Math.round(w * pixelRatio);
        this._owner.viewport.canvasHeight = this.height = this.element.height = Math.round(h * pixelRatio);

        if (!(this._owner.runtime.planetWebview)) {
            this.element.style.width = w + "px";
            this.element.style.height = h + "px";
        }

        return this;
    };

    /**
     * clear canvas
     * @return {canvas} this
     */
    Canvas.prototype.clear = function() {
        // this.ctx.clearRect(0, 0, this.width, this.height);
        // due to the abnormal behaviour on android 2.3, height is decremented by one
        this.ctx.clearRect(0, 0, this.width, this.height - 1);
        return this;
    };

    /**
     * create offscreen canvas element
     * the size of offscree canvas is identical to that of Canvas.element
     * @return {HTMLCanvasElement}
     */
    Canvas.prototype.offscreen = function(){
        var newCanvas = document.createElement("canvas");
        newCanvas.width = this.width;
        newCanvas.height = this.height;
        return newCanvas;
    };

    return Canvas;
});