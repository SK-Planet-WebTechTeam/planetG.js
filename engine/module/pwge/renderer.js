define("pwge/renderer/transition", ["util/easing"], function(easing){
    return {
        fade : function(past, o){ //this -> game.canvas.ctx
            var canvas = this.canvas,
                opacity = easing[o.easing](past, 0, 1, o.duration);

            this.save();
            this.drawImage(o.from, 0, 0, canvas.width, canvas.height);
            this.globalAlpha = opacity;
            this.drawImage(o.to, 0, 0, canvas.width, canvas.height);
            this.restore();
        },
        zoomIn : function(past, o){
            var canvas = this.canvas,
                zoom = easing[o.easing](past, 0, 1, o.duration);

            this.save();
            this.translate(-canvas.width / 2 * zoom + canvas.width / 2, -canvas.height / 2 * zoom + canvas.height / 2);
            this.scale(zoom, zoom);
            this.drawImage(o.to, 0, 0, canvas.width, canvas.height);
            this.restore();
        },
        zoomOut : function(past, o){
            var canvas = this.canvas,
                zoom = 4 - easing[o.easing](past, 0, 3, o.duration);

            this.save();
            this.translate(-canvas.width / 2 * zoom + canvas.width / 2, -canvas.height / 2 * zoom + canvas.height / 2);
            this.scale(zoom, zoom);
            this.drawImage(o.to, 0, 0, canvas.width, canvas.height);
            this.restore();
        },
        slideInRight : function(past, o) {
            var canvas = this.canvas,
                left = Math.round(easing[o.easing](past, 0, canvas.width, o.duration));

            this.save();
            this.translate(-left, 0);
            this.drawImage(o.from, 0, 0, canvas.width, canvas.height);
            this.translate(canvas.width, 0);
            this.drawImage(o.to, 0, 0, canvas.width, canvas.height);
            this.restore();
        },
        slideInLeft : function(past, o) {
            var canvas = this.canvas,
                left = Math.round(easing[o.easing](past, 0, canvas.width, o.duration));

            this.save();
            this.translate(left, 0);
            this.drawImage(o.from, 0, 0, canvas.width, canvas.height);
            this.translate(-canvas.width, 0);
            this.drawImage(o.to, 0, 0, canvas.width, canvas.height);
            this.restore();
        },
        slideInBottom : function(past, o) {
            var canvas = this.canvas,
                top = Math.round(easing[o.easing](past, 0, canvas.height, o.duration));

            this.save();
            this.translate(0, -top);
            this.drawImage(o.from, 0, 0, canvas.width, canvas.height);
            this.translate(0, canvas.height);
            this.drawImage(o.to, 0, 0, canvas.width, canvas.height);
            this.restore();
        },
        slideInTop : function(past, o) {
            var canvas = this.canvas,
                top = Math.round(easing[o.easing](past, 0, canvas.height, o.duration));

            this.save();
            this.translate(0, top);
            this.drawImage(o.from, 0, 0, canvas.width, canvas.height);
            this.translate(0, -canvas.height);
            this.drawImage(o.to, 0, 0, canvas.width, canvas.height);
            this.restore();
        },
        moveInRight : function(past, o) {
            var canvas = this.canvas,
                left = Math.round(easing[o.easing](past, 0, canvas.width, o.duration));

            this.save();
            this.drawImage(o.from, 0, 0, canvas.width, canvas.height);
            this.translate(canvas.width - left, 0);
            this.drawImage(o.to, 0, 0, canvas.width, canvas.height);
            this.restore();
        },
        moveInLeft : function(past, o) {
            var canvas = this.canvas,
                left = Math.round(easing[o.easing](past, 0, canvas.width, o.duration));

            this.save();
            this.drawImage(o.from, 0, 0, canvas.width, canvas.height);
            this.translate(-canvas.width + left, 0);
            this.drawImage(o.to, 0, 0, canvas.width, canvas.height);
            this.restore();
        },
        moveInBottom : function(past, o) {
            var canvas = this.canvas,
                top = Math.round(easing[o.easing](past, 0, canvas.height, o.duration));

            this.save();
            this.drawImage(o.from, 0, 0, canvas.width, canvas.height);
            this.translate(0, canvas.height - top);
            this.drawImage(o.to, 0, 0, canvas.width, canvas.height);
            this.restore();
        },
        moveInTop : function(past, o) {
            var canvas = this.canvas,
                top = Math.round(easing[o.easing](past, 0, canvas.height, o.duration));

            this.save();
            this.drawImage(o.from, 0, 0, canvas.width, canvas.height);
            this.translate(0, top - canvas.height);
            this.drawImage(o.to, 0, 0, canvas.width, canvas.height);
            this.restore();
        }
    };
});

define("pwge/renderer", ["util/PubSub", "pwge/util", "pwge/renderer/transition"], function(PubSub, util, transition){
    /**
     * renderer module
     * @exports pwge/renderer
     * @requires util/PubSub
     * @requires pwge/util
     * @requires pwge/renderer/transition
     */
    var Renderer = function(){
        this._raf = null;
        this._rafBody = (function(){
            if (this._stopRequested) {
                this._isRendering = false;
                this._stopRequested = false;
                this.trigger("stop");
                return;
            }
            this._loop();
        }).bind(this);

        this._now = 0;
        this._scene = {};
        this._currentScene = null;
        this._isRendering = false;
        this._startedTime = 0;
        this._pausedTime = 0;

        this.on("step", function(dt) {
            var i, len, boards = this._owner.boardManager.getBoard();
            for (i = 0, len = boards.length; i < len; i++) {
                if (boards[i] && this.isRendering() && boards[i].enabled) {
                    if (boards[i].b2World) {
                        boards[i].b2World.Step(dt); //b2World.Step
                    } else {
                        boards[i].step(dt);
                    }
                }
            }
        });

        this.on("draw", function(dt) {
            var i, len,
                dirty = false,
                canvas = this._owner.canvas,
                boards = this._owner.boardManager.getBoard(),
                orderedBoards;

            for (i = 0, len = boards.length; i < len; i++) {
                if (boards[i] && this.isRendering() && boards[i].enabled) {
                    boards[i].draw(dt);
                    boards[i]._checkDirty();
                }
            }

            for (i = 0, len = boards.length; i < len; i++) {
                if (this.isRendering() && boards[i].enabled && boards[i].dirty) {
                    dirty = true;
                    break;
                }
            }

            if (dirty) {
                //only when any dirty Entity exists, do rendering
                if (this._owner.config.clearCanvasOnEveryFrame) {
                    canvas.clear();
                }

                //sort
                orderedBoards = util.sortByZ(boards);

                for (i = 0, len = orderedBoards.length; i < len; i++) {
                    if (orderedBoards[i] && this.isRendering() && orderedBoards[i].enabled) {
                        orderedBoards[i]._flush();
                        orderedBoards[i].dirty = false;
                    }
                }
                if (this._owner.runtime.planetWebview && canvas.ctx.canvas === canvas.element) {
                    canvas.ctx.flush();
                }
            }
        });

        this.on("switchScene", function(targetBoards, transition) {
            var boards = this._owner.boardManager.getBoard();
            if (typeof transition !== "undefined") {
                var from, to;
                from = this.snapShot();
                boards.forEach(function(board) {
                    if (targetBoards.indexOf(board.name) > -1) {
                        board.enable();
                    } else {
                        board.disable();
                    }
                });
                to = this.snapShot();
                boards.forEach(function(board) {
                    board.disable();
                });

                this._transition(util.extend(transition, {
                    from : from,
                    to : to,
                    callback : function() {
                        boards.forEach(function(board) {
                            if (targetBoards.indexOf(board.name) > -1) {
                                board.enable();
                            } else {
                                board.disable();
                            }
                        });
                    }
                }));
            } else {
                boards.forEach(function(board) {
                    if (targetBoards.indexOf(board.name) > -1) {
                        board.enable();
                    } else {
                        board.disable();
                    }
                });
            }
        });
        this.on("stop", function() {
            var boards = this._owner.boardManager.getBoard();
            boards.forEach(function(board) {
                if (typeof board._done !== "undefined") {
                    board._done = board._done.map(function(){
                        return false;
                    });
                }
                board.entities.forEach(function(entity){
                    entity._init();
                });

                board.startedTime = 0;
                board.pausedTime = 0;
                board.past = 0;
            });

            this._currentScene = null;
        });

    };
    Renderer.prototype = Object.create(PubSub.prototype);

    Renderer.prototype._loop = function() {
        this._raf = requestAnimationFrame(this._rafBody);
        this._now = +new Date() - this._startedTime + this._pausedTime;
        this.render(this._now);
    };

    /**
     * execute rendering.
     * @return {renderer}
     */
    Renderer.prototype.render = function(time){
        if (this._isRendering) {
            this.trigger("step", time);
            this.trigger("draw", time);
        }
        return this;
    };

    /**
     * start a rendering loop.
     * restart when paused.
     * @return {renderer}
     */
    Renderer.prototype.start = function(){
        if (!this._isRendering) {
            this._startedTime = +new Date();
            this._isRendering = true;
            this._loop();
        }

        return this;
    };

    /**
     * resume rendering.
     * @return {renderer}
     * @see renderer.start
     */
    Renderer.prototype.resume = Renderer.prototype.start;

    /**
     * pause rendering.
     * resume when starts again 
     * @return {renderer}
     */
    Renderer.prototype.pause = function(){
        this._pausedTime = this._now;
        // cancelAnimationFrame(this._raf);
        this._stopRequested = true;
        return this;
    };

    /**
     * stop rendering.
     * @return {renderer}
     */
    Renderer.prototype.stop = function(){
        this._startedTime = 0;
        this._pausedTime = 0;
        this._now = 0;
        // cancelAnimationFrame(this._raf);
        this._stopRequested = true;
        return this;
    };

    /**
     * get the current time tick of renderer.
     * @return {Number} time progress in msec
     */
    Renderer.prototype.now = function(){
        return this._now;
    };

    Renderer.prototype.isRendering = function() {
        return this._isRendering;
    };

    /**
     * make scene.
     * @param  {String} sceneName the name of scene
     * @param  {String} boardName the name of Board or the array of name of Board to be included in Scene
     * @return {renderer}
     */
    Renderer.prototype.makeScene = function(sceneName, boardName){
        this._scene[sceneName] = (!Array.isArray(boardName)) ? [boardName] : boardName;
        return this;
    };

    /**
     * switch scene. Boards that are switched into are enabled, remaining Boards are disable.
     * @param  {String} sceneName the name of Scene to be switched to
     * @param  {String | Object} transition the name of Scene switching animation effect
     * @return {renderer}
     * @example
     * renderer.switchScene("targetScene");
     * @example
     * renderer.switchScene("targetScene", "zoomIn");
     * @example
     * renderer.switchScene("targetScene", {
     *     type : "zoomOut",
     *     easing : "easeInOutQuad",
     *     duration : 2000
     * });
     */
    Renderer.prototype.switchScene = function(sceneName, transition){
        var targetBoards = this._scene[sceneName];
        if (targetBoards) {
            this._currentScene = sceneName;
            if (typeof transition === "undefined") { //normal
                this.trigger("switchScene", targetBoards);
            } else { //transision
                if (typeof transition === "string") {
                    transition = {
                        type : transition
                    };
                }

                this.trigger("switchScene", targetBoards, transition);
            }
        }

        return this;
    };

    /**
     * the name of a current scene
     * @return {String}
     */
    Renderer.prototype.getCurrentScene = function() {
        return this._currentScene;
    };

    /**
     * take the snapshot of current canvas.
     * @return {HTMLCanvasElement} offscreen canvas element
     */
    Renderer.prototype.snapShot = function() {
        var canvas = this._owner.canvas,
            oldCtx = canvas.ctx,
            offscreenCanvas = canvas.offscreen();

        canvas.ctx = offscreenCanvas.getContext("2d"); //temporarily switch context
        // canvas.ctx.putImageData(oldCtx.getImageData(0, 0, canvas.width, canvas.height), 0, 0);
        canvas.ctx.drawImage(canvas.element, 0, 0, canvas.width, canvas.height); //copy canvas
        this.render(this._now);
        canvas.ctx = oldCtx; //restore context
        // document.body.appendChild(offscreenCanvas);
        return offscreenCanvas;
    };

    Renderer.prototype._transition = function(o) {
        this.pause();
        o = util.extend({
            duration : 500,
            easing : "linear",
            start : +new Date()
        }, o);

        var canvas = this._owner.canvas,
            runtime = this._owner.runtime,
            loop = (function(){
                canvas.clear();
                var past = (+new Date() - o.start),
                    opacity;
                if (past <= o.duration) {
                    transition[o.type].call(canvas.ctx, past, o);
                    if (runtime.planetWebview && canvas.ctx.canvas === canvas.element) {
                        canvas.ctx.flush();
                    }
                    requestAnimationFrame(loop);
                } else {
                    canvas.ctx.drawImage(o.to, 0, 0, canvas.width, canvas.height);
                    if (typeof o.callback === "function") {
                        o.callback();
                    }
                    this.resume();
                }
            }).bind(this);

        loop();
    };

    return Renderer;
});