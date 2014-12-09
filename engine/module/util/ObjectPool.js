define("util/ObjectPool", function(){
    /**
     * util/ObjectPool object pool module
     * @exports util/ObjectPool
     * @param {Function} ConstructorFunction constructor funtion
     * @param {Number} expandCount    initial object pool size
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
     * get one object from a pool
     * @method
     * @return {Object} object
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
     * return an object to pool.
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
     * reset an object by calling its constructor function.
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
     * expand the size of an object pool.
     * @param  {Number} n the number of objects in the pool
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
     * reset internal variables.
     * @param {Number} 초기 할당된 객체 개수
     */
    ObjectPool.prototype._clearMetrics = function(allocated) {
        this.metrics.totalalloc = allocated || 0;
        this.metrics.totalfree = 0;
    }

    return ObjectPool;
});