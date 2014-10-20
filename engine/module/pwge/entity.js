define("pwge/entity", ["pwge/spriteManager", "pwge/util", "util/PubSub", "util/easing"], function(spriteManager, util, PubSub, easing){
    /**
     * entity 모듈
     * Entity 객체를 생성한다.
     * Entity 객체는 직접생성하여 쓰기보다 util/ObjectPool로 관리하여 ObjectPool.allocate() 메서드로 할당해 사용하는게 좋다.
     * Board에 추가될 객체의 위치와 크기에 대한 값을 가진다.
     * @class
     * @param {Object} options 옵션 객체.
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
        // console.log(this._lastStep)
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
            this._drawImageData = {}; //draw때 적용될 이미지의 데이터
        }
        if(!this._prevDrawImageData){
            this._prevDrawImageData = {}; //이전 frame의 draw 상태를 저장
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
                    this.owner.dirty = true;
                    return true;
                }
            }
        }

        for (var i = 0, len = this._drawProps.length; i < len; i++) {
            if (this._lastDraw[this._drawProps[i]] !== this._drawImageData[this._drawProps[i]]) {
                if (this.owner) {
                    this.owner.dirty = true;
                    return true;
                }
            }
        }

        return false;
    };

    /**
     * Board에 의해 호출되어, Entitiy들의 위치, 크기값을 계산한다.
     * 기본적으로 animation을 적용하여 x, y, width, height 값을 계산하고, 필요시 오버라이딩하여 사용한다.
     * @param  {String} dt 렌더러의 타임라인 진행시간
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
                this.animation = null; //callback 내부에서 animate()를 실행하여 문제가 될 수 있기때문에 this.animation을 null로 바꿔주고 콜백을 실행

                if (fn) {
                    fn.call(this);
                }
            }
        }
    };

    /**
     * Board에 의해 호출되어, step메서드에 의해 결정된 x, y, width, height값을 토대로 entity를 화면에 그린다.
     * 기본적으로 sprite를 적용하게 되며, 필요시 오버라이딩하여 사용한다.
     * @param  {String} dt 렌더러의 타임라인 진행시간
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
        // var invalidatedRects = this.owner.invalidatedRects;
        if(invalidatedRects.length < 1 || this.owner._bgInit ){
            this.owner._bgInit = false;
            return this._flush();
        }

        // this._setLastStep();
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
            data.image = this._drawImageData.image;//image source는 모두 배경 이미지로 바꾸자
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
                // this._setLastDraw();
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
                //domRenderer로 본 Entity를 rendering 하는 경우
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
                //canvas로 rendering 하는 경우
                context.drawImage(data.image, data.sx, data.sy, data.sw, data.sh, data.dx, data.dy, data.dw, data.dh);
            }
            if (ctxChanged) {
                context.restore();
            }
            this._setLastDraw();
        }
    };

    /**
     * Entity를 Board에 추가한다.
     * @param {String} boardName Board의 이름
     * @return {Entity}
     */
    Entity.prototype.addTo = function(boardName) {
        this._objectPool._owner.boardManager.getBoard(boardName).addEntity(this);

        return this;
    };

    /**
     * Entity가 렌더링되도록 enable 시킨다.
     * enable된 상태에서만 렌더러에 의해 step, draw 메서드가 호출된다.
     * @return {Entity}
     */
    Entity.prototype.enable = function() {
        this.enabled = true;
        return this;
    };

    /**
     * Entity가 렌더링되지 않도록 disable 시킨다.
     * disable된 상태에서는 렌더러에 의해 step, draw 메서드가 호출되지 않는다.
     * @return {Entity}
     */
    Entity.prototype.disable = function(name) {
        this.enabled = false;
        return this;
    };

    /**
     * TODO
     * Entity의 크기를 확대축소한다.
     * @param {Number} ratio 확배배율
     * @return {Entity}
     */
    Entity.prototype.scale = function(ratio, corner) {
        this.width *= ratio;
        this.height *= ratio;
        return this;
    };

    /**
     * Entity가 포함된 Board를 구한다.
     * @return {Board | Null}
     */
    Entity.prototype.getOwnerBoard = function() {
        return this.owner;
    };

    /**
     * Entity에 기본으로 적용될 Sprite를 지정한다.
     * @param {String} spriteName Sprite 이름
     * @param  {Number} startTime  적용이 시작될 시간
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
     * Entitiy에 적용될 이미지를 지정한다.
     * draw를 인스턴스메서드로 지정하기 때문에 한번 설정된 이후에는 Sprite가 적용되지 않는다.
     * @param {HTMLImageElement} image
     */
    Entity.prototype.setBaseImage = function(image) {
        this.baseImage = image;
        return this;
    };

    /**
     * Entity에 일시적으로 적용할 Sprite를 지정한다.
     * 적용된 후(Sprite의 duration + sleep 이후)에는 다시 기본 Sprite가 적용된다.
     * @param {String} spriteName Sprite 이름
     * @param  {Number} startTime  적용이 시작될 시간
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
     * Entity에 일시적으로 적용할 Animation을 지정한다.
     * Animation의 duration 기간동안만 적용된다.
     * @param {Object | String} animation Animation 객체
     * @param  {Number} startTime  적용이 시작될 시간
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
     * Entity를 삭제한다.
     * 삭제된 후에는 다시 객체 풀에 반환된다.
     */
    Entity.prototype.destroy = function() {
        if (!!this.domRenderer) {
            this.domRenderer.owner.returnRendererNode(this.domRenderer);
        }
        if (this.owner) {
            //invalidate 되야 될 영역이 있다면 먼저 board manager의 invalidatedRects에 등록 하여준다
            var bm = this.owner.getBoardManager();
            bm.invalidatedRects.push(this.getInvalidatedRect());
            this.owner.removeEntity(this);
        }

        this._objectPool.free(this);
    };

    return Entity;
});