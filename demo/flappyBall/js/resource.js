define("ocb/resource", [], function(){
    var resource = {
        imagePath : "img/",
        images : {
            "background" : "flappyball_bg.png",
            "background_white" : "flappyball_bg_white.png",
            // "background_end" : "flappyball_bg_end.png",
            "ballImg" : "flappyball_ball.png",
            "objectImg" : "flappyball_elements.png",
            "coinPointImg" : "coin_and_point.png"
        },
        spriteInfo : {
            // Ball sprite
            "ball_flying" : {
                image : "ballImg",
                x : 15,
                y : 12,
                width : 126,
                height : 126,
                frames : 4,
                loop : true,
                duration : 600,
                sleep : 0,
                order : [0,1,2,3],
                easing : "linear"
            },
            // Ball sprite (when game is over )
            "ball_falling" : {
                image : "ballImg",
                x : 15,
                y : 171,
                width : 126,
                height : 126,
                frames : 5,
                loop : false,
                duration : 1500,
                sleep : 0,
                order : [0,1,2,3,4],
                easing : "linear"
            },
            // upper globe
            "up_side_globe" : {
                image : "objectImg",
                x : 195,
                y : 39+186,
                width : 159,
                height : 186,
                frames : 1
            },
            // lower globe
            "down_side_globe" : {
                image : "objectImg",
                x : 24,
                y : 39,
                width : 159,
                height : 186,
                frames : 1
            },
            // globe bar
            "globe_bar" : {
                image : "objectImg",
                x : 246,
                y : 39,
                width : 27,
                height : 186,
                frames : 1
            },
            "restart" : {
                image : "objectImg",
                x : 375,
                y : 243,
                width : 336,
                height : 168,
                frames : 1
            },

            // clouds
            "cloud_syrup" : {
                image : "objectImg",
                x : 24,
                y : 432,
                width : 258,
                height : 165,
                frames : 1
            },
            "cloud_ocb" : {
                image : "objectImg",
                x : 24,
                y : 618,
                width : 258,
                height : 165,
                frames : 1
            },
            "cloud_tmap" : {
                image : "objectImg",
                x : 357,
                y : 666,
                width : 168,
                height : 117,
                frames : 1
            },

            // coin sprite
            "coin" : {
                image : "coinPointImg",
                x:6,
                y:9,
                width:69,
                height:60,
                frames : 5,
                loop : true,
                duration : 500,
                sleep : 0,
                order : [0,1,2,3,4],
                easing : "linear"
            },
            // coin sprite after acquisition
            "point" : {
                image : "coinPointImg",
                x:6,
                y:81,
                width:69,
                height:60,
                frames : 4,
                loop : true,
                duration : 900,
                sleep : 0,
                order : [0,1,2,1],
                easing : "linear"
            },
        }
    };
    return resource;
});