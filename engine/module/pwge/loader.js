define("pwge/loader", ["pwge/runtime", "pwge/soundManager", "pwge/util"], function(runtime, soundManager, util){
    var resourceMap = {},
        /**
         * loader 모듈
         * @exports pwge/loader
         * @requires pwge/runtime
         */
        loader = {},
        loadImage = function(url) {
            return new Promise(function(resolve, reject) {
                var element = new Image(),
                    timeout = setTimeout(function(){
                        reject(Error("can't load " + url));
                    }, loader._owner.config.loaderTimeout);

                element.onload = function(){
                    resolve(element);
                };
                element.src = url;
            });
        },
        loadMusic = function(url) {
            return new Promise(function(resolve, reject) {
                if (!runtime.HTMLAudioElement) {
                    resolve(undefined);
                }
                var element = new Audio();
                    timeout = setTimeout(function(){
                        reject(Error("can't load " + url));
                    }, loader._owner.config.loaderTimeout);

                element.addEventListener("canplaythrough", function(){
                    resolve(element);
                });
                element.setAttribute("preload", "true");
                element.setAttribute("autobuffer", "true");
                element.src = url;
                element.pause();
            });
        },
        loadSound = function(url) {
            return new Promise(function(resolve, reject) {
                if (!runtime.AudioContext) {
                    resolve(undefined);
                }
                var request = new XMLHttpRequest(),
                    audioContext;

                request.open("GET", url, true);
                request.responseType = "arraybuffer";

                request.onload = function() {
                    audioContext = (window.SKPWebView) ? (new runtime.AudioContext()) : soundManager.audioContext;
                    audioContext.decodeAudioData(request.response, function(buffer) {
                        resolve(buffer);
                    }, function(error){
                        reject(Error('decode error'));
                    });
                };
                request.onerror = function() {
                    reject(Error('XHR error'));
                };

                request.send();
            });
        };

    /**
     * 이미지를 로드한다.
     * @param {Object} 로드할 이미지 정보
     * @returm {Promise}
     * @example
loader.loadImages({
    "bg1" : "./images/bg_01.png",
    "bg2" : "./images/bg_02.png"
}).then(function(images){
    console.log(images);
});
     */
    loader.loadImages = function(obj) {
        var result = {};
        return Promise.all(Object.keys(obj).map(function(name){
            var url = obj[name];
            return loadImage(obj[name]).then(function(image){
                result[name] = resourceMap[encodeURIComponent(url)] = image;
                return result;
            });
        })).then(function(){
            return arguments[0][0];
        });
    };

    /**
     * 음악를 로드한다.
     * 로딩된 음악은 <audio> 태그로 재생되며, 하나의 음악만 재생이 가능하다.
     * @param {Object} 로드할 음악 정보
     * @returm {Promise}
     * @example
loader.loadMusics({
    "bg1" : "./musics/bg_01.mp3",
    "bg2" : "./musics/bg_02.ogg"
}).then(function(musics){
    console.log(musics);
});
     */
    loader.loadMusics = function(obj) {
        var result = {};
        return Promise.all(Object.keys(obj).map(function(name){
            var url = obj[name];
            return loadMusic(url).then(function(audio){
                if (audio) {
                    result[name] = resourceMap[encodeURIComponent(url)] = audio;
                }
                return result;
            });
        })).then(function(){
            return arguments[0][0];
        });
    };

    /**
     * 효과음을 로드한다.
     * 로딩된 효과음은 AudioContext를 이용해 재생되며, 동시에 여러개의 효과음을 재생할 수 있다.
     * @param {Object} 로드할 효과음 정보
     * @returm {Promise}
     * @example
loader.loadSounds({
    "fx1" : "./fxs/fx_01.mp3",
    "fx2" : "./fxs/fx_02.mp3"
}).then(function(sounds){
    console.log(sounds);
});
     */
    loader.loadSounds = function(obj) {
        var result = {};
        return Promise.all(Object.keys(obj).map(function(name){
            var url = obj[name];
            return loadSound(url).then(function(buffer){
                result[name] = resourceMap[encodeURIComponent(url)] = buffer;
                return result;
            });
        })).then(function(){
            return arguments[0][0];
        });
    };

    /**
     * 여러 종류의 리소스를 한꺼번에 로드한다.
     * 로딩된 리소스는 지정된 이름으로 spriteManager/soundManager를 통해 자동 설정된다.
     * @param {Object} resourceMap 로드할 리소스 정보
     * @returm {Promise}
     * @example
loader.loadResources({
    musics : {
        "bg1" : "./musics/bg_01.mp3",
        "bg2" : "./musics/bg_02.ogg"
    },
    sounds : {
        "fx1" : "./fxs/fx_01.mp3",
        "fx2" : "./fxs/fx_02.mp3"
    }
}).then(function(){
    console.log(soundManager.get("fx1"));
});
     *
     * @example
@example
loader.loadResources({
    images : {
        "bg1" : "./images/bg_01.png",
        "sp1" : "./images/sp_01.png"
    },
    spriteInfo : {
        "sprite1" : { //스프라이트 이름 : 스프라이트 정보
            image : "sp1", //로딩된 이미지 이름
            x : 0,
            y : 0
            width : 45,
            height : 45,
            frames : 6,
            loop : true,
            duration : 1000,
            order : [0,1,2,3,4,5],
            easing : "linear"
        }
    }
    musics : {
        "bg1" : "./musics/bg_01.mp3",
        "bg2" : "./musics/bg_02.ogg"
    },
    sounds : {
        "fx1" : "./fxs/fx_01.mp3",
        "fx2" : "./fxs/fx_02.mp3"
    }
}).then(function(){
    console.log(spriteManager.get("sprite1"));
});
     */
    loader.loadResources = function(resourceMap) {
        var promises = [],
            key,
            resourceMapImages = resourceMap.images,
            qualityPath = "low/";

        if (resourceMap.imagePath) {
            if (loader._owner.viewport.imageRatio === 2/3) {
                qualityPath = "mid/";
            }
            if (loader._owner.viewport.imageRatio === 1) {
                qualityPath = "high/";
            }

            for (key in resourceMapImages) {
                resourceMapImages[key] = resourceMap.imagePath + qualityPath + resourceMapImages[key];
            }
        }

        if (typeof resourceMap.images !== "undefined") {
            promises.push(loader.loadImages(resourceMapImages).then(function(images){
                var sprites;
                if (resourceMap.spriteInfo) {
                    sprites = Object.keys(resourceMap.spriteInfo);
                    sprites.forEach(function(key){
                        loader._owner.spriteManager.set(key, images[resourceMap.spriteInfo[key].image], resourceMap.spriteInfo[key]);
                    });
                }

                Object.keys(images).forEach(function(key){
                    if (!sprites.some(function(sprite){
                        return resourceMap.spriteInfo[sprite].image === key;
                    })) {
                        loader._owner.spriteManager.set(key, images[key]);
                    }
                });
            }));
        }

        if (typeof resourceMap.musics !== "undefined") {
            if ((/iphone|ipad|ipod/i).test(window.navigator.userAgent)) {
                resourceMap.sounds = util.extend((resourceMap.sounds || {}), resourceMap.musics);
                if (resourceMap.musicInfo) {
                    resourceMap.soundInfo = util.extend((resourceMap.soundInfo || {}), resourceMap.musicInfo);
                }
            } else {
                promises.push(loader.loadMusics(resourceMap.musics).then(function(musics){
                    Object.keys(musics).forEach(function(key){
                        if (resourceMap.musicInfo && resourceMap.musicInfo[key]) {
                            loader._owner.soundManager.setMusic(key, musics[key], resourceMap.musicInfo[key]);
                        } else {
                            loader._owner.soundManager.setMusic(key, musics[key]);
                        }
                    });
                }));
            }
        }

        if (typeof resourceMap.sounds !== "undefined") {
            promises.push(loader.loadSounds(resourceMap.sounds).then(function(sounds){
                Object.keys(sounds).forEach(function(key){
                    if (resourceMap.soundInfo && resourceMap.soundInfo[key]) {
                        // alert("info")
                        loader._owner.soundManager.setSound(key, sounds[key], resourceMap.soundInfo[key]);
                    } else {
                        // alert("no info")
                        loader._owner.soundManager.setSound(key, sounds[key]);
                    }
                });
            }));
        }

        return Promise.all(promises);
    };

    /**
     * 로드된 리소스를 불러온다.
     * @param  {String} url 불러올 리소스의 url
     * @return {HTMLImageElement | HTMLAudioElement | ArrayBuffer} 이미지 엘리먼트, 오디오 엘리먼트, 또는 오디오 ArrayBuffer
     */
    loader.get = function(url) {
        return resourceMap[encodeURIComponent(url)] || null;
    };

    if ((/iphone|ipad|ipod/i).test(window.navigator.userAgent)) {
        loader.loadMusics = loader.loadSounds;
        loader.loadMusic = loader.loadSound;
    }

    return loader;
});