define("pwge/debug", function(){
    /**
     * debug 모듈
     * @exports pwge/debug
     */
    var Debug = function(owner){
        this.renderer = owner.renderer;

        var last,
            fps = [],
            between = 0;

        this._callback = (function(dt) {
            if (!last) {
                last = dt;
                return;
            }

            between = dt - last;
            if (fps.length > 120) { //average recent 10 frames
                fps.splice(0, 1);
            }

            fps.push(between);
            if (fps.length > 0 && between > 0) {
                // this.fps.textContent = (1000/between).toFixed(1);
                this.fps.textContent = (1000/(fps.reduce(function(l, c){ return l + c; })/fps.length)).toFixed(1);
            }

            last = dt;
        }.bind(this));
    };

    /**
     * fps meter가 표시되는 엘리먼트를 구한다.
     * @return {HTMLSpanElement}
     */
    Debug.prototype.getFPSElement = function() {
        if (!this.fps) {
            this.fps = document.createElement("span");
        }
        return this.fps;
    };

    /**
     * fps meter 표시를 시작한다.
     * @return {Debug}
     */
    Debug.prototype.start = function() {
        var fps = this.getFPSElement();
        this.fps.textContent = "FPS METER";
        document.body.appendChild(fps);
        fps.style.cssText = "position:absolute;bottom:0;right:0;color:#fff;font-size:18px;margin:0;padding:5px;background:#000;opacity:0.75;font-family:Arial;font-weight:bold";

        this.renderer.on("draw", this._callback);

        return this;
    };

    /**
     * fps meter 표시를 멈춘다.
     * @return {Debug}
     */
    Debug.prototype.stop = function() {
        document.body.removeChild(this.fps);
        this.renderer.off("draw", this._callback);

        return this;
    };

    return Debug;
});