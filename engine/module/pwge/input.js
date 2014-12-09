define("pwge/input", ["util/PubSub"], function(PubSub) {
    /**
     * input module
     * @exports pwge/input
     * @extends util/PubSub
     * @requires pwge/canvas
     * @requires util/PubSub
     * @example
     * input.on("click", function(e){ //event handling });
     */
    var Input = function(owner){
        this.setup(owner.canvas.element);
    };
    Input.prototype = Object.create(PubSub.prototype);
    Input.prototype._delegate = function(e, touch) {
        var x, y, entity, owner = this._owner;
        if (owner && owner.renderer.isRendering()) {
            e.stopPropagation();
            e.preventDefault();

            if (typeof touch === "boolean") {
                x = (touch) ? e.changedTouches[0].clientX - owner.canvas.element.offsetLeft + window.scrollX : e.offsetX;
                y = (touch) ? e.changedTouches[0].clientY - owner.canvas.element.offsetTop + window.scrollY : e.offsetY;
                e.ratioX = x / owner.viewport.width;
                e.ratioY = y / owner.viewport.height;
                e.canvasX = (e.ratioX * owner.viewport.canvasWidth);
                e.canvasY = (e.ratioY * owner.viewport.canvasHeight);
                e.designX = (e.ratioX * owner.viewport.designWidth);
                e.designY = (e.ratioY * owner.viewport.designHeight);
            }

            this.trigger(e.type, e);

            if ((entity = owner.boardManager.detect(e.canvasX, e.canvasY))) {
                if (entity.owner) {
                    entity.trigger(e.type, e);
                }
            }
        }
    };
    Input.prototype.setup = function(canvasElement){
        var self = this;
        canvasElement.addEventListener("touchstart", function(e){
            self._delegate(e, true);
        }, true);

        canvasElement.addEventListener("touchmove", function(e){
            self._delegate(e, true);
        }, true);

        canvasElement.addEventListener("touchend", function(e){
            self._delegate(e, true);
        }, true);

        canvasElement.addEventListener("touchcancel", function(e){
            self._delegate(e, true);
        }, true);

        canvasElement.addEventListener("dblclick", function(e){
            self._delegate(e, false);
        }, true);

        canvasElement.addEventListener("click", function(e){
            self._delegate(e, false);
        }, true);

        canvasElement.addEventListener("mousedown", function(e){
            self._delegate(e, false);
        }, true);

        canvasElement.addEventListener("mousemove", function(e){
            self._delegate(e, false);
        }, true);

        canvasElement.addEventListener("mouseup", function(e){
            self._delegate(e, false);
        }, true);
    };

    // document.body.addEventListener("keydown", function(e){
    //     delegate(e);
    // }, true);
    return Input;
});