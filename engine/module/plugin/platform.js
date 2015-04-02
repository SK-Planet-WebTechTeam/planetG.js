/* platform.js was made for supporting platform game
 * platform game commonly needs background and map coordinate.
 * So this plugin provides common functions for platform game.
 * I am sure that this will be helpful to develop platform game easilly.
 */
define("plugin/platform",['pwge/spriteManager','pwge/boardManager','pwge/input','pwge/canvas','pwge/renderer','util/easing',"util/PubSub",'pwge/util'], function(spriteManager,boardManager,input,canvas,renderer,easing,PubSub,util ){

    // Base Object for Platform Game
    var Platform = function( game, gameObject, jumper ){
        this.game = game;
        this.gameObject = gameObject;
        this.jumper = jumper;
    };

    Platform.prototype = Object.create(PubSub.prototype);

    /**
     * Map DB reading and initializing
     */
    Platform.prototype.init = function( config ){
        var i, len;

        util.extend(this, config);

        // changing array to obj property for performance
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

        // background moving
        this.setBackGround();

        // map index initializing
        this.timeLastMatch = new Date().getTime();
        this.timeStart = this.timeLastMatch ;
        this.lastIdx = 0;
        this.crntIdx = 0;
        this.mapLastIdx = 0;
        this.mapCrntIdx = 0;

        // Map initializing
        this.entities = [];
        for ( var i=0, iLen=this.mapSizeX + 2 ; i<iLen ; i++) {
            this.entities[i] = [];
            for ( var j=0, jLen=this.mapSizeY ; j<jLen ; j++ ) {
                this.entities[i][j] = this.assignEntity( this.map[i][j], i, j );
            }
        }
    };

    /**
     * moving background
     */
    Platform.prototype.setBackGround = function() {
        // making two backgrounds, binding moving-animation
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
     * assign map tile to entity
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
     * moving all map tiles to leftside
     * ex) cookie run, flappy bird...
     */
    Platform.prototype.moveLeft = function( dt, endCtx, endCB, createCB, delCB){

        var i, j, iLen, jLen, timeCrnt;

        console.log(dt);

        timeCrnt = +new Date() - this.timeStart;
        this.crntIdx = (this.map.length - this.mapSizeX) * ( timeCrnt / this.totalTime );
        this.mapCrntIdx = Math.min( Math.floor(this.crntIdx), this.map.length-this.mapSizeX );

        // checking map end
        if ( this.mapCrntIdx < this.map.length-this.mapSizeX-2 ) {
            for ( i=0, iLen=this.mapSizeX + 2 ; i<iLen ; i++) {
                // when map tile needs reposition
                if ( this.mapLastIdx + i < this.mapCrntIdx ) {
                    // memory releasing for disappeared column of map tile
                    for ( j=0, jLen=this.mapSizeY ; j<jLen ; j++ ) {
                        if ( this.entities[i][j] ) {
                            // callback when some map tile disappear
                            if ( typeof delCB !== 'undefined' ) {
                                delCB.call(this, this.entities[i][j].type);
                            }
                            this.entities[i][j].destroy();
                        }
                    }

                    // adding new column of map tile
                    var newEntity = [];
                    for ( j=0, jLen=this.mapSizeY ; j<jLen ; j++ ) {
                        newEntity[j] = this.assignEntity( this.map[this.mapLastIdx+this.mapSizeX+2+i][j], this.mapSizeX+i, j );
                        if ( newEntity[j] && typeof createCB !== 'undefined' ) {
                            createCB.call(this, newEntity[j].type, i, j);
                        }
                    }
                    this.entities.push( newEntity );
                }
                // not needs reposition
                else {
                    break;
                }
            }

            // deleting disappeared map tiles
            this.entities.splice( 0, i );

            // reposition map tile
            var shift = Math.round((this.crntIdx-this.mapCrntIdx)*this.entitySizeX);
            for ( i=0, iLen=this.mapSizeX + 2 ; i<iLen ; i++) {
                for ( j=0, jLen=this.mapSizeY ; j<jLen ; j++ ) {
                    if ( this.entities[i][j] ){
                        this.entities[i][j].x = this.entitySizeX*i - shift;
                    }
                }
            }

            // detecting collision and drop to the ground
            this.jumper.checkCollision();
            this.jumper.checkDrop();
        }
        // end of map
        else {
            if ( typeof endCB !== 'undefined' ) {
                endCB.call( endCtx );
            }
        }

        this.lastIdx = this.crntIdx;
        this.mapLastIdx = this.mapCrntIdx;
    };

    /**
     * collision detection with some map units(= hinderArray)
     * @return {Boolean}  if collision, return true
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

                    // collision
                    if (  !((nx+nw < gx) || (gx+gw <nx) || (ny+nh <= gy) || (gy+gh <= ny)) ){
                        return true;
                    }
                }
            }
        }

        return false;
    };

    /**
     * collision detection with some map units(= hinderArray)
     * @return {Boolean}  if collision, return true
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

                    // score
                    if (  !((nx+nw < gx) || (gx+gw <nx) || (ny+nh <= gy) || (gy+gh <= ny)) && this.entities[i][j].type === "coin"  ){
                        this.entities[i][j].destroy();
                        this.gameObject.addScore();
                        this.gameObject.addTime();
                    }
                    // collision
                    else if (  !((nx+nw < gx) || (gx+gw <nx) || (ny+nh <= gy) || (gy+gh <= ny)) && this.entities[i][j].type in this.hinderObj ){
                        return true;
                    }
                }
            }
        }

        return false;
    };

    /**
     * check whether main character is located in same column with some map unit (=hinderArray) or not
     * @return {Boolean}  if same column, return true
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
     * check whether main character is on the ground or not
     * @return {Boolean | Number} if not on the ground, return false
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

                    // reposition
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
     * calculating jump-position ( checking the ceil and blocking unit )
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
     * calculating drop-position ( checking the ground and blocking unit )
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