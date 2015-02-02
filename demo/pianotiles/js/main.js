requirejs.config({
    baseUrl:'../../engine/module',
    paths:{
        game: '../../demo/pianotiles/js'
    }
});

require(['pwge/game','game/pianotiles','game/resource'],function( Game, Pianotiles, resources){

    var mobile = 'ontouchstart' in window,
        START_EV = mobile ? 'touchstart' : 'mousedown',
        MOVE_EV = mobile ? 'touchmove' : 'mousemove',
        END_EV = mobile ? 'touchend' : 'mouseup';

    var game = new Game({
        container : window,
        canvas : document.getElementById("canvas"),
        resolution : {
            quality : "high",
            width : 1080,
            height : 1350
        },
        viewport : "scale_to_fit",
        viewportAlign : {
            vertical : "top"
        },
        clearCanvasOnEveryFrame : true,
        planetWebview : false,
        maxQuality : "mid",
        quality : "auto",
        domRendering : true,
        domRendererSelector: "rendererDOM",
        debug : true
    });

    var playBaord = null,
        gridCanvas = null;

    var buttonPos = {
        x:( game.config.resolution.width - 620) / 2,
        y:800,
        x2:((640 - 420) / 2) + 620,
        y2:1200
    };

    var _touchstart = function(e) {
        var x = e.designX,
            y = e.designY;

        if ( x > buttonPos.x && x < buttonPos.x2) {
            if ( y > buttonPos.y && y < buttonPos.y2 ) {
                console.log("start!");
                game.trigger("start");
            }
        }
    };

    var sizeTest = function() {
            var canvas = game.canvas.offscreen();
            var ctx = canvas.getContext("2d");

            console.log(ctx.canvas.width);
            console.log(ctx.canvas.height);

            ctx.fillStyle="#ff0000";
            ctx.fillRect(0,0,ctx.canvas.width, ctx.canvas.height);
            game.entityPool.allocate({
                x:0,
                y:0,
                width:game.config.resolution.width,
                height:game.config.resolution.height
            }).addTo("introBoard").setBaseImage(canvas);
    };

    game.on("ready",function(e){

        var introBoard = game.boardManager.makeBoard("introBoard");
        var image = new Image();
        image.src = "image/mid/intro_bg.png";
        var button = new Image();


        button.src = "image/mid/intro_btn_start.png";

        game.entityPool.allocate({
             x:0,
             y:0,
             width: game.config.resolution.width,
             height: game.config.resolution.height
        }).addTo("introBoard").setBaseImage(image);

        game.entityPool.allocate({
            x:( game.config.resolution.width - 620) / 2,
            y:800,
            width:620,
            height:300
        }).addTo("introBoard").setBaseImage(button);

        game.input.on(START_EV, _touchstart);

        game.renderer.makeScene("introScene",["introBoard"]);

        game.renderer.start();
        game.renderer.switchScene("introScene", "zoomOut");
    });

    // initialize game scene
    game.on("start",function(e){
        var playBoard = game.boardManager.makeBoard("playBoard");
        var offCanvas = game.canvas.offscreen();


        game.renderer.makeScene("playScene",["playBoard"]);
        game.input.off(START_EV, _touchstart);
        Pianotiles.init(game,"playBoard",offCanvas);
        Pianotiles.play();
        game.renderer.switchScene("playScene");
    });

    game.on("gameover", function(e){

        var endBoard = game.boardManager.makeBoard("endBoard");

        var image = new Image();
        image.src = "image/mid/gameover_bg.png";

        game.entityPool.allocate({
            x:0,
            y:0,
            width: game.config.resolution.width,
            height: game.config.resolution.height
        }).addTo("endBoard").setBaseImage(image);

        game.renderer.makeScene("endScene",["endBoard"]);
        console.log("end game");
        game.renderer.switchScene("endScene");

    });

    game.trigger("ready");
});