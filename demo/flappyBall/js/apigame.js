requirejs.config({
    baseUrl:'../../engine/module',
    paths:{
        pwge: './pwge',
        ocb: '../../demo/flappyBall/js'
    },
    waitSeconds: 15,
    urlArgs: "bust=4351215041"
});


require(["ocb/main",'ocb/resource'], function(game, resource) {

    // trigger game start
    // First parameter [1, 5, 10] is the timing for displaying lucky item...
    var gameStart = function() {
        started = true;
        game.trigger("play", [1, 5, 10] );
    };

    // Game starts after game resource (image) is loaded
    game.loader.loadResources(resource).then(
        // resource loading
        function(){
            loaded = true;
            game.trigger("ready");
            gameStart();
        },
        // resource loading fail
        function(){
            // exit("Failed for resource loading.<br> Try again some time later.");
        }
    );

    // Event handler for 'score event'
    $(".gameCanvas").on("score", function(e, data){
        if ( typeof data.point === "undefined" ) {
            return;
        }

        var point = data.point;

        // 숫자를 이미지로 대체
        for (var i=3 ; i>0 ; i--) {
            var elm = document.getElementById("currentScore" + i);
            elm.classList.remove("n" + ((point===0) ? 9 : (point-1)%10));
            elm.classList.add("n" + point%10);
            point = Math.floor(point/10);
        }
    });

    // Event handler for 'finish event'
    $(".gameCanvas").on("finish", function(e, data){
        if ( typeof data.point === "undefined" ) {
            return;
        }

        alert("finish... your score : " + data.point + ", lucky item : " + data.luckyPoint);
    });
});