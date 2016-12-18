

## Installation

The very first thing you need to do is import our JS file. In your HTML file where you want to put our game engine, include following code in `<head></head>`.

    <script src="./engine/lib/polyfill.js"></script>
    <script src="./engine/lib/promise-0.1.1.js"></script>
    <script src="./engine/lib/require.js" data-main="js/main.js"></script>

Then, you also need a **<canvas>** element to draw your game. Thus, basic HTML file for your game should look something like below.

    <html>
        <head>
            <script src="./engine/lib/polyfill.js"></script>
            <script src="./engine/lib/promise-0.1.1.js"></script>
            <script src="./engine/lib/require.js" data-main="js/main.js"></script>
        </head>
        <body>
            <canvas id="canvas"></canvas>
        </body>
    </html>

As you see from the above code, there are some dependencies.

*   RequireJS
*   IE polyfill library
*   promise library

All three dependency files are included in our repository.

At **data-main** attribute in <script src="./engine/lib/require.js" **data-main="js/main.js"**></script>, put the path of your source code for the game.

### RequireJS Configuration

Basic RequireJS configuration needed for our game engine is as below.

    requirejs.config({
        baseUrl: './engine/module/',
        paths: {
            game: './game/polypop/js'
        },
        urlArgs: "bust=" + (new Date()).getTime()
    });

*   **baseUrl**: Location of engine/module directory
*   **paths**: Paths to any other file you need for your game.
*   **urlArgs**: Optional, but it is better to use this property so that browser not read from cached files. For more information, please refer to [RequireJS API doc](http://requirejs.org/docs/api.html#config)


## Game

Game object has all configuration of how to draw your game on canvas, and holds all other objects in your game such as scenes, boards, entities, etc, which will be explained on later parts.

    require(['pwge/game', 'game/resource', ...], function(Game, resource, ...) {
        var game = new Game({
            container : window,
            canvas : document.getElementById("canvas"),
            resolution : {
                quality : "mid",
                width : 720,
                height : 900
            },
            viewport : "scale_to_fit_width",
            viewportAlign : {
                vertical : "top"
            },
            resource : resource,
            clearCanvasOnEveryFrame : false,
            quality : "auto",
            maxQuality : "mid",
            debug : false
        });

        ...
    });

*   **container**:
*   **canvas**: Canvas element to draw your game on.
*   **resolution**: Base resolution information. Entity's size and location are determined based on this information.
*   **viewport**: viewport property should be set among following five options.
    *   **default**:
    *   **scale_to_fit**: Scale the canvas to fit the viewport (preserves ratio).
    *   **stretch_to_fit**: Stretch the canvas to fit the viewport (**NOT** preserve ratio).
    *   **scale_to_fit_width**: Scale the canvas to fit width of the viewport. Height of the canvas may become longer than viewport height.
    *   **scale_to_fit_height**: Scale the canvas to fit height of the viewport. Width of the canvas may become longer than viewport width.
*   **viewportAlign**: If viewport is set to "scale_to_fit_width".
*   **resource**: resource module (explained later in [Game Resources](#game_resources)).
*   **clearCanvasOnEveryFrame**: If true, clear canvas on every frame, otherwise, clear canvas only when there is any change.
*   **quality**: "auto", "high", "mid", "low". If set to "auto", quality is determined by the devices' pixel ratio and viewport size.
*   **maxQuality**(Optional): If quality is set to "auto", restrict maximum quality to be applied: "high", "mid", "low".
*   **debug**:



## Renderer

**Renderer** manages the game's time process, and manages game scenes. Renderer's loop function is called on every frame by requestAnimationFrame, do any neccessary calculation for your game, and draw each frame on the screen. "step", "draw" event is triggered on every loop function call, so you can listen to these events to do calculations or anything you want to do.

    game.renderer.on("step", function(dt) {
        ...
    });

    game.renderer.on("draw", function(dt) {
        ...
    });

The argument passed in the callback function , **dt**, is delta time between this frame and the last frame.



### DOM Renderer



## Scene

A game consists of at least one **game scene**, and renderer takes care of scene transition on user input or specific event. For instance, suppose your game has a "game start" button, and click on the button starts the game, and 1 minutes after game ends and displays players score. Then, the first scene of your game is the screen with "game start" button, the second is game playing screen, and the last scene is the screen with players score.



### Make Scene

To make a scene in your game, simply call Renderer's makeScene method.

    game.renderer.makeScene("introScene",["introBoard"]);

The first argument is the **name of new scene**, and the second one is an **array of names of [Boards](#board)** to include in the new scene. There is no **Scene** object explicitly accessable by developers, or no property for scene either. The only thing open to developers is the name of the scene. Thus, boards must be created before you create a scene.



### Scene Transition

Planet game engine supports **scene transition effect**.

    game.renderer.switchScene("introScene", "zoomOut");

If you don't want any transition effect, just omit the second argument.

List of supported transition effect:

*   fade
*   zoomIn / zoomOut
*   slideInTop / slideInRight / slideInBottom / slideInLeft
*   moveInTop / moveInRight / moveInBottom / moveInLeft

#### Custom Transition Effect

    require(["pwge/renderer/transition", "pwge/canvas", "util/easing"], function(transition, canvas, easing){
        transition.customSceneTransitionEffect = function(past, o){
            var opacity = easing[o.easing](past, 0, 1, o.duration);
            canvas.ctx.save();
            canvas.ctx.drawImage(o.from, 0, 0, canvas.width, canvas.height);
            canvas.ctx.globalAlpha = opacity;
            canvas.ctx.drawImage(o.to, 0, 0, canvas.width, canvas.height);
            canvas.ctx.restore();
        };
    });

    renderer.switchScene("targetScene", "customSceneTransitionEffect");

    renderer.switchScene("targetScene", {
        type : "customSceneTransitionEffect",
        easing : "easeInOutQuad",
        duration : 2000
    });

## Board

Board is where all the entities in the game is included and presented. A board must be included in a Scene, or it will never shown on the canvas. A scene can have multiple boards.

    var playBoard = game.boardManager.makeBoard("boardname", { x : 50, y : 100 });

You can set offset of the board from the canvas's ( 0, 0 ) by the second argument. Setting offset will affect position of all entities in board.

<article id="add_to_scene">

### add to scene

Adding boards to a scene is only done on scene creation. Thus, make sure you create all boards before you create a scene to add them.

    var introBoard = game.boardManager.makeBoard("boardname"),
        playBoard = game.boardManager.makeBoard("playBoard", { x : 50, y : 100 });

    game.renderer.makeScene("introScene",["introBoard", "playBoard"]);


## Entity

Any object you put in your game is an **Entity**. A character the user play around, a bullet the character shoots, obstacles that block the character's move.. everything is an entity. Entities should be allocated from the [**Entity Pool**](#entity_pool), and then added to a Board to be presented in a specific game scene.


### Entity Pool

PWGE makes use of **Entity Pool** for efficient memory management (to suppresse garbage collection). Thus, every entity should be allocated in the entity pool properly when needed, and must be returned to the entity pool when it is no more in use. **game.entityPool.allocate** method allocates a new entity at available spot in the pool and reset the properties with given option (parameter).

    var new_entity = game.entityPool.allocate({
        x: 50,
        y: 50,
        width: 100,
        height: 100,
        anchorX: 0,
        anchorY: 0
    });

An entity has following properties.

    {
        "domRendering": false,
        "domRenderer": null,
        "enabled": true,
        "detectable": true,
        "opacity": 1,
        "anchorX": 0,
        "anchorY": 0,
        "rotate": 0,
        "scaleX": 1,
        "scaleY": 1,
        "x": 0,
        "y": 0,
        "z": 0,
        "width": 0,
        "height": 0
    }

*   **domRendering**:
*   **domRenderer**:
*   **enabled**: if true, the entity is shown on board, otherwise it doesn't appear on board.
*   **detectable**:
*   **opacity**: opacity of the entity
*   **anchorX, anchorY**: anchor point to top-left corner from center
*   **rotate**: amount of rotation (in radian)
*   **scaleX, scaleY**: scale factor
*   **x, y, z**: entity's position on board (center of the entity)
*   **width**: width of the entity
*   **height**: height of the entity



### add to board

A new entity should be contained by a **Board**, otherwise, it will never show on the canvas. Adding an entity to a board is done with following code.

    new_entity.addTo( "name of a board" );

Or

    board.addEntity( new_entity );


## Sprite

Apply a sprite image to an entity is divided into two step.

#### step 1\. define sprite

Sprite object has following properties.

    {
        "image" : "bomb",
        "x": 0,
        "y": 0,
        "width" : 135,
        "height" : 135,
        "frames" : 6,
        "loop" : true,
        "duration" : 1000,
        "sleep": 100,
        "order" : [0,1,2,3,4,5],
        "easing" : "linear"
    }

*   **image**: name of image. to apply a sprite image, you should load an image before you define a sprite, either by loader, or resource.js
*   **x**: top-left corner position of sprite
*   **y**: top-left corner position of sprite
*   **width**: width of each frame. For example, a 100 x 20 sprite image consists of five 20 x 20 images for a frame, then this value should be 20.
*   **height**: height of each frame
*   **frames**: if applying a sprite animation, total count of sprite animation frames
*   **loop**: if true, repeat the sprite animation
*   **duration**:
*   **sleep**:
*   **order**: play order of each frame
*   **easing**: name of easing function

To define a sprite explicitly with sprite manager, **game.spriteManager.set(imageName, spriteName, option)** method is used.

    game.spriteManager.set("bomb", "bombAnimation", {
        x:0,
        y:0,
        width : 40,
        height : 40,
        frames : 6,
        loop : true,
        duration : 1000,
        order : [0,1,2,3,4,5],
        easing : "linear"
    });

To define a sprite in **resource.js**, add **spriteInfo** property to resource object. (for detailed information about resource.js, please refer to [Game Resources](#game_resources))

    var resource = {
        images : {
            "bomb" : "images/bomb.png"
        },
        spriteInfo : {
            "bomb" : {
                image : "bomb",
                x:0,
                y:0,
                width : 135,
                height : 135,
                frames : 6,
                loop : true,
                duration : 1000,
                order : [0,1,2,3,4,5],
                easing : "linear"
            }
        }
    };

#### step 2\. apply pre-defined sprite

    entity.setBaseSprite( "sprite_name" ); // set default sprite
    entity.applySprite( "sprite_name" ); // apply sprite

Entity class has two methods for applying sprite animation: **entity.setBaseSprite( spriteName )** and **entity.applySprite( spriteName )**. These two methods are slightly different. **applySprite** method applies given sprite on call, and once animation is done ( after [duration + sleep] ms ), the entity's sprite gets back to its default sprite animation which is set by **setBaseSprite** method.


## Game Resources

All resources and used in your game (images, sprite, music, etc.) can be configured in **Game Resource file**. Game Resource file looks like below.

    define("game/resource", function(){
        var resource = {
            imagePath : "images/",
            images : {
                "background": "background.png",
                "player": "player.png",
                "bullet": "bullet.png"
            },
            spriteInfo : {
                "player" : {
                    image : "player",
                    x:0,
                    y:0,
                    width : 135,
                    height : 135,
                    frames : 6,
                    loop : true,
                    duration : 1000,
                    order : [0,1,2,3,4,5],
                    easing : "linear"
                },
                "bullet" : {
                    image : "bullet",
                    x:0,
                    y:0,
                    width : 135,
                    height : 135,
                    frames : 5,
                    loop : true,
                    duration : 1000,
                    order : [0,1,2,3,4],
                    easing : "linear"
                }
            },
            musics : {
                "bg" : "sound/loop.m4a"
            },
            sounds : {
                "button"    : "sound/gem-0.mp3",
                "click"     : "sound/click.mp3",
                "explosion" : "sound/gem-4.mp3",
                "timer"     : "sound/timer.mp3",
                "endgame"   : "sound/endgame.mp3"
            }
        };

        return resource;
    });

#### Properties:

*   **imagePath**: Path to image sources. According to game quality in game configuration setting, resource loader automatically append [ "low/", "mid/", "high/" ] to this path.
*   **images**: Images to load. < name, filename > pair.
*   **spriteInfo**: Sprite settings can be also done here. For detailed description on each property, please refer to [Sprite](#sprite). Image positions and sizes depend on the resolution setting in basic configuration. If your base resolution is set to "high", and bullet image consists of five 135*135 sprite component images, then sprite setting for "bullet" is the same as shown above example.
*   **musics**:
*   **sounds**:


## Animation

Animation other than sprite animation is applied by **entity.animate(option)** method.

    entity.animate({
        duration : 1000,
        from : {
            x : 0,
            y : 0
        },
        to : {
            x : 200,
            y : 200
        },
        easing : {
            x : 'linear',
            y : 'linear'
        },
        callback : function () {
            console.log( "animation end" );
        }
    });

*   **duration**: Total animation play time in ms.
*   **from**: Initial entity status at animation start. Any properties in Entity can be used.
*   **to**: Final entity status at animation start. Any properties in Entity can be used.
*   **easing**: Easing function name. Different easing functions can be used on each property in a single animation.
*   **callback**: Callback function triggered on animation end time (on "animationend" event)



## Input

Planet Game Engine has **Input** module for you to handle events more conveniently. To add/remove event handler, call **game.input.on/game.input.off** as below.

    var onTouch = function(e) {
        console.log("touch event");
    };
    game.input.on("touchstart", onTouch);

    // do stuff..

    game.input.off("touchstart", onTouch);

The major advantage of using input module is that Planet game engine calculates coordinates for you. Event object passed to your callback function has 6 more coordinate information: ratioX, ratioY, canvasX, canvasY, designX, and designY.;

ratioX/Y gives you the ratio of current position to viewport size.

canvasX/Y gives current position on canvas.

designX/Y gives current position on canvas, based on size of base resolution. Suppose base resolution is set to 360x450 and real canvas size shown on the screen is 720x900, and you click on ( 100, 100 ) on the screen. Then designX/Y gives ( 50, 50 ). This is useful because if you need any calculation with event position, you don't need to worry about varying canvas size.

    var onTouch = function(e) {
        var x = e.designX,
            y = e.designY;

        // do stuff

    };

## Offscreen Canvas

## Sound
