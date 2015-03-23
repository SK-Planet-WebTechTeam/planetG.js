define("ocb/main",['pwge/game','ocb/entity',"pwge/util"],function( Game, entity, util){

    // detection for performance tunning
    var ua = window.navigator.userAgent,
        kitkat = (/Android 4\.4\.[012]/i).test(ua); // android 4.4.0~4.4.2

    // make Game Object
    var game = new Game({
        container : window,
        canvas : document.getElementById("gameCanvas"),

        // view configure
        resolution : {
            quality : "high",
            width : 720,
            height : 900
        },
        viewport : "scale_to_fit",
        viewportAlign : {
            vertical : "top"
        },

        // game configure
        entityZOrdering: false,
        sortByZOnEveryFrame: false,
        planetWebview : false,
        quality : "high",
        domRendering: kitkat, // only enabled if kitkat
        domRendererSelector: "rendererDOM",
        clearCanvasOnEveryFrame : false,
        smartRepaint: kitkat, // for root bg, only enabled if kitkat
        debug : false,
        level : 0
    });

    var playBoard,
        endBoard;

    // Game Scenario when 'ready' triggered
    game.on("play",function(){
        var self = this;

        // make board for game play
        playBoard = game.boardManager.makeBoard("playBoard", { entityZOrdering: game.config.entityZOrdering });
        game.renderer.makeScene("playScene",["playBoard"]);

        // init game
        entity.init(game, playBoard);

        // score event triggering from game
        entity.on("score", function(){
            $(".gameCanvas").trigger("score", {
                point : entity.getScore()
            });
        });

        entity.on("level", function(){
            $(".gameCanvas").trigger("level", {
                point : entity.getLevel()
            });
        });

        //alert("arkanoid redesigned v0.30");

        entity.play(game.config.level);
        game.renderer.start();
        game.renderer.switchScene("playScene");
    });

    game.on("end", function() {
        //game.renderer.stop();
        //console.log("gameover");
    });

    game.on("next", function() {
        game.config.level+=1;
        entity.nextStage();
    });

    return game;
});