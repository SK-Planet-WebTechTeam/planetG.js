define("pwge/spriteManager", ["pwge/canvas", "util/easing", "pwge/util"], function(canvas, easing, util){
    var spriteMap = {},
        /**
         * sprite module
         * manages a image or sprite image for Entity
         * @exports pwge/spriteManager
         * @requires pwge/canvas
         * @requires pwge/easing
         * @requires pwge/util
         */
        spriteManager = {},
        Sprite;

    /**
     * Sprite module
     * should not be direclty accessed by an application,
     * but should be accessed through a spriteManager module
     * @class
     * @param  {String} name the name of Sprite
     * @param  {HTMLImageElement} image sprite image element
     * @param  {Object} options option
     *
     * @example
     * spriteManager.set(name, image, options);
     */
    Sprite = function(name, image, options){
        var i;

        this.name = name;
        this.image = image;

        this.options = util.extend({
            loop : false,
            repeat : 1,
            duration : 0,
            sleep : 0,
            order : [],
            easing : "linear"
        }, options);
        this.x = this.options.x;
        this.y = this.options.y;
        this.width = this.options.width;
        this.height = this.options.height;
        this.lastAwake = 0;
        this.easingFn = easing[this.options.easing];

        if (!this.options.order.length) {
            for (i = 0; i < this.options.frames; i++) {
                this.options.order.push(i);
            }
        }

        this.uniqueFrames = [];
        this.options.order.forEach(function(v){
            if (this.options.order.indexOf(v) > -1 && this.uniqueFrames.indexOf(v) < 0) {
                this.uniqueFrames.push(v);
            }
        }, this);
    };

    /**
     * @private
     * @param  {Number} dt timeline progress in msec
     */
    Sprite.prototype.draw = function(dt) {
        var image = this.sprite.image,
            sx = this.sprite.x + this.sprite._getCurrentFrame(dt) * this.sprite.width,
            sy = this.sprite.y,
            sw = Math.min(this.sprite.options.width, this.sprite.width), //이미지 크기보다 클 경우 렌더링 오류
            sh = Math.min(this.sprite.options.height, this.sprite.height), //이미지 크기보다 클 경우 렌더링 오류
            dx = this.owner.x + this.x,// - this.anchorX,
            dy = this.owner.y + this.y,// - this.anchorY,
            dw = this.width,
            dh = this.height;

        this.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
    };

    /**
     * get a specified frame as a image out of a sprite image
     * @param  {Number} frameNo the frame number (0~)
     * @return {HTMLCanvasElement}
     * @example
     * entityPool.allocate({
     *     x : 50,
     *     y : 200,
     *     width : 340,
     *     height : 235
     * }).setBaseImage(spriteManager.get("spriteName").getFrameAsImage(0));
     */
    Sprite.prototype.getFrameAsImage = function(frameNo) {
        var ctx = canvas.offscreen().getContext("2d");

        ctx.drawImage(this.image,
            this.x + this.width * frameNo,
            this.y,
            this.width,
            this.height,
            this.x,
            this.y,
            this.width,
            this.height
        );
        return ctx.canvas;
    };

    Sprite.prototype._getCurrentFrame = function(dt) {
        if (this.options.frames === 1) {
            return 0;
        }

        dt = Math.max(0, dt);

        if (!this.options.loop && dt > (this.options.duration + this.options.sleep) * this.options.repeat) {
            return this.options.order[this.options.order.length - 1];
        }
        return this.options.order[Math.min(this.options.order.length - 1, Math.floor(this.easingFn(dt % (this.options.duration + this.options.sleep), 0, this.options.order.length, this.options.duration)))];
    };

    /**
     * get Sprite from spriteMap by name.
     * @param  {String} name the name of Sprite
     * @return {Object}
     */
    spriteManager.get = function(name) {
        return spriteMap[name];
    };

    /**
     * create a Sprite, then initialize it.
     * @param  {String} name the name of Sprite
     * @param  {HTMLImageElement} image the image element of Sprite
     * @param  {Object} options option object
     * @return {sprite}
     * @example
     * spriteManager.set("imageName", image);
     * entityPool.allocate({
     *     x : 50,
     *     y : 200,
     *     width : 340,
     *     height : 235
     * }).setBaseSprite("imageName");
     */
    spriteManager.set = function(name, image, options) {
        if (typeof options !== "undefined") {
            ["x", "y", "width", "height"].forEach(function(p){
                options[p] = (options[p] * this._owner.viewport.imageRatio);
            }, this);
        } else {
            options = { x : 0, y : 0, width : image.width, height : image.height, frames : 1 };
        }

        spriteMap[name] = new Sprite(name, image, options);
        return this;
    };

    return spriteManager;
});