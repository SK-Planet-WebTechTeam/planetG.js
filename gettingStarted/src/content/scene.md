---
title: Scene
id: <%= title.toLowerCase().split(" ").join("_")  %>
order: 2
items: true
item_key: scene
---

A game consists of at least one **game scene**, and renderer takes care of scene transition on user input or specific event. For instance, suppose your game has a "game start" button, and click on the button starts the game, and 1 minutes after game ends and displays players score. Then, the first scene of your game is the screen with "game start" button, the second is game playing screen, and the last scene is the screen with players score.
