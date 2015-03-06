requirejs.config({
    baseUrl:'../../engine/module',
    paths:{
        pwge: './pwge',
        ocb: '../../demo/arkanoid/js'
    },
    waitSeconds: 15,
    urlArgs: "bust=001"
});


require(["ocb/main",'ocb/resource'], function(game, resource) {

    // trigger game start
    var gameStart = function() {
        started = true;
        game.trigger("play");
    };

    // Game starts after game resource (image) is loaded
    game.loader.loadResources(resource).then(
        // resource loading
        function(){
            //alert("arkanoid v0.17");
            game.trigger("ready");
            gameStart();
        },
        // resource loading fail
        function(){
            alert("Failed for resource loading.\nTry again some time later.");
        }
    );

});