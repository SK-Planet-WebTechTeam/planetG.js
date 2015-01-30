---
title: Game
id: <%= title.toLowerCase().split(" ").join("_")  %>
order: 1.1
items: true
item_key: game
---
Game object has all configuration of how to draw your game on canvas, and holds all other objects in your game such as scenes, boards, entities, etc, which will be explained on later parts.
<pre><code class="js">require(['pwge/game', 'game/resource', ...], function(Game, resource, ...) {
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
</code></pre>

- **container**:
- **canvas**: Canvas element to draw your game on.
- **resolution**: Base resolution information. Entity's size and location are determined based on this information.
- **viewport**: viewport property should be set among following five options.
    - **default**:
    - **scale_to_fit**: Scale the canvas to fit the viewport (preserves ratio).
    - **stretch_to_fit**: Stretch the canvas to fit the viewport (**NOT** preserve ratio).
    - **scale_to_fit_width**: Scale the canvas to fit width of the viewport. Height of the canvas may become longer than viewport height.
    - **scale_to_fit_height**: Scale the canvas to fit height of the viewport. Width of the canvas may become longer than viewport width.
- **viewportAlign**: If viewport is set to "scale_to_fit_width".
- **resource**: resource module (explained later in [Game Resources](#game_resources)).
- **clearCanvasOnEveryFrame**: If true, clear canvas on every frame, otherwise, clear canvas only when there is any change.
- **quality**: "auto", "high", "mid", "low". If set to "auto", quality is determined by the devices' pixel ratio and viewport size.
- **maxQuality**(Optional): If quality is set to "auto", restrict maximum quality to be applied: "high", "mid", "low".
- **debug**:
