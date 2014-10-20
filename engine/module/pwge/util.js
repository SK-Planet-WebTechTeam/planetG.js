define("pwge/util", function(){
    var /**
         * pwge/util 모듈
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
     * 객체를 다른객체의 프로퍼티를 복사해와 확장한다.
     * @function
     * @return {Object} 확장된 객체
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
     * id 문자열을 생성한다.
     * @function
     * @return {String} id 문자열
     */
    util.generateId = function() {
        return Math.round(Math.random() * 100000).toString() + (+new Date()).toString();
    };

    /**
     * 두 객체가 겹치는지 확인한다. (충돌감지)
     * 두 객체의 x, y, width, height, anchorX, anchorY 프로퍼티를 사용하므로, entity를 직접 인자로 사용해도 된다.
     * @param  {Object | Entity} o1 객체1.
     * @param  {Object | Entity} o2 객체2.
     * @return {Boolean}
     */
    util.overlap = function(o1, o2) {
        return (o1.x <= o2.x + o2.width &&
            o1.y <= o2.y + o2.height &&
            o2.x <= o1.x + o1.width &&
            o2.y <= o1.y + o1.height);

        // return !((o1.y + o1.height - o1.anchorY < o2.y - o2.anchorY) || (o1.y - o1.anchorY > o2.y + o2.height - o2.anchorY) || (o1.x + o1.width - o1.anchorX < o2.x - o2.anchorX) || (o1.x - o1.anchorX > o2.x + o2.width - o2.anchorX));
    };

    /**
     * 엘리먼트의 위치(오프셋)을 구한다.
     * @param  {HTMLElement} el 위치를 구할 엘리먼트
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
     * board에 추가된 entity들을 z값으로 정렬하기 위한 메서드
     * @param  {Array} arr entity들의 배열
     * @return {Array}     정렬된 entitiy들의 배열
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
