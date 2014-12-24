requirejs.config({
    baseUrl:'../../engine/module',
    paths:{
        lib:'lib',
        game: '../../demo/sachunsung/js'
    }
});


// Main scenario for sachunsung game
require(['pwge/game', 'game/sachunsung', 'game/scroller', 'game/resource' ],function(Game, sachunsung, scroller, resource){
    var game = new Game({
        container : window,
        canvas : document.getElementById("canvas"),

        // coordinate system
        resolution : {
            quality : "high",
            width : 1080,
            height : 1350
        },
        viewport : "scale_to_fit",
        viewportAlign : {
            vertical : "top"
        },

        // img resource
        resource: resource,

        // game engine configure
        entityZOrdering: false,
        entityPoolSize: 24,
        clearCanvasOnEveryFrame : true,
        sortByZOnEveryFrame: false,
        planetWebview : false,
        maxQuality : "high",
        quality : "high",
        domRendering: false,
        // domRendererSelector: "rendererDOM",
        smartRepaint: false,
        debug : false
    });

    // Game configuration
    var totalTime = 60000,
        i=0,
        sum=0,

        // game level (from 0 to 6)
        crntStage = 0,
        challangeStage = 0,
        totalStage = 6,

        // accumulated score
        totalScore = 0,

        // boards for display layout
        introBoard = null,
        scrollBoard = null,
        playBoard = null,
        endBoard = null;

    // Game Intro Scene
    game.on("ready",function(){
        // making scene and board
        if (introBoard !== null) {
            introBoard.destroy();
        }
        introBoard = game.boardManager.makeBoard("introBoard");
        if (scrollBoard !== null) {
            scrollBoard.destroy();
        }
        scrollBoard = game.boardManager.makeBoard("scrollBoard");
        game.renderer.makeScene("introScene",["introBoard", "scrollBoard"]);

        // background
        game.entityPool.allocate({
            x:0,
            y:0,
            width:1080,
            height:1350,
            detectable:false
        }).addTo("introBoard").setBaseSprite("stageBg");

        // making scroller component
        scroller.init({
            game : game,
            board : scrollBoard,
            img : "img/high/sachunsungStageUI.png",
            x : 170,
            y : 613,
            width : 739,
            height : 468
        });

        // position for each stage 'play' button
        var btnX = [ 25, 185, 25, 185, 25, 185],
            btnY = [ 150, 150, 230, 230, 310, 310 ];
        for ( i = 0 ; i < totalStage; i++) {
            var stg = game.entityPool.allocate({
                x:btnX[i],
                y:btnY[i],
                width:110,
                height:62
            }).addTo("introBoard");;

            // mission-completed stage
            if ( i <= challangeStage ) {
                stg.setBaseSprite("playBtn").on("touchend click", (function(i) {
                    return function(e) {
                        this.setBaseSprite("playBtnDown");
                        crntStage = i;
                        game.trigger("play");
                    }
                })(i) );
            }
            // stage which is not being able to play now
            else {
                stg.setBaseSprite("questionBtn");
            }
        }

        // rendering loop start
        game.renderer.start();
        game.renderer.switchScene("introScene", "zoomOut");
    });

    // Game Play Scene
    game.on("play",function(e){
        var ready = null,
            go  = null;

        // making scene and board
        if (playBoard !== null) {
            playBoard.destroy();
        }
        playBoard = game.boardManager.makeBoard("playBoard");
        game.renderer.makeScene("playScene",["playBoard"]);

        // game initializing
        sachunsung.init(game, playBoard, crntStage);

        // event binding when mission complete
        sachunsung.on("complete", function(){
            // updating stage info
            console.log( crntStage + " stage clear... " );
            if (crntStage < totalStage-1 && crntStage === challangeStage) {
                challangeStage = ++crntStage;
            }
            console.log( "next stage is " + challangeStage );

            // updating accumulated score
            totalScore += sachunsung.getScore();
            console.log( "total score : " + totalScore );

            endGame();
        });

        // excuted when mission-complete or time-out
        var endGame = function() {
            console.log("end game");
            sachunsung.off("complete")
            sachunsung.end();
            setTimeout( function () {
                game.trigger("end");
            }, 2000);
        }

        // time-line description for 'Ready' -> 'Go' animation and time-out setting
        playBoard.timeline([
            // ready
            [300, function(start,now){
                console.log(start,now);
                ready = game.entityPool.allocate({
                    x:(1080-305)/2,
                    y:(1350-121)/2,
                    width:305,
                    height:121
                }).addTo("playBoard").setBaseSprite("Ready");
            }],
            [1000,function(start,now){
                ready.destroy();
            }],
            // go
            [1300,function(start,now){
                go = game.entityPool.allocate({
                    x:(1080-208)/2,
                    y:(1350-202)/2,
                    width:208,
                    height:202
                }).addTo("playBoard").setBaseSprite("Go");
            }],
            // game start
            [2000,function(start,now){
                go.destroy();
                console.log("start game");
                sachunsung.start();
            }],
            // time out after 60s (totalTime)
            [totalTime+2000,function(start,now){
                endGame();
            }]
        ]);

        game.renderer.switchScene("playScene");
    });

    // Game End Scene
    game.on("end",function(start,now){
        // making scene and board
        if (endBoard !== null) {
            endBoard.destroy();
        }
        endBoard = game.boardManager.makeBoard("endBoard");
        game.renderer.makeScene("endScene",["endBoard"]);

        // background
        game.entityPool.allocate({
            x:0,
            y:0,
            width:1080,
            height:1350,
            detectable:false
        }).addTo("endBoard").setBaseSprite("gameBg");

        // game over img
        game.entityPool.allocate({
            x:(1080-559)/2,
            y:(1350-116)/2,
            width:559,
            height:116
        }).addTo("endBoard").setBaseSprite("gameOver");

        // time-line description for moving to Intro Scene
        endBoard.timeline([
            // moving to Game Intro Scene after 2s
            [2000, function(start,now){
                console.log(start,now);
                game.trigger("ready");
            }],
        ]);

        game.renderer.switchScene("endScene");
    });
});