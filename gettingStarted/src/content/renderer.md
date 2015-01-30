---
title: Renderer
id: <%= title.toLowerCase().split(" ").join("_")  %>
order: 1.2
items: true
item_key: renderer
---

**Renderer** manages the game's time process, and manages game scenes. Renderer's loop function is called on every frame by requestAnimationFrame, do any neccessary calculation for your game, and draw each frame on the screen. "step", "draw" event is triggered on every loop function call, so you can listen to these events to do calculations or anything you want to do.

<pre><code class="js">game.renderer.on("step", function(dt) {
    ...
});

game.renderer.on("draw", function(dt) {
    ...
});
</code></pre>

The argument passed in the callback function , **dt**, is delta time between this frame and the last frame.