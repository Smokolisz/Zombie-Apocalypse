class RpsGame {
    
    constructor(p1, p2) {
        this._players = {
            "p": [
                {"sock": p1, "id":0, "speed":3, "hp":10, "rotation":0, "attackSpeed":200, "reload":true, "cords":{"x":450, "y":400}},
                {"sock": p2, "id":1, "speed":3, "hp":10, "rotation":0, "attackSpeed":200, "reload":true, "cords":{"x":550, "y":400}}
            ]
        };

        this._enemies = [];
        this._enemyID = 0;

        this._bullets = [];
        this._bulletID = 0;

        this._elToDelete = {
            "bullets": [],
            "enemies": []
        };
            

        
        this._playersLength = this._players.p.length;
        this._points = 0;

        this._gameWidth = 1000;
        this._gameHeight = 800;

        this._game = true;

        this._initPlayers();
        this._players.p.forEach((player, idx) => {
            player.sock.on('tick', (data) => {
                if(this._players.p[idx].hp>0) {
                    this._onTick(idx, data);
                }
            });
        });

        this._gameLoop();
    }

    _initPlayers() {
        this._players.p.forEach((player, playerIndex) => {
            let data = {"urID":playerIndex,"p":[]};
            for(let i=0;i<this._playersLength;i++) {
                let info = {
                    "id":this._players.p[i].id, 
                    "cords":{
                        "x":this._players.p[i].cords.x,
                        "y":this._players.p[i].cords.y
                    }
                };
                data.p.push(info);
            }

            player.sock.emit('initPlayers', data);
        });
    }

    _sendToPlayer(playerIndex, msg) {
        this._players[playerIndex].emit('message', msg);
    }

    _sendToPlayers() {
        this._players.p.forEach((player, playerIndex) => {

            let data = {"urID":playerIndex,"p":[], "e":[], "b":[], "del":[], "score":this._points};

            for(let i=0;i<this._playersLength;i++) {
                let player = {
                    "id":this._players.p[i].id,
                    "hp":this._players.p[i].hp,
                    "rotation": this._players.p[i].rotation,
                    "cords":{
                        "x":this._players.p[i].cords.x,
                        "y":this._players.p[i].cords.y
                    }
                };
                data.p.push(player);
            }


            let enemiesLength = this._enemies.length;
            for(let i=0;i<enemiesLength;i++) {
                let enemy = {
                    "id":this._enemies[i].id,
                    "speed": this._enemies[i].speed,
                    "hp": this._enemies[i].hp,
                    "cords":{
                        "x": this._enemies[i].cords.x,
                        "y": this._enemies[i].cords.y
                    },
                    "direction": this._enemies[i].direction
                };
                data.e.push(enemy);
            }

            let bulletsLength = this._bullets.length;
            for(let i=0;i<bulletsLength;i++) {
                let bullet = {
                    "id":this._bullets[i].id,
                    "cords":{
                        "x": this._bullets[i].cords.x,
                        "y": this._bullets[i].cords.y
                    },
                    "direction": this._bullets[i].direction
                };
                data.b.push(bullet);
            }

            data.del.push(this._elToDelete);
            
            player.sock.emit('gameData', data);
        });

        this._elToDelete.bullets = [];
        this._elToDelete.enemies = [];
    }

    _onTick(playerIndex, data) {
        //console.log(data);

        this._players.p[playerIndex].rotation = data.rotation;

        if(data.shot && this._players.p[playerIndex].reload) {
            this._players.p[playerIndex].reload = false;

            let _this = this;
            setTimeout(() => {
                _this._players.p[playerIndex].reload = true;
            }, this._players.p[playerIndex].attackSpeed);

            this._addBullet(this._players.p[playerIndex].cords.x, this._players.p[playerIndex].cords.y, this._players.p[playerIndex].rotation);
        }

        let keyLength = data.keyboard.length;
        for(let i=0;i<keyLength;i++) {
            let keyID = data.keyboard[i].key;

            switch(keyID) {
                case 0:
                    this._players.p[playerIndex].cords.y-=this._players.p[playerIndex].speed;
                    break;
                case 1:
                    this._players.p[playerIndex].cords.y+=this._players.p[playerIndex].speed;
                    break;
                case 2:
                    this._players.p[playerIndex].cords.x-=this._players.p[playerIndex].speed;
                    break;
                case 3:
                    this._players.p[playerIndex].cords.x+=this._players.p[playerIndex].speed;
                    break;
            }
        }
    }

    _addEnemy() {

        let x,y;

        //vertically or horizontally
        if(Math.round(Math.random())) {
            y = Math.floor(Math.random() * (900 - -100 + 1)) + -100;

            //left or right side
            if(Math.round(Math.random())) {
                x = -100;
            } else {
                x = 1100;
            }
        } else {
            x = Math.floor(Math.random() * (1100 - -100 + 1)) + -100;

            //top or bottom
            if(Math.round(Math.random())) {
                y = -100;
            } else {
                y = 900;
            }
        }
        
        let enemy = {
            "id": ++this._enemyID,
            "speed":1,
            "hp":2,
            "cords":{
                "x": x,
                "y": y
            },
            "direction":0,
            "reload":true
        };
        this._enemies.push(enemy);
    }

    _moveEnemies() {
        let enemiesLength = this._enemies.length;

        for(let i=0;i<enemiesLength;i++) {
            let distanceToPlayers = [];
            
            for(let y=0;y<this._playersLength;y++) {
                //if(this._players.p[y].hp>0) {
                    let dx = this._enemies[i].cords.x - this._players.p[y].cords.x;
                    let dy = this._enemies[i].cords.y - this._players.p[y].cords.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);

                    if(this._players.p[y].hp<0) {
                        distance = Infinity;
                    }
    
                    distanceToPlayers.push(distance);
                //}
            }


            //its not best place to check that, but idk
            let a = true;
            for(let z=0;z<this._playersLength;z++) {
                if(this._players.p[z].hp>0) {
                    a = false;
                }
            }

            if(a) {
                this._gameOver();
            }
            //^^^^


            let smallestDistance = Math.min(...distanceToPlayers);
            let playerID = distanceToPlayers.indexOf(smallestDistance);
            let distance = smallestDistance;

            if(distance > 45) {
                let ix = (this._enemies[i].cords.x - this._players.p[playerID].cords.x) / distance;
                let iy = (this._enemies[i].cords.y - this._players.p[playerID].cords.y) / distance;

                //this._enemies[i].direction = Math.PI * ix * iy * 360;
                //this._enemies[i].direction = Math.atan2(ix,iy)*180/Math.PI;
                this._enemies[i].direction = Math.atan2(ix,iy);

                this._enemies[i].cords.x -= ix * this._enemies[i].speed;
                this._enemies[i].cords.y -= iy * this._enemies[i].speed;
            } else {
                //zombie attack
                let _this = this;
                if(_this._enemies[i].reload) {
                    this._enemies[i].reload=false;
                    setTimeout(function() {
                        if(_this._enemies[i]!=null) {
                            let dx = _this._enemies[i].cords.x - _this._players.p[playerID].cords.x;
                            let dy = _this._enemies[i].cords.y - _this._players.p[playerID].cords.y;
                            let newDistance = Math.sqrt(dx * dx + dy * dy);
        
                            if(newDistance < 50) {
                                _this._players.p[playerID].hp--;
                            }
                        }
                        _this._enemies[i].reload=true;
                    }, 300);
                }
                
            }
            

            //kolizja zombie z innymi zombie
            for(let j=0;j<enemiesLength;j++) {
                let dx = this._enemies[i].cords.x - this._enemies[j].cords.x;
                let dy = this._enemies[i].cords.y - this._enemies[j].cords.y;
                let enemyDis = Math.sqrt(dx * dx + dy * dy);

                //console.log(enemyDis);

                if(enemyDis < 30&&enemyDis>0) {
                    let ix = (this._enemies[i].cords.x - this._enemies[j].cords.x) / enemyDis; 
                    let iy = (this._enemies[i].cords.y - this._enemies[j].cords.y) / enemyDis;

                    this._enemies[j].cords.x -= ix * this._enemies[j].speed;
                    this._enemies[j].cords.y -= iy * this._enemies[j].speed;
                }
            }

            /*if(this._players.p[playerID].cords.y>this._enemies[i].cords.y) {
                this._enemies[i].cords.y+=this._enemies[i].speed;
            } else if(this._players.p[playerID].cords.y<this._enemies[i].cords.y) {
                this._enemies[i].cords.y-=this._enemies[i].speed;
            }

            if(this._players.p[playerID].cords.x>this._enemies[i].cords.x) {
                this._enemies[i].cords.x+=this._enemies[i].speed;
            } else if (this._players.p[playerID].cords.x<this._enemies[i].cords.x) {
                this._enemies[i].cords.x-=this._enemies[i].speed;
            }*/
        }
    }

    _addBullet(x,y, rotation) {
        let bullet = {
            "id": ++this._bulletID,
            "speed":20,
            "cords":{
                "x": x,
                "y": y
            },
            "direction": rotation
        };
        this._bullets.push(bullet);
    }

    _moveBullets() {

        bulletLoop:
        for(let i=0;i<this._bullets.length;i++) {

            this._bullets[i].cords.x += Math.cos(this._bullets[i].direction)*this._bullets[i].speed;
            this._bullets[i].cords.y += Math.sin(this._bullets[i].direction)*this._bullets[i].speed;

            //Zombie hit
            for(let j=0;j<this._enemies.length;j++) {
                let dx = this._enemies[j].cords.x - this._bullets[i].cords.x;
                let dy = this._enemies[j].cords.y - this._bullets[i].cords.y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                
                if(distance < 30) {
                    this._enemies[j].hp--;

                    if(this._enemies[j].hp<=0) {
                        this._points+=7;

                        let del = {"id": this._enemies[j].id};
                        this._elToDelete.enemies.push(del);

                        this._enemies.splice(j, 1);
                    }

                    let del = {"id": this._bullets[i].id};
                    this._elToDelete.bullets.push(del);

                    this._bullets.splice(i, 1);
                    continue bulletLoop;
                }
            }

            //Out of map
            if(this._bullets[i].cords.x<-10||this._bullets[i].cords.x>this._gameWidth||this._bullets[i].cords.y<-10||this._bullets[i].cords.y>this._gameHeight) {

                //console.log(this._elToDelete);
                
                let del = {"id": this._bullets[i].id};
                this._elToDelete.bullets.push(del);

                this._bullets.splice(i, 1);
                continue;
            }


            //let ix = (this._enemies[i].cords.x - this._players.p[playerID].cords.x) / distance;
            //let iy = (this._enemies[i].cords.y - this._players.p[playerID].cords.y) / distance;

            //this._enemies[i].direction = Math.atan2(ix,iy);

            //this._enemies[i].cords.x -= ix * this._enemies[i].speed;
            //this._enemies[i].cords.y -= iy * this._enemies[i].speed;

            //this._bullets[i].cords.y+=this._bullets[i].speed;
        }
    }

    _gameLoop() {

        let _this = this;

        setInterval(function() {
            if(_this._game) {
                _this._moveEnemies();
                _this._moveBullets();
                _this._sendToPlayers();
            }
        },16);


        var interval;
        var duration = 500;
        function appear() {
            if(duration>70) {
                duration -= 3;
            }
            
            //console.log(duration);
            _this._addEnemy();
            interval = setInterval(function () {
                clearInterval(interval); //clear
                if(_this._game) {
                    appear(); //re-run
                }
            }, duration);
        }

        appear();
    }
    
    _gameOver() {
        this._game = false;
        this._players.p.forEach((player) => {
            player.sock.emit('gameOver', 1);
        });
    }
}

module.exports = RpsGame;