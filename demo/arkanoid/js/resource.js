define("ocb/resource", [], function(){
    var resource = {
        imagePath : "img/",
        images : {
            "bg" : "bg.png",
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
                loop:true,
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
            "block2" : {
                image:"tiles",
                x:0,
                y:16,
                width:32,
                height:16,
                frames:1
            },
            "block3" : {
                image:"tiles",
                x:0,
                y:32,
                width:32,
                height:16,
                frames:1
            },
            "block4" : {
                image:"tiles",
                x:0,
                y:48,
                width:32,
                height:16,
                frames:1
            },
            "block5" : {
                image:"tiles",
                x:144,
                y:128,
                width:32,
                height:16,
                frames:1
            },
            "paddle" : {
                image:"tiles",
                x:0,
                y:64,
                width:48,
                height:16,
                frames:1
            },
            "ball" : {
                image:"tiles",
                x:48,
                y:64,
                width:16,
                height:16,
                frames:1
            },
            "item" : {
                image:"tiles",
                x:96,
                y:96,
                width:16,
                height:16,
                frames:1
            }
        }
    };
    return resource;
});