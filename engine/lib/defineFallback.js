/*
 * define fallback
 * require.js 모듈로 선언되었으나 require를 사용하지 않는 앱에서 해당 모듈을 사용하고자 할때,
 * 모든 require module을 global object로 등록 해서 사용 가능하게 해 줌
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