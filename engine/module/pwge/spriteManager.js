define("pwge/spriteManager", ["pwge/canvas", "util/easing", "pwge/util"], function(canvas, easing, util){
    var spriteMap = {},
        /**
         * sprite 모듈
         * <br>Entity에 적용될 이미지나 스프라이트애니메이션을 설정한다.
         * @exports pwge/spriteManager
         * @requires pwge/canvas
         * @requires pwge/easing
         * @requires pwge/util
         */
        spriteManager = {},
        Sprite;

    /**
     * Sprite 객체
     * 직접생성하여 쓰지 않고 spriteManager 모듈을 통해 사용한다.
     * @class
     * @param  {String} name 이름
     * @param  {HTMLImageElement} image 스프라이트 이미지 엘리먼트
     * @param  {Object} options 설정옵션객체
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
     * @param  {Number} dt 타임라인 진행시간
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
     * 스프라이트의 특정 프레임을 image로 불러온다.
     * @param  {Number} frameNo 프레임 번호 (0~)
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
        return this.options.order[Math.min(this.options.order.length - 1, Math.floor(easing[this.options.easing](dt % (this.options.duration + this.options.sleep), 0, this.options.order.length, this.options.duration)))];
    };

    /**
     * Sprite 객체를 가져온다.
     * @param  {String} name 이름
     * @return {Object}
     */
    spriteManager.get = function(name) {
        return spriteMap[name];
    };

    /**
     * Sprite 객체를 생성하여 설정한다.
     * @param  {String} name 이름
     * @param  {HTMLImageElement} image 스프라이트 이미지 엘리먼트
     * @param  {Object} options 설정옵션객체. 애니메이션이 없는 고정 이미지인경우 생략가능하다.
     * @return {sprite}
     * @example
     * //애니메이션이 없는 한장의 이미지를 엔티티에 적용하는 예제
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