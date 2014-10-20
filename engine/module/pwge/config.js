define("pwge/config", function() {
    /**
     * config 모듈
     * 디폴트 설정값들을 프로퍼티로 가진다.
     * @exports pwge/config
     */
    var config = {};

    /**
     * canvas 엘리먼트의 컨테이너 엘리먼트.
     * 이 값으로 viewport의 크기와 정렬이 결정된다.
     * @type {HTMLElement}
     * @default window
     */
    config.container = window;

    /**
     * 뷰포트 설정
     * "default", "scale_to_fit", "scale_to_fit_width", "scale_to_fit_height", "stretch_to_fit"
     * @type {String}
     * @default "default"
     */
    config.viewport = "default";

    /**
     * 뷰포트의 가로, 세로 정렬
     * @type {Object}
     * @example
config.viewportAlign = {
    horizontal : "center", //"left", "right"
    vertical : "middle" //"top", "bottom"
};
     */
    config.viewportAlign = {
        horizontal : "center", //"left", "right"
        vertical : "middle" //"top", "bottom"
    };

    /**
     * 이미지 품질 설정.
     * "auto"시 고해상도(레티나) 디스플레이에서 devicePixelRatio와 canvas 컨텍스트의 backingStorePixelRatio를 계산하여 자동으로 고해상도 이미지로 렌더링한다.
     * "low", "mid", "high"로 지정가능하며, 이 설정에 따라 canvas 엘리먼트의 크기가 변경되므로 성능에 큰 영향을 준다.
     * 고해상도 디스플레이가 아니면, 어떤 값을 지정하더라도 canvas 엘리먼트의 크기는 resolution 설정값을 따르게 된다.
     * @type {String}
     * @default "low"
     */
    config.quality = "low";


    /**
     * 최대 이미지 품질 설정
     * config.quality가 "auto"일 경우에만 적용된다.
     * @type {String}
     * @default "low"
     */
    config.maxQuality = "low";

    /**
     * planet.webview 지원여부.
     * @type {Boolean}
     * @default true
     */
    config.planetWebview = true;

    /**
     * loader의 타임아웃 시간(ms)
     * @type {Number}
     * @default 30000
     */
    config.loaderTimeout = 30000;

    /*t
     * 기본 board 객체 풀 크기
     * @type {Number}
     * @default 16
     */
    config.boardPoolSize = 16;

    /**
     * 기본 entity 객체 풀 크기
     * @type {Number}
     * @default 128
     */
    config.entityPoolSize = 128;

    /**
     * 렌더링시 매 프레임마다 canvas.clear() 호출여부
     * @type {Boolean}
     * @default true
     */
    config.clearCanvasOnEveryFrame = true;

    /**
     * 디버그 모드 적용 여부. fps 미터를 확인할 수 있다.
     * @type {Boolean}
     * @default false
     */
    config.debug = false;

    return config;
});