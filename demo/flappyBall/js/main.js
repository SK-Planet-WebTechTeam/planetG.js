define("ocb/main",['pwge/game','ocb/flappyBall',"pwge/util"],function( Game, flappyBall, util){

    // divec detection for performance tuning
    var ua = window.navigator.userAgent,
        android = (/Android/i).test(ua),
        gb = (/Android 2/i).test(ua),
        ics = (/Android 4.0/i).test(ua),
        kitkat = (/Android 4.4;/i).test(ua)||(/Android 4.4.2/i).test(ua);

    // make Game Object
    var game = new Game({
        container : window,
        canvas : document.getElementById("gameCanvas"),

        // view configure
        resolution : {
            quality : "high",
            width : 1080,
            height : 1350
        },
        viewport : "scale_to_fit",
        viewportAlign : {
            vertical : "top"
        },

        // game configure
        entityZOrdering: false,
        entityPoolSize: 24,
        clearCanvasOnEveryFrame : false,
        sortByZOnEveryFrame: false,
        planetWebview : false,
        maxQuality : ((gb || ics || kitkat ) ? "low" : "mid"),
        quality : "auto",
        domRendering: false,
        domRendererSelector: "rendererDOM",
        smartRepaint: kitkat,
        // smartRepaint: false,
        debug : true
    });

    var playBoard,
        endBoard;

    // Game Scenario when 'ready' triggered
    game.on("ready",function(){
        var self = this;

        // make board for game play
        playBoard = game.boardManager.makeBoard("playBoard", { entityZOrdering: game.config.entityZOrdering });
        game.renderer.makeScene("playScene",["playBoard"]);

        // make board for game end
        endBoard = game.boardManager.makeBoard("endBoard", { entityZOrdering: game.config.entityZOrdering });
        game.renderer.makeScene("endScene",["endBoard"]);
        game.entityPool.allocate({
            x:0,
            y:0,
            width:self.config.resolution.width,
            height:self.config.resolution.height
        }).addTo("endBoard").setBaseSprite("background");

        // initializing game
        flappyBall.init(game, playBoard);

        // score event triggering from game
        flappyBall.on("score", function(){
            $(".gameCanvas").trigger("score", {
                point : flappyBall.getScore()
            });
        });

        // game over event binding
        flappyBall.on("gameover", function(){
            flappyBall.end();
            setTimeout( function () {
                game.trigger("end");
            });
        });

        // when domRenderer is enabled
        if(game.config.domRendering){
            var tmp = document.getElementsByClassName(game.domRenderer.selector),
                len = tmp.length;
            // PC and browser compatibility
            var mobile = 'ontouchstart' in window,
                START_EV = mobile ? 'touchstart' : 'mousedown',
                MOVE_EV = mobile ? 'touchmove' : 'mousemove',
                END_EV = mobile ? 'touchend' : 'mouseup';
            if(len <= 0) {
                console.log("invalid selctor");
                return;
            }
            // event binding in DOM element
            for( i=0; i < len; i++ ){
                tmp[i].addEventListener(START_EV, flappyBall._onTouchstart, true);
            }
        }
    });

    // Game Scenario when 'play' triggered
    game.on("play",function( luckyPoint ){
        flappyBall.play( luckyPoint );
        game.renderer.start();
        game.renderer.switchScene("playScene");
    });

    // Game Scenario when 'end' triggered
    game.on("end",function(start,now){
        game.renderer.switchScene("endScene");
        $(".gameCanvas").trigger("finish", {
            point : flappyBall.getScore(),
            luckyPoint : flappyBall.getLuckyScore()
        });
    });

    return game;
});