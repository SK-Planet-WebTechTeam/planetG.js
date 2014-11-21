requirejs.config({
    baseUrl: '../../engine/module',
    paths : {
        game : "../../demo/avoidance/js"
    }
});

require(['pwge/game', 'game/resource'], function(Game, resource){
    var game = new Game({
        container : window,
        canvas : document.getElementById("gameCanvas"),
        resolution : { //design resolution
            quality : "low",
            width : 360,
            height : 400
        },
        viewport : "scale_to_fit",
        clearCanvasOnEveryFrame : false,
        debug : true
    });

    game.loader.loadResources(resource).then(function(){
        game.trigger("ready");
    }, function() {
        alert("error");
    });

    game.on("ready", function(){
        var bgImage = game.canvas.offscreen(),
            context = bgImage.getContext("2d");

        bgImage.width = game.viewport.designWidth;
        bgImage.height = game.viewport.designHeight;

        context.fillStyle = "#777";
        context.fillRect(0, 0, bgImage.width, bgImage.height);
        game.spriteManager.set("bg", bgImage);

        var bulletImage = game.canvas.offscreen();
        context = bulletImage.getContext("2d");

        bulletImage.width = 6;
        bulletImage.height = 6;

        var centerX = bulletImage.width / 2;
        var centerY = bulletImage.height / 2;
        var bulletRadius = 3;

        context.beginPath();
        context.arc(centerX, centerY, bulletRadius, 0, 2 * Math.PI, false);
        context.fillStyle = "rgba(255, 255, 255, 0.8)";
        context.fill();
        context.lineWidth = 1;
        context.strokeStyle = "#000";
        context.stroke();
        game.spriteManager.set("bullet", bulletImage);

        var playerImage = game.canvas.offscreen();
        context = playerImage.getContext("2d");

        playerImage.width = 25;
        playerImage.height = 25;

        centerX = playerImage.width / 2;
        centerY = playerImage.height / 2;
        var playerRadius = 10;

        context.beginPath();
        context.arc(centerX, centerY, playerRadius, 0, 2 * Math.PI, false);
        context.fillStyle = "red";
        context.fill();
        context.lineWidth = 1;
        context.strokeStyle = '#333';
        context.stroke();

        game.spriteManager.set("player", playerImage);

        var space = game.boardManager.makeBoard("space");
        game.renderer.makeScene("play", ["space"]);

        var bg = game.entityPool.allocate({
            x: 0,
            y: 0,
            width: game.viewport.designWidth,
            height: game.viewport.designHeight,
            z: -2
        }).addTo("space").setBaseImage(bgImage);

        var player = game.entityPool.allocate({
            x: game.viewport.designWidth / 2,
            y: game.viewport.designHeight / 2,
            width: 25,
            height: 25,
            anchorX: 12.5,
            anchorY: 12.5,
            z: -1
        }).addTo("space").setBaseImage(playerImage);

        var overlap = function(o1, o2) {
            return Math.sqrt((o2.x - o1.x) * (o2.x - o1.x) + (o2.y - o1.y) * (o2.y - o1.y)) < bulletRadius + playerRadius;
        };
        player.step = function(dt){
            var entities = game.boardManager.findEntity(function(){
                    return this.type === "bullet";
                }),
                collision = false,
                overed;

            if (entities) {
                if (entities.length) {
                    collision = entities.some(function(entity){
                        if (overlap(player, entity)) {
                            overed = entity;
                        }
                        return overlap(player, entity);
                    });
                } else {
                    overed = collision = overlap(player, entities);
                }
            }

            timer.textContent = (dt / 1000).toFixed(3).toString();

            if (collision) {
                // console.log(player, overed, Math.sqrt((overed.x - player.x) * (overed.x - player.x) + (overed.y - player.y) * (overed.y - player.y)));
                game.renderer.stop();
                game.soundManager.stopMusic();
                game.soundManager.playSound("endgame");
            }
        };

        var bulletGenerator = game.entityPool.allocate().addTo("space");
        var lastLevel = -1,
            levelDuration = 1000;

        var getAngle = function(x1, y1, x2, y2) {
                return Math.atan2(y2 - y1, x2 - x1);
            },
            destroySelf = function(){
                this.destroy();
                game.soundManager.playSound("click");
            };

        bulletGenerator.generate = function(level) {
            var bullet, ang,
                fromX,
                fromY,
                targetAngle,
                toX,
                i;
            for (i = 0; i < 10; i++) {
                ang = Math.PI * Math.random() * 2;
                fromX = game.viewport.designWidth / 2 + game.viewport.designWidth * 0.75 * Math.cos(ang);
                fromY = game.viewport.designHeight / 2 + game.viewport.designHeight * 0.75 * Math.sin(ang);
                bullet = game.entityPool.allocate({
                    type: "bullet",
                    x: fromX,
                    y: fromY,
                    z: 3,
                    width: 6,
                    height: 6,
                    anchorX: 3,
                    anchorY: 3
                }).addTo("space").setBaseImage(bulletImage);

                targetAngle = getAngle(fromX, fromY, player.x, player.y);
                toX = Math.cos(targetAngle) * Math.max(game.viewport.designHeight, game.viewport.designWidth) * 1.5;

                bullet.animate({
                    duration : Math.floor(3500 + Math.random() * 2500),
                    from: {
                        x: fromX,
                        y: fromY
                    },
                    to: {
                        x: fromX + toX,
                        y: fromY + Math.tan(targetAngle) * toX
                    },
                    easing : {
                        x : "linear",
                        y : "linear"
                    },
                    callback : destroySelf
                });
            }
        };
        bulletGenerator.step = function(dt) {
            var r = dt % levelDuration;
            dt -= r;
            level = (dt / levelDuration);
            if (level > lastLevel) {
                bulletGenerator.generate(level);
                lastLevel = level;
            }
        };
        game.boardManager.getBoard("space");

        var touched = false,
            left = 0,
            top = 0,
            within = function(range, n) {
                return (n < 0) ? -Math.min(range, Math.abs(n)) : Math.min(range, Math.abs(n));
            };

        game.input.on("touchstart mousedown", function(e){
            touched = true;
            left = e.designX;
            top = e.designY;
        });
        game.input.on("touchmove mousemove", function(e){
            if (touched) {
                moveLeft = e.designX - left;
                moveTop = e.designY - top;
                left = e.designX;
                top = e.designY;

                player.x += within(20, moveLeft);
                player.y += within(20, moveTop);

                player.x = Math.min(Math.max(0, player.x), game.viewport.designWidth);
                player.y = Math.min(Math.max(0, player.y), game.viewport.designHeight);
            }
        });
        game.input.on("touchend mouseup", function(e){
            touched = false;
        });

        game.renderer.start();
        game.renderer.switchScene("play", "zoomOut");
        game.soundManager.playMusic("bg", true);
    });
});