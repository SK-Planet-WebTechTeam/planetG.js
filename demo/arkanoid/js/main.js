define("ocb/main",['pwge/game','ocb/entity',"pwge/util"],function( Game, entity, util){

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
            width : 320,
            height : 416
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
        domRendering: true,
        domRendererSelector: "rendererDOM",
        clearCanvasOnEveryFrame : false,
        smartRepaint: true, // root bg
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

        // init game
        entity.init(game, playBoard);
    });

    // Game Scenario when 'play' triggered
    game.on("play",function(){
        entity.play();
        game.renderer.start();
        game.renderer.switchScene("playScene");
    });

    game.on("end", function() {
        game.renderer.stop();
        alert("game over");
    })

    return game;
});