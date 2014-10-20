define("pwge/domRenderer", ["pwge/util", "util/PubSub"], function(util, PubSub){
    /**
     * domRenderer 모듈
     * DOMRenderer 객체를 생성한다.
     * DOM Renderer는 Entity가 Canvas가 아닌 rendering back-end가 DOM일 경우
     * @class
     * @param {Object} options 옵션 객체.
     * @exports pwge/DOMRenderer
     * @requires util/util
     * @requires util/PubSub
     * @example
     * var newDOMRenderer =new DOMRenderer(options);
     */
    var DOMRenderer = function( selector, xScale, yScale ){
        this.nodes = [];//references to DOM nodes
        this.container = null;//container node selector
        this.selector = selector;//DOM node selector로 class selector
        this.xScale = xScale; //canvas.width to canvas.style.width ratio
        this.yScale = yScale; //canvas.height to canvas.style.height ratio

        this._init();
    };

    DOMRenderer.prototype._init = function(){
        var tmp = document.getElementsByClassName(this.selector),
            len = tmp.length;

        if(len <= 0) {
            console.log("invalid selctor");
            return;
        }
        //node list에 DOMRenderingContext를 생성하여 등록
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
            //해당 prop을 갖는 node를 찾아서 return
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

        //주어진 prop 갖는 노드를 찾는 것을 실패 했거나 prop가 없는 경우에는 해당 prop을 node에 설정해서 pop해서 전달
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
        this.refDOMNode.style.cssText = renderingCSSText;
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