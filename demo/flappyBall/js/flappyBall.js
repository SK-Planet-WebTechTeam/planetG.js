define("ocb/flappyBall",['pwge/spriteManager','pwge/boardManager','pwge/input','pwge/canvas','pwge/renderer','util/easing',"util/PubSub",'pwge/util'], function(spriteManager,boardManager,input,canvas,renderer,easing,PubSub,util){

    // PC and browser compatibility
    var mobile = 'ontouchstart' in window,
        START_EV = mobile ? 'touchstart' : 'mousedown',
        MOVE_EV = mobile ? 'touchmove' : 'mousemove',
        END_EV = mobile ? 'touchend' : 'mouseup';

    // variable for referencing objects
    var flappyBall,
        ball,
        globes = [];

    var screenWidth = null,
        screenHeight = null,
        gloveSpeed = 3500,
        cloudSpeed = 3,
        luckyTime,  // the timing for displaying luck item
        currentLevel, // current level in the selected degree of difficulty
        gamePattern, // the selected degree of difficulty

        // total game patterns of the degree of difficulty
        difficultyLevel = [
            // 1st pattern
            [
                {
                    // height between upper and lower gloves
                    // refer 1 in img/game-design.png
                    gap : 600,

                    // width between current glove and next glove
                    // refer 2 in img/game-design.png
                    intervalBase : 500,
                    interval : 1500,

                    // range where is displayed the glove
                    // refer 3 in img/game-design.png
                    rangeBase : 50,
                    range : 190,

                    // occurance number of gloves in this patern
                    count : 3
                },{
                    gap : 550,
                    intervalBase : 400,
                    interval : 1250,
                    rangeBase : 50,
                    range : 240,
                    count : 3
                },{
                    gap : 500,
                    intervalBase : 300,
                    interval : 1000,
                    rangeBase : 50,
                    range : 290,
                    count : 3
                },{
                    gap : 450,
                    intervalBase : 200,
                    interval : 900,
                    rangeBase : 50,
                    range : 340,
                    count : 3
                },{
                    gap : 400,
                    intervalBase : 150,
                    interval : 500,
                    rangeBase : 50,
                    range : 390,
                    count : 8
                },{
                    gap : 400,
                    intervalBase : 100,
                    interval : 300,
                    rangeBase : 50,
                    range : 440,
                    count : 10
                }
            ],

            // 2nd pattern
            [
                {
                    gap : 400,
                    intervalBase : 150,
                    interval : 500,
                    rangeBase : 50,
                    range : 390,
                    count : 5
                },{
                    gap : 450,
                    intervalBase : 200,
                    interval : 900,
                    rangeBase : 50,
                    range : 340,
                    count : 5
                },{
                    gap : 500,
                    intervalBase : 300,
                    interval : 1000,
                    rangeBase : 50,
                    range : 290,
                    count : 5
                },{
                    gap : 550,
                    intervalBase : 400,
                    interval : 1250,
                    rangeBase : 50,
                    range : 240,
                    count : 5
                },{
                    gap : 600,
                    intervalBase : 500,
                    interval : 1500,
                    rangeBase : 50,
                    range : 190,
                    count : 5
                }
            ],
            // 3rd pattern
            [
                {
                    gap : 500,
                    intervalBase : 300,
                    interval : 1000,
                    rangeBase : 50,
                    range : 290,
                    count : 3
                },{
                    gap : 400,
                    intervalBase : 150,
                    interval : 500,
                    rangeBase : 50,
                    range : 390,
                    count : 5
                },{
                    gap : 500,
                    intervalBase : 300,
                    interval : 1000,
                    rangeBase : 50,
                    range : 290,
                    count : 3
                },{
                    gap : 400,
                    intervalBase : 100,
                    interval : 300,
                    rangeBase : 50,
                    range : 440,
                    count : 10
                }
            ],
            // 4st pattern
            [
                {
                    gap : 550,
                    intervalBase : 400,
                    interval : 1250,
                    rangeBase : 50,
                    range : 240,
                    count : 5
                },{
                    gap : 450,
                    intervalBase : 200,
                    interval : 900,
                    rangeBase : 50,
                    range : 340,
                    count : 5
                },{
                    gap : 400,
                    intervalBase : 100,
                    interval : 300,
                    rangeBase : 50,
                    range : 440,
                    count : 10
                },{
                    gap : 450,
                    intervalBase : 200,
                    interval : 900,
                    rangeBase : 50,
                    range : 340,
                    count : 5
                }
            ]];

    /**
     * Ball Object
     */
    var Ball = function( dur ) {
        this.jumpingState = false;
        this.jumpDuration = 300;
        this.jumpHeight = 200;
        this.dropDuration = dur || 900;
    };

    /**
     * Initializing Ball Object
     */
    Ball.prototype.init = function( game, board ){
        this.game = game;
        this.board = board;
        this.alive = true;

        // applying ball sprite
        this.entity = this.game.entityPool.allocate({
            x:240,
            y:300,
            z:3,
            width:126,
            height:126
        }).addTo(board.name).setBaseSprite("ball_flying");

        this._changeJumpPosition = this.changeJumpPosition.bind(this);
        this._changeDropPosition = this.changeDropPosition.bind(this);
    };

    /**
     * Jump method
     */
    Ball.prototype.jump = function( dt ) {
        this.jumpingState = true;
        this.jumpStartTime = dt;
        this.jumpStartPosition = this.entity.y;

        if (this.alive) {
            this.entity.setBaseSprite( "ball_flying" );
            this.board.step = this._changeJumpPosition;
        }
    };

    /**
     * Callback method for changing position while ascending
     */
    Ball.prototype.changeJumpPosition = function(dt) {
        var jumpingPosition, upperPosition;

        // if ascending is ended, drop
        if ( dt - this.jumpStartTime > this.jumpDuration ) {
            this.drop( this.jumpStartTime + this.jumpDuration, this.jumpStartPosition - this.jumpHeight );
            return;
        }

        // moving position
        jumpingPosition = this.jumpStartPosition - Math.floor( easing.easeOutCubic( dt-this.jumpStartTime, 0, this.jumpHeight, this.jumpDuration ) );

        // check whether ball heat the ceiling
        upperPosition = (jumpingPosition < 0 ? 0 : jumpingPosition ) ;
        if ( jumpingPosition !== upperPosition ) {
            this.drop( this.game.renderer.now(), upperPosition );
            return;
        }

        // moving
        this.entity.y = jumpingPosition;
    };

    /**
     * Drop method
     */
    Ball.prototype.drop = function( time, position ) {
        this.jumpingState = true;
        this.dropStartTime = time;
        this.dropStartPosition = position;

        this.board.step = this._changeDropPosition;
    };

    /**
     * Callback method for changing position while descending
     */
    Ball.prototype.changeDropPosition = function(dt) {
        var dropPosition = this.dropStartPosition + Math.floor( easing.easeInSine( dt-this.dropStartTime, 0, screenHeight, this.dropDuration ) );

        // disappearing in the canvas ...
        if ( screenHeight - this.entity.height < dropPosition) {
            this.jumpingState = false;
            if ( flappyBall.gameover === false ) {
                flappyBall.trigger("gameover");
            }
        }
        // moving position
        else {
            this.entity.y = dropPosition;
        }
    };

    /**
     * Globe Object ( consist of upper and lower globes )
     */
    var Globe = function( game, board, data ){
        this.game = game;
        this.board = board;
        this.startTime = data.startTime;
        this.count = false;

        // position for collision detection
        this.colsnArea = [
            { // upper globe bar
                x: 51,
                y: -data.y,
                width: 27,
                height: data.y
            },{ // upper globe
                x: 21,
                y: 57,
                width: 95,
                height: 78
            },{  // upper globe finger
                x: 66,
                y: 186-42,
                width: 39,
                height: 21
            },{  // lower globe finger
                x: 66,
                y: 186 + difficultyLevel[gamePattern][currentLevel].gap + 42,
                width: 39,
                height: 21
            },{  // lower globe
                x: 21,
                y: 186 + difficultyLevel[gamePattern][currentLevel].gap + 51,
                width: 95,
                height: 78
            },{   // lower globe bar
                x: 51,
                y: 186 + difficultyLevel[gamePattern][currentLevel].gap + 186,
                width: 27,
                height: screenHeight - (data.y + 186 + difficultyLevel[gamePattern][currentLevel].gap + 186) - 118
            }
        ];

        // upper globe bar object
        this.upperGlobeBar = this.game.entityPool.allocate({
            x: data.x + 51,
            y: 0,
            z: 1,
            width: 27,
            height: data.y,
            domRendering: game.config.domRendering
        }).addTo(board.name).setBaseSprite("globe_bar");
        // if domRendering === true
        if(this.upperGlobeBar.domRendering){
            this.upperGlobeBar.domRenderer = game.domRenderer.getRendererNode("bar");
            this.upperGlobeBar.domRenderer.setEntity(this.upperGlobeBar);
        }

        // upper globe object
        this.upperGlobe = this.game.entityPool.allocate({
            x: data.x,
            y: data.y,
            z: 1,
            width: 159,
            height: 186,
            domRendering: game.config.domRendering
        }).addTo(board.name).setBaseSprite("up_side_globe");
        // if domRendering === true
        if(this.upperGlobe.domRendering){
            this.upperGlobe.domRenderer = game.domRenderer.getRendererNode("globeUp");
            this.upperGlobe.domRenderer.setEntity(this.upperGlobe);
        }

        // lucky item object
        if ( luckyTime.length !== 0 && luckyTime[0] < data.score ) {

            this.coin = this.game.entityPool.allocate({
                x: data.x,
                y: data.y + 186 + ( difficultyLevel[gamePattern][ currentLevel ].gap - 60*2 )/2,
                z:1,
                width:69*2,
                height:60*2
            }).addTo(board.name).setBaseSprite("coin");

            luckyTime.shift();
        }

        // lower globe object
        this.downGlobe = this.game.entityPool.allocate({
            x: data.x,
            y: data.y + 186 + difficultyLevel[gamePattern][ currentLevel ].gap,
            z: 1,
            width: 159,
            height: 186,
            domRendering: game.config.domRendering
        }).addTo(board.name).setBaseSprite("down_side_globe");
        // if domRendering === true
        if(this.downGlobe.domRendering){
            this.downGlobe.domRenderer = game.domRenderer.getRendererNode("globeDown");
            this.downGlobe.domRenderer.setEntity(this.downGlobe);
        }

        // lower globe bar object
        this.downGlobeBar = this.game.entityPool.allocate({
            x: data.x + 51,
            y: data.y + 186 + difficultyLevel[gamePattern][ currentLevel ].gap + 186,
            z: 1,
            width: 27,
            height: screenHeight - (data.y + 186 + difficultyLevel[gamePattern][ currentLevel ].gap + 186) - 118,
            domRendering: game.config.domRendering
        }).addTo(board.name).setBaseSprite("globe_bar");
        // if domRendering === true
        if(this.downGlobeBar.domRendering){
            this.downGlobeBar.domRenderer = game.domRenderer.getRendererNode("bar");
            this.downGlobeBar.domRenderer.setEntity(this.downGlobeBar);
        }
    };

    /**
     * move method
     */
    Globe.prototype.move = function( data ){
        this.upperGlobe.x = data.x;
        this.upperGlobeBar.x = data.x+51;
        if ( typeof this.coin !== "undefined" ) {
            this.coin.x = data.x;
        }
        this.downGlobe.x = data.x;
        this.downGlobeBar.x = data.x+51;
     };

    /**
     * destroy method
     */
    Globe.prototype.destroy = function(){
        this.upperGlobe.destroy();
        this.upperGlobeBar.destroy();
        if ( typeof this.coin !== "undefined" ) {
            this.coin.destroy();
        }
        this.downGlobe.destroy();
        this.downGlobeBar.destroy();
    };

    /**
     * FlappyBall Game Object
     */
    var FlappyBall = function() {};

    FlappyBall.prototype = Object.create(PubSub.prototype);

    FlappyBall.prototype.init = function( game, playBoard ){

        this.game = game;
        this.playBoard = playBoard;

        // screen configure
        screenWidth = this.width = game.config.resolution.width;
        screenHeight = this.height = game.config.resolution.height;

        // background
        this.background = this.game.entityPool.allocate({
            x:0,
            y:0,
            z:-2,
            width:1080,
            height:1350,
            rootBG: this.game.config.smartRepaint
        }).addTo(this.playBoard.name).setBaseSprite("background");

        // clouds showing only in high resolution for performance tuning
        if ( this.game.config.maxQuality !== "low" ) {
            this.cloud = [];
            this.cloud[0] = this.game.entityPool.allocate({
                x:60,
                y:159,
                z:1,
                width:258,
                height:165
            }).addTo(this.playBoard.name).setBaseSprite("cloud_syrup");
            this.cloud[1] = this.game.entityPool.allocate({
                x:786,
                y:24,
                z:1,
                width:258,
                height:165
            }).addTo(this.playBoard.name).setBaseSprite("cloud_ocb");
            this.cloud[2] = this.game.entityPool.allocate({
                x:462,
                y:339,
                z:1,
                width:168,
                height:117
            }).addTo(this.playBoard.name).setBaseSprite("cloud_tmap");
        }

        // Ball
        ball = new Ball( this.game.config.maxQuality === "low" ? 1200 : 900 );
        ball.init( this.game, this.playBoard );

        // touch event binding
        this._onTouchstart = this.onTouchstart.bind(this);
        // game logic function binding for each time interval
        this._progress = this.progress.bind(this);
    };

    /**
     * Play method
     */
    FlappyBall.prototype.play = function( luckyPointTime ){
        var i, iLen;

        // game configure reset
        this.gameover = false;
        this.score = 0;
        this.luckyScore = 0;

        // setting the degree of difficulty
        var gamePatternRatio = [ 0, 0, 1, 1, 1, 2, 3, 3 ];
        gamePattern = gamePatternRatio[ Math.floor( Math.random()*gamePatternRatio.length ) ];

        // change stage in the degree of difficulty
        currentLevel = 0;
        this.levelUpScore = [];
        var sum=0;
        for ( i=0, iLen=difficultyLevel[gamePattern].length; i<iLen ; i++) {
            this.levelUpScore.push( sum );
            sum += difficultyLevel[gamePattern][i].count;
        }
        this.levelUpTotal = sum;

        // lucky item setting, refer triggering 'play' in apigame.js file
        luckyTime = luckyPointTime || [];

        // background
        this.background.setBaseSprite("background");

        // setting clouds postion
        if ( this.game.config.maxQuality !== "low" ) {
            this.cloud[0].x = 60;
            this.cloud[1].x = 786;
            this.cloud[2].x = 462;
        }

        // setting ball
        ball.alive = true;
        ball.entity.y = 300;
        ball.entity.setBaseSprite("ball_flying");
        ball.jump( this.game.renderer.now() );

        // setting globes
        if ( globes.length !== 0 ) {
            for ( i=0, iLen=globes.length; i<iLen ; i++) {
                globes[i].destroy();
            }
        }
        globes = [];
        globes.push( new Globe(this.game, this.playBoard, {
            x: this.width,
            y: 100,
            startTime: +new Date(),
            type: "down"
        }) );

        // touch event binding
        this.game.input.on(START_EV, this._onTouchstart);
        // game logic function binding for each time interval
        this.game.renderer.on("step", this._progress );
    };

    /**
     * End method
     */
    FlappyBall.prototype.end = function() {
        var i, iLen;

        // 모든 장애물 재거
        for ( i=0, iLen=globes.length; i<iLen ; i++) {
            globes[i].destroy();
        }
        globes = [];

        // input 이벤트 콜백함수 및 step 함수 해제
        this.game.input.off(START_EV, this._onTouchstart);
        this.game.renderer.off("step", this._progress );
    };

    /**
     * Callback method for touch event
     */
    FlappyBall.prototype.onTouchstart = function(e) {
        // just jump
        ball.jump( this.game.renderer.now() );
    };

    /**
     * Step method for game play
     */
    FlappyBall.prototype.progress = function(dt) {
        var i, p, iLen,
            item,
            curTime = +new Date(),
            removedIdx=0,
            globeNum;

        // GAME OVER
        if ( this.gameover === true ) {
            return;
        }

        // repositioning every globes
        for ( i=0, iLen=globes.length; i<iLen ; i++) {
            item = globes[i];
            p = this.width - Math.floor( easing.linear( curTime - item.startTime, 0, this.width + item.upperGlobe.width , gloveSpeed ) );
            item.move( {x:p} );
            // deleting globes which are disappeared
            if ( item.upperGlobe.x + item.upperGlobe.width <= 0 ){
                item.destroy();
                removedIdx = i+1;
            }
        }

        // deleting globes in globe list
        if( removedIdx === 1 ){
            //shift is much faster than splice
            globes.shift();
        } else {
            globes.splice( 0, removedIdx );
        }

        // repositioning clouds
        if ( this.game.config.maxQuality !== "low") {
            for ( i=0, iLen=this.cloud.length; i<iLen ; i++) {
                this.cloud[i].x -= cloudSpeed;
                if ( this.cloud[i].x + 258 < 0 ) {
                    this.cloud[i].x = this.width + 50;
                }
            }
        }

        // adding globes
        globeNum = globes.length;
        if ( globeNum === 0 || ( globeNum < 3 && globes[globeNum-1].upperGlobe.x + globes[globeNum-1].upperGlobe.width + difficultyLevel[gamePattern][currentLevel].intervalBase < this.width ))  {
            globes.push( new Globe(this.game, this.playBoard, {
                x: this.width + Math.floor( Math.random()* difficultyLevel[gamePattern][ currentLevel ].interval + 1),
                y: difficultyLevel[gamePattern][currentLevel].rangeBase + Math.floor( Math.random()*difficultyLevel[gamePattern][currentLevel].range + 1),
                startTime: curTime,
                score: this.getScore()
            }));
        }

        // collision detection & score update & checking stage in the pattern the degree of difficulty
        this.checkCollisionScore();
    };


    /**
     * Method for collision detection & score update & checking stage in the pattern the degree of difficulty
     */
    FlappyBall.prototype.checkCollisionScore = function() {
        var i, j, iLen, jLen, self = this;

        // check for every globes
        for ( i=0, iLen=globes.length; i<iLen ; i++) {
            var baseX = globes[i].upperGlobe.x ,
                baseY = globes[i].upperGlobe.y;

            // check x position
            if ( ball.entity.x + ball.entity.width < baseX ) {
                break;
            }

            // check each collistion area of globe
            for ( j=0, jLen=globes[i].colsnArea.length; j<jLen ; j++) {
                var area = globes[i].colsnArea[j];

                if ( !(baseX + area.x + area.width < ball.entity.x || ball.entity.x + ball.entity.width < baseX + area.x)
                        && !(baseY + area.y + area.height < ball.entity.y || ball.entity.y + ball.entity.height < baseY + area.y) ) {

                    this.gameover = true;
                    ball.alive = false;

                    ball.entity.setBaseSprite( "ball_falling" );
                    if ( this.game.config.maxQuality !== "low" ) {
                        this.background.setBaseSprite("background_white");
                    }

                    // 공이 떨어지는 시간동안 기다렸다가 종료
                    setTimeout( function(){
                        self.trigger("gameover");
                    }, ball.dropDuration * 3/4  );
                    return;
                }
            }

            // acquire lucky item
            var coin = globes[i].coin;
            if ( typeof coin !== "undefined"
                    && !(coin.x + coin.width*3/4 < ball.entity.x || ball.entity.x + ball.entity.width < coin.x + coin.width*1/4)
                    && !(coin.y + coin.height*3/4 < ball.entity.y || ball.entity.y + ball.entity.height < coin.y + coin.height*3/4)){
                coin.setBaseSprite("point");
            }

            // score update
            if ( globes[i].upperGlobe.x < 240 && globes[i].count === false ) { // 240은 ball의 x 좌표
                globes[i].count = true;

                // changing stage in the pattern the degree of difficulty
                this.addScore();
                if ( this.checkLevelUp() ) {
                    currentLevel++;
                    currentLevel = currentLevel % difficultyLevel[gamePattern].length;
                }

                // counting acquirement of luck item
                if ( typeof globes[i].coin !== "undefined" ){
                    this.addLuckyScore();
                }
            }
        }
    };


    /**
     * Method for changing stage in the pattern the degree of difficulty
     */
    FlappyBall.prototype.checkLevelUp = function(){

        var score = this.score % this.levelUpTotal ;

        if ( this.levelUpScore.indexOf( score ) !== -1 ) {
            return true;
        }
        else {
            return false;
        }
    };

    /**
     * Method for getting score
     */
    FlappyBall.prototype.getScore = function() {
        return this.score;
    };

    /**
     * Method for adding score
     */
    FlappyBall.prototype.addScore = function() {
        var self = this;

        this.score++;
        this.trigger("score");

        // Max score
        if ( this.score === 997 ) {
            setTimeout( function(){
                self.trigger("gameover");
            }, 100 );
        }
    };

    /**
     * Method for getting count of lucky item
     */
    FlappyBall.prototype.getLuckyScore = function() {
        return this.luckyScore;
    };

    /**
     * Method for adding acquire number of lucky item
     */
    FlappyBall.prototype.addLuckyScore = function() {
        this.luckyScore ++;
    };

    flappyBall = new FlappyBall();
    return flappyBall;
});