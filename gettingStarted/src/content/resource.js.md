---
title: Game Resources
id: <%= title.toLowerCase().split(" ").join("_")  %>
order: 7
items: true
---

All resources and used in your game (images, sprite, music, etc.) can be configured in **Game Resource file**. Game Resource file looks like below.

<pre><code class="js">define("game/resource", function(){
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
</code></pre>

####Properties:

+ **imagePath**: Path to image sources. According to game quality in game configuration setting, resource loader automatically append [ "low/", "mid/", "high/" ] to this path.
+ **images**: Images to load. < name, filename > pair.
+ **spriteInfo**: Sprite settings can be also done here. For detailed description on each property, please refer to [Sprite](#sprite). Image positions and sizes depend on the resolution setting in basic configuration. If your base resolution is set to "high", and bullet image consists of five 135*135 sprite component images, then sprite setting for "bullet" is the same as shown above example.
+ **musics**:
+ **sounds**:


