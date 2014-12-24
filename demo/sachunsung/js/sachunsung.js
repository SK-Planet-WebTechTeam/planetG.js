// This game is prototype.
// It means that this game is not opened to users yet .
// So, it needs some adjust for image coordinate.
define("game/sachunsung",['pwge/spriteManager','pwge/boardManager','pwge/input','pwge/canvas','util/PubSub','util/easing','pwge/util'], function(spriteManager, boardManager, input, canvas, PubSub, easing, util){

    var common = {
            // Card Type (= animal character type, at first, not animal but color)
            totalTypes: 8,
            types:  ["purple", "emerald", "blue", "green", "pink", "brown", "orange", "darkgreen" ],

            // layout
            boardWidth: 10,
            boardHeight: 10,
            chrWidth: 105,
            chrHeight:119,
            offsetY: 236,

            // score config
            matchPoint: 250, // match point
            timePoint: 10, // 10 point per 1s
            comboPoint: 250, // combo point

            // time config
            totalTime: 60000, // 60s
            comboTime: 2000, // 2s
            hintTime: 5000, // 5s
            startTime : null
        },

        // each Stage Matrix
        // 10 X 10 map
        // 0 : road
        // 1 : character
        // 2 : block
        mapDB = [
            [
                0,0,0,0,0,0,0,0,0,0,
                0,0,0,0,0,0,0,0,0,0,
                0,0,0,1,1,1,1,0,0,0,
                0,0,0,1,0,0,1,0,0,0,
                0,0,0,1,0,0,1,0,0,0,
                0,0,0,1,1,1,1,0,0,0,
                0,0,0,0,0,0,0,0,0,0,
                0,0,0,0,0,0,0,0,0,0,
                0,0,0,0,0,0,0,0,0,0,
                0,0,0,0,0,0,0,0,0,0
            ],
            [
                0,0,0,0,0,0,0,0,0,0,
                0,0,0,0,0,0,0,0,0,0,
                0,0,1,0,0,0,0,1,0,0,
                0,0,1,0,2,2,0,1,0,0,
                0,0,1,0,2,2,0,1,0,0,
                0,0,1,0,2,2,0,1,0,0,
                0,0,1,0,2,2,0,1,0,0,
                0,0,1,0,0,0,0,1,0,0,
                0,0,0,0,0,0,0,0,0,0,
                0,0,0,0,0,0,0,0,0,0
            ],
            [
                0,0,0,0,0,0,0,0,0,0,
                0,0,0,0,0,0,0,0,0,0,
                0,0,1,1,1,1,1,1,0,0,
                0,0,1,0,0,0,0,1,0,0,
                0,0,1,0,0,0,0,1,0,0,
                0,0,1,0,0,0,0,1,0,0,
                0,0,1,0,0,0,0,1,0,0,
                0,0,1,1,1,1,1,1,0,0,
                0,0,0,0,0,0,0,0,0,0,
                0,0,0,0,0,0,0,0,0,0
            ],
            [
                0,0,0,0,0,0,0,0,0,0,
                0,0,0,0,0,0,0,0,0,0,
                0,0,1,1,1,1,1,1,0,0,
                0,0,1,0,0,0,0,1,0,0,
                0,0,1,0,2,2,0,1,0,0,
                0,0,1,0,2,2,0,1,0,0,
                0,0,1,0,0,0,0,1,0,0,
                0,0,1,1,1,1,1,1,0,0,
                0,0,0,0,0,0,0,0,0,0,
                0,0,0,0,0,0,0,0,0,0
            ],
            [
                0,0,0,0,0,0,0,0,0,0,
                0,0,0,0,0,0,0,0,0,0,
                0,0,1,1,1,1,1,1,0,0,
                0,0,1,2,2,2,2,1,0,0,
                0,0,1,0,0,0,0,1,0,0,
                0,0,1,0,0,0,0,1,0,0,
                0,0,1,2,2,2,2,1,0,0,
                0,0,1,1,1,1,1,1,0,0,
                0,0,0,0,0,0,0,0,0,0,
                0,0,0,0,0,0,0,0,0,0
            ],
            [
                0,0,0,0,0,0,0,0,0,0,
                0,0,0,0,0,0,0,0,0,0,
                0,0,1,1,1,1,1,1,0,0,
                0,0,1,1,1,1,1,1,0,0,
                0,0,1,2,2,2,2,1,0,0,
                0,0,1,2,2,2,2,1,0,0,
                0,0,1,1,1,1,1,1,0,0,
                0,0,1,1,1,1,1,1,0,0,
                0,0,0,0,0,0,0,0,0,0,
                0,0,0,0,0,0,0,0,0,0
            ]
        ];

        mobile = 'ontouchstart' in window,
        START_EV = mobile ? 'touchstart' : 'mousedown',
        MOVE_EV = mobile ? 'touchmove' : 'mousemove',
        END_EV = mobile ? 'touchend' : 'mouseup';

    var Sachunsung = function () {
        util.extend(this, common);
    };

    // for on() and trigger() function
    Sachunsung.prototype = Object.create(PubSub.prototype);

    Sachunsung.prototype.init = function( game, playBoard, stage ) {
        this.game = game;
        this.playBoard = playBoard;
        this.crntStage = stage || 0;

        // stage setting
        this.crntMap = [];
        for (var i=0, l=mapDB[this.crntStage].length ; i<l ; i++) {
            this.crntMap[i] = mapDB[ this.crntStage ][i];
        }
        this.mapToBoard =[];
        this.board = [];

        // initializing
        this.score = 0;
        // combo (= matching continually)
        this.comboCnt = 0;
        this.comboTimer = null;
        // Hint (= visual effect for helping match)
        this.hint = null;
        this.hintTimer = null;
        this.finish = false;

        // background img
        this.game.entityPool.allocate({
            x:0,
            y:0,
            width:1080,
            height:1350,
            detectable:false
        }).addTo(this.playBoard.name).setBaseSprite("gameBg");

        // timer icon img
        this.game.entityPool.allocate({
            x: 1080 - ((1080-1046)/2) - 17*2 - 48,
            y:53,
            width:48,
            height:40,
            detectable:false
        }).addTo(this.playBoard.name).setBaseSprite("clock");

        // timer(number) img
        this.tenTime = this.game.entityPool.allocate({
            x:1080 - ((1080-1046)/2) - 17*2 ,
            y:53,
            width:17,
            height:24,
            detectable:false
        }).addTo(this.playBoard.name).setBaseSprite("sixTime");
        this.oneTime = this.game.entityPool.allocate({
            x:1080 - ((1080-1046)/2) - 17,
            y:53,
            width:17,
            height:24,
            detectable:false
        }).addTo(this.playBoard.name).setBaseSprite("zeroTime");

        // timeline img
        this.timer = this.game.entityPool.allocate({
            x:(1080-1046)/2,
            y:105,
            width:1046,
            height:28,
            detectable:false
        }).addTo(this.playBoard.name).setBaseSprite("timer");

        // updating timer and timeline
        var countTime = function(dt){
            var term = 1046/this.totalTime*1000;

            if( dt < this.totalTime ){
                // 매 초마다 시간 막대를 이동시킴
                this.timer.width = 1046 - (term * Math.floor(dt/1000) );
                // 매 초마다 시간을 숫자로 표시함
                this.updateTime(this.totalTime - Math.floor(dt/1000));
            }
        };
        this.timer.step = countTime.bind(this);

        // score img
        this.million = this.game.entityPool.allocate({
            x:540 - (42*3 + 21/2),
            y:24,
            width:42,
            height:64,
            detectable:false
        }).addTo(this.playBoard.name).setBaseSprite("zero");
        this.tenthousand = this.game.entityPool.allocate({
            x:540 - (42*2 + 21/2),
            y:24,
            width:42,
            height:64,
            detectable:false
        }).addTo(this.playBoard.name).setBaseSprite("zero");
        this.thousand = this.game.entityPool.allocate({
            x:540 - (42*1 + 21/2),
            y:24,
            width:42,
            height:64,
            detectable:false
        }).addTo(this.playBoard.name).setBaseSprite("zero");
        this.game.entityPool.allocate({
            x:540 - (21/2),
            y:24,
            width:21,
            height:64,
            detectable:false
        }).addTo(this.playBoard.name).setBaseSprite("comma");
        this.hundred = this.game.entityPool.allocate({
            x:540 + (21/2),
            y:24,
            width:42,
            height:64,
            detectable:false
        }).addTo(this.playBoard.name).setBaseSprite("zero");
        this.ten = this.game.entityPool.allocate({
            x:540 + (42*1 + 21/2),
            y:24,
            width:42,
            height:64,
            detectable:false
        }).addTo(this.playBoard.name).setBaseSprite("zero");
        this.one = this.game.entityPool.allocate({
            x:540 + (42*2 + 21/2),
            y:24,
            width:42,
            height:64,
            detectable:false
        }).addTo(this.playBoard.name).setBaseSprite("zero");

        // generating character
        this.generateCard();
    };

    Sachunsung.prototype.start = function() {
        this._onTouchstart = this.onTouchstart.bind(this);
        this.game.input.on(START_EV, this._onTouchstart);

        this.timeLastMatch = new Date().getTime();
        this.startTime = this.timeLastMatch ;
        this.checkHint();
        this.firstChoice = null;
    };
    Sachunsung.prototype.end = function() {
        this.game.input.off(START_EV, this._onTouchstart);
    };

    // utility functions for sensing user click (or touch)
    Sachunsung.prototype.getChrAt = function(i, j) {
        if ( this.mapToBoard[i + this.boardWidth * j] === -1) {
            return;
        }
        return this.board[ this.mapToBoard[i + this.boardWidth * j] ] ;
    };
    Sachunsung.prototype.getChrIdx = function(i, j) {
        return this.mapToBoard[i + this.boardWidth * j] ;
    };
    Sachunsung.prototype.getChrType = function(i, j) {
        if ( this.mapToBoard[i + this.boardWidth * j] === -1) {
            return;
        }
        return this.board[ this.mapToBoard[i + this.boardWidth * j] ].type;
    };
    Sachunsung.prototype.getIJfromIdx = function(idx) {
        return {
            i: idx % this.boardWidth,
            j: Math.floor(idx / this.boardWidth),
        };
    };

    // Board Generation
    Sachunsung.prototype.generateCard = function(){
        var board = this.board,
            map = this.crntMap,
            mapToBoard = this.mapToBoard,
            i, j,
            chr, chrNum =0,
            type;

        for (j=0 ; j<this.boardHeight ; j++) {
            for (i=0 ; i<this.boardWidth; i++) {
                // making character
                if (map[i+this.boardWidth*j] === 1) {
                    type = this.types[Math.floor(chrNum/2) % this.totalTypes];
                    board.push(
                        this.game.entityPool.allocate({
                            x: i * this.chrWidth,
                            y: j * this.chrHeight + this.offsetY,
                            width: this.chrWidth,
                            height: this.chrHeight,
                            i: i,
                            j: j,
                            type: type,
                            selectable: true
                        }).addTo(this.playBoard.name)
                    );
                    mapToBoard.push(chrNum);
                    chrNum ++;
                }
                // making block character
                else if (map[i+this.boardWidth*j] === 2) {
                    this.game.entityPool.allocate({
                        x: i * this.chrWidth,
                        y: j * this.chrHeight + this.offsetY,
                        width: this.chrWidth,
                        height: this.chrHeight,
                        i: i,
                        j: j,
                        selectable: false
                    }).addTo(this.playBoard.name).setBaseSprite("block");
                    mapToBoard.push(-1);
                }
                // making road
                else {
                    mapToBoard.push(-1);
                }
            }
        }

        // randomizing characters' location
        do {
            this.shuffle();
        } while(!this.canSolve());

        console.log( "board : " + this.board );
        console.log( "map   : " + this.mapToBoard );

        // after shuffling, setting sprite for characters
        for (i=0; i<board.length ; i++) {
            if (board[i].selectable) {
                board[i].setBaseSprite(board[i].type);
            }
        }
    };

    // shuffling card (=character) position
    Sachunsung.prototype.shuffle = function () {
        var board = this.board,
            tmp,
            m, n;

        for (m=0; m<board.length ; m++) {
            n = Math.floor(Math.random()*board.length);

            // changing m-th and n-th location
            if ( board[m] !== null && board[n] !== null && board[m].selectable && board[n].selectable ) {
                tmp = board[m].type ;
                board[m].type = board[n].type;
                board[n].type = tmp;
            }
        }
    };

    // checking mission-complete
    Sachunsung.prototype.isFinish = function () {
        var m, map = this.crntMap;

        for (m=0; m<map.length ; m++) {
            if ( map[m] === 1 ) {
                return false;
            }
        }
        return true;
    };

    // checking possibility for mission-complete
    Sachunsung.prototype.canSolve = function () {
        var i, j,
            m, n,
            map = this.crntMap,
            path;

        for ( i=0 ; i<map.length ; i++ ){
            if ( map[i]===1 ) {
                for ( j=i+1; j<map.length ; j++ ){
                    if ( map[j]===1 ) {
                        m = this.getIJfromIdx(i);
                        n = this.getIJfromIdx(j);
                        path = this.isPath(m.i, m.j, n.i, n.j);
                        if( this.isSameType(m.i, m.j, n.i, n.j) && path ) {
                            return path;
                        }
                    }
                }
            }
        }

        return false;
    };

    // checking whether two character type are same or not
    Sachunsung.prototype.isSameType = function(fromI, fromJ, toI, toJ) {
        if ( !this.getChrAt(fromI, fromJ) || !this.getChrAt(toI, toJ) || !this.getChrAt(fromI, fromJ).selectable || !this.getChrAt(toI, toJ).selectable) {
            return;
        }
        return (this.getChrType(fromI, fromJ) === this.getChrType(toI, toJ));
    };

    // checking whether path exist or not between two characters
    Sachunsung.prototype.isPath = function(fromI, fromJ, toI, toJ) {
        var i, j,
            m, n,
            map = this.crntMap;

        if ( this.getChrAt(fromI, fromJ) === null || this.getChrAt(toI, toJ) === null || !this.getChrAt(fromI, fromJ).selectable || !this.getChrAt(toI, toJ).selectable) {
            return false;
        }

        // 1 line
        if ( this.isLine(fromI, fromJ, toI, toJ) ){
            //alert( '('+fromI+', ' + fromJ + ') -> (' + toI + ', ' + toJ +')' );
            return [ {i: fromI, j: fromJ}, {i: toI, j: toJ} ];
        }

        // 2 ㄱ (horizontal first) line
        if ( map[toI + fromJ*this.boardWidth]===0 && this.isLine(fromI, fromJ, toI, fromJ) && this.isLine(toI, fromJ, toI, toJ) ) {
            //alert( '('+fromI+', ' + fromJ + ') -> (' + toI + ', '+fromJ + ') -> (' + toI + ', ' + toJ +')' );
            return [ {i: fromI, j: fromJ}, {i: toI, j: fromJ}, {i: toI, j: toJ} ];
        }

        // 2 ㄴ (vertical first) line
        if ( map[fromI + toJ*this.boardWidth]===0 && this.isLine(fromI, fromJ, fromI, toJ) && this.isLine(fromI, toJ, toI, toJ) ) {
            //alert( '('+fromI+', ' + fromJ + ') -> (' + fromI + ', ' + toJ +') -> (' + toI + ', ' + toJ +')' );
            return [ {i: fromI, j: fromJ}, {i: fromI, j: toJ}, {i: toI, j: toJ} ];
        }

        // 3 ㄱ+ㄴ (horizontal - vertical - horizontal)line
        for (m=1; m<this.boardWidth ; m++) {
            i = fromI - m;
            if ( 0 <= i && i < this.boardWidth && map[i + fromJ*this.boardWidth]===0 && map[i + toJ*this.boardWidth]===0 && this.isLine(fromI, fromJ, i, fromJ) && this.isLine(i, fromJ, i, toJ) && this.isLine(i, toJ, toI, toJ) ) {
                //alert( '('+fromI+', ' + fromJ + ') -> (' + i + ', '+fromJ+') -> ( '+ i + ', ' + toJ + ') -> (' + toI + ', ' + toJ +')' );
                return [ {i: fromI, j: fromJ}, {i: i, j: fromJ}, {i: i, j: toJ}, {i: toI, j: toJ} ];
            }

            i = fromI + m;
            if ( 0 <= i && i < this.boardWidth && map[i + fromJ*this.boardWidth]===0 && map[i + toJ*this.boardWidth]===0 && this.isLine(fromI, fromJ, i, fromJ) && this.isLine(i, fromJ, i, toJ) && this.isLine(i, toJ, toI, toJ) ) {
                //alert( '('+fromI+', ' + fromJ + ') -> (' + i + ', '+fromJ+') -> ( '+ i + ', ' + toJ + ') -> (' + toI + ', ' + toJ +')' );
                return [ {i: fromI, j: fromJ}, {i: i, j: fromJ}, {i: i, j: toJ}, {i: toI, j: toJ} ];
            }
        }

        // 3 ㄴ+ㄱ (vertical - horizontal - vertical) line
        for (n=1; n<this.boardHeight; n++) {
            j = fromJ - n;
            if ( 0 <= j && j < this.boardHeight && map[fromI + j*this.boardWidth]===0 && map[toI + j*this.boardWidth]===0 && this.isLine(fromI, fromJ, fromI, j) && this.isLine(fromI, j, toI, j) && this.isLine(toI, j, toI, toJ) ) {
                //alert( '('+fromI+', ' + fromJ + ') -> (' + fromI + ', '+j+') -> ( '+ toI + ', ' + j + ') -> (' + toI + ', ' + toJ +')' );
                return [ {i: fromI, j: fromJ}, {i: fromI, j: j}, {i: toI, j: j}, {i: toI, j: toJ} ];
            }

            j = fromJ + n;
            if ( 0 <= j && j < this.boardHeight && map[fromI + j*this.boardWidth]===0 && map[toI + j*this.boardWidth]===0 && this.isLine(fromI, fromJ, fromI, j) && this.isLine(fromI, j, toI, j) && this.isLine(toI, j, toI, toJ) ) {
                //alert( '('+fromI+', ' + fromJ + ') -> (' + fromI + ', '+j+') -> ( '+ toI + ', ' + j + ') -> (' + toI + ', ' + toJ +')' );
                return [ {i: fromI, j: fromJ}, {i: fromI, j: j}, {i: toI, j: j}, {i: toI, j: toJ} ];
            }
        }

        return false;
    };

    // checking whether block unit exist or not between two characters
    Sachunsung.prototype.isLine = function(fromI, fromJ, toI, toJ) {
        var i, j, map = this.crntMap;

        if ((fromI===toI && fromJ===toJ) || (fromI!==toI && fromJ!==toJ)){
            return false;
        }
        // horizontal line
        if (fromI!==toI && fromJ===toJ) {
            // rightside
            if ( fromI < toI ) {
                for (i=fromI+1 ; i<toI ; i++) {
                    if (map[ i+fromJ*this.boardWidth ] !==0) {
                        return false;
                    }
                }
            }
            // leftside
            else {
                for (i=toI+1 ; i<fromI ; i++) {
                    if (map[ i+fromJ*this.boardWidth ] !==0) {
                        return false;
                    }
                }
            }
        }
        // vertical line
        else {
            // downside
            if ( fromJ < toJ ) {
                for (j=fromJ+1 ; j<toJ ; j++) {
                    if (map[ fromI + j*this.boardWidth ] !==0) {
                        return false;
                    }
                }
            }
            // upside
            else {
                for (j=toJ+1 ; j<fromJ ; j++) {
                    if (map[ fromI + j*this.boardWidth ] !==0) {
                        return false;
                    }
                }
            }
        }
        return true;
    };

    // current score
    Sachunsung.prototype.getScore = function() {
        return this.score;
    };

    // updating score
    Sachunsung.prototype.addScore = function(point) {
        this.score += point;
        var num = this.score;

        for ( var i=0, j=1; i<6 ; i++ ){
            this.updateScoreDigit( num % 10, j );
            j*=10;
            num = Math.floor(num / 10);
        }
    };

    Sachunsung.prototype.updateScoreDigit = function(n,d){
        var numArray = ["zero","one","two","three","four","five","six","seven","eight","nine"];

        switch(d){
            case 100000:
                this.million.setBaseSprite(numArray[n]);
                break;
            case 10000:
                this.tenthousand.setBaseSprite(numArray[n]);
                break;
            case 1000:
                this.thousand.setBaseSprite(numArray[n]);
                break;
            case 100:
                this.hundred.setBaseSprite(numArray[n]);
                break;
            case 10:
                this.ten.setBaseSprite(numArray[n]);
                break;
            case 1:
                this.one.setBaseSprite(numArray[n]);
                break;
        }
    };

    // updating time
    Sachunsung.prototype.updateTime = function( time ) {
        var num = time;

        for ( var i=0, j=1; i<2 ; i++ ){
            this.updateTimeDigit( num % 10, j );
            j*=10;
            num = Math.floor(num / 10);
        }
    };

    Sachunsung.prototype.updateTimeDigit = function(n,d){
        var numArray = ["zeroTime","oneTime","twoTime","threeTime","fourTime","fiveTime","sixTime","sevenTime","eightTime","nineTime"];

        switch(d){
            case 10:
                this.tenTime.setBaseSprite(numArray[n]);
                break;
            case 1:
                this.oneTime.setBaseSprite(numArray[n]);
                break;
        }
    };

    // showing combo
    Sachunsung.prototype.showComboMsg = function(i, j, count) {
        var numArray = ["zero","one","two","three","four","five","six","seven","eight","nine"],
            deletingAni = {
                    duration : 1500,
                    from : {
                        scaleX : 1,
                        scaleY : 1
                    },
                    to : {
                        scaleX : 1,
                        scaleY : 0
                    },
                    easing : {
                        scaleX : "linear",
                        scaleY : "linear"
                    },
                    callback : function(){
                        this.destroy();
                    }
                };

        this.game.entityPool.allocate({
            x: i * this.chrWidth,
            y: j * this.chrHeight + this.offsetY - 76,
            z: 1,
            width: 63,
            height: 66,
            selectable: false
        }).addTo("playBoard").setBaseSprite(numArray[count]).animate(deletingAni);
        this.game.entityPool.allocate({
            x: i * this.chrWidth + 63,
            y: j * this.chrHeight + this.offsetY - 76,
            z: 1,
            width: 144,
            height: 66,
            selectable: false
        }).addTo("playBoard").setBaseSprite("combo").animate(deletingAni);
    };

    // User Input Handlers
    Sachunsung.prototype.onTouchstart = function(e) {
        var x = e.designX,
            y = e.designY,
            i = Math.floor(x/this.chrWidth),
            j = Math.floor((y- this.offsetY)/this.chrHeight),
            lines = [];

        e.preventDefault();

        // not selecting
        if ( i<0 || this.boardWidth<=i || j<0 || this.boardHeight<=j || !this.getChrAt(i, j)) {
            return;
        }

        // selecting 1st character
        if (!this.firstChoice) {
            this.firstChoice = this.getChrAt(i, j);
            this.firstSelected = this.game.entityPool.allocate({
                x: i* this.chrWidth -10,
                y: j* this.chrHeight + this.offsetY -10,
                width: this.chrWidth+10,
                height: this.chrHeight+10,
                selectable: false
            }).addTo("playBoard").setBaseSprite("selected");
            console.log( i, j );
            return;
        }
        // selecting 1st character again
        else if (i===this.firstChoice.i && j===this.firstChoice.j) {
            return;
        }
        // selecting 2nd character
        else {
            this.secondSelected = this.game.entityPool.allocate({
                x: i* this.chrWidth -10,
                y: j* this.chrHeight + this.offsetY -10,
                width: this.chrWidth+10,
                height: this.chrHeight+10,
                selectable: false
            }).addTo("playBoard").setBaseSprite("selected");
            console.log( this.firstChoice.i, this.firstChoice.j, i, j );
        }

        // matching
        lines = this.isPath(this.firstChoice.i, this.firstChoice.j, i, j);
        if( this.isSameType(this.firstChoice.i, this.firstChoice.j, i, j) && lines ) {

            // showing path
            var m, n, k=0,
                // hiding path after 0.3s
                pathAni = {
                    duration : 300,
                    from : {
                        scaleX : 1,
                        scaleY : 1
                    },
                    to : {
                        scaleX : 1,
                        scaleY : 1
                    },
                    easing : {
                        scaleX : "linear",
                        scaleY : "linear"
                    },
                    callback : function(){
                        this.destroy();
                    }
                };
            for ( m=0 ; m+1<lines.length ; m++ ) {
                if ( lines[m].i === lines[m+1].i ){
                    if ( lines[m].j < lines[m+1].j ) {
                        for ( n=lines[m].j+1 ; n<lines[m+1].j ; n++ ){
                            this.game.entityPool.allocate({
                                x: lines[m].i* this.chrWidth,
                                y: n* this.chrHeight + this.offsetY,
                                width: this.chrWidth,
                                height: this.chrHeight,
                                selectable: false
                            }).addTo("playBoard").setBaseSprite("vertical").animate(pathAni);
                        }
                        if ( m+2 === lines.length ){
                            // entityPool.allocate({
                            //     x: lines[m].i* this.chrWidth,
                            //     y: n* this.chrHeight + this.offsetY,
                            //     width: this.chrWidth,
                            //     height: this.chrHeight,
                            //     selectable: false
                            // }).addTo("playBoard").setBaseSprite("vertical");
                        }
                        else if ( lines[m+1].i < lines[m+2].i ) {
                            this.game.entityPool.allocate({
                                x: lines[m].i* this.chrWidth,
                                y: n* this.chrHeight + this.offsetY,
                                width: this.chrWidth,
                                height: this.chrHeight,
                                selectable: false
                            }).addTo("playBoard").setBaseSprite("righttop").animate(pathAni);
                        }
                        else if ( lines[m+2].i < lines[m+1].i ) {
                            this.game.entityPool.allocate({
                                x: lines[m].i* this.chrWidth,
                                y: n* this.chrHeight + this.offsetY,
                                width: this.chrWidth,
                                height: this.chrHeight,
                                selectable: false
                            }).addTo("playBoard").setBaseSprite("lefttop").animate(pathAni);
                        }
                    }
                    else {
                        for ( n=lines[m].j-1 ; lines[m+1].j<n ; n-- ){
                            this.game.entityPool.allocate({
                                x: lines[m].i* this.chrWidth,
                                y: n* this.chrHeight + this.offsetY,
                                width: this.chrWidth,
                                height: this.chrHeight,
                                selectable: false
                            }).addTo("playBoard").setBaseSprite("vertical").animate(pathAni);
                        }
                        if ( m+2 === lines.length ){
                            // entityPool.allocate({
                            //     x: lines[m].i* this.chrWidth,
                            //     y: n* this.chrHeight + this.offsetY,
                            //     width: this.chrWidth,
                            //     height: this.chrHeight,
                            //     selectable: false
                            // }).addTo("playBoard").setBaseSprite("vertical");
                        }
                        else if ( lines[m+1].i < lines[m+2].i ) {
                            this.game.entityPool.allocate({
                                x: lines[m].i* this.chrWidth,
                                y: n* this.chrHeight + this.offsetY,
                                width: this.chrWidth,
                                height: this.chrHeight,
                                selectable: false
                            }).addTo("playBoard").setBaseSprite("rightbottom").animate(pathAni);
                        }
                        else if ( lines[m+2].i < lines[m+1].i ) {
                            this.game.entityPool.allocate({
                                x: lines[m].i* this.chrWidth,
                                y: n* this.chrHeight + this.offsetY,
                                width: this.chrWidth,
                                height: this.chrHeight,
                                selectable: false
                            }).addTo("playBoard").setBaseSprite("leftbottom").animate(pathAni);
                        }
                    }
                }
                else {
                    if ( lines[m].i < lines[m+1].i ) {
                        for ( n=lines[m].i+1 ; n<lines[m+1].i ; n++ ){
                            this.game.entityPool.allocate({
                                x: n* this.chrWidth,
                                y: lines[m].j* this.chrHeight + this.offsetY,
                                width: this.chrWidth,
                                height: this.chrHeight,
                                selectable: false
                            }).addTo("playBoard").setBaseSprite("horizontal").animate(pathAni);
                        }
                        if ( m+2 === lines.length ){
                            // this.game.entityPool.allocate({
                            //     x: n* this.chrWidth,
                            //     y: lines[m].j* this.chrHeight + this.offsetY,
                            //     width: this.chrWidth,
                            //     height: this.chrHeight,
                            //     selectable: false
                            // }).addTo("playBoard").setBaseSprite("horizontal");
                        }
                        else if ( lines[m+1].j < lines[m+2].j ) {
                            this.game.entityPool.allocate({
                                x: n* this.chrWidth,
                                y: lines[m].j* this.chrHeight + this.offsetY,
                                width: this.chrWidth,
                                height: this.chrHeight,
                                selectable: false
                            }).addTo("playBoard").setBaseSprite("leftbottom").animate(pathAni);
                        }
                        else if ( lines[m+2].j < lines[m+1].j ) {
                            this.game.entityPool.allocate({
                                x: n* this.chrWidth,
                                y: lines[m].j* this.chrHeight + this.offsetY,
                                width: this.chrWidth,
                                height: this.chrHeight,
                                selectable: false
                            }).addTo("playBoard").setBaseSprite("lefttop").animate(pathAni);
                        }
                    }
                    else {
                        for ( n=lines[m].i-1 ; lines[m+1].i<n ; n-- ){
                            this.game.entityPool.allocate({
                                x: n* this.chrWidth,
                                y: lines[m].j* this.chrHeight + this.offsetY,
                                width: this.chrWidth,
                                height: this.chrHeight,
                                selectable: false
                            }).addTo("playBoard").setBaseSprite("horizontal").animate(pathAni);
                        }
                        if ( m+2 === lines.length ){
                            // this.game.entityPool.allocate({
                            //     x: n* this.chrWidth,
                            //     y: lines[m].j* this.chrHeight + this.offsetY,
                            //     width: this.chrWidth,
                            //     height: this.chrHeight,
                            //     selectable: false
                            // }).addTo("playBoard").setBaseSprite("horizontal");
                        }
                        else if ( lines[m+1].j < lines[m+2].j ) {
                            this.game.entityPool.allocate({
                                x: n* this.chrWidth,
                                y: lines[m].j* this.chrHeight + this.offsetY,
                                width: this.chrWidth,
                                height: this.chrHeight,
                                selectable: false
                            }).addTo("playBoard").setBaseSprite("rightbottom").animate(pathAni);
                        }
                        else if ( lines[m+2].j < lines[m+1].j ) {
                            this.game.entityPool.allocate({
                                x: n* this.chrWidth,
                                y: lines[m].j* this.chrHeight + this.offsetY,
                                width: this.chrWidth,
                                height: this.chrHeight,
                                selectable: false
                            }).addTo("playBoard").setBaseSprite("righttop").animate(pathAni);
                        }
                    }
                }
            }

            // visual effect for hiding img resource
            var deletingAni = {
                duration : 300,
                from : {
                    scaleX : 1,
                    scaleY : 1
                },
                to : {
                    scaleX : 0,
                    scaleY : 0
                },
                easing : {
                    scaleX : "linear",
                    scaleY : "linear"
                },
                callback : function(){
                    this.destroy();
                }
            };

            // hiding 1st character
            this.getChrAt(this.firstChoice.i, this.firstChoice.j).animate( deletingAni );
            this.crntMap[this.firstChoice.i+this.firstChoice.j*this.boardWidth] = 0;
            this.board[ this.mapToBoard[this.firstChoice.i+this.firstChoice.j*this.boardWidth] ] = null;

            // hiding 2nd character
            this.getChrAt( i, j).animate( deletingAni );
            this.crntMap[i+j*this.boardWidth] = 0;
            this.board[ this.mapToBoard[i+j*this.boardWidth] ] = null;

            // updating matching score
            this.addScore(this.matchPoint);

            // combo bonus
            matchTime = new Date().getTime();
            if( this.startTime !== this.timeLastMatch && matchTime - this.timeLastMatch <= this.comboTime) {
                this.comboCnt ++;
                this.addScore( this.comboPoint * this.comboCnt );
                this.showComboMsg( i, j, this.comboCnt );
            }
            else {
                this.comboCnt = 0;
            }
            this.timeLastMatch = matchTime;

            // when mission complete
            if ( this.isFinish() ) {
                this.finish = true;
                if ( this.hintTimer ) {
                    clearTimeout( this.hintTimer );
                }

                // time bonus
                crntTime = new Date().getTime();
                console.log( crntTime );
                this.score += (this.totalTime - Math.floor((crntTime-this.startTime) / 1000) ) * this.timePoint ;
                this.trigger("complete");
            }
            // not mission-complete and impossible any matching -> shuffling
            else if (!this.canSolve()) {
                do {
                    this.shuffle();
                } while(!this.canSolve()) ;

                for (i=0; i<this.board.length ; i++) {
                    if (this.board[i] !== null && this.board[i].selectable) {
                        this.board[i].setBaseSprite(this.board[i].type);
                    }
                }
            }

            this.firstChoice = null;

            // hiding focus visual effect for selected characters
            this.firstSelected.animate( deletingAni );
            this.secondSelected.animate( deletingAni );
        }

        // not matching, 2nd selected -> 1st selected
        else {
            this.firstChoice = this.getChrAt(i, j);
            // hiding focus visual effect
            this.firstSelected.destroy();
            this.firstSelected = this.secondSelected;
        }


        // reset hint time
        if ( !this.finish ) {
           this.checkHint();
        }
    };

    Sachunsung.prototype.checkHint = function(){
        if ( this.hintTimer ) {
            clearTimeout( this.hintTimer );
        }
        if ( this.hint ) {
            this.hint.destroy();
            this.hint = null;
        }
        this.path = this.canSolve();
        this.hintTimer = setTimeout( this.showHint.bind(this) , this.hintTime);
    };

    Sachunsung.prototype.showHint = function(){
        this.hint = this.game.entityPool.allocate({
            x: this.path[0].i* this.chrWidth,
            y: this.path[0].j* this.chrHeight + this.offsetY,
            width: this.chrWidth,
            height: this.chrHeight,
            selectable: false
        }).addTo("playBoard").setBaseSprite("hint");
    };

    return new Sachunsung();
});