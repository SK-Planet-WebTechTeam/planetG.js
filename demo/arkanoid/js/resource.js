define("ocb/resource", [], function(){
    var resource = {
        imagePath : "img/",
        images : {
            "bg" : "bg.png",
            "coin" : "coin.png",
            "tiles" : "tiles.png"
        },
        spriteInfo:{
            "bg":{
                image:"bg",
                x:0,
                y:0,
                width:320,
                height:416,
                frames:1
            },
            "coin":{
                image:"coin",
                x:0,
                y:0,
                width:45,
                height:45,
                frames:1
            },
            "countdown" : {
                image:"tiles",
                x:0,
                y:96,
                width:32,
                height:48,
                frames:3,
                duration:3000,
                order:[0,1,2],
                sleep:0,
                loop:false,
                easing:"linear"
            },
            "block1" : {
                image:"tiles",
                x:0,
                y:0,
                width:32,
                height:16,
                frames:1
            },
            "block1_killed" : {

            },
            "paddle" : {
                image:"tiles",
                x:0,
                y:64,
                width:48,
                height:16,
                frames:1
            },
            "paddle_sm": {

            },
            "ball" : {
                image:"tiles",
                x:48,
                y:64,
                width:16,
                height:16,
                frames:1
            }
        }
    };
    return resource;
});