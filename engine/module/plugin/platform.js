define("plugin/platform",['pwge/spriteManager','pwge/boardManager','pwge/input','pwge/canvas','pwge/renderer','util/easing',"util/PubSub",'pwge/util'], function(spriteManager,boardManager,input,canvas,renderer,easing,PubSub,util ){

    // Base Object for Platform Game
    var Platform = function( game, gameObject, jumper ){
        this.game = game;
        this.gameObject = gameObject;
        this.jumper = jumper;
    };

    Platform.prototype = Object.create(PubSub.prototype);

    /**
     * 맵 DB를 읽어와서 초기화 시킨다.
     */
    Platform.prototype.init = function( config ){
        var i, len;

        util.extend(this, config);

        // 속도 향상을 위해서 배열을 프로퍼티로 변경
        this.mapObj = {};
        for ( i=0, len=this.mapObjArray.length ; i<len ; i++ ) {
            this.mapObj[ this.mapObjArray[i] ] = 1;
        }

        this.hinderObj = {};
        for ( i=0, len=this.hinderArray.length ; i<len ; i++ ) {
            this.hinderObj[ this.hinderArray[i] ] = 1;
        }

        this.groundObj = {};
        for ( i=0, len=this.groundArray.length ; i<len ; i++ ) {
            this.groundObj[ this.groundArray[i] ] = 1;
        }

        this.jumpLimitObj = {};
        for ( i=0, len=this.jumpLimitObjArray.length ; i<len ; i++ ) {
            this.jumpLimitObj[ this.jumpLimitObjArray[i] ] = 1;
        }

        // 배경이 자동으로 움직이도록 설정
        this.setBackGround();

        // 맵 인덱스 초기화
        this.timeLastMatch = new Date().getTime();
        this.timeStart = this.timeLastMatch ;
        this.lastIdx = 0;
        this.crntIdx = 0;
        this.mapLastIdx = 0;
        this.mapCrntIdx = 0;

        // 초기 맵을 구성
        this.entities = [];
        for ( var i=0, iLen=this.mapSizeX + 2 ; i<iLen ; i++) {
            this.entities[i] = [];
            for ( var j=0, jLen=this.mapSizeY ; j<jLen ; j++ ) {
                this.entities[i][j] = this.assignEntity( this.map[i][j], i, j );
            }
        }
    };

    /**
     * 배경을 오른쪽에 왼쪽으로 이동시켜 왼쪽에서 오른쪽으로 움직이는 효과를 준다.
     */
    Platform.prototype.setBackGround = function() {
        // 두개의 배경화면을 만들어 애니메이션으로 이동시킴
        var bgAnimation1 = {
                duration : this.bgRotationTime,
                from : {x:0},
                to : {x:-this.entitySizeX * this.mapSizeX},
                easing : {x:"linear"},
                callback : function() {
                    this.animate( bgAnimation1 );
                }
            },
            bgAnimation2 = {
                duration : this.bgRotationTime,
                from : {x:this.entitySizeX * this.mapSizeX},
                to : {x:0},
                easing : {x:"linear"},
                callback : function() {
                    this.animate( bgAnimation2 );
                }
            };

        this.game.entityPool.allocate({
            x:0,
            y:0,
            z:-1,
            width:this.entitySizeX * this.mapSizeX,
            height:this.entitySizeY * this.mapSizeY
        }).addTo(this.boardName).setBaseSprite(this.background).animate(bgAnimation1);

        this.game.entityPool.allocate({
            x:this.entitySizeX * this.mapSizeX,
            y:0,
            z:-1,
            width:this.entitySizeX * this.mapSizeX,
            height:this.entitySizeY * this.mapSizeY
        }).addTo(this.boardName).setBaseSprite(this.background).animate(bgAnimation2);
    };

    /**
     * 하나의 맵 타일을 entity로 할당한다.
     */
    Platform.prototype.assignEntity = function( objName, idxI, idxJ ) {
        if ( objName in this.mapObj ){
            return this.game.entityPool.allocate({
                        x: this.entitySizeX*idxI,
                        y: this.entitySizeY*idxJ,
                        width: this.entitySizeX,
                        height: this.entitySizeY,
                        type : objName
                    }).addTo(this.boardName).setBaseSprite( objName );
        }
        else {
            return null;
        }
    };

    /**
     * 자동으로 왼쪽으로 이동하는 게임의 경우에 호출한다. ex) 쿠키런, Flappy Bird...
     */
    Platform.prototype.moveLeft = function( dt, endCtx, endCB, createCB, delCB){

        var i, j, iLen, jLen, timeCrnt;

        console.log(dt);

        timeCrnt = +new Date() - this.timeStart;
        this.crntIdx = (this.map.length - this.mapSizeX) * ( timeCrnt / this.totalTime );
        this.mapCrntIdx = Math.min( Math.floor(this.crntIdx), this.map.length-this.mapSizeX );

        // 맵이 끝까지 가지 않은 경우
        if ( this.mapCrntIdx < this.map.length-this.mapSizeX-2 ) {
            for ( i=0, iLen=this.mapSizeX + 2 ; i<iLen ; i++) {
                // 이동하면서 맵이 변경되는 경우
                if ( this.mapLastIdx + i < this.mapCrntIdx ) {
                    // 이동하면서 화면에서 사라진 열(column) 메모리 릴리즈
                    for ( j=0, jLen=this.mapSizeY ; j<jLen ; j++ ) {
                        if ( this.entities[i][j] ) {
                            // 사라지는 타일의 타입을 callback 함수로 전달
                            if ( typeof delCB !== 'undefined' ) {
                                delCB.call(this, this.entities[i][j].type);
                            }
                            this.entities[i][j].destroy();
                        }
                    }

                    // 화면에 보이게 된 열(column) 추가
                    var newEntity = [];
                    for ( j=0, jLen=this.mapSizeY ; j<jLen ; j++ ) {
                        newEntity[j] = this.assignEntity( this.map[this.mapLastIdx+this.mapSizeX+2+i][j], this.mapSizeX+i, j );
                        if ( newEntity[j] && typeof createCB !== 'undefined' ) {
                            createCB.call(this, newEntity[j].type, i, j);
                        }
                    }
                    this.entities.push( newEntity );
                }
                // 변경이 필요없는 경우, 현재 이후의 열(column)은 체크하지 않아도 됨
                else {
                    break;
                }
            }

            // 사라진 부분을 제거
            this.entities.splice( 0, i );

            // 모든 타일의 위치 재조정
            var shift = Math.round((this.crntIdx-this.mapCrntIdx)*this.entitySizeX);
            for ( i=0, iLen=this.mapSizeX + 2 ; i<iLen ; i++) {
                for ( j=0, jLen=this.mapSizeY ; j<jLen ; j++ ) {
                    if ( this.entities[i][j] ){
                        this.entities[i][j].x = this.entitySizeX*i - shift;
                    }
                }
            }

            // // 충돌 및 추락하는 경우 체크
            this.jumper.checkCollision();
            this.jumper.checkDrop();
        }
        // 맵이 끝까지 간 경우
        else {
            if ( typeof endCB !== 'undefined' ) {
                endCB.call( endCtx );
            }
        }

        this.lastIdx = this.crntIdx;
        this.mapLastIdx = this.mapCrntIdx;
    };

    /**
     * 멥의 유닛들(hinderArray)과 충돌하는지 체크한다.
     * @return {Boolean}  충돌이 있으면 true를 리턴한다.
     */
    Platform.prototype.isCollision = function( nx, ny, nw, nh ){
        var i, j, iLen, jLen,
            gx, gy, gw, gh;

        i = Math.floor( nx / this.entitySizeX );
        iLen = i + Math.ceil( nw / this.entitySizeX );

        j = Math.floor( ny / this.entitySizeY );
        jLen = j + Math.ceil( nh / this.entitySizeY );

        for ( ; i<=iLen ; i++) {
            for ( ; j<=jLen ; j++) {
                if ( this.entities[i][j] && this.entities[i][j].type in this.hinderObj ){
                    gx = this.entities[i][j].x;
                    gy = this.entities[i][j].y;
                    gw = this.entities[i][j].width;
                    gh = this.entities[i][j].height;

                    // 충돌
                    if (  !((nx+nw < gx) || (gx+gw <nx) || (ny+nh <= gy) || (gy+gh <= ny)) ){
                        return true;
                    }
                }
            }
        }

        return false;
    };

    /**
     * 멥의 유닛들(hinderArray)과 충돌하는지 체크한다.
     * @return {Boolean}  충돌이 있으면 true를 리턴한다.
     */
    Platform.prototype.isCollision = function( nx, ny, nw, nh ){
        var i, j, iLen, jLen,
            gx, gy, gw, gh;

        i = Math.floor( nx / this.entitySizeX );
        iLen = i + Math.ceil( nw / this.entitySizeX );

        j = Math.floor( ny / this.entitySizeY );
        jLen = j + Math.ceil( nh / this.entitySizeY );

        for ( ; i<=iLen ; i++) {
            for ( ; j<=jLen ; j++) {
                if ( this.entities[i][j] ) {
                    gx = this.entities[i][j].x;
                    gy = this.entities[i][j].y;
                    gw = this.entities[i][j].width;
                    gh = this.entities[i][j].height;

                    // 점수 획득
                    if (  !((nx+nw < gx) || (gx+gw <nx) || (ny+nh <= gy) || (gy+gh <= ny)) && this.entities[i][j].type === "coin"  ){
                        this.entities[i][j].destroy();
                        this.gameObject.addScore();
                        this.gameObject.addTime();
                    }
                    // 충돌
                    else if (  !((nx+nw < gx) || (gx+gw <nx) || (ny+nh <= gy) || (gy+gh <= ny)) && this.entities[i][j].type in this.hinderObj ){
                        return true;
                    }
                }
            }
        }

        return false;
    };

    /**
     * 멥의 유닛들(hinderArray)이 같은 column에 있는지 체크한다.
     * @return {Boolean}  같은 column에 있으면 true를 리턴한다.
     */
    Platform.prototype.isSameColumn = function( nx, ny, nw, nh, type ){
        var i, j, iLen, jLen;

        i = Math.floor( nx / this.entitySizeX );
        iLen = i + Math.ceil( nw / this.entitySizeX );

        for ( ; i<=iLen ; i++) {
            for ( j=0, jLen=this.mapSizeY ; j<jLen ; j++) {
                if ( this.entities[i][j] && this.entities[i][j].count !== true && this.entities[i][j].type === type ){
                    this.entities[i][j].count = true;
                    return true;
                }
            }
        }

        return false;
    };

    /**
     * 현재 ground 위에 있는지 체크한다.
     * @return {Boolean | Number} ground 위에 있으면 해당 높이를, ground에 없으면 false로 리턴한다.
     */
    Platform.prototype.isOnGround = function( nx, ny, nw, nh ){
        var position,
            i, j, iLen, jLen,
            gx, gy, gw, gh;

        i = Math.floor( nx / this.entitySizeX );
        iLen = i + Math.ceil( nx % this.entitySizeX + nw / this.entitySizeX );

        j = Math.floor( ny / this.entitySizeY );
        jLen = j + Math.ceil( ny % this.entitySizeY + nh / this.entitySizeY );

        //for ( i=0, iLen=this.mapSizeX + 2 ; i<iLen ; i++) {
        for ( ; i<=iLen ; i++) {
            for ( ; j<=jLen ; j++ ) {
                if ( this.entities[i][j] && this.entities[i][j].type in this.groundObj ) {
                    gx = this.entities[i][j].x;
                    gy = this.entities[i][j].y;
                    gw = this.entities[i][j].width;
                    gh = this.entities[i][j].height;

                    // collision
                    if (  !((nx+nw < gx) || (gx+gw <nx) || (ny+nh !== gy)) ){
                        position = gy - nh;
                        return position;
                    }
                }
            }
        }

        return false;
    };

    /**
     * Jump하여 이동할 위치를 구한다.
     * 맵에 장애물이 없으면 입력값을 그대로 리턴한다.
     */
    Platform.prototype.getJumpPosition = function( nx, ny, nw, nh ){
        var position = ny,
            i, j, iLen, jLen,
            gx, gy, gw, gh;

        i = Math.floor( nx / this.entitySizeX );
        iLen = i + Math.ceil( nw / this.entitySizeX );

        // j = Math.floor( ny / this.entitySizeY );
        // jLen = j + Math.ceil( nh / this.entitySizeY );

        for ( ; i<=iLen ; i++) {
            for ( j=0, jLen=this.mapSizeY ; j<=jLen ; j++ ) {
                if ( this.entities[i][j] && this.entities[i][j].type in this.jumpLimitObj ) {
                    gx = this.entities[i][j].x;
                    gy = this.entities[i][j].y;
                    gw = this.entities[i][j].width;
                    gh = this.entities[i][j].height;

                    // collision
                    // if (  !((nx+nw < gx) || (gx+gw < nx) || (ny+nh <= gy) || (gy+gh <= ny)) ){
                    if (  !((nx+nw < gx) || (gx+gw < nx) || (ny+nh <= gy) || (gy+gh <= ny)) && (gy<ny) ){
                        position = gy + gh;
                        return position;
                    }
                }
            }
        }

        // map boundary
        if ( ny < 0 ) {
            position = 0;
        }

        return position;
    };

    /**
     * 낙하하여 떨어지는 위치를 구한다.
     * 맵에 장애물이 없으면 입력값을 그대로 리턴한다.
     */
    Platform.prototype.getDropPosition = function( nx, ny, nw, nh ){
        var position,
            i, j, iLen, jLen,
            gx, gy, gw, gh;

        i = Math.floor( nx / this.entitySizeX );
        iLen = i + Math.ceil( nw / this.entitySizeX );

        // j = Math.floor( ny / this.entitySizeY );
        // jLen = j + Math.ceil( nh / this.entitySizeY );

        for ( ; i<=iLen ; i++) {
            for ( j=0, jLen=this.mapSizeY ; j<=jLen ; j++ ) {
                if ( this.entities[i][j] && this.entities[i][j].type in this.groundObj ) {
                    gx = this.entities[i][j].x;
                    gy = this.entities[i][j].y;
                    gw = this.entities[i][j].width;
                    gh = this.entities[i][j].height;

                    // collision
                    if (  !((nx+nw < gx) || (gx+gw <nx) || (ny+nh < gy) || (gy+gh <ny)) && (ny<gy) ){
                        position = gy - nh;
                        return position;
                    }
                }
            }
        }

        return false;
    };

    return Platform;
});