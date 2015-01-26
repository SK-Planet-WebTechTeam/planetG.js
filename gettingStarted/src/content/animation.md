---
title: Animation
id: animation
order: 8
items: true
---

Animation other than sprite animation is applied by **entity.animate(option)** method.

<pre><code class="js">entity.animate({
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
</code></pre>

+ **duration**: Total animation play time in ms.
+ **from**: Initial entity status at animation start. Any properties in Entity can be used.
+ **to**: Final entity status at animation start. Any properties in Entity can be used.
+ **easing**: Easing function name. Different easing functions can be used on each property in a single animation.
+ **callback**: Callback function triggered on animation end time (on "animationend" event)
