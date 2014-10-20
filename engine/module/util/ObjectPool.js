define("util/ObjectPool", function(){
    /**
     * util/ObjectPool 객체 풀 모듈
     * @exports util/ObjectPool
     * @param {Function} ConstructorFunction 생성자 함수
     * @param {Number} expandCount    객체 풀에 생성해 놓을 객체의 개수
     */
    var ObjectPool = function(ConstructorFunction, expandCount){
        this._ConstructorFunction = ConstructorFunction;

        // metrics for tracking internals
        this.metrics = {};
        this._clearMetrics();

        // the objpool stack
        this._objpool = [];

        if(!!expandCount && expandCount > 0){
            this.expand(expandCount);
        }
    };

    /**
     * 객체 풀에서 객체를 하나 가져온다.
     * @method
     * @return {Object} 객체
     */
    ObjectPool.prototype.allocate = function() {
        var obj;

        if (this._objpool.length === 0) {
            obj = new this._ConstructorFunction();
            obj._objectPool = this;

            this.metrics.totalalloc++;

        } else {
            obj = this._objpool.pop();

            this.metrics.totalfree--;
        }

        this._ConstructorFunction.apply(obj, arguments);

        return obj;
    };

    /**
     * 객체를 다시 풀로 되돌려서 사용가능한 상태로 만든다.
     * @param  {Object} obj 반환할 객체
     * @return {ObjectPool}
     */
    ObjectPool.prototype.free = function(obj) {
        this._objpool.push(obj);

        this.metrics.totalfree++;

        this._ConstructorFunction.call(obj);

        return this;
    };

    /**
     * 객체를 초기화시킨다.
     * @param  {Object} obj 반환할 객체
     * @return {Object} 초기화된 객체
     */
    ObjectPool.prototype.reset = function(obj) {
        this._ConstructorFunction.call(obj);

        for (var key in this._ConstructorFunction.prototype) { //delete overided props
            if (this._ConstructorFunction.prototype.hasOwnProperty(key) && obj.hasOwnProperty(key)) {
                delete obj[key];
            }
        }

        return obj;
    };

    /**
     * 객체 풀을 확장한다.
     * @param  {Number} n 객체 풀에 확장하여 할당해 놓을 객체의 개수
     * @return {ObjectPool}
     */
    ObjectPool.prototype.expand = function(n) {
        var obj;
        while (n--) {
            obj = new this._ConstructorFunction();
            obj._objectPool = this;
            this._objpool.push(obj);
            this.metrics.totalalloc++;
        }

        return this;
    };

    /**
     * 내부 통계 변수를 초기화
     * @param {Number} 초기 할당된 객체 개수
     */
    ObjectPool.prototype._clearMetrics = function(allocated) {
        this.metrics.totalalloc = allocated || 0;
        this.metrics.totalfree = 0;
    }

    return ObjectPool;
});