requirejs.config({
    baseUrl:'../../engine/module',
    paths:{
        pwge: './pwge',
        ocb: '../../demo/arkanoid_redesigned/js'
    },
    waitSeconds: 15,
    urlArgs: "bust=003"
});


require(["ocb/main",'ocb/resource'], function(game, resource) {

    // Game starts after game resource (image) is loaded
    game.loader.loadResources(resource).then(
        // resource loading
        function(){
            $(document).ready(function() {
                var disableScroll = function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    return false;
                };
                $(".gameCanvas").on("touchstart touchmove", disableScroll);
                $(document).on("touchstart touchmove", disableScroll);
            });

            game.trigger("play");
        },
        // resource loading fail
        function(){
            alert("Failed for resource loading.\nTry again some time later.");
        }
    );

    $(".gameCanvas").on("score", function(e, data){
        if (data) {
            $("#score").text(data.point);
        }
    });

    $(".gameCanvas").on("level", function(e, data){
        if (data) {
            $("#level").text(data.point);
        }
    });

});