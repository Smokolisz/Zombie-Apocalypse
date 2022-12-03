PIXI.utils.skipHello();

const gameOver = (over) => {
    if(over) {
        console.log("Game over!");
        document.getElementById("gameOver").classList.add("game-over-show");
    }
}

var playerID;
var isAlive=true;

const initPlayers = (data) => {
    playerID = data.urID;
    //console.log(data);
    //console.log(playerID);

    for(let i=0;i<2;i++) {
        let cords = data.p[i].cords;
        let add = new playerController;
        add.init(cords);
        add.parentGroup = playersGroup;
        playersArr.push(add);
    }
    
    //console.log(playersArr);
    startGame();
}



const serverRespond = (data) => {
    //console.log(data);


    //del trash
    let bulletsToDelLength = data.del[0].bullets.length;
    let enemiesToDelLength = data.del[0].enemies.length;

    //del bullets
    for(let i=0;i<bulletsToDelLength;i++) {
        let currBulletsLength = bulletsArr.length;
        for(let j=0;j<currBulletsLength;j++) {
            if(data.del[0].bullets[i].id==bulletsArr[j].id) {
                bulletsArr[j].bullet.visible = false;
                container.removeChild(bulletsArr[j].bullet);
                bulletsArr.splice(j, 1);
                break;
            }
        }
    }

    //del enemies
    for(let i=0;i<enemiesToDelLength;i++) {
        let currEnemiesLength = enemyArr.length;
        for(let j=0;j<currEnemiesLength;j++) {
            if(data.del[0].enemies[i].id==enemyArr[j].id) {
                //enemyArr[j].enemy.visible = false;
                //container.removeChild(enemyArr[j].enemy);
                enemyArr[j].enemy.setTexture(texture_blood[getRandomInt(0,6)]);
                console.log(texture_blood);
                //enemyArr[j].enemy.setTexture(texture_hero);
                enemyArr.splice(j, 1);
                break;
            }
        }
    }




    //move players
    for(let i=0;i<2;i++) {
        let cords = data.p[i].cords;
        playersArr[i].movePlayer(cords);

        if(playerID != data.p[i].id) {
            playersArr[i].player.rotation = data.p[i].rotation;
        } else {
            if(data.p[i].hp<=0) {
                isAlive = false;
            }
        }

        if(data.p[i].hp<=0) {
            playersArr[i].player.rotation=0;
            playersArr[i].player.setTexture(texture_tombstone);
        }
    }


    let enemiesLength = data.e.length;
    for(let i=0;i<enemiesLength;i++) {

        let currEnemiesLength = enemyArr.length;
        let makeNewE = true;
        for(let y=0;y<currEnemiesLength;y++) {
            if(data.e[i].id===enemyArr[y].id) {
                makeNewE = false;
                break;
            }
        }


        if(makeNewE) {
            let cords = data.e[i].cords;
            let add = new enemyController;
            add.init(cords, data.e[i].id);
            add.parentGroup = enemiesGroup;
            enemyArr.push(add);
        } else {
            let cords = data.e[i].cords;
            let direction = data.e[i].direction;
            enemyArr[i].moveEnemy(cords, direction);
        }
    }


    //move bullets
    let bulletsLength = data.b.length;
    for(let i=0;i<bulletsLength;i++) {

        let currBulletsLength = bulletsArr.length;
        let makeNewB = true;
        for(let y=0;y<currBulletsLength;y++) {
            if(data.b[i].id===bulletsArr[y].id) {
                makeNewB = false;
                break;
            }
        }


        if(makeNewB) {
            let cords = data.b[i].cords;
            let add = new bulletController;
            add.init(cords, data.b[i].id);
            bulletsArr.push(add);
        } else {
            let cords = data.b[i].cords;
            let direction = data.b[i].direction;
            bulletsArr[i].moveBullet(cords, direction);
        }
    }

    textScore.text = 'Score ' + data.score;

    let hp = data.p[playerID].hp;
    if(hp<0) {hp=0;}
    textHP.text = hp+"HP";
}

const sock = io();
sock.on('initPlayers', initPlayers);
sock.on('gameData', serverRespond);
sock.on('gameOver', gameOver);






function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}



//PIXI init
var type = "WebGL"
if (!PIXI.utils.isWebGLSupported()) {
    type = "canvas"
}

const app=new PIXI.Application(1000,800,{
    transparent:false,
    backgroundColor:'0x000000'
});

document.body.appendChild(app.view);

/*var layer = new PIXI.display.Layer();
app.stage.addChild(layer);*/


//test
var enemiesGroup = new PIXI.display.Group(0, true);
enemiesGroup.on('sort', function(sprite) {
    // green bunnies go down
    //sprite.zOrder = -sprite.y;
    sprite.zOrder = -9999;
});

var playersGroup = new PIXI.display.Group(1, function(sprite) {
    // blue bunnies go up
    sprite.zOrder = 9999;
});

app.stage = new PIXI.display.Stage();
app.stage.group.enableSort = true;

app.stage.addChild(new PIXI.display.Layer(enemiesGroup));
app.stage.addChild(new PIXI.display.Layer(playersGroup));


//test end

var container = new PIXI.Container();
app.stage.addChild(container);




var texture_hero = PIXI.Texture.fromImage('img/hero.png');
var texture_zombie = PIXI.Texture.fromImage('img/zombie.png');
var texture_bullet = PIXI.Texture.fromImage('img/bullet_1.png');
var texture_tombstone = PIXI.Texture.fromImage('img/tombstone.png');
var texture_blood = [
    PIXI.Texture.fromImage('img/blood/b1.png'),
    PIXI.Texture.fromImage('img/blood/b2.png'),
    PIXI.Texture.fromImage('img/blood/b3.png'),
    PIXI.Texture.fromImage('img/blood/b4.png'),
    PIXI.Texture.fromImage('img/blood/b5.png'),
    PIXI.Texture.fromImage('img/blood/b6.png'),
    PIXI.Texture.fromImage('img/blood/b7.png')
];


/*PIXI.loader
    .add('examples/assets/spritesheet/fighter.json')
    .load(onAssetsLoaded);


    function onAssetsLoaded() {}*/



// Load fonts from googlefonts
window.WebFontConfig = {
    google: {
        families: ['Snippet', 'Press Start 2P', 'Arvo:700italic', 'Podkova:700']
    }
};

(function () {
    var wf = document.createElement('script');
    wf.src = ('https:' === document.location.protocol ? 'https' : 'http') +
        '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
    wf.type = 'text/javascript';
    wf.async = 'true';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(wf, s);
})();

var textScore = new PIXI.Text('Score: ', {
    fontFamily: 'Press Start 2P',
    fontSize: 18,
    fill: 'white',
    align: 'left'
});

textScore.x = 20;
textScore.y = 30;
textScore.anchor.x = 0;
app.stage.addChild(textScore);


var textHP = new PIXI.Text('HP: ', {
    fontFamily: 'Press Start 2P',
    fontSize: 18,
    fill: 'white',
    align: 'left'
});

textHP.x = 20;
textHP.y = 60;
textHP.anchor.x = 0;
app.stage.addChild(textHP);
//^^^^^^^


var playersArr = [];
var playerController = function() {
    this.player = null;

    this.init = function (cords) {
        //console.log(cords);
        this.player = new PIXI.Sprite(texture_hero);
        this.player.anchor.set(0.5,0.7);
        this.player.x = cords.x;
        this.player.y = cords.y;
        //this.player.scale.set(0.3);
        this.player.visible = true;
        container.addChild(this.player);
    };

    this.move = function (i,delta) {

        if(up.isDown||down.isDown||left.isDown||right.isDown||mouseDown) {

            let data = {
                "keyboard": [],
                "shot": false,
                "rotation": this.player.rotation
            };


            if(up.isDown) {
                let key = {"key":0}
                data.keyboard.push(key);
            }
    
            if(down.isDown) {
                let key = {"key":1}
                data.keyboard.push(key);
            }
    
            if(left.isDown) {
                let key = {"key":2}
                data.keyboard.push(key);
            }
    
            if(right.isDown) {
                let key = {"key":3}
                data.keyboard.push(key);
            }

            if(mouseDown) {
                data.shot = true;
            }

            //console.log(data);
            sock.emit('tick', data);
        }
    };

    this.shot = function() {
        console.log("shot!");
    }

    this.rotate = function() {
        playersArr[playerID].player.rotation = rotateToPoint(app.renderer.plugins.interaction.mouse.global.x, app.renderer.plugins.interaction.mouse.global.y, playersArr[playerID].player.x, playersArr[playerID].player.y);
    };

    this.movePlayer = function(cords) {
        this.player.y=cords.y;
        this.player.x=cords.x;
    };
}

var enemyArr = [];
var enemyController = function() {
    this.enemy = null;
    this.id = 0;

    this.init = function (cords, id) {
        //console.log(cords);
        this.enemy = new PIXI.Sprite(texture_zombie);
        this.enemy.anchor.set(0.5);
        this.enemy.x = cords.x;
        this.enemy.y = cords.y;
        //this.enemy.scale.set(0.25);
        this.enemy.visible = true;
        this.id = id;
        container.addChild(this.enemy);
    };

    this.moveEnemy = function(cords, direction) {
        this.enemy.y=cords.y;
        this.enemy.x=cords.x;

        this.enemy.rotation = -direction - Math.PI / 2;
    };
}


var bulletsArr = [];
var bulletController = function() {
    this.bullet = null;
    this.id = 0;

    this.init = function (cords, id) {
        //console.log(cords);
        this.bullet = new PIXI.Sprite(texture_bullet);
        this.bullet.anchor.set(0.5,0.5);
        this.bullet.x = cords.x;
        this.bullet.y = cords.y;
        this.bullet.visible = false; //test
        this.id = id;
        container.addChild(this.bullet);
    };

    this.moveBullet = function(cords, direction) {
        this.bullet.y=cords.y;
        this.bullet.x=cords.x;
        this.bullet.visible = true;
        this.bullet.rotation = direction+1.5;
    };

}


var mouseDown = 0;
const startGame = () => {

    app.stage.interactive = true;

    console.log("start");
    
    document.onmousedown = function() { 
    ++mouseDown;
    }
    document.onmouseup = function() {
    --mouseDown;
    }

    document.ontouchstart = function() { 
    ++mouseDown;
    }
    document.ontouchend = function() {
    --mouseDown;
    }

    app.ticker.add(function (delta) {
        if(isAlive) {
            playersArr[playerID].move();
            playersArr[playerID].rotate();
        }
    });
}



function rotateToPoint(mx, my, px, py) {  
    var dist_Y = my - py;
    var dist_X = mx - px;
    var angle = Math.atan2(dist_Y,dist_X);
    //var degrees = angle * 180/ Math.PI;
    return angle;
    //return degrees;
}

    


// ŚRODEK EKRANU
//container.x = (app.renderer.width - container.width) / 2;
//container.y = (app.renderer.height - container.height) / 2;