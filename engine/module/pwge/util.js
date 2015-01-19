define("pwge/util", function(){
    var /**
         * pwge/util module
         * @exports pwge/util
         */
        util = {},
        deepcopy,
        extend,
        generateId;

    deepcopy = function(obj) {
        var ret = {}, v;
        for (v in obj) {
            if (obj.hasOwnProperty(v)) {
                if (Object.prototype.toString.call(obj[v]) === "[object Object]") {
                    ret[v] = deepcopy(obj[v]);
                } else {
                    ret[v] = obj[v];
                }
            }
        }
        return ret;
    };

    /**
     * object extend method
     * @function
     * @return {Object} extended object
     */
    util.extend = function() {
        var parent = arguments[0], child, i = 1, v;
        for (; i < arguments.length; i++) {
            child = arguments[i];
            for (v in child) {
                if (child.hasOwnProperty(v)) {
                    if (Object.prototype.toString.call(child[v]) === "[object Object]" && parent.hasOwnProperty(v)) {
                        parent[v] = util.extend(parent[v], deepcopy(child[v]));
                    } else {
                        parent[v] = child[v];
                    }
                }
            }
        }
        return parent;
    };

    /**
     * generated string for id.
     * @function
     * @return {String} id string
     */
    util.generateId = function() {
        return Math.round(Math.random() * 100000).toString() + (+new Date()).toString();
    };

    /**
     * check if two objects are overlapped
     * @param  {Object | Entity} o1 object 1
     * @param  {Object | Entity} o2 object 2
     * @return {Boolean}
     */
    util.overlap = function(o1, o2) {
        return (o1.x <= o2.x + o2.width &&
            o1.y <= o2.y + o2.height &&
            o2.x <= o1.x + o1.width &&
            o2.y <= o1.y + o1.height);
    };

    /**
     * calculate the offset of the given element, starting from document left/top corner.
     * @param  {HTMLElement} el element
     * @return {Object}
     */
    util.getOffset = function(el){
        var box = { top: 0, left: 0 },
            doc = document.documentElement;

        if (typeof el.getBoundingClientRect !== "undefined") {
            box = el.getBoundingClientRect();
        }
        return {
            top: box.top + window.pageYOffset - doc.clientTop,
            left: box.left + window.pageXOffset  - doc.clientLeft
        };
    };

    /**
     * sort the given array
     * @param  {Array} arr the array of Entity
     * @return {Array}     the sorted array of Entity
     */
    util.sortByZ = function(arr) {
        var ret = [],
            z = {},
            ez, keys, i, len = arr.length;

        for (i = 0; i < len; i++) {
            ez = arr[i].z.toString();
            if (!z[ez]) {
                z[ez] = [];
            }
            z[ez].push(arr[i]);
        }

        keys = Object.keys(z).sort(function(a, b){
            return a * 1 > b * 1 ? 1 : -1;
        });

        for (i = 0, len = keys.length; i < len; i++) {
            ret = ret.concat(z[keys[i].toString()]);
        }

        return ret;
    };

    return util;
});