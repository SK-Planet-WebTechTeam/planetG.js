define("pwge/soundManager", ["pwge/runtime", "pwge/util"], function(runtime, util) {
    /**
     * soundManager 모듈
     * @exports pwge/soundManager
     * @requires pwge/runtime
     */
    var soundManager = {},
        musicMap = {},
        musicInfo = {},
        soundMap = {},
        soundInfo = {},
        soundSource = {},
        audioElement = soundManager.audioElement = (runtime.HTMLAudioElement) ? document.createElement("audio") : undefined,
        audioContext = soundManager.audioContext = (runtime.AudioContext) ? new runtime.AudioContext() : undefined;

    /**
     * 이름을 지정하여, 로딩된 <audio> 태그로 음악을 설정한다.
     * @param {String} name   음악의 이름
     * @param {HTMLAudioElement} source <audio> 태그
     * @param {Object} options 음악 재생 옵션
     * @return {soundManager}
     */
    soundManager.setMusic = function(name, source, options) {
        musicMap[name] = source;
        musicInfo[name] = util.extend({
            loop : false,
            volume : 1
        }, (options || {}));
        return this;
    };

    /**
     * 음악을 이름으로 불러온다.
     * @param {String} name   음악의 이름
     * @return {HTMLAudioElement}
     */
    soundManager.getMusic = function(name) {
        return musicMap[name];
    };

    /**
     * 음악을 재생한다.
     * @param {String} name   음악의 이름
     * @param {Object} options  재생 옵션
     * @return {soundManager}
     */
    soundManager.playMusic = function(name, options) {
        var source = this.getMusic(name);
        if (audioElement && source) {
            options = util.extend(musicInfo[name], (options || {}));

            this.stopMusic();
            audioElement.volume = options.volume;
            audioElement.loop = options.loop;
            audioElement.src = source.src;
            audioElement.play(0);
        }

        return this;
    };

    /**
     * 음악재생을 중단한다.
     * @return {soundManager}
     */
    soundManager.stopMusic = function() {
        if (audioElement) {
            audioElement.pause();
        }

        return this;
    };

    /**
     * 이름을 지정하여, 로딩된 ArrayBuffer로 효과음을 설정한다.
     * @param {String} name   효과음의 이름
     * @param {ArrayBuffer} source ArrayBuffer
     * @param {Object} options 효과음 재생 옵션
     * @return {soundManager}
     */
    soundManager.setSound = function(name, source, options) {
        soundMap[name] = source;
        soundInfo[name] = util.extend({
            loop : false,
            volume : 1
        }, (options || {}));

        return this;
    };

    /**
     * 효과음을 이름으로 불러온다.
     * @param {String} name   효과음의 이름
     * @return {ArrayBuffer}
     */
    soundManager.getSound = function(name) {
        return soundMap[name];
    };

    /**
     * 효과음을 재생한다.
     * @param {String} name   효과음의 이름
     * @param {Object} options  재생 옵션
     * @return {soundManager}
     */
    soundManager.playSound = function(name, options) {
        var buffer = this.getSound(name);
        if (audioContext && buffer) {
            options = util.extend((soundInfo[name] || {}), (options || {}));
            this.stopSound(name);

            var source = soundSource[name] = audioContext.createBufferSource();
            source.buffer = buffer;
            source.loop = options.loop;

            var gainNode = audioContext.createGain();
            source.connect(gainNode);
            gainNode.connect(audioContext.destination);
            gainNode.gain.value = options.volume;

            source.start(0);
        }

        return this;
    };

    soundManager.stopSound = function(name) {
        if (soundSource[name]) {
            soundSource[name].stop(0);
            soundSource[name] = null;
        }

        return this;
    };

    soundManager.unlock = function() {
        if ((/iphone|ipad|ipod/i).test(window.navigator.userAgent)) {
            var source = audioContext.createOscillator();
            source.type = 0; // sine wave
            var curveLength = 100;
            var curve1 = new Float32Array(curveLength);
            var curve2 = new Float32Array(curveLength);
            for (var i = 0; i < curveLength; i++) {
                curve1[i] = Math.sin(Math.PI * i / curveLength);
                curve2[i] = Math.cos(Math.PI * i / curveLength);
            }

            var waveTable = audioContext.createWaveTable(curve1, curve2);
            source.setWaveTable(waveTable);
            var gainNode = audioContext.createGain();
            source.connect(gainNode);
            gainNode.connect(audioContext.destination);
            gainNode.gain.value = 0;
            source.start(0);
        }

        return this;
    };

    if ((/iphone|ipad|ipod/i).test(window.navigator.userAgent)) { //on iOS, only using AudioContext
        soundManager.playMusic = soundManager.playSound;
        soundManager.stopMusic = soundManager.stopSound;
    }

    return soundManager;
});