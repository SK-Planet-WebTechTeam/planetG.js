define("pwge/loader", ["pwge/runtime", "pwge/soundManager", "pwge/util"], function(runtime, soundManager, util){
    var resourceMap = {},
        /**
         * loader module
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
     * load images.
     * @param {Object} image description object  to be loaded
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
     * load musics via <audio>.
     * @param {Object} music description object to be loaded
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
     * load sound effect via WebAudio.
     * loaded sound is played by AudioContext, and sound mixing is also supported as per WebAudio spec.
     * loaded sound effect is played with AudioContext. multiple sound effect can be played simultaneously.
     * @param {Object} sound description object to be loaded.
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
     * load a multiple types of resources together.
     * @param {Object} resourceMap resource description object to be loaded.
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
        loader.loadResources({
            images : {
                "bg1" : "./images/bg_01.png",
                "sp1" : "./images/sp_01.png"
            },
            spriteInfo : {
                "sprite1" : { //sprite name
                    image : "sp1", //the name of the loaded image
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
            if (loader._owner.viewport.pixelRatio >= 3) {
                qualityPath = "high/";
            } else if (loader._owner.viewport.pixelRatio >= 2) {
                qualityPath = "mid/";
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
                        loader._owner.soundManager.setSound(key, sounds[key], resourceMap.soundInfo[key]);
                    } else {
                        loader._owner.soundManager.setSound(key, sounds[key]);
                    }
                });
            }));
        }

        return Promise.all(promises);
    };

    /**
     * return the loaded resource.
     * @param  {String} url the URL of a resource to access
     * @return {HTMLImageElement | HTMLAudioElement | ArrayBuffer} image element, audio element, or audio array buffer.
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