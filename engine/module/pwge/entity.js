define("pwge/entity", ["pwge/spriteManager", "pwge/util", "util/PubSub", "util/easing"], function(spriteManager, util, PubSub, easing){
    /**
     * entity module
     * construct an Entity object.
     * An Entity represent one drawable object by canvas with a sprite image or DOMRenderer.
     * It should be created and reclaimned by util/ObjectPool (object pool for supressing garbage collector).
     * Every Entity pertains to a Board which manage the position and size of the Entity.
     * @class
     * @param {Object} options option object.
     * @exports pwge/entity
     * @requires util/util
     * @requires util/PubSub
     * @requires pwge/spriteManager
     * @example
     * var newEntity = entityPool.allocate(options);
     */
    var Entity = function(options){
        this.id = util.generateId();
        this.owner = null;
        this.domRendering = false;
        this.domRenderer = null;
        this.enabled = true;
        this.baseImage = null;
        this.baseSprite = null;
        this.animation = null;
        this.animationStart = 0;
        this.animationEnd = 0;
        this.sprite = null;
        this.spriteStart = 0;
        this.spriteEnd = 0;
        this.detectable = true;
        this.opacity = 1;
        this.anchorX = 0;
        this.anchorY = 0;
        this.rotate = 0;
        this.scaleX = 1;
        this.scaleY = 1;
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this._z = 0;
        this.width = 0;
        this.height = 0;
        this.dirty = false;

        if (options) {
            util.extend(this, options);
        }
        this._init();
    };

    Entity.prototype = Object.create(PubSub.prototype);

    Entity.prototype._drawProps = ["image", "sx", "sy", "sw", "sh", "dx", "dy", "dw", "dh"];
    Entity.prototype._stepProps = ["owner", "enabled", "x", "y", "z", "opacity", "anchorX", "anchorY", "rotate", "scaleX", "scaleY", "width", "height"];
    Entity.prototype._setLastStep = function(){
        var i, len;
        for (i = 0, len = this._stepProps.length; i < len; i++) {
            this._lastStep[this._stepProps[i]] = this[this._stepProps[i]];
        }
    };
    Entity.prototype._setLastDraw = function(){
        var i, len;
        for (i = 0, len = this._drawProps.length; i < len; i++) {
            this._lastDraw[this._drawProps[i]] = this._drawImageData[this._drawProps[i]];
        }
    };
    Entity.prototype._init = function() {
        var i, len;

        if (!this._drawImageData) {
            this._drawImageData = {}; //image data to be used on drawing
        }
        if(!this._prevDrawImageData){
            this._prevDrawImageData = {}; //draw status of a previous frame
        }
        if (!this._lastStep) {
            this._lastStep = {}; //step
        }
        if (!this._lastDraw) {
            this._lastDraw = {}; //draw
        }
        for (i = 0, len = this._stepProps.length; i < len; i++) {
            this._lastStep[this._stepProps[i]] = undefined;
        }
        for (i = 0, len = this._drawProps.length; i < len; i++) {
            this._drawImageData[this._drawProps[i]] = undefined;
            this._lastDraw[this._drawProps[i]] = undefined;
        }
    };
    Entity.prototype.getInvalidatedRect = function(){
        var i = 0,
            len = this._drawProps.length,
            ret = {};

        do{
            ret[this._drawProps[i]] = this._prevDrawImageData[this._drawProps[i]];
        } while(++i<len)
        return ret;
    };
    Entity.prototype.saveDrawRect = function(){
        var i, len;

        for (i = 0, len = this._drawProps.length; i < len; i++) {
            this._prevDrawImageData[this._drawProps[i]] = this._drawImageData[this._drawProps[i]];
        }
    };
    Entity.prototype._checkDirty = function(){
        var key;

        for (var i = 0, len = this._stepProps.length; i < len; i++) {
            if (this._lastStep[this._stepProps[i]] !== this[this._stepProps[i]]) {
                if (this.owner) {
                    this.owner.dirty = this.dirty = true;
                    return true;
                }
            }
        }

        for (var i = 0, len = this._drawProps.length; i < len; i++) {
            if (this._lastDraw[this._drawProps[i]] !== this._drawImageData[this._drawProps[i]]) {
                if (this.owner) {
                    this.owner.dirty = this.dirty = true;
                    return true;
                }
            }
        }

        return false;
    };

    /**
     * Board calls its Entity.step() for calculating x, y, width, height.
     * Entity.step() is expected to be overidden by game app's own step() method.
     * @param  {String} dt timeline progress
     */
    Entity.prototype.step = function(dt) {
        if (this.animation) {
            if (dt >= this.animationStart/* && dt <= this.animationEnd*/) {
                this.animation.step.call(this, dt);
            }

            if (dt > this.animationEnd) {
                var fn;
                if (typeof this.animation.callback === "function") {
                    fn = this.animation.callback;
                }
                //To prevent animate() from being called in a callback, set this.animation to null
                this.animation = null;
                if (fn) {
                    fn.call(this);
                }
            }
        }
    };

    /**
     * Board calls its Entity.draw() to draw Entity onto frame buffer (canvas or DOM)
     * By default, it assume sprite image. You can override this method for your own implementation
     * @param  {String} dt timeline progress
     */
    Entity.prototype.draw = function(dt) {
        if (this.sprite) {
            var past = dt - this.spriteStart,
                totalDuration = (this.sprite.options.duration + this.sprite.options.sleep) * this.sprite.options.repeat;
            if (this.sprite && this.baseImage && past > totalDuration) {
                this.sprite = null;
                this.drawImage(this.baseImage,
                    0,
                    0,
                    this.baseImage.width,
                    this.baseImage.height,
                    this.owner.x + this.x,
                    this.owner.y + this.y,
                    this.width,
                    this.height
                );
            } else {
                if (this.baseSprite && this.sprite.name !== this.baseSprite.name && !this.sprite.options.loop && past > totalDuration) {
                    this.applySprite(this.baseSprite.name); //reapply baseSprite
                }
                this.sprite.draw.call(this, past);
            }
        } else if (this.baseImage) {
            this.drawImage(this.baseImage,
                0,
                0,
                this.baseImage.width,
                this.baseImage.height,
                this.owner.x + this.x,
                this.owner.y + this.y,
                this.width,
                this.height
            );
        }
    };

    Entity.prototype.drawImage = function(image, sx, sy, sw, sh, dx, dy, dw, dh) {
        var viewport = this._objectPool._owner.viewport,
            renderRatio = viewport.renderRatio;
        this._drawImageData.image = image;
        this._drawImageData.sx = sx;
        this._drawImageData.sy = sy;
        this._drawImageData.sw = sw;
        this._drawImageData.sh = sh;
        this._drawImageData.dx = (dx - this.anchorX) * renderRatio;
        this._drawImageData.dy = (dy - this.anchorY) * renderRatio;
        this._drawImageData.dw = (dw * renderRatio);
        this._drawImageData.dh = (dh * renderRatio);

        if ((this._drawImageData.sx + this._drawImageData.sw) > image.width) {
            this._drawImageData.sw = image.width - this._drawImageData.sx;
        }
        if ((this._drawImageData.sy + this._drawImageData.sh) > image.height) {
            this._drawImageData.sh = image.height - this._drawImageData.sy;
        }
    };

    Entity.prototype._updateInvalidatedRegion = function(invalidatedRects) {
        if( this.owner._bgInit ){
            this.owner._bgInit = false;
            return this._flush();
        }

        var data,
            temp_image,
            renderRatio = this._objectPool._owner.viewport.renderRatio,
            imageRatio = this._objectPool._owner.viewport.imageRatio,
            x = ((this.owner.x + this.x) * renderRatio),
            y = ((this.owner.y + this.y) * renderRatio),
            context = this._objectPool._owner.canvas.ctx,
            ctxChanged;

        for(i=0; i<invalidatedRects.length; i++){
            data = invalidatedRects[i];
            temp_image = data.image;
            data.image = this._drawImageData.image;
            ctxChanged = false;

            if (data.image && data.sw > 0 && data.sh > 0) {
                if (this.opacity !== 1 || this.rotate || this.scaleX !== 1 || this.scaleY !== 1) {
                    context.save();
                    ctxChanged = true;
                }
                if (this.opacity !== 1) {
                    context.globalAlpha = this.opacity;
                }
                if (this.rotate || this.scaleX !== 1 || this.scaleY !== 1) {
                    context.translate(x, y);
                    context.rotate(this.rotate);
                    context.scale(this.scaleX, this.scaleY);
                    context.translate(-x, -y);
                }
                context.drawImage(data.image, data.dx/renderRatio*imageRatio, data.dy/renderRatio*imageRatio, data.dw/renderRatio*imageRatio, data.dh/renderRatio*imageRatio, data.dx, data.dy, data.dw, data.dh);
                if (ctxChanged) {
                    context.restore();
                }
            }

            data.image = temp_image;
        }
    };

    Entity.prototype._flush = function() {
        this._setLastStep();

        var data = this._drawImageData,
            renderRatio = this._objectPool._owner.viewport.renderRatio,
            x = ((this.owner.x + this.x) * renderRatio),
            y = ((this.owner.y + this.y) * renderRatio),
            context = this._objectPool._owner.canvas.ctx,
            ctxChanged = false;

        if (data.image && data.sw > 0 && data.sh > 0) {
            if (this.opacity !== 1 || this.rotate || this.scaleX !== 1 || this.scaleY !== 1) {
                context.save();
                ctxChanged = true;
            }
            if (this.opacity !== 1) {
                context.globalAlpha = this.opacity;
            }
            if (this.rotate || this.scaleX !== 1 || this.scaleY !== 1) {
                context.translate(x, y);
                context.rotate(this.rotate);
                context.scale(this.scaleX, this.scaleY);
                context.translate(-x, -y);
            }
            if(!!this.domRendering) {
                //when this Entity is bound to DOMRender
                var renderer = this.domRenderer,
                    ws,
                    hs;

                if(renderer.xScale > 0) {
                    ws = renderer.xScale;
                } else {
                    ws = data.dw/renderer.refDOMNode.clientWidth*renderer.owner.xScale;
                    renderer.xScale = ws;
                }
                if(renderer.yScale > 0) {
                    hs = renderer.yScale;
                } else {
                    hs = data.dh/renderer.refDOMNode.clientHeight*renderer.owner.yScale;
                    renderer.yScale = hs;
                }

                var tmp = '-webkit-transform: translate3d(' + data.dx*renderer.owner.xScale + 'px,' + data.dy*renderer.owner.yScale + 'px,0) ';
                tmp += 'scale('+ ws + "," + hs + ')';
                this.domRenderer.draw( tmp );
            } else {
                //when this Entity is rendered onto <canvas>
                context.drawImage(data.image, data.sx, data.sy, data.sw, data.sh, data.dx, data.dy, data.dw, data.dh);
            }
            if (ctxChanged) {
                context.restore();
            }
            this._setLastDraw();
        }
    };

    /**
     * add Entity to Board.
     * @param {String} boardName the name of Board
     * @return {Entity}
     */
    Entity.prototype.addTo = function(boardName) {
        this._objectPool._owner.boardManager.getBoard(boardName).addEntity(this);

        return this;
    };

    /**
     * Enable Entity to be rendered.
     * Only when it is enable, step() and draw for this Entity will be called
     * @return {Entity}
     */
    Entity.prototype.enable = function() {
        this.enabled = true;
        return this;
    };

    /**
     * Disable Entity not to be rendered.
     * @return {Entity}
     */
    Entity.prototype.disable = function(name) {
        this.enabled = false;
        return this;
    };

    /**
     * TODO
     * resize the size of Entity
     * @param {Number} resize ratio
     * @return {Entity}
     */
    Entity.prototype.scale = function(ratio, corner) {
        this.width *= ratio;
        this.height *= ratio;
        return this;
    };

    /**
     * Return Board that containing Entity.
     * @return {Board | Null}
     */
    Entity.prototype.getOwnerBoard = function() {
        return this.owner;
    };

    /**
     * Set a default spriate image to Entity
     * @param {String} spriteName the name of sprite image
     * @param  {Number} startTime  the start time
     * @return {Entity}
     */
    Entity.prototype.setBaseSprite = function(spriteName, startTime) {
        startTime = startTime || 0;
        this.baseSprite = spriteManager.get(spriteName);
        if (!this.sprite || this.sprite.name !== spriteName) {
            this.applySprite.call(this, spriteName, startTime);
        }

        return this;
    };

    /**
     * Set a default image to Entity
     * It cannot be used together with setBaseSprite() at the same time
     * @param {HTMLImageElement} image
     */
    Entity.prototype.setBaseImage = function(image) {
        this.baseImage = image;
        return this;
    };

    /**
     * Set an one-time sprite image.
     * After being rendered with the sprite image, the default sprite image will be used again from the next draw()
     * @param {String} spriteName the name of Sprite
     * @param  {Number} startTime  the start time
     * @return {Entity}
     */
    Entity.prototype.applySprite = function(spriteName, startTime) {
        this.sprite = spriteManager.get(spriteName);
        if (this.sprite) {
            this.spriteStart = (typeof startTime !== "undefined") ? startTime : ((this.owner) ? this.owner.now() : 0);
            this.spriteEnd = this.spriteStart + this.sprite.options.duration + this.sprite.options.sleep;
            if (this.sprite.options.loop) {
                this.spriteEnd = Infinity;
            }
        }

        return this;
    };

    /**
     * Set a temporary animation to Entity
     * @param {Object | String} animation Animation object
     * @param  {Number} startTime  start time
     * @return {Entity}
     */
    Entity.prototype.animate = function(animation, startTime) {
        this.animation = animation;
        this.animation.step = this._makeAnimationStepFunction(animation);
        this.animationStart = startTime || ((this.owner) ? this.owner.now() : 0);
        this.animationEnd = this.animationStart + this.animation.duration;

        if (this.owner) {
            this.step.call(this, this.owner.now()); //step() 실행시 prototype 메서드가 실행되는 경우가 있음. 갤럭시 팝. LG등. 정확한 원인 파악되지 않았음.
        }

        return this;
    };

    Entity.prototype._makeAnimationStepFunction = function(options) {
        var start = options.from,
            end = options.to;

        return function(dt) {
            var past = (dt - this.animationStart),
                key;

            for (key in start) {
                this[key] = start[key] + easing[options.easing[key]](past, 0, end[key] - start[key], options.duration);
            }
        };
    };

    /**
     * Delete Entity and then return it into ObjectPool
     */
    Entity.prototype.destroy = function() {
        if (!!this.domRenderer) {
            this.domRenderer.owner.returnRendererNode(this.domRenderer);
        }
        if (this.owner) {
            //When DOMRender is enabled, the invalidated rectangle of this Entity is added into Board.
            var bm = this.owner.getBoardManager();
            bm.invalidatedRects.push(this.getInvalidatedRect());
            this.owner.removeEntity(this);
        } else {
            console.log("WARNING: destory entity that does not pertain to Board. Did you really mean it?");
        }

        this._objectPool.free(this);
    };

    return Entity;
});
