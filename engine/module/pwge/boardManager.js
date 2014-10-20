define("pwge/board", ["pwge/boardManager", "pwge/util"], function(boardManager, util){
    /**
     * Board 객체를 생성한다.
     * Board 객체는 util/ObjectPool로 관리되며 boardPool.allocate() 메서드로 할당해 사용한다.
     * @class
     * @param {String} name Board의 이름
     * @param {Object} options 옵션 객체
     * @example
     * var newBoard = boardPool.allocate("boardname");
     *
     * @example
     * var newBoard = boardPool.allocate("boardname", { x : 50, y : 100 }); //Board의 기준점. Board내의 모든 Entity들의 위치값에 영향을 준다.
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
     * Board에 Entity를 추가한다.
     * @param {Entity} entity Entity 객체
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
                                if(!!this.entityZOrdering){
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
        }
        return this;
    };
    /**
     * Entity를 찾는다.
     * @param  {Entity | String | Function} entity 또는 entity.id 또는 비교함수
     * @return {Entity | Array | null}
     *
     * @example
     * board.findEntity(entity)
     * board.findEntity("id")
     * board.findEntity(function(entity) {
     *     return entity.type === "test"; //또는 this.type === "test"
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
     * 이벤트 위치에 해당하는 Entity를 찾는다.
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
     * Entity를 Board에서 제거한다.
     * @param  {Entity | String} entity 제거할 Entity 혹은 Entity.id
     * @return {Board}
     */
    Board.prototype.removeEntity = function(entity) {
        entity = this.findEntity(entity);
        if (entity) {
            entity.owner = null;
            // console.log("entitiy destroyed", entity, entity.owner, this.entities.indexOf(entity));
            this.entities.splice(this.entities.indexOf(entity), 1);
            // console.log(this.entities.length)
            this.dirty = true;
        }
        return this;
    };
    /**
     * Board가 렌더링되도록 enable 시킨다.
     * 동시에 다시재생될 수 있도록 resume된다.
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
     * Board가 렌더링되지 않도록 disable 시킨다.
     * 동시에 재생이 진행되지 않도록 pause된다.
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
     * 재생을 중지시키기 위해 pause시킨다.
     * step메서드내에서 타임라인이 진행되지 않도록 한다.
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
     * 다시재생시키기 위해 resume시킨다.
     * step메서드내에서 타임라인이 다시 진행되도록 한다.
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
     * Board의 현재 타임라인 진행 시간을 리턴한다.
     * @return {Number} 타임라인 진행 시간
     */
    Board.prototype.now = function() {
        return this.past;
    };

    /**
     * 렌더러에 의해 호출되어, Board의 타임라인 진행에 따라 포함된 Entitiy들의 위치값을 계산하는 step함수를 실행시킨다.
     * @param  {String} dt 렌더러의 타임라인 진행시간
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

        // console.log(dt)
    };
    /**
     * 렌더러에 의해 호출되어, Board의 타임라인 진행에 따라 포함된 Entitiy들의 페인팅을 담당하는 step함수를 실행시킨다.
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
                item.saveDrawRect();//이전 frame의 draw rect를 저장
                item.draw(dt);
                invalidated = item._checkDirty();
                if(!this._boardManager._owner.config.clearCanvasOnEveryFrame && invalidated && !item.rootBG && !item.domRendering){
                    bm.invalidatedRects.push(this.entities[i].getInvalidatedRect());
                }
            }
        }
        // console.log(dt)
    };
    Board.prototype._flush = function() {
        var i, len, orderedEntities;

        var bm = this.getBoardManager();

        orderedEntities = (this._boardManager._owner.runtime.defineProperty && this._orderedEntities) ? this._orderedEntities : util.sortByZ(this.entities);

        for (i = 0, len = orderedEntities.length; i < len; i++) {
            if (this._boardManager._owner.renderer.isRendering && this.enabled && orderedEntities[i] && orderedEntities[i].owner === this && orderedEntities[i].enabled) {
                if (this._boardManager._owner.config.clearCanvasOnEveryFrame || !orderedEntities[i].rootBG ) {
                    orderedEntities[i]._flush();
                }
                else {
                    //Root BG일 경우만 다시 전체를 다시 그리지 않고 invalidate 영역만을 이전 frame buffer(cavas)에 그림
                    orderedEntities[i]._updateInvalidatedRegion(bm.invalidatedRects);
                }
            }
        }
        bm.invalidatedRects = [];
        this._setLastStep();
    };
    /**
     * Board의 타임라인 진행에 따라 실행할 콜백을 등록한다.
     * @param  {Array} timeline 타임라인정보 배열
     * @return {Board}
     */
    Board.prototype.timeline = function(timeline) {
        this._timeline = timeline;
        this._done = [];
        this._done.length = this._timeline.length;
        return this;
    };
    /**
     * timeline메서드로 등록된 타임라인정보를 가지고, step 메서드에서 현재 진행시간에 맞는 콜백을 실행시킨다.
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
     * board를 삭제한다.
     * 삭제된 후에는 다시 객체 풀에 반환된다.
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
     * boardManager 모듈
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
     * Board를 만든다.
     * 이미 같은 이름의 보드가 있으면 해당 보드를 리턴한다.
     * @param {String} name 만들 보드의 이름
     * @return {Board}
     */
    BoardManager.prototype.makeBoard = function(name, options) {
        var board = this.getBoard(name),
            newBoard;

        options = options || {};

        if (board) { //이미 만들어진 보드가 있으면 options를 재지정해준다.
            this._boardPool._ConstructorFunction.call(board, name, options);
            return board;
        }
        newBoard = this._boardPool.allocate(name, options);
        newBoard._boardManager = this;
        this._boards.push(newBoard);

        return newBoard;
    };

    /**
     * Board를 가져온다.
     * @param  {String} name 가져올 보드의 이름
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
     * Z에 의해 sort된 Board를 가져온다.
     */
    BoardManager.prototype.sortByZBoards = function() {
        this._orderedBoards = util.sortByZ( this.getBoard() );
        return this._orderedBoards;
    };

    /**
     * Z에 의해 sort된 Board를 가져온다.
     */
    BoardManager.prototype.getSortByZBoards = function() {
        return this._orderedBoards;
    };

    /**
     * Board를 제거한다.
     * @param  {String} name 제거할 보드의 이름
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

    // boardManager.addAsBox2dWorld = function(name, b2World) {
    //     this.makeBoard(name);
    //     this.getBoard(name).b2World = b2World;

    //     return this;
    // };


    /**
     * Board에서 Entity를 찾는다.
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
     *  enabled된 Board에서 Entity를 찾는다.
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
     * Board를 enable시킨다.
     * enable된 board는 renderer에 의해 재생된다.
     * @param  {String} name 보드의 이름
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
     * Board를 disable시킨다.
     * disable된 board는 renderer에 의해 재생되지 않는다.
     * @param  {String} name 보드의 이름
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
