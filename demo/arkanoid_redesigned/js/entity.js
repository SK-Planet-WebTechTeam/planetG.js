define("ocb/entity",['pwge/spriteManager','pwge/boardManager','pwge/input','pwge/canvas','pwge/renderer','util/easing',"util/PubSub",'pwge/util'], function(spriteManager,boardManager,input,canvas,renderer,easing,PubSub,util){

    // PC and browser compatibility
    var mobile = 'ontouchstart' in window,
        START_EV = mobile ? 'touchstart' : 'mousedown',
        MOVE_EV = mobile ? 'touchmove' : 'mousemove',
        END_EV = mobile ? 'touchend' : 'mouseup';

    var game, entity, paddle;
    var balls = [];
    var items = [];
    var blocks = [];
    var score = 0;
    var initial_speed = -3;
    var speed = initial_speed;
    var itemProperty = 0.1; // item gen prop
    var maxBall = 5;

    /**
     * Ball Object
     */
    var Ball = function() {
        this.x = 360;
        this.y = 600;
        this.r = 12;
        this.vx = -1;
        this.vy = -1;
        this.wall_width = 32;
        this.maxX = 720 - this.wall_width;
        this.maxY = 900;
        this.minX = 0 + this.wall_width;
        this.minY = 0 + this.wall_width;
        this.prev_dt = 0;
    };

    /**
     * Initializing Ball Object
     */
    Ball.prototype.init = function( game, board, vx, vy ){
        this.game = game;
        this.board = board;
        if (vx && vy) {
            this.vx = vx;
            this.vy = vy;
        }

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
        var i;
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
            var v = Math.pow(Math.abs(this.vy),2) + Math.pow(Math.abs(this.vx),2),
            vx = (this.entity.x - paddle.entity.x)/25,
            vy = Math.sqrt( Math.abs(v - Math.pow(vx,2)) )*(-1);
            this.vx = vx;
            this.vy = vy;
            //console.log( v, Math.pow(Math.abs(this.vy),2) + Math.pow(Math.abs(this.vx),2) );
        }

        // detecting collision to blocks
        for(i in blocks) {
            var block = blocks[i];
            switch(inCollisionRect(this, block)){
                case 1:
                case 2:
                    this.vy *= -1;
                    hitBlock( this.game, this.board, block, i );
                    break;
                case 3:
                case 4:
                    this.vx *= -1;
                    hitBlock( this.game, this.board, block, i );
                    break;
            }
        }

        // detecting dying conditions
        if (this.entity.y > this.maxY+this.r) {
            // remove from queue
            for(i in balls) {
                if (balls[i]===this) {
                    balls.splice(i,1);
                    break;
                }
            }
            this.entity.destroy();

            if (balls.length<=0) {
                this.game.trigger("end");
                clearBallsItems();
                showGameover(this.game, this.board);
            }
        }

        this.prev_dt = dt;
    };

    var hitBlock = function( game, board, block, index ) {
        var item, x, y;
        x = block.entity.x;
        y = block.entity.y;
        //console.log('hit :', block);

        if (block.hp<5){ // 5 means unbreakable
            block.hp -= 1;
            if (block.hp>0) {
                block.entity.setBaseSprite("block"+block.hp);
            }
        }
        if (block.hp<=0) {
            // it means that the number of live balls are IMPORTANT !
            score += block.score * balls.length;
            entity.trigger("score");

            block.destroy();
            blocks.splice(index, 1);

            if (blocks.length <= game.nUnbreakables) {
                // clear this stage
                game.trigger("next");
            } else {
                if (Math.random()<itemProperty && (balls.length+items.length<maxBall)) {
                    // generate a item
                    item = new Item();
                    item.init( game, board, x, y );
                    items.push( item );
                }
            }
        }
    }

    var inCollisionWithPaddle = function(ball, p) {
        var bLeft = ball.entity.x+ball.r >= p.entity.x-p.width/2,
            bRight = ball.entity.x-ball.r <= p.entity.x+p.width/2,
            bTop = ball.entity.y+ball.r >= p.entity.y-p.height/2,
            bBottom = ball.entity.y-ball.r <= p.entity.y+p.height/2;
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
     * Item Object
     */
    var Item = function() {
        this.width = 36;
        this.height = 35;
        this.vx = 0;
        this.vy = 2;
        this.prev_dt = 0;
        this.r = 18;
    };

    Item.prototype.init = function( game, board, x, y ){
        var self = this;
        this.game = game;
        this.board = board;

        // applying item sprite
        this.entity = this.game.entityPool.allocate({
            x:x,
            y:y,
            z:1,
            width:this.width,
            height:this.height,
            anchorX:this.width/2,
            anchorY:this.height/2,
            domRendering:self.game.config.domRendering
        }).addTo(board.name).setBaseSprite("item");

        if(this.entity.domRendering){
            this.entity.domRenderer = game.domRenderer.getRendererNode("item");
            this.entity.domRenderer.setEntity(this.entity);
        }

    };

    Item.prototype.step = function(dt) {
        var i;

        if (this.prev_dt) {
            var ddt = dt - this.prev_dt;
            this.entity.x += this.vx*ddt/10;
            this.entity.y += this.vy*ddt/10;
        }

        // if collision with paddle, destroy
        if (inCollisionWithPaddle(this, paddle) ) {
            this.entity.destroy();

            // remove from queue
            for(i in items) {
                if (items[i]===this) {
                    items.splice(i,1);
                    break;
                }
            }

            // add ball
            var ball = new Ball();
            ball.init( this.game, this.board, speed, speed );
            balls.push(ball);
        }

        // if out of window, destroy
        if (this.entity.y > 900+100) {

            this.entity.destroy();
            for(i in items) {
                if (items[i]===this) {
                    items.splice(i,1);
                    break;
                }
            }
        }

        this.prev_dt = dt;
    };

    /**
     * Paddle Object
     */
    var Paddle = function() {
        this.x = 360;
        this.y = 810;
        this.width = 152;
        this.height = 28;
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
            this.entity.domRenderer.refDOMNode.addEventListener(MOVE_EV, function(e) {
                // copy & paste : input-relative codes from pwge
                var tx = (mobile) ? e.changedTouches[0].clientX - self.game.canvas.element.offsetLeft + window.scrollX : e.offsetX,
                ratioX = tx / self.game.viewport.width;
                self.entity.x = (ratioX * self.game.viewport.designWidth);
            });
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
            width:720,
            height:900,
            //domRendering:game.config.domRendering
            rootBG: this.game.config.smartRepaint
        }).addTo(this.playBoard.name).setBaseSprite("bg");
/*
        if(this.bg.domRendering){
            this.bg.domRenderer = game.domRenderer.getRendererNode("bg");
            this.bg.domRenderer.setEntity(this.bg);
        }
*/

        // game logic function binding for each time interval
        this._progress = this.progress.bind(this);
    };

    /**
     * Play method
     */
    Entities.prototype.play = function(level){
        var self = this;

        // game logic function binding for each time interval
        this.game.renderer.on("step", this._progress );

        // create blocks
        createBlocks( self.game, self.playBoard, level );

        // create paddle
        if (!paddle) {
            paddle = new Paddle();
            paddle.init( self.game, self.playBoard );
        }

        //refresh score board
        entity.trigger("score");
        entity.trigger("level");

        var countdown = this.game.entityPool.allocate({
            x:720/2-181/2,
            y:480,
            z:1,
            width:181,
            height:223
        }).addTo(this.playBoard.name).setBaseSprite("count3");

        setTimeout( function() {
            countdown.setBaseSprite("count2"); //._flush();
            setTimeout( function() {
                countdown.setBaseSprite("count1"); //._flush();
                setTimeout( function() {
                    countdown.destroy();
                    // create ball
                    var ball = new Ball();
                    ball.init( self.game, self.playBoard, speed, speed );
                    balls.push(ball);
                }, 1000);
            }, 1000 );
        }, 1000 );

    };

    Entities.prototype.nextStage = function() {
        var self = this;
        var level = self.game.config.level;

        clearBallsItems();

        // increase ball speed
        speed *= 1.3;

        // create blocks
        if (!createBlocks( self.game, self.playBoard, level )) {
            //if there're no stages
            //the end of stages
            alert("The End of Stages!");
            return;
        }

        var countdown = this.game.entityPool.allocate({
            x:720/2-181/2,
            y:480,
            z:1,
            width:181,
            height:223
        }).addTo(this.playBoard.name).setBaseSprite("count3");

        setTimeout( function() {
            countdown.setBaseSprite("count2"); //._flush();
            setTimeout( function() {
                countdown.setBaseSprite("count1"); //._flush();
                setTimeout( function() {
                    countdown.destroy();
                    // create ball
                    var ball = new Ball();
                    ball.init( self.game, self.playBoard, speed, speed );
                    balls.push(ball);
                }, 1000);
            }, 1000 );
        }, 1000 );

    }

    /**
     * Step method for game play
     */
    Entities.prototype.progress = function(dt) {
        var i,j;
        for(i in balls) {
            if (balls[i] && balls[i].entity && balls[i].entity.owner) {
                balls[i].step(dt);
            }
        }
        for(j in items) {
            if (items[j] && items[j].entity && items[j].entity.owner) {
                items[j].step(dt);
            }
        }
    };

    Entities.prototype.getScore = function() {
        return score;
    };

    Entities.prototype.getLevel = function() {
        return entity.game.config.level + 1;
    };

    /**
     * Block Object
     */
    var Block = function() {
        this.width = 57;
        this.height =27;
    };

    /**
     * Initializing Block Object
     */
    Block.prototype.init = function( game, board, x, y, hp ){
        this.game = game;
        this.board = board;
        this.score = hp*100; // this score will be added to total score when deleting.
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
        }).addTo(board.name).setBaseSprite("block"+hp);
    };

    Block.prototype.destroy = function() {
        this.entity.destroy();
    };


    // the number means the HP of blocks
    var b = 1; // blue
    var r = 3; // red
    var o = 2; // orange
    var g = 4; // green
    var X = 0; // null
    var z = 5; // unbreakable

    var generateRandomMap = function() {
        var m = [], cols=8, rows=14, maxZ=5, y, x, block, row, maxKindOfBlock=6, nZ=0;
        for(y=0; y<rows; y++) {
            row = [];
            for(x=0; x<cols; x++) {
                block = Math.floor(Math.random()*maxKindOfBlock);
                if (block===z) {
                    if (nZ>maxZ) {
                        block=4; // replace to g(=4)
                    } else {
                        nZ+=1;
                    }
                }
                row.push(block);
            }
            m.push(row);
        }
        return m;
    }

    map = [
/*
        // level 1 : you have a time to think
        [
            [X,X,X,X,X,X,X,X],
            [X,b,o,o,o,o,b,X],
            [X,X,X,o,o,X,X,X],
            [X,X,X,o,o,X,X,X],
            [X,b,o,o,o,o,b,X],
            [X,X,X,X,X,X,X,X],
        ],
*/
        // easy SK
        [   [b,b,b,X,X,b,X,b],
            [b,X,X,X,X,b,b,X],
            [X,b,b,X,X,b,X,X],
            [X,X,b,X,X,b,b,X],
            [b,b,b,X,X,b,X,b] ],

        // SK lv2
        [   [X,X,X,X,X,X,X,X],
            [b,b,b,b,b,b,b,b],
            [r,r,r,b,b,o,b,o],
            [r,b,b,b,b,o,o,b],
            [b,r,r,b,b,o,b,b],
            [b,b,r,b,b,o,o,b],
            [r,r,r,b,b,o,b,o],
            [b,b,b,b,b,b,b,b] ],

        // maze
        [   [X,X,X,X,X,X,X,X],
            [r,r,r,r,r,r,r,r],
            [X,X,X,X,X,X,X,r],
            [r,r,r,r,r,r,X,r],
            [r,X,X,X,X,X,X,r],
            [r,X,r,r,r,r,r,r],
            [r,X,X,X,X,X,X,r],
            [r,r,r,r,r,r,X,r],
            [r,X,X,X,X,X,X,r],
            [r,X,r,r,r,r,r,r],
            [r,X,X,X,X,X,X,r],
            [r,r,r,r,r,r,X,r],
        ],

        // SK lv3
        [   [X,X,X,X,X,X,X,X],
            [X,X,X,X,X,X,X,X],
            [g,g,g,g,g,g,g,g],
            [r,r,r,g,g,o,g,o],
            [r,g,g,g,g,o,o,g],
            [g,r,r,g,g,o,g,g],
            [g,g,r,g,g,o,o,g],
            [r,r,r,g,g,o,g,o],
            [g,z,z,z,z,z,z,g] ],

    ];

    var createBlocks = function( game, board, level ){
        blocks=[];
        entity.trigger("level");

        if (level === map.length) {
            var m = generateRandomMap();
            map.push(m);
            //console.log("generated map :", m);
            //return false;
        }

        game.nUnbreakables = 0;
        var block, x, y, offsetX=150, offsetY=100, hp;
        // load blocks from level json
        for(y in map[level]) {
            //console.log( map[level][y] );
            for(x in map[level][y]) {
                hp = map[level][y][x];
                if (hp>0) {
                    block = new Block();
                    block.init(game, board, x*block.width+offsetX, y*block.height+offsetY, hp);
                    blocks.push(block);
                    if (hp === z) {
                        game.nUnbreakables+=1;
                    }
                }
            }
        }

        return true;
    };

    var showGameover = function(game, board) {
        var gameover = game.entityPool.allocate({
            x:0,
            y:0,
            z:999,
            width:720,
            height:900,
            domRendering:true
        }).addTo(board.name).setBaseSprite("gameover");

        var cbGameover = function(e) {
            // copy & paste : input-relative codes from pwge
            var tx = (mobile) ? e.changedTouches[0].clientX - game.canvas.element.offsetLeft + window.scrollX : e.offsetX,
            ratioX = tx / game.viewport.width,
            dx = (ratioX * game.viewport.designWidth),
            ty = (mobile) ? e.changedTouches[0].clientY - game.canvas.element.offsetTop + window.scrollY : e.offsetY
            ratioY = ty / game.viewport.height,
            dy = (ratioY * game.viewport.designHeight);

            //retry
            if (dx>40 && dx<340 && dy>615 && dy<725) {
                gameover.domRenderer.refDOMNode.removeEventListener(END_EV, cbGameover);
                gameover.destroy();

                // reset bg
                entity.bg._flush();

                // reset data
                game.config.level=0;
                score = 0;
                speed = initial_speed;

                clearBallsItems();

                entity.play(0);
            }

            //exit
            if (dx>370 && dx<670 && dy>615 && dy<725) {
                window.history.back();
            }
        };

        gameover.domRenderer = game.domRenderer.getRendererNode("gameover");
        gameover.domRenderer.setEntity(gameover);
        gameover.domRenderer.refDOMNode.addEventListener(END_EV, cbGameover);

    };

    var clearBallsItems = function() {
        //clear balls & items
        var i;
        for(i in balls) {
            balls[i].entity.destroy();
        }
        balls=[];
        for(i in items) {
            items[i].entity.destroy();
        }
        items=[];
        for(i in blocks) {
            blocks[i].entity.destroy();
        }
        blocks=[];
    };

    game = entity = new Entities();
    return game;
});