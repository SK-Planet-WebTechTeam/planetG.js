define("pwge/canvas", function(){
    /**
     * canvas 모듈
     * @class
     * @exports pwge/canvas
     * @param {pwge/game}
     */
    var Canvas = function(owner) {
        this.setElement(owner.config.canvas);
    };

    /**
     * canvas 엘리먼트를 설정한다.
     * canvas 엘리먼트가 아닐경우, container로 설정하고, 그 안에 새로운 canvas 엘리먼트를 만든다.
     * @param {HTMLCanvasElement | HTMLElement} el canvas 엘리먼트
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
     * canvas 엘리먼트를 resize한다.
     * @param  {Number} w 너비
     * @param  {Number} h 높이
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
     * canvas를 모두 지운다.
     * @return {canvas} this
     */
    Canvas.prototype.clear = function() {

        // this.ctx.save(); 

        // this.ctx.fillStyle = "#fff";
        //this.ctx.fillStyle = "rgba(255, 255, 255, 1.0)";
        // this.ctx.flobalAlpha = 1;
        // this.ctx.fillRect(0, 0, this.width, this.height);

        // this.ctx.restore();

        // this.ctx.clearRect(0, 0, this.width, this.height); //beware do this on android
        this.ctx.clearRect(0, 0, this.width, this.height - 1);
        return this;
    };

    /**
     * offscreen canvas element를 생성한다.
     * offscreen canvas element는 Canvas.element와 동일한 크기를 가진다.
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