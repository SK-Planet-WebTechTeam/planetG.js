define("pwge/board", ["pwge/boardManager", "pwge/util"], function(boardManager, util){
    /**
     * Board object constructor
     * Board manage a set of Entities for rendering
     * @class
     * @param {String} name Board's name string
     * @param {Object} options option object
     * @example
     * var newBoard = boardPool.allocate("boardname");
     *
     * @example
     * var newBoard = boardPool.allocate("boardname", { x : 50, y : 100 }); //All entitie Board의 기준점. affects positions for all Entities on Board
     */
    var Board = function(name, options){
        this.name = name;
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.dirty = true;
        this.entities = [];
        this.enabled = false;
        this.paused = true;
        this.startedTime = 0;
        this.pausedTime = 0;
        this.past = 0;
        this._timeline = [];
        this._lastStep = {};
        this.invalidatedRects = [];
        this._bgInit = true;
        this.entityZOrdering = true;
        var i, len;
        for (i = 0, len = this._stepProps.length; i < len; i++) {
            this._lastStep[this._stepProps[i]] = undefined;
        }

        if (options) {
            util.extend(this, options);
        }
    };
    Board.prototype._stepProps = ["x", "y", "z"];
    Board.prototype._setLastStep = function(){
        var i, len;
        for (i = 0, len = this._stepProps.length; i < len; i++) {
            this._lastStep[this._stepProps[i]] = this[this._stepProps[i]];
        }
    };
    Board.prototype._checkDirty = function(){
        var key;

        for (var i = 0, len = this._stepProps.length; i < len; i++) {
            if (this._lastStep[this._stepProps[i]] !== this[this._stepProps[i]]) {
                this.dirty = true;
                return;
            }
        }
    };
    /**
     * add Entity into Board.
     * @param {Entity} entity Entity object
     * @return {Board}
     */
    Board.prototype.addEntity = function(entity) {
        var self = this;
        if (!this.findEntity(entity)) {
            this.entities.push(entity);
            entity.owner = this;
            this.dirty = true;

            if (this._boardManager._owner.runtime.defineProperty) {
                entity._z = entity.z;
                delete entity.z;

                Object.defineProperty(entity, "z", {
                    configurable : true,
                    get : function() {
                        return this._z;
                    },
                    set : function(z) {
                        if (this._z !== z) {
                            this._z = z;
                            if (this.owner) {
                                if(!!self.entityZOrdering){
                                    self._orderedEntities = util.sortByZ(self.entities);
                                } else {
                                    self._orderedEntities = self.entities;
                                }
                            }
                        }
                    }
                });

                if(!!this.entityZOrdering){
                    self._orderedEntities = util.sortByZ(self.entities);
                } else {
                    self._orderedEntities = self.entities;
                }

            }

            if (!this._boardManager._owner.config.sortByZOnEveryFrame) {
                this._boardManager.sortByZBoards();
            }
        } else {
            throw "try to add entity that alreay exist. please fix your game";
        }
        return this;
    };
    /**
     * find Entity within Board
     * @param  {Entity | String | Function} Entity, entity.id, or comparator function
     * @return {Entity | Array | null}
     *
     * @example
     * board.findEntity(entity)
     * board.findEntity("id")
     * board.findEntity(function(entity) {
     *     return entity.type === "test"; //this.type === "test"
     * });
     */
    Board.prototype.findEntity = function(entity) {
        var id, fn, ret, i, len;

        switch(typeof entity) {
            case "string":
                id = entity;
                break;
            case "function":
                fn = entity;
                break;
            case "object":
                id = entity.id;
        }

        if (id) {
            for (i = 0, len = this.entities.length; i < len; i++) {
                if (this.entities[i] && this.entities[i].id === id) {
                    return this.entities[i];
                }
            }
            return null;
        } else if (fn) {
            ret = [];
            for (i = 0, len = this.entities.length; i < len; i++) {
                if (this.entities[i] && fn.call(this.entities[i], this.entities[i])) {
                    ret.push(this.entities[i]);
                }
            }
            if (ret.length === 1) {
                return ret[0];
            }
            if (ret.length) {
                return ret;
            }
            return null;
        }
    };

    /**
     * find and return Entity located by the given x and y.
     * @param {Number} x
     * @param {Number} y
     * @return {Entity | null}
     */
    Board.prototype.detect = function(x, y) {
        var o = {
            x : x,
            y : y,
            width : 2,
            height : 2,
            anchorX : 1,
            anchorY : 1
        };

        for (var i = 0, len = this.entities.length; i < len; i++) {
            if (this.entities[i] && this.entities[i].detectable && util.overlap(o, this._getAbsoluteCanvasPosition(this.entities[i]))) {
                return this.entities[i];
            }
        }
        return null;
    };

    Board.prototype._getAbsoluteCanvasPosition = function(entity) {
        var renderRatio = this._boardManager._owner.viewport.renderRatio;
        return {
            x : ((this.x + entity.x) * renderRatio),
            y : ((this.y + entity.y) * renderRatio),
            width : (entity.width * renderRatio),
            height : (entity.height * renderRatio),
            anchorX : (entity.anchorX * renderRatio),
            anchorY : (entity.anchorY * renderRatio)
        };
    };

    /**
     * remove Entity within Board.
     * @param  {Entity | String} entity Entity or Entity.id to be removed
     * @return {Board}
     */
    Board.prototype.removeEntity = function(entity) {
        entity = this.findEntity(entity);
        if (entity) {
            entity.owner = null;
            this.entities.splice(this.entities.indexOf(entity), 1);
            this.dirty = true;
        } else {
            throw "try to remove entity that does not exist. please fix your game";
        }
        return this;
    };
    /**
     * enable Board to do rendering.
     * @return {Board}
     */
    Board.prototype.enable = function() {
        if (!this.enabled) {
            this.dirty = true;
            this.resume();
            this.enabled = true;
        }
        return this;
    };
    /**
     * disable Board not to do rendering.
     * @return {Board}
     */
    Board.prototype.disable = function() {
        if (this.enabled) {
            this.dirty = true;
            this.pause();
            this.enabled = false;
        }
        return this;
    };
    /**
     * stop progressing
     * the step method of timeline will be paused
     * @return {Board}
     */
    Board.prototype.pause = function() {
        if (!this.paused) {
            this.dirty = true;
            this.paused = true;
            this.pausedTime = this.past;
        }
        return this;
    };
    /**
     * resume progressing
     * the step method of timeline will be resumed
     * @return {Board}
     */
    Board.prototype.resume = function() {
        if (this.paused) {
            this.dirty = true;
            this.paused = false;
            this.startedTime = this._boardManager._owner.renderer.now() - this.past;
        }
        return this;
    };
    /**
     * return the time progress of Board.
     * @return {Number} time progress
     */
    Board.prototype.now = function() {
        return this.past;
    };

    /**
     * called by Renderer, it calls the step method of all Entities of Board
     * @param  {String} dt time progress of caller, or Renderer
     */
    Board.prototype.step = function(dt) {
        var i, len;
        if (this.paused) {
            dt = this.past;
        } else {
            dt = dt - this.startedTime;
        }

        if (dt < 0) {
            dt = 0;
        }

        this.past = dt;

        this._doTask(dt);
        for (i = 0, len = this.entities.length; i < len; i++) {
            if (this.entities[i] && this._boardManager._owner.renderer.isRendering() && this.enabled && this.entities[i].enabled) {
                this.entities[i].step.call(this.entities[i], dt);
            }
        }
    };
    /**
     * called by Renderer, it calls the draw method of all Entities of Board
     * @param  {String} dt 렌더러의 타임라인 진행시간
     */
    Board.prototype.draw = function(dt) {
        var i, len, invalidated, item;
        if (this.paused) {
            dt = this.past;
        } else {
            dt = dt - this.startedTime;
        }

        if (dt < 0) {
            dt = 0;
        }

        this.past = dt;

        var bm = this.getBoardManager();

        for (i = 0, len = this.entities.length; i < len; i++) {
            if (this.entities[i] && this._boardManager._owner.renderer.isRendering && this.enabled && this.entities[i] && this.entities[i].owner === this && this.entities[i].enabled) {
                item = this.entities[i];
                item.saveDrawRect();
                item.draw(dt);
                invalidated = item._checkDirty();
                if(!this._boardManager._owner.config.clearCanvasOnEveryFrame && invalidated && !item.rootBG && !item.domRendering){
                    bm.invalidatedRects.push(this.entities[i].getInvalidatedRect());
                }
            }
        }
    };
    Board.prototype._flush = function() {
        var i, len, orderedEntities;

        var bm = this.getBoardManager();

        orderedEntities = (this._boardManager._owner.runtime.defineProperty && this._orderedEntities) ? this._orderedEntities : util.sortByZ(this.entities);

        for (i = 0, len = orderedEntities.length; i < len; i++) {
            if (this._boardManager._owner.renderer.isRendering && this.enabled && orderedEntities[i] && orderedEntities[i].owner === this && orderedEntities[i].enabled) {

                if (this._boardManager._owner.config.smartRepaint) {
                    if (this._boardManager._owner.config.clearCanvasOnEveryFrame) {
                        throw "clearCanvasOnEveryFrame is not supported when smart repaint is enabled!!";
                    }
                    if (orderedEntities[i].rootBG) {
                        //If it is set to rootBG, clear all invalidated rectangles by rendering the corresponding region from a background image
                        orderedEntities[i]._updateInvalidatedRegion(bm.invalidatedRects);
                    } else if (orderedEntities[i].dirty) {
                        //entity is not rootBG, and it is dirty. flush the entity
                        orderedEntities[i]._flush();
                        orderedEntities[i].dirty = false;
                    }
                } else {
                    //smart repaint가 꺼져있을때는 dirty 여부와 상관없이 항상 flush 하여 그린다
                    orderedEntities[i]._flush();
                    orderedEntities[i].dirty = false;
                }
            }
        }
        bm.invalidatedRects = [];
        this._setLastStep();
    };
    /**
     * register timeline callbacks
     * @param  {Array} timeline Array of timeline
     * @return {Board}
     */
    Board.prototype.timeline = function(timeline) {
        this._timeline = timeline;
        this._done = [];
        this._done.length = this._timeline.length;
        return this;
    };
    /**
     * timeline callbacks are expired by dt
     * @param   {Number} dt 타임라인진행 시간
     * @return  {Board}
     * @private
     */
    Board.prototype._doTask = function(dt) {
        var tasks = [];
        for (var i = 0; i < this._timeline.length; i++) {
            if (this._timeline[i][0] < dt && !this._done[i]) {
                tasks.push(i);
            }
        }

        tasks.forEach(function(i){
            this._done[i] = true;
            this._timeline[i][1].call(this, this._timeline[i][0], dt);
        }, this);
    };

    /**
     * destroy Board and then it is returned into ObjectPool.
     */
    Board.prototype.destroy = function() {
        this.entities.length = 0;
        this._timeline.length = 0;
        this._boardManager._boardPool.free(this);
    };

    Board.prototype.getBoardManager = function() {
        return this._boardManager;
    };

    return Board;
});

define("pwge/boardManager", ["util/ObjectPool", "pwge/board", "pwge/util"], function(ObjectPool, Board, util){
    /**
     * BoardManager Constructor
     * @exports pwge/boardManager
     * @requires pwge/board
     * @requires pwge/renderer
     */
    var BoardManager = function(owner){
        this._boardPool = new ObjectPool(Board, owner.config.boardPoolSize);
        this._boards = [];
        this.invalidatedRects = [];
    };

    /**
     * make Board and add it into BoardManager.
     * if Board with the same name exist, just return it
     * @param {String} name the name of Board
     * @return {Board}
     */
    BoardManager.prototype.makeBoard = function(name, options) {
        var board = this.getBoard(name),
            newBoard;

        options = options || {};

        if (board) { //if Board already exists, return it after updating options
            this._boardPool._ConstructorFunction.call(board, name, options);
            return board;
        }
        newBoard = this._boardPool.allocate(name, options);
        newBoard._boardManager = this;
        this._boards.push(newBoard);

        return newBoard;
    };

    /**
     * get Board.
     * @param  {String} name the name of Board
     * @return {Board | null}
     */
    BoardManager.prototype.getBoard = function(name) {
        if (typeof name === "undefined") {
            return this._boards;
        }

        for (var i = 0, len = this._boards.length; i < len; i++) {
            if (this._boards[i].name === name) {
                return this._boards[i];
            }
        }

        return null;
    };

    /**
     * sort all Boards of BoardManager by Z value
     */
    BoardManager.prototype.sortByZBoards = function() {
        this._orderedBoards = util.sortByZ( this.getBoard() );
        return this._orderedBoards;
    };

    /**
     * get all Boards of BoardManager
     */
    BoardManager.prototype.getSortByZBoards = function() {
        return this._orderedBoards;
    };

    /**
     * remove Board out of BoardManager.
     * @param  {String} name the name of Board to be removed
     * @return {boardManager}
     */
    BoardManager.prototype.removeBoard = function(name) {
        for (var i = 0, len = this._boards.length, board; i < len; i++) {
            if (this._boards[i].name === name) {
                board = this._boards[i];
                this._boards[i].splice(this._boards[i].indexOf(board), 1);
                board.destroy();
                this.dirty = true;
            }
        }

        return this;
    };

    /**
     * find Entity from Boards.
     */
    BoardManager.prototype.findEntity = function(entity) {
        var ret = [], entities;
        //entity, prop
        for (var i = 0, len = this._boards.length; i < len; i++) {
            entities = this._boards[i].findEntity(entity);
            if (entities) {
                if (Array.isArray(entities)) {
                    ret = ret.concat(entities);
                } else {
                    ret.push(entities);
                }
            }
        }

        if (ret.length) {
            return ret;
        }

        return null;
    };

    /**
     * find and return Entity located by the given x and y.
     */
    BoardManager.prototype.detect = function(x, y) {
        var entity, i;
        for (i = 0; i < this._boards.length; i++) {
            if (this._boards[i].enabled) {
                entity = this._boards[i].detect(x, y);
                if (entity) {
                    return entity;
                }
            }
        }
        return null;
    };

    /**
     * enable Board with the given name.
     * @param  {String} name the name of Board
     * @return {boardManager}
     */
    BoardManager.prototype.enable = function(name) {
        var board = this.getBoard(name);
        if (board) {
            board.enable();
        }
        return this;
    };

    /**
     * disable Board with the given name.
     * @param  {String} name the name of Board
     * @return {boardManager}
     */
    BoardManager.prototype.disable = function(name) {
        var board = this.getBoard(name);
        if (board) {
            board.disable();
        }
        return this;
    };

    return BoardManager;
});
