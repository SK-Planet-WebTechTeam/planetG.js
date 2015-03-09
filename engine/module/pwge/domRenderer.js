define("pwge/domRenderer", ["pwge/util", "util/PubSub"], function(util, PubSub){
    /**
     * DOMRenderer module
     * DOMRenderer is to render a set of entities via bounded DOM elements, not into <canvas>.
     * DOMRenderer module maintain a set of bounded DOM element and RenderingContext for each entity
     * that is desiginated to use DOMRenderer for rendering
     * Implementation-wise, by rendering, it means that the DOM element is transformed by CSS 3D transform.
     * For more detail to understand DOMRender, please see the user programming guide.
     * construct DOMRenderer object.
     * @class
     * @param {String} class selector that can be used by getElementsByClassName.
     * @param {Number} width scale factor (canvas.width to canvas.style.width ratio).
     * @param {Number} hiehgt scale factor (canvas.height to canvas.style.height ratio).
     * @exports pwge/DOMRenderer
     * @example
     * var newDOMRenderer =new DOMRenderer(classSelector, xScale, yScale);
     */
    var DOMRenderer = function( selector, xScale, yScale ){
        this.nodes = [];//references to DOM nodes
        this.container = null;//container node selector
        this.selector = selector;
        this.xScale = xScale;
        this.yScale = yScale;

        this._init();
    };

    DOMRenderer.prototype._init = function(){
        var tmp = document.getElementsByClassName(this.selector),
            len = tmp.length;

        if(len <= 0) {
            console.log("invalid selctor");
            return;
        }
        //create DOMRenderingcontext for all entities in this.nodes
        for( i=0; i < len; i++ ){
            this.nodes.push( new DOMRenderingContext( tmp[i], this ) );
        }
    };

    DOMRenderer.prototype.setCanvasScaleFactor = function(xScale, yScale){
        this.xScale = xScale;
        this.yScale = yScale;
    };

    DOMRenderer.prototype.getRendererNode = function( prop ){
        if( this.nodes.length< 1 ){
            console.log("no free DOM node for allocation");
            return;
        }
        if( !!prop ){
            //find and return the pre-exisiting node containg prop if exist for better performance
            var i,
                nodes = this.nodes,
                len = nodes.length;

            for( i=0; i<len; i++ ){
                if( nodes[i].refDOMNode.classList.contains(prop) ){
                    var obj = nodes.splice(i,1);
                    return obj.pop();
                }
            }
        }

        //if miss, create a node with the prop and then return it
        this.nodes[len-1].refDOMNode.className = this.selector; //need to be reset
        this.nodes[len-1].refDOMNode.classList.add(prop);
        this.nodes[len-1].classList.push(prop);
        return this.nodes.pop();
    };

    DOMRenderer.prototype.returnRendererNode = function( node, hardReset ){
        node.reset( hardReset );
        this.nodes.push(node);
    };

    DOMRenderer.prototype.draw = function(){
        var i,
            len = this.nodes.length;

        for( i=0; i<len; i++ ){
            this.nodes[i].draw();
        }
    };

    DOMRenderer.prototype.hide = function(){
        var i,
            len = this.nodes.length;

        for( i=0; i<len; i++ ){
            this.nodes[i].hide();
        }
    };

    DOMRenderer.prototype.show = function(){
        var i,
            len = this.nodes.length;

        for( i=0; i<len; i++ ){
            this.nodes[i].show();
        }
    }

    var defaultTransformStyle = "-webkit-transform: translate3d(-1000px,0,0)";

    var DOMRenderingContext = function( domNode, domRenderer ){
         this.classList = [];
         this.owner = domRenderer;
         this.refDOMNode = domNode;
         this.reset(true);
    };

    DOMRenderingContext.prototype.reset = function( hardReset ){
        this.refEntity = null;
        this.renderingCSSText = "";
        this.refDOMNode.style.cssText = defaultTransformStyle;

        var node = this.refDOMNode;
        if(hardReset){
            //prop을 제거해서 Texture를 완전히 reset
            this.classList.forEach(function(element, index, array){
                node.classList.remove(element);
                return true;
            });
            this.classList = [];
        }

        this.xScale = -1;
        this.yScale = -1;
    };

    DOMRenderingContext.prototype.setEntity = function( entity ){
        this.refEntity = entity;
    };

    DOMRenderingContext.prototype.setCSSText = function( cssTxt ){
        this.renderingCSSText = cssTxt;
    };

    DOMRenderingContext.prototype.setCSSProperty = function( prop ){
        if(!!prop && !!prop.key){
            this.refDOMNode.style[ prop.key ] = prop.value;
        } else {
            console.log("invalid property");
        }
    };

    DOMRenderingContext.prototype.addClass = function( className ){
        this.classList.push(className);
    }

    DOMRenderingContext.prototype.draw = function( renderingCSSText ){
        this.refDOMNode.style.cssText += renderingCSSText;
    };

    DOMRenderingContext.prototype.hide = function( ){
        // this.refDOMNode.style.display = "none";
        this.refDOMNode.style.cssText = defaultTransformStyle;
    };

    DOMRenderingContext.prototype.show = function( ){
        this.draw();
    };

    return DOMRenderer;
});