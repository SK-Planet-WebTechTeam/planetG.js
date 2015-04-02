define("game/pianotiles",['pwge/spriteManager','pwge/boardManager','pwge/input','pwge/canvas','pwge/renderer','pwge/domRenderer','util/easing',"util/PubSub",'pwge/util'], function(spriteManager,boardManager,input,canvas,renderer,domRenderer,easing,PubSub,util){

      // PC 및 브라우저 호환
    var mobile = 'ontouchstart' in window,
        START_EV = mobile ? 'touchstart' : 'mousedown',
        MOVE_EV = mobile ? 'touchmove' : 'mousemove',
        END_EV = mobile ? 'touchend' : 'mouseup';


    var Pianotiles = function() {

        this.start = false; // start == false ? gameover : start
        this.score = 0;
    };

    Pianotiles.prototype = Object.create(PubSub.prototype);

    Pianotiles.prototype.init = function(game, playBoard, gridCanvas) {

        this.game = game;
        this.size = 4;
        this.board = playBoard;
        this.canvas = gridCanvas;
        this.context = gridCanvas.getContext("2d");
        this.timerEntity = this.game.entityPool.allocate({
            x: (this.game.config.resolution.width - 40) / 2 - 20 ,
            y: 50,
            z:1001,
            width:60,
            height:110
        }).addTo(this.board);
        this.backgroundEntity = this.game.entityPool.allocate({
            x:0,
            y:0,
            width: this.game.config.resolution.width,
            height: this.game.config.resolution.height
        }).addTo(this.board);

        this.backgroundCanvas = this.game.canvas.offscreen();
        this.backgroundCtx = this.backgroundCanvas.getContext("2d");


        this.resolution = this.game.config.resolution.width / this.context.canvas.width;
        this.map = [];
        this.entities = null;
        this.startTime = 0;
        this.rowCounter = 0;
        this.maxRow = 50;
        this.isDom = this.game.config.domRendering;
        this.shift = false;
        this.reset = false;
        this.touched = false;
        this.timerStart = false;
        this.bottomLine = 0;
        this.graytiles = [];
        this.blacktiles = [];
        this.redtiles = [];

        this.starttileTime = null;

        this.makeTileMap();
        this.bottomLine = this.map[0].row[0].y + this.spacing_y;
        this.topLine = this.map[this.map.length-1].row[0].y;

        this.backgroundEntity.disable(this.backgroundEntity);
        this.timerEntity.disable(this.timerEntity);
        this.makeEntity();
        this.drawMap();
        this.setStartTimer();

        this._progress = this.progress.bind(this);
        this.game.renderer.on("step", this._progress);

        this._onTouchstart = this.onTouchstart.bind(this);

        this.setTimeText();

        this.game.input.on(START_EV, this._onTouchstart);
    };

    Pianotiles.prototype.makeTileMap = function() {

        var mapSize = 5,ctx = this.context,
            yPosition,rowMap;

        this.spacing_x = parseInt(ctx.canvas.width/this.size,10);
        this.spacing_y = parseInt(ctx.canvas.height/this.size,10) + 20;

        for (var i=1; i<=mapSize; i++) {
            yPosition = ctx.canvas.height - (this.spacing_y * i);
            rowMap = this.makeRow(yPosition);
            this.map.push({
                row:rowMap
            });
        }
    };

    Pianotiles.prototype.makeRow = function(yPosition) {

        var row = [];

        for (var i = 0; i < this.size; i++) {

            row.push({
                x: i*this.spacing_x,
                y: yPosition,
                width: this.spacing_x,
                height: this.spacing_y,
                startTile : false,
                latest : false,
                color:"#fff"
            });
        };

        this.setTilesColor(row);
        return row;
    };

    Pianotiles.prototype.setTilesColor = function(row) {

        var blackTile = parseInt(Math.random()*4 ,10);

        row[blackTile].color = "#000";
    };

    Pianotiles.prototype.makeEntity = function() {

        var ctx = this.context,
            imgEntity = {};

        ctx.fillStyle="#000";
        ctx.fillRect(0,0,this.spacing_x * 4,this.spacing_y * 4);
        imgEntity.black = new Image();
        imgEntity.black.src = ctx.canvas.toDataURL();
        ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);

        ctx.fillStyle="#a9a9a9";
        ctx.fillRect(0,0,this.spacing_x * 4,this.spacing_y * 4);
        imgEntity.gray = new Image();
        imgEntity.gray.src = ctx.canvas.toDataURL();
        ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);

        ctx.fillStyle="#ff0000";
        ctx.fillRect(0,0,this.spacing_x * 4,this.spacing_y * 4);
        imgEntity.red = new Image();
        imgEntity.red.src = ctx.canvas.toDataURL();
        ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);

        this.entities = imgEntity;
    };

    Pianotiles.prototype.drawOnlyDOM = function() {

        
    };

    Pianotiles.prototype.drawMap = function() {

        var imgSource, imgTag, i, j, temp;

        for (i = 0; i < this.blacktiles.length; i++) {
            this.blacktiles[i].destroy();
        };
        for (i = 0; i < this.graytiles.length; i++) {
            this.graytiles[i].destroy();
        };

        this.blacktiles = [];
        this.graytiles = [];

        this.backgroundCtx.clearRect(0,0,this.backgroundCtx.canvas.width, this.backgroundCtx.canvas.height);

        for ( i = 0; i < this.map.length; i++ ) {
            for( j = 0; j < this.size; j++ ) {

                this.drawRect(this.map[i].row[j]);

                if(this.map[i].row[j].color === "#000") {
                    if(i === 0) {
                        this.map[i].row[j].latest = true;
                    }
                    this.setTileColor(this.map[i].row[j], this.entities.black, this.blacktiles);
                }
            }
        }

        this.backgroundEntity.enable();
        this.backgroundEntity.setBaseImage(this.backgroundCanvas);
    };

    Pianotiles.prototype.drawRect = function(option) {

        var ctx = this.backgroundCtx;

        ctx.strokeRect(option.x, option.y, option.width, option.height);
    };

    Pianotiles.prototype.setTileColor = function(row,tileColor,entityArray) {

           var temp,styleText = row.latest ? "background-color:#000;z-index:1000;" : "background-color:#000;z-index:999;";

           entityArray.push(
               this.game.entityPool.allocate({
                  x:row.x * this.resolution,
                  y:row.y * this.resolution,
                  width:row.width * this.resolution,
                  height:row.height * this.resolution,
                  domRendering: this.isDom
               }).addTo(this.board).setBaseImage(tileColor)
           );

           styleText += "width:"+row.width+"px; height:"+row.height+"px;";

           if (entityArray[entityArray.length - 1].domRendering) {

               entityArray[entityArray.length - 1].domRenderer = this.game.domRenderer.getRendererNode("tiles");
               entityArray[entityArray.length - 1].domRenderer.setEntity(entityArray[entityArray.length - 1]);
               entityArray[entityArray.length - 1].domRenderer.refDOMNode.style.cssText = styleText;
               entityArray[entityArray.length - 1].domRenderer.refDOMNode.addEventListener(START_EV, this.onDomTouchStart);
           };
    };

    Pianotiles.prototype.onDomTouchStart = function(e) {

        var latest = e.target.style["z-index"] === "1000" ? true : false,
            self = pianotiles;

        if (latest) {

            self.touched = true;
            self.score++;
            self.setTimer();
            self.blacktiles[0].destroy();
            self.blacktiles.shift();

            if(this.startTile) {
                self.start = true;
            }
        } else {

            self.gameover = true;
        }

    };

    Pianotiles.prototype.setTimeText = function() {

        var currentTime = +new Date(),
            timerText = parseInt((currentTime - this.starttileTime)/1000,10);


        this.context.canvas.width = 60;
        this.context.canvas.height = 100;
        this.context.clearRect(0,0,60,100);

        this.context.font="90px Arial";
        this.context.fillStyle = "#ff0000";

        if (this.timerStart) {
            this.context.fillText(timerText,5, 65);
        } else {
            this.context.fillText("0",5, 65);
        }

        this.timerEntity.setBaseImage(this.canvas);
        this.timerEntity.enable();
    };

    Pianotiles.prototype.freeRow = function(entity) {
        this.map.shift();
    };

    Pianotiles.prototype.setStartTimer = function() {

        var i = 0;

        if (this.game.config.domRendering) {

            this.blacktiles[0].domRenderer.refDOMNode.startTile = true;

        } else {
            for ( i = 0; i < 4; i++ ) {
                if (this.map[0].row[i].color === "#000") {

                    this.map[0].row[i].startTile = true;
                }
            }
        }

    };

    Pianotiles.prototype.move = function() {

        var top,
            length,
            tempY,
            isFree=false,
            rowLength = this.map[0].row.length,
            mapLength = this.map.length,
            currentDate = +new Date();

        for (var i = 0; i < mapLength; i++) {
            for (var j = 0; j < rowLength; j++) {

                top = this.map[i].row[j].y;
                length = this.spacing_y / 8;

                tempY = Math.floor(easing.linear( currentDate  - this.startTime, top, length, 10));

                this.map[i].row[j].y = tempY;

                if(tempY >= this.bottomLine) {
                    isFree = true;

                }

            };
        };

        if (isFree) {
            this.freeRow();
            this.shift = true;
        };

        this.drawMap();

    };

    Pianotiles.prototype.progress = function(dt) {

        if (this.gameover) {
            this.timerStart = false;
            this.game.trigger("gameover");
            this.game.renderer.off("step", this._progress);

            for (var i = 0; i < this.blacktiles.length; i++) {
                this.blacktiles[i].destroy();
            }

            return;
        }

        if (this.start) {
            this.starttileTime = +new Date();
            this.timerStart = true;
            this.start = false;
        }
        this.setTimeText();

        if (this.touched) {

            if ( this.shift ) {

                this.addRow();

                this.shift = false;
                this.touched = false;

                return;
            }
            this.move();
        }
    };

    Pianotiles.prototype.addRow = function() {

        if (this.maxRow <= this.rowCounter) {
            return;
        }

        var newY = this.map[this.map.length -1].row[0].y - this.spacing_y,
            newRow = this.makeRow(newY);

        this.map.push({
            row : newRow
        });

        this.rowCounter++;
    };

    Pianotiles.prototype.checkTouch = function(option) {

        var touchPosition = {
                x: option.x,
                y: option.y
            },
            tilePosition = {
                x1: null,
                x2: null,
                y1: null,
                y2: null
            },
            map = this.map,
            size = this.size;

        for (var i = 0; i < map.length; i++) {
            for (var j = 0; j < size; j++) {

                tilePosition.x1 = map[i].row[j].x;
                tilePosition.x2 = map[i].row[j].x + map[i].row[j].width;
                tilePosition.y1 = map[i].row[j].y;
                tilePosition.y2 = map[i].row[j].y + map[i].row[j].height;

                if (touchPosition.x > tilePosition.x1 && touchPosition.x < tilePosition.x2) {
                    if (touchPosition.y > tilePosition.y1 && touchPosition.y < tilePosition.y2) {

                        this.touched = true;
                        this.score++;
                        this.setTouchedTile(map[i].row[j]);

                        if(map[i].row[j].startTile) {
                            this.start = true;
                        }
                    }
                }
            }
        }
    };

    Pianotiles.prototype.setTimer = function() {
        var rowLen = this.map[0].row.length,
            mapLen = this.map.length,
            startTime = +new Date();

        this.startTime = startTime;

        for (var i = mapLen -1; i >= 0; i--) {
            for (var j = rowLen - 1; j >= 0; j--) {
                this.map[i].row[j].startTime = startTime;
            };

        };
    };

    Pianotiles.prototype.setTouchedTile = function(tile) {

        if( tile.color === "#000" && tile.latest) {
            this.setTimer();
            this.blacktiles[0].destroy();
            this.blacktiles.shift();
            this.setTileColor(tile,this.entities.gray, this.graytiles);
            tile.color = "#fff";
        } else {
            this.gameover = true;
        }
    };

    Pianotiles.prototype.play = function() {
        this.game.renderer.resume();
    };

    Pianotiles.prototype.onTouchstart = function(e) {

        var x = e.canvasX,
            y = e.canvasY;

        e.preventDefault();

        this.checkTouch({x:x,y:y});
    };

    pianotiles = new Pianotiles();

    return pianotiles;
});
