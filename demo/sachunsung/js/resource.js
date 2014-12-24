define("game/resource", [], function(){
    var resource = {
        imagePath : "img/",
        images : {
            "stageBg" : "sachunsungStageBg.png",
            "stageUI" : "sachunsungStageUI.png",
            "gameBg" : "sachunsungGameBg.png",
            "gameImg" :"sachunsungGameImages.png",
            "playBtn" : "btn-play.png",
            "playBtnDown" : "btn-play-down.png"
        },
        spriteInfo : {
            // character unit
            "purple" : {
                image : "gameImg",
                x : 0*105,
                y : 0,
                z : 1,
                width : 105,
                height : 119,
                frames : 1
            },
            "emerald" : {
                image : "gameImg",
                x : 1*105,
                y : 0,
                width : 105,
                height : 119,
                frames : 1
            },
            "blue" : {
                image : "gameImg",
                x : 2*105,
                y : 0,
                width : 105,
                height : 119,
                frames : 1
            },
            "green" : {
                image : "gameImg",
                x : 3*105,
                y : 0,
                width : 105,
                height : 119,
                frames : 1
            },
            "pink" : {
                image : "gameImg",
                x : 4*105,
                y : 0,
                width : 105,
                height : 119,
                frames : 1
            },
            "brown" : {
                image : "gameImg",
                x : 5*105,
                y : 0,
                width : 105,
                height : 119,
                frames : 1
            },
            "orange" : {
                image : "gameImg",
                x : 6*105,
                y : 0,
                width : 105,
                height : 119,
                frames : 1
            },
            "darkgreen" : {
                image : "gameImg",
                x : 7*105,
                y : 0,
                width : 105,
                height : 119,
                frames : 1
            },
            // block unit
            "block" : {
                image : "gameImg",
                x : 3*105,
                y : 119,
                width : 105,
                height : 119,
                frames : 1
            },
            // hint (twinkling effect)
            "hint" : {
                image : "gameImg",
                x : 0,
                y : 2*119,
                width : 105,
                height : 119,
                frames : 4,
                loop : true,
                duration : 1000,
                sleep : 0,
                order : [0,1,2,3],
                easing : "linear"
            },
            // matching path sprite
            "lefttop" : {
                image : "gameImg",
                x : 4*105,
                y : 2*119,
                width : 105,
                height : 112,
                frames : 1
            },
            "righttop" : {
                image : "gameImg",
                x : 5*105,
                y : 2*119,
                width : 105,
                height : 112,
                frames : 1
            },
            "rightbottom" : {
                image : "gameImg",
                x : 6*105,
                y : 2*119,
                width : 105,
                height : 112,
                frames : 1
            },
            "leftbottom" : {
                image : "gameImg",
                x : 7*105,
                y : 2*119,
                width : 105,
                height : 112,
                frames : 1
            },
            "horizontal" : {
                image : "gameImg",
                x : 8*105,
                y : 2*119,
                width : 105,
                height : 112,
                frames:1
            },
            "vertical" : {
                image : "gameImg",
                x : 9*105,
                y : 2*119,
                width : 105,
                height : 112,
                frames:1
            },
            // combo effect
            "zeroCombo" : {
                image : "gameImg",
                x:0*63,
                y:357,
                width:63,
                height:66,
                frames:1
            },
            "oneCombo" : {
                image : "gameImg",
                x:1*63,
                y:357,
                width:63,
                height:66,
                frames:1
            },
            "twoCombo" : {
                image : "gameImg",
                x:2*63,
                y:357,
                width:63,
                height:66,
                frames:1
            },
            "threeCombo" : {
                image : "gameImg",
                x:3*63,
                y:357,
                width:63,
                height:66,
                frames:1
            },
            "fourCombo" : {
                image : "gameImg",
                x:4*63,
                y:357,
                width:63,
                height:66,
                frames:1
            },
            "fiveCombo" : {
                image : "gameImg",
                x:5*63,
                y:357,
                width:63,
                height:66,
                frames:1
            },
            "sixCombo" : {
                image : "gameImg",
                x:6*63,
                y:357,
                width:63,
                height:66,
                frames:1
            },
            "sevenCombo" : {
                image : "gameImg",
                x:7*63,
                y:357,
                width:63,
                height:66,
                frames:1
            },
            "eightCombo" : {
                image : "gameImg",
                x:8*63,
                y:357,
                width:63,
                height:66,
                frames:1
            },
            "nineCombo" : {
                image : "gameImg",
                x:9*63,
                y:357,
                width:63,
                height:66,
                frames:1
            },
            "combo" : {
                image : "gameImg",
                x:630,
                y:357,
                width:144,
                height:66,
                frames:1
            },
            // time
            "zeroTime" : {
                image : "gameImg",
                x:0*17,
                y:423,
                width:17,
                height:24,
                frames:1
            },
            "oneTime" : {
                image : "gameImg",
                x:1*17,
                y:423,
                width:17,
                height:24,
                frames:1
            },
            "twoTime" : {
                image : "gameImg",
                x:2*17,
                y:423,
                width:17,
                height:24,
                frames:1
            },
            "threeTime" : {
                image : "gameImg",
                x:3*17,
                y:423,
                width:17,
                height:24,
                frames:1
            },
            "fourTime" : {
                image : "gameImg",
                x:4*17,
                y:423,
                width:17,
                height:24,
                frames:1
            },
            "fiveTime" : {
                image : "gameImg",
                x:5*17,
                y:423,
                width:17,
                height:24,
                frames:1
            },
            "sixTime" : {
                image : "gameImg",
                x:6*17,
                y:423,
                width:17,
                height:24,
                frames:1
            },
            "sevenTime" : {
                image : "gameImg",
                x:7*17,
                y:423,
                width:17,
                height:24,
                frames:1
            },
            "eightTime" : {
                image : "gameImg",
                x:8*17,
                y:423,
                width:17,
                height:24,
                frames:1
            },
            "nineTime" : {
                image : "gameImg",
                x:9*17,
                y:423,
                width:17,
                height:24,
                frames:1
            },
            // score
            "zero" : {
                image : "gameImg",
                x:0*42,
                y:3*119+66+24,
                width:42,
                height:62,
                frames:1
            },
            "one" : {
                image : "gameImg",
                x:1*42,
                y:3*119+66+24,
                width:42,
                height:62,
                frames:1
            },
            "two" : {
                image : "gameImg",
                x:2*42,
                y:3*119+66+24,
                width:42,
                height:62,
                frames:1
            },
            "three" : {
                image : "gameImg",
                x:3*42,
                y:3*119+66+24,
                width:42,
                height:62,
                frames:1
            },
            "four" : {
                image : "gameImg",
                x:4*42,
                y:3*119+66+24,
                width:42,
                height:62,
                frames:1
            },
            "five" : {
                image : "gameImg",
                x:5*42,
                y:3*119+66+24,
                width:42,
                height:62,
                frames:1
            },
            "six" : {
                image : "gameImg",
                x:6*42,
                y:3*119+66+24,
                width:42,
                height:62,
                frames:1
            },
            "seven" : {
                image : "gameImg",
                x:7*42,
                y:3*119+66+24,
                width:42,
                height:62,
                frames:1
            },
            "eight" : {
                image : "gameImg",
                x:8*42,
                y:3*119+66+24,
                width:42,
                height:62,
                frames:1
            },
            "nine" : {
                image : "gameImg",
                x:9*42,
                y:3*119+66+24,
                width:42,
                height:62,
                frames:1
            },
            "comma" : {
                image : "gameImg",
                x:10*42,
                y:3*119+66+24,
                width:21,
                height:62,
                frames:1
            },
            // Ready
            "Ready" : {
                image : "gameImg",
                x : 525,
                y : 447,
                width : 305,
                height : 121,
                frames : 1
            },
            // Go
            "Go" :  {
                image : "gameImg",
                x : 0,
                y : 531,
                width : 208,
                height : 202,
                frames : 1
            },
            // Game Over
            "gameOver" : {
                image : "gameImg",
                x : 315,
                y : 582,
                width : 559,
                height : 116,
                frames : 1
            },
            // selected character visual effect
            "selected" : {
                image : "gameImg",
                x : 945,
                y : 0,
                width : 116,
                height : 131,
                frames : 1
            },
            // timer icon
            "clock" : {
                image : "gameImg",
                x : 1050 - 17*2 - 48,
                y : 711,
                width : 48,
                height : 40,
                frames : 1
            },
            // time line
            "timer" : {
                image : "gameImg",
                x : 0,
                y : 763,
                z : 1,
                width : 1046,
                height : 28,
                frames : 1
            }
        }/*,
        musics : {
            // "gameBg" : "sound/loop.m4a"
        },
        sounds : {
            // "button"    : "sound/gem-0.mp3",
            // "click"     : "sound/click.mp3",
            // "explosion" : "sound/gem-4.mp3",
            // "timer"     : "sound/timer.mp3",
            // "endgame"   : "sound/endgame.mp3"
        }*/
    };
    return resource;
});

