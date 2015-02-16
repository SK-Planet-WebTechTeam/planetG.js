---
title: Board
id: <%= title.toLowerCase().split(" ").join("_")  %>
order: 3
items: true
item_key: board
---
Board is where all the entities in the game is included and presented. A board must be included in a Scene, or it will never shown on the canvas. A scene can have multiple boards.

<pre><code class="js">var playBoard = game.boardManager.makeBoard("boardname", { x : 50, y : 100 });
</code></pre>

You can set offset of the board from the canvas's ( 0, 0 ) by the second argument. Setting offset will affect position of all entities in board.
