/*
 * define fallback
 * in case when a module is deifned as the module type of require.js but it should be loaded without require.js,
 * this fallback loads all require.js modules in a window namespace as a global object.
 */
(function(){
    if ( !window.define ) {
        window.define = function( name, deps, func ){
            var re = new RegExp("(/[a-zA-Z0-9]+)$"),
                moduleName = re.exec(name)[0],
                moduleName = moduleName.substr(1),
                args = [];
            if( typeof deps === "object" ){
                if( typeof func === "function"){
                    deps.forEach(function(element, index, array){
                        var re = new RegExp("(/[a-zA-Z0-9]+)$"),
                            moduleName = re.exec(element)[0],
                            moduleName = moduleName.substr(1);
                        //window에 중복된 객체가 없을때 만 넣어야 한다
                        args.push( window[ moduleName ] );
                    });
                    if( window[ moduleName ] === undefined ){
                        window[ moduleName ] = func.apply(null, args);
                    }
                }
            } else if ( typeof deps === "function" ){
                if( window[ moduleName ] === undefined ){
                    window[ moduleName ] = deps();
                }
            } else {
                console.log("define format error");
            }
        };
    }
}());