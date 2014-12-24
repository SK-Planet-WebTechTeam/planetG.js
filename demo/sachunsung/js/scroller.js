// This is first UI component trial.
// But I think UI component is not good idea.
// In Intro Scene, composing with HTML basic node is easier than composing with UI component.
// Refer flappyBall Intro page.
define("game/scroller", ['pwge/spriteManager','pwge/boardManager','pwge/input','pwge/canvas','pwge/loader','util/PubSub','util/easing','pwge/util'], function(spriteManager, boardManager, input, canvas, loader, PubSub, easing, util){

    var common = {
        btnWidth : 30,
        btnHeight : 30,
        scrollSize : 200,
        scrollStep : 30,
        scrollTop : 30
    };

    var Scroller = function () {
        util.extend(this, common);
    };

    Scroller.prototype = Object.create(PubSub.prototype);

    Scroller.prototype.init = function( data ) {

        var self = this;

        util.extend(this, data);

        // scroll-up button
        this.game.entityPool.allocate({
            x: this.x + this.width - this.btnWidth,
            y: this.y ,
            width : this.btnWidth,
            height : this.btnHeight
        }).addTo( this.board.name ).setBaseSprite("playBtn");

        // scroll-down button
        this.game.entityPool.allocate({
            x: this.x + this.width - this.btnWidth,
            y: this.y + this.height - this.btnHeight,
            width: this.btnWidth,
            height: this.btnHeight
        }).addTo( this.board.name ).setBaseSprite("playBtn");

        this.image = loader.get(this.img);
        spriteManager.set("scroll", this.image, { x : 0, y :this.scrollTop, width : this.image.width, height : this.scrollSize, frames : 1 } );

        // scroll area
        this.scrollArea = this.game.entityPool.allocate({
            x: this.x,
            y: this.y,
            width: this.width - this.btnWidth,
            height: this.height
        }).addTo( this.board.name ).setBaseSprite("scroll");

        this._onTouchstart = this.onTouchstart.bind(this);
        this.game.input.on(START_EV, this._onTouchstart);
    }

    // User Input Handlers
    Scroller.prototype.onTouchstart = function(e) {
        var x = e.designX,
            y = e.designY;

        e.preventDefault();

        console.log( x, ":", y);

        // not scroller area
        if ( x<0 || this.x + this.width< x || y<0 || this.y + this.height< y ) {
            return;
        }

        // clicking scroll-up button
        if ( this.x + this.width - this.btnWidth < x && x < this.x + this.width
            && this.y < y && y < this.y + this.btnHeight ) {

            // adjust top position
            this.scrollTop -= this.scrollStep;
            if ( this.scrollTop < 0 ) {
                this.scrollTop = 0;
            }

            this.image = loader.get( this.img);
            spriteManager.set("scroll", this.image, { x : 0, y :this.scrollTop, width : this.image.width, height : this.scrollSize, frames : 1 } );
            this.scrollArea.destroy();
            this.scrollArea = this.game.entityPool.allocate({
                x: this.x,
                y: this.y,
                width: this.width - this.btnWidth,
                height: this.height
            }).addTo( this.board.name ).setBaseSprite("scroll");

            console.log("up");
        }
        // clicking scroll-down button
        else if ( this.x + this.width - this.btnWidth < x && x < this.x + this.width
            && this.y + this.height - this.btnHeight < y && y < this.y + this.height ) {

             this.image = loader.get( this.img);

            // adjust top position
            this.scrollTop += this.scrollStep;
            if ( this.image.height < this.scrollTop + this.scrollSize ){
                this.scrollTop = this.image.height - this.scrollSize;
            }

            spriteManager.set("scroll", this.image, { x : 0, y :this.scrollTop, width : this.image.width, height : this.scrollSize, frames : 1 } );
            this.scrollArea.destroy();
            this.scrollArea = this.game.entityPool.allocate({
                x: this.x,
                y: this.y,
                width: this.width - this.btnWidth,
                height: this.height
            }).addTo( this.board.name ).setBaseSprite("scroll");
            //this.scrollArea.setBaseSprite("scroll")._flush();

            console.log("down");
        }


    }

    return new Scroller();
});

