define("ocb/entity",['pwge/spriteManager','pwge/boardManager','pwge/input','pwge/canvas','pwge/renderer','util/easing',"util/PubSub",'pwge/util'], function(spriteManager,boardManager,input,canvas,renderer,easing,PubSub,util){

    // PC and browser compatibility
    var mobile = 'ontouchstart' in window,
        START_EV = mobile ? 'touchstart' : 'mousedown',
        MOVE_EV = mobile ? 'touchmove' : 'mousemove',
        END_EV = mobile ? 'touchend' : 'mouseup';

    var game, entity, paddle;
    var balls = [];
    var blocks = [];

    /**
     * Ball Object
     */
    var Ball = function() {
        this.x = 160;
        this.y = 200;
        this.r = 8;
        this.vx = -1;
        this.vy = -1;
        this.wall_width = 24;
        this.maxX = 320 - this.wall_width;
        this.maxY = 416;
        this.minX = 0 + this.wall_width;
        this.minY = 0 + this.wall_width;
        this.prev_dt = 0;
    };

    /**
     * Initializing Ball Object
     */
    Ball.prototype.init = function( game, board ){
        this.game = game;
        this.board = board;

        // applying ball sprite
        this.entity = this.game.entityPool.allocate({
            x:this.x,
            y:this.y,
            z:1,
            width:this.r*2,
            height:this.r*2,
            anchorX:this.r,
            anchorY:this.r,
            domRendering:game.config.domRendering
        }).addTo(board.name).setBaseSprite("ball");

        if(this.entity.domRendering){
            this.entity.domRenderer = game.domRenderer.getRendererNode("ball");
            this.entity.domRenderer.setEntity(this.entity);
        }
    };

    Ball.prototype.step = function( dt ) { // dt = ms
        if (this.prev_dt) {
            var ddt = dt - this.prev_dt;
            this.entity.x += this.vx*ddt/10;
            this.entity.y += this.vy*ddt/10;
        }

        // detecting collision to walls
        if (this.entity.x < this.minX) { this.vx = Math.abs(this.vx); }
        if (this.entity.x > this.maxX) { this.vx = -Math.abs(this.vx); }
        if (this.entity.y < this.minY) { this.vy = Math.abs(this.vy); }

        // detecting collision to paddle
        if (this.vy>0 && inCollisionWithPaddle(this, paddle) ) {
            var prev_v_sum = Math.abs(this.vy) + Math.abs(this.vx);
            this.vx = (this.entity.x - paddle.entity.x)/20;
            this.vy = (prev_v_sum - Math.abs(this.vx))*(-1);
        }

        // detecting collision to blocks
        for(var i in blocks) {
            var block = blocks[i];
            switch(inCollisionRect(this, block)){
                case 1:
                case 2:
                    this.vy *= -1;
                    hitBlock( block, i );
                    break;
                case 3:
                case 4:
                    this.vx *= -1;
                    hitBlock( block, i );
                    break;
            }
        }

        // detecting dying conditions
        if (this.entity.y > this.maxY) {
            this.game.trigger("end");
        }

        this.prev_dt = dt;
    };

    var hitBlock = function( block, index ) {
        block.hp -= 1;
        if (block.hp<=0) {
            block.destroy();
            blocks.splice(index, 1);

            if (blocks.length === 0) {
                // clear this stage
                alert("stage clear");
            }
        }
    }

    var inCollisionWithPaddle = function(ball, paddle) {
        var bLeft = ball.entity.x+ball.r >= paddle.entity.x-paddle.width/2,
            bRight = ball.entity.x-ball.r <= paddle.entity.x+paddle.width/2,
            bTop = ball.entity.y+ball.r >= paddle.entity.y-paddle.height/2,
            bBottom = ball.entity.y-ball.r <= paddle.entity.y+paddle.height/2;
        if (bTop && bBottom && bLeft && bRight) {
            return true;
        }
        return false;
    }

    // when the ball is collision with
    // top of obj : 1
    // bottom of obj : 2
    // left of obj : 3
    // right of obj : 4
    // no collision : 0
    // this logic should be improved.
    var inCollisionRect = function(ball, obj) {
        // check the ball is collision with the obj
        var bLeft = ball.entity.x+ball.r >= obj.entity.x-obj.width/2,
            bRight = ball.entity.x-ball.r <= obj.entity.x+obj.width/2,
            bTop = ball.entity.y+ball.r >= obj.entity.y-obj.height/2,
            bBottom = ball.entity.y-ball.r <= obj.entity.y+obj.height/2;

        if (bTop && bBottom && bLeft && bRight){
            var dRight = (obj.entity.x+obj.width/2) - (ball.entity.x-ball.r),
                dTop = (ball.entity.y+ball.r) - (obj.entity.y-obj.height/2),
                dLeft = (ball.entity.x+ball.r) - (obj.entity.x-obj.width/2),
                dBottom = (obj.entity.y+obj.height/2) - (ball.entity.y-ball.r);

            // check the top of obj
            if (ball.vy>0 && dRight>dTop && dLeft>dTop) {
                return 1;
            }
            // check the right side of obj
            if (ball.vx<0 && dRight<dTop && dRight<dBottom) {
                return 4;
            }
            // check the bottom of obj
            if (ball.vy<0 && dRight>dBottom && dLeft>dBottom) {
                return 2;
            }
            // check the left side of obj
            if (ball.vx>0 && dLeft<dTop && dLeft<dBottom) {
                return 3;
            }
        }
        return 0;
    }

    /**
     * Paddle Object
     */
    var Paddle = function() {
        this.x = 160;
        this.y = 376;
        this.width = 48;
        this.height = 16;
    };

    /**
     * Initializing Paddle Object
     */
    Paddle.prototype.init = function( game, board ){
        var self = this;
        this.game = game;
        this.board = board;

        // applying paddle sprite
        this.entity = this.game.entityPool.allocate({
            x:this.x,
            y:this.y,
            z:1,
            width:this.width,
            height:this.height,
            anchorX:this.width/2,
            anchorY:this.height/2,
            domRendering:self.game.config.domRendering
        }).addTo(board.name).setBaseSprite("paddle");

        if(this.entity.domRendering){
            this.entity.domRenderer = game.domRenderer.getRendererNode("paddle");
            this.entity.domRenderer.setEntity(this.entity);
        }

        this.game.input.on(MOVE_EV, function(e){
            self.entity.x = e.designX;
        });
    };


    /**
     * Game Object
     */
    var Entities = function() {};

    Entities.prototype = Object.create(PubSub.prototype);

    Entities.prototype.init = function( game, playBoard ){

        this.game = game;
        this.playBoard = playBoard;

        // screen configure
        screenWidth = this.width = game.config.resolution.width;
        screenHeight = this.height = game.config.resolution.height;

        // background
        this.bg = this.game.entityPool.allocate({
            x:0,
            y:0,
            z:0,
            width:320,
            height:416,
            //domRendering:game.config.domRendering
            rootBG: this.game.config.smartRepaint
        }).addTo(this.playBoard.name).setBaseSprite("bg");

/*
        if(this.bg.domRendering){
            this.bg.domRenderer = game.domRenderer.getRendererNode("bg");
            this.bg.domRenderer.setEntity(this.bg);
        }
*/
        // countdown
        var countdown = this.countdown = this.game.entityPool.allocate({
            x:320/2-32/2,
            y:200,
            z:1,
            width:32,
            height:48
        }).addTo(this.playBoard.name).setBaseSprite("countdown");

        //if there's no animation callback, so we have to wait.
        setTimeout( function() {
            countdown.destroy();
        }, 1000*3);

        // game logic function binding for each time interval
        this._progress = this.progress.bind(this);
    };

    /**
     * Play method
     */
    Entities.prototype.play = function(){
        var self = this;

        // game logic function binding for each time interval
        this.game.renderer.on("step", this._progress );

        // create blocks
        createBlocks( self.game, self.playBoard );

        // create paddle
        paddle = new Paddle();
        paddle.init( self.game, self.playBoard );

        setTimeout( function() {
            // create ball
            var ball = new Ball();
            ball.init( self.game, self.playBoard );
            balls.push(ball);
        }, 1000*3);

    };

    /**
     * Callback method for touch event
     */
    Entities.prototype.onTouchmove = function(e) {
        console.log(e);
    };

    /**
     * Step method for game play
     */
    Entities.prototype.progress = function(dt) {
        var i;

        for(i in balls) {
            balls[i].step(dt);
        }
    };


    /**
     * Block Object
     */
    var Block = function() {
        this.width = 32;
        this.height =16;
    };

    /**
     * Initializing Block Object
     */
    Block.prototype.init = function( game, board, x, y, hp ){
        this.game = game;
        this.board = board;
        this.hp = hp;

        // applying ball sprite
        this.entity = this.game.entityPool.allocate({
            x:x,
            y:y,
            z:1,
            width:this.width,
            height:this.height,
            anchorX:this.width/2,
            anchorY:this.height/2
        }).addTo(board.name).setBaseSprite("block1");
    };

    Block.prototype.destroy = function() {
        this.entity.destroy();
    };


    // the number means the HP of blocks
    var b = 1; // red
    var r = 3; // blue
    var o = 2; // orange
    var g = 4; // green
    var X = 0; // null
    var z = 5; // unbreakable

    map = [
        [r,r,r,X,X,o,X,o],
        [r,X,X,X,X,o,o,X],
        [X,r,r,X,X,o,X,X],
        [X,X,r,X,X,o,o,X],
        [r,r,r,X,X,o,X,o]
    ];

    var createBlocks = function( game, board ){
        var block, x, y;
        // load blocks from level json
        for(y in map) {
            for(x in map[y]) {
                if (map[y][x]>0) {
                    block = new Block();
                    block.init(game, board, x*block.width+50, y*block.height+50, 1);
                    blocks.push(block);
                }
            }
        }
    }

    game = entity = new Entities();
    return game;
});