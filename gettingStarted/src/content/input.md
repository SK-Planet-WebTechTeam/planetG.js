---
title: Input
id: <%= title.toLowerCase().split(" ").join("_")  %>
order: 9
items: true
item_key: input
---

Planet Game Engine has **Input** module for you to handle events more conveniently. To add/remove event handler, call **game.input.on/game.input.off** as below.

<pre><code class="js">var onTouch = function(e) {
    console.log("touch event");
};
game.input.on("touchstart", onTouch);

// do stuff..

game.input.off("touchstart", onTouch);
</code></pre>

The major advantage of using input module is that Planet game engine calculates coordinates for you. Event object passed to your callback function has 6 more coordinate information: ratioX, ratioY, canvasX, canvasY, designX, and designY.;

ratioX/Y gives you the ratio of current position to viewport size.

canvasX/Y gives current position on canvas.

designX/Y gives current position on canvas, based on size of base resolution. Suppose base resolution is set to 360*450 and real canvas size shown on the screen is 720*900, and you click on ( 100, 100 ) on the screen. Then designX/Y gives ( 50, 50 ). This is useful because if you need any calculation with event position, you don't need to worry about varying canvas size.

<pre><code class="js">var onTouch = function(e) {
var x = e.designX,
    y = e.designY;

// do stuff

};
</code></pre>
