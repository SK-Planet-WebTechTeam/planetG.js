define("ocb/resource", [], function(){
    var resource = {
        imagePath : "img/",
        images : {
            "bg" : "bg.png",
            "ball" : "ball.png",
            "paddle_m" : "paddle_m.png",
            "brick_b" : "brick_b.png",
            "brick_g" : "brick_g.png",
            "brick_o" : "brick_o.png",
            "brick_p" : "brick_p.png",
            "brick_v" : "brick_v.png",
            "brick_w" : "brick_w.png",
            "brick_y" : "brick_y.png",
            "count1" : "count_1.png",
            "count2" : "count_2.png",
            "count3" : "count_3.png",
            "item" : "item_plus.png",
            "gameover" : "msg_gameover.png"
        },
        spriteInfo:{
            "bg":{
                image:"bg",
                x:0,
                y:0,
                width:720,
                height:900,
                frames:1
            },
            "count1" : {
                image:"count1",
                x:0,
                y:0,
                width:216,
                height:258,
                frames:1
            },
            "count2" : {
                image:"count2",
                x:0,
                y:0,
                width:216,
                height:258,
                frames:1
            },
            "count3" : {
                image:"count3",
                x:0,
                y:0,
                width:216,
                height:258,
                frames:1
            },
            "block1" : {
                image:"brick_g",
                x:0,
                y:0,
                width:57,
                height:27,
                frames:1
            },
            "block2" : {
                image:"brick_b",
                x:0,
                y:0,
                width:57,
                height:27,
                frames:1
            },
            "block3" : {
                image:"brick_y",
                x:0,
                y:0,
                width:57,
                height:27,
                frames:1
            },
            "block4" : {
                image:"brick_p",
                x:0,
                y:0,
                width:57,
                height:27,
                frames:1
            },
            "block5" : {
                image:"brick_w",
                x:0,
                y:0,
                width:57,
                height:27,
                frames:1
            },
            "paddle" : {
                image:"paddle_m",
                x:0,
                y:0,
                width:152,
                height:28,
                frames:1
            },
            "ball" : {
                image:"ball",
                x:0,
                y:0,
                width:24,
                height:24,
                frames:1
            },
            "item" : {
                image:"item",
                x:0,
                y:0,
                width:36,
                height:35,
                frames:1
            },
            "gameover" : {
                image:"gameover",
                x:0,
                y:0,
                width:720,
                height:900,
                frames:1
            }
        }
    };
    return resource;
});