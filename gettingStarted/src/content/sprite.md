---
title: Sprite
id: <%= title.toLowerCase().split(" ").join("_")  %>
order: 6
items: true
item_key: sprite
---

Apply a sprite image to an entity is divided into two step.

####step 1. define sprite

Sprite object has following properties.
<pre><code class="json">{
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
</code></pre>

+ **image**: name of image. to apply a sprite image, you should load an image before you define a sprite, either by loader, or resource.js
+ **x**: top-left corner position of sprite
+ **y**: top-left corner position of sprite
+ **width**: width of each frame. For example, a 100 x 20 sprite image consists of five 20 x 20 images for a frame, then this value should be 20.
+ **height**: height of each frame
+ **frames**: if applying a sprite animation, total count of sprite animation frames
+ **loop**: if true, repeat the sprite animation
+ **duration**:
+ **sleep**:
+ **order**: play order of each frame
+ **easing**: name of easing function


To define a sprite explicitly with sprite manager, **game.spriteManager.set(imageName, spriteName, option)** method is used.
<pre><code class="js">game.spriteManager.set("bomb", "bombAnimation", {
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
</code></pre>

To define a sprite in **resource.js**, add **spriteInfo** property to resource object. (for detailed information about resource.js, please refer to [Game Resources](#game_resources))
<pre><code class="js">var resource = {
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
</code></pre>


####step 2. apply pre-defined sprite
<pre><code class="js">entity.setBaseSprite( "sprite_name" ); // set default sprite
entity.applySprite( "sprite_name" ); // apply sprite
</code></pre>

Entity class has two methods for applying sprite animation: **entity.setBaseSprite( spriteName )** and **entity.applySprite( spriteName )**. These two methods are slightly different. **applySprite** method applies given sprite on call, and once animation is done ( after [duration + sleep] ms ), the entity's sprite gets back to its default sprite animation which is set by **setBaseSprite** method.
