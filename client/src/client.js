PIXI.utils.skipHello();

const gameOver = (over) => {
    if (over) {
        console.log("Game over!");
        message.innerHTML = "Game Over!";
        shotZone.classList.add("hide");
        moveZone.classList.add("hide");
        resetBtn.classList.add("show");
        message.classList.add("show");
    }
}

var playerID;
var nick;
var isAlive = true;
var currentHP;

const initPlayers = (data) => {
    playerID = data.urID;
    currentHP = data.p[playerID].hp;
    //console.log(data);
    //console.log(playerID);

    for (let i = 0; i < 2; i++) {
        let cords = data.p[i].cords;
        let add = new playerController;
        add.init(cords);
        playersArr.push(add);
    }

    //console.log(playersArr);
    //playersSContainer.sortChildren();
    message.classList.remove("show");
    initPlayersNicks([data.p[0].nick, data.p[1].nick]);
    startGame();
}

var nicksArr = [];
var nicksLength = 0;
const initPlayersNicks = (nicks) => {
    nicksLength = nicks.length;
    for(let i=0;i<nicksLength;i++) {
        let textNick = new PIXI.Text(nicks[i], {
            fontFamily: 'Press Start 2P',
            fontSize: 10,
            fill: 'white',
            align: 'left'
        });

        textNick.x = playersArr[i].player.x+10;
        textNick.y = playersArr[i].player.y-60;
        textNick.anchor.x = 0.5;
        textNick.anchor.y = 1;
        app.stage.addChild(textNick);
    
        nicksArr.push(textNick);
    }
}

const movePlayersNicks = () => {
    for(let i=0;i<nicksLength;i++) {
        nicksArr[i].x = playersArr[i].player.x+10;
        nicksArr[i].y = playersArr[i].player.y-60;
    }
}




const serverRespond = (data) => {
    //console.log(data);

    //del trash
    let bulletsToDelLength = data.del[0].bullets.length;
    let enemiesToDelLength = data.del[0].enemies.length;

    //del bullets
    for (let i = 0; i < bulletsToDelLength; i++) {
        let currBulletsLength = bulletsArr.length;
        for (let j = 0; j < currBulletsLength; j++) {
            if (data.del[0].bullets[i].id == bulletsArr[j].id) {
                bulletsArr[j].bullet.visible = false;
                container.removeChild(bulletsArr[j].bullet);
                bulletsArr.splice(j, 1);
                break;
            }
        }
    }

    //del enemies
    for (let i = 0; i < enemiesToDelLength; i++) {
        let currEnemiesLength = enemyArr.length;
        for (let j = 0; j < currEnemiesLength; j++) {
            if (data.del[0].enemies[i].id == enemyArr[j].id) {
                container.removeChild(enemyArr[j].enemy);
                floorBloodContainer.addChild(enemyArr[j].enemy);
                enemyArr[j].enemy.texture = texture_blood[getRandomInt(0, 6)];
                enemyArr.splice(j, 1);
                break;
            }
        }
    }


    //move players
    for (let i = 0; i < 2; i++) {
        let cords = data.p[i].c;
        playersArr[i].movePlayer(cords);

        if (playerID != data.p[i].id) {
            playersArr[i].player.rotation = data.p[i].r;
        } else {
            if (data.p[i].hp <= 0) {
                isAlive = false;
            }
        }

        if (data.p[i].hp <= 0) {
            playersArr[i].player.rotation = 0;
            playersArr[i].player.texture = texture_tombstone;
        }
    }


    let enemiesLength = data.e.length;
    for (let i = 0; i < enemiesLength; i++) {

        let currEnemiesLength = enemyArr.length;
        let makeNewE = true;
        for (let y = 0; y < currEnemiesLength; y++) {
            if (data.e[i].id === enemyArr[y].id) {
                makeNewE = false;
                break;
            }
        }

        let cords = data.e[i].c;

        if (makeNewE) {
            let add = new enemyController;
            add.init(cords, data.e[i].id);
            enemyArr.push(add);
        } else {
            let direction = data.e[i].d;
            enemyArr[i].moveEnemy(cords, direction);
        }
    }


    //move bullets
    let bulletsLength = data.b.length;
    for (let i = 0; i < bulletsLength; i++) {

        let currBulletsLength = bulletsArr.length;
        let makeNewB = true;
        for (let y = 0; y < currBulletsLength; y++) {
            if (data.b[i].id === bulletsArr[y].id) {
                makeNewB = false;
                break;
            }
        }


        if (makeNewB) {
            let cords = data.b[i].c;
            let add = new bulletController;
            add.init(cords, data.b[i].id);
            bulletsArr.push(add);
            let shot = new buzz.sound("../audio/shot.mp3");
            shot.play();
        } else {
            let cords = data.b[i].c;
            let direction = data.b[i].d;
            bulletsArr[i].moveBullet(cords, direction);
        }
    }

    textScore.text = 'Score ' + data.score;

    //HP
    let hp = data.p[playerID].hp;
    if(currentHP!=hp) {

        let scratches = currentHP - hp;
        currentHP = hp;
        for(let i=0;i<scratches;i++) {
            let add = new scratch;
            scratchArr.push(add);
        }

        if (hp < 0) {
            hp = 0;
        }
        textHP.text = hp + "HP";
    }
}

const sock = io();
sock.on('initPlayers', initPlayers);
sock.on('gameData', serverRespond);
sock.on('gameOver', gameOver);

const nickInput = document.getElementById("nick");
const submit = document.getElementById("play");
const menu = document.getElementById("menu");
const waiting = document.getElementById("waitingForPlayer");
const playerForm = document.getElementById("playerForm");
const body = document.getElementsByTagName("body");
const usersConnected = document.getElementById("usersConnected");
const waitingAnimation = document.getElementById("waiting-animation");
const message = document.getElementById("message");
const resetBtn = document.getElementById("playAgain");
const shotZone = document.getElementById("shot");
const moveZone= document.getElementById("move");


resetBtn.addEventListener("click", () => {
    window.history.replaceState({}, null, window.location.href +"&autoplay=1");
    location.reload(false);
});


let dots = "";
let countDots = 0;
let waitingInterval = setInterval(() => {
    dots += '.';
    countDots++;

    if (countDots > 3) {
        dots = "";
        countDots = 0;
    }

    waitingAnimation.innerHTML = dots;

}, 1000);



//menu
sock.on('startGame', () => {
    console.log("Game start");
    waiting.classList.add("hide");
    playerForm.classList.remove("hide");
    clearInterval(waitingInterval);

    checkForAutoplay();

    submit.addEventListener("click", (e) => {
        e.preventDefault();

        nick = nickInput.value;

        if (nick != "") {
            sendNick();
        }
    });
});

function sendNick() {
    sock.emit('nick', nick);

    window.history.replaceState({}, null, "?nick=" + nick);

    message.innerHTML = '<div class="medium-txt">Waiting for second player...</div><div class="small-txt">If you wait longer than 30sec refresh the page to look for another player.</div>';
    message.classList.add("show");

    menu.classList.add("hide");
    body[0].classList.add("hide-overflow");
}



//users connected
sock.on('usersConnected', (data) => {
    console.log(data);
    usersConnected.innerHTML = data;
});


//ranking
const rankingEl = document.getElementById("ranking");
sock.on('ranking', (data) => {
    if (data != null) {
        let ranking = JSON.parse(data);
        let rankingLength = ranking.length;
        let node = '<th class="rank">#</th><th class="nicks">Nicks</th><th class="score">Score</th>';

        for (let i = 0; i < rankingLength; i++) {
            node += '<tr><td class="rank">' + (i + 1) + '</td><td class="nicks">' + sanitarize(ranking[i].player1) + ' & ' + sanitarize(ranking[i].player2) + '</td><td class="score">' + sanitarize(ranking[i].score) + '</td></tr>';
        }

        rankingEl.innerHTML = node;
    }
});











//PIXI init
var type = "WebGL"
if (!PIXI.utils.isWebGLSupported()) {
    type = "canvas"
}

const app = new PIXI.Application(1000, 800, {
    transparent: false,
    backgroundColor: '0x000000'
});

document.body.appendChild(app.view);

var floorBloodContainer = new PIXI.Container();
app.stage.addChild(floorBloodContainer);

var container = new PIXI.Container();
app.stage.addChild(container);

var scratchContainer = new PIXI.Container();
app.stage.addChild(scratchContainer);




var texture_hero = PIXI.Texture.from('img/hero.png');
var texture_zombie = PIXI.Texture.from('img/zombie.png');
var texture_bullet = PIXI.Texture.from('img/bullet_1.png');
var texture_tombstone = PIXI.Texture.from('img/tombstone.png');
var texture_blood = [
    PIXI.Texture.from('img/blood/b1.png'),
    PIXI.Texture.from('img/blood/b2.png'),
    PIXI.Texture.from('img/blood/b3.png'),
    PIXI.Texture.from('img/blood/b4.png'),
    PIXI.Texture.from('img/blood/b5.png'),
    PIXI.Texture.from('img/blood/b6.png'),
    PIXI.Texture.from('img/blood/b7.png')
];

var texture_scratch = [
    PIXI.Texture.from('img/scratch/s1.png'),
    PIXI.Texture.from('img/scratch/s2.png'),
    PIXI.Texture.from('img/scratch/s3.png'),
];



// Load fonts from googlefonts
window.WebFontConfig = {
    google: {
        families: ['Press Start 2P']
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
/*var playersSContainer = new SContainer();
app.stage.addChild(playersSContainer);
var FRONT = 10000;*/
var playerController = function() {
    this.player = null;

    this.init = function(cords) {
        this.player = new PIXI.Sprite(texture_hero);
        this.player.anchor.set(0.5, 0.7);
        this.player.x = cords.x;
        this.player.y = cords.y;
        //this.player.scale.set(0.3);
        this.player.visible = true;

        container.addChild(this.player);

        //playersSContainer.addChildZ(this.player, this.player.y);
    };

    this.move = function() {

        if (up.isDown || down.isDown || left.isDown || right.isDown || mouseDown || joystickPressed) {

            let data = {
                "keyboard": [],
                "shot": false,
                "r": +this.player.rotation.toFixed(2) //rotation
            };


            if (up.isDown) {
                let key = {
                    "k": 0
                }
                data.keyboard.push(key);
            }

            if (down.isDown) {
                let key = {
                    "k": 1
                }
                data.keyboard.push(key);
            }

            if (left.isDown) {
                let key = {
                    "k": 2
                }
                data.keyboard.push(key);
            }

            if (right.isDown) {
                let key = {
                    "k": 3
                }
                data.keyboard.push(key);
            }

            if (mouseDown) {
                data.shot = true;
            }

            if (joystickPressed) {
                sock.emit('joystickMove', +joystickRadian.toFixed(2));
            }


            //console.log(data);
            sock.emit('tick', data);
        }
    };

    this.rotate = function() {
        playersArr[playerID].player.rotation = rotateToPoint(app.renderer.plugins.interaction.mouse.global.x, app.renderer.plugins.interaction.mouse.global.y, playersArr[playerID].player.x, playersArr[playerID].player.y);
    };

    this.movePlayer = function(cords) {
        this.player.y = cords.y;
        this.player.x = cords.x;
    };
}

var enemyArr = [];
var enemyController = function() {
    this.enemy = null;
    this.id = 0;

    this.init = function(cords, id) {
        //console.log(cords);
        this.enemy = new PIXI.Sprite(texture_zombie);
        this.enemy.anchor.set(0.5);
        this.enemy.x = cords.x;
        this.enemy.y = cords.y;
        //this.enemy.scale.set(0.25);
        this.enemy.visible = true;
        //this.enemy.parentGroup = enemiesGroup;
        this.id = id;
        container.addChild(this.enemy);
    };

    this.moveEnemy = function(cords, direction) {
        this.enemy.y = cords.y;
        this.enemy.x = cords.x;

        this.enemy.rotation = -direction - Math.PI / 2;
    };
}


var bulletsArr = [];
var bulletController = function() {
    this.bullet = null;
    this.id = 0;

    this.init = function(cords, id) {
        //console.log(cords);
        this.bullet = new PIXI.Sprite(texture_bullet);
        this.bullet.anchor.set(0.5, 0.5);
        this.bullet.x = cords.x;
        this.bullet.y = cords.y;
        this.bullet.visible = false;
        this.id = id;
        container.addChild(this.bullet);
    };

    this.moveBullet = function(cords, direction) {
        this.bullet.y = cords.y;
        this.bullet.x = cords.x;
        this.bullet.visible = true;
        this.bullet.rotation = direction + 1.6;
    };
}

var scratchArr = [];
var scratch = function() {
    console.log("-hp");
    this.scratch = new PIXI.Sprite(texture_scratch[getRandomInt(0,3)]);
    this.scratch.anchor.set(0.5);
    this.scratch.x = getRandomInt(200,900);
    this.scratch.y = getRandomInt(200,700);
    this.scratch.rotation = getRandomInt(0,6);
    this.scratch.visible = true;
    scratchContainer.addChild(this.scratch);

    this.vanish = function(delta) {
        this.scratch.alpha -= 0.01 * delta;

        if(this.scratch.alpha <= 0) {
            this.scratch.visible = false;
            scratchContainer.removeChild(this.scratch.alpha);
            //bulletsArr.splice(j, 1);
        }
    }
}

var joystickRadian = 0;
var joystickPressed = false;
var mouseDown = 0;
const startGame = function() {

    //check if mobile, if yes display joysticks
    if (isMobile) {
        document.body.requestFullscreen();

        console.log("Joysticks enabled");
        joystickShot = nipplejs.create({
            zone: document.getElementById('shot'),
            mode: 'semi',
            color: 'blue',
            size:65,
            catchDistance: 100
            //multitouch: false
        });

        joystickShot.on('move', function (evt, data) {
            playersArr[playerID].player.rotation = 6.3 - data.angle.radian;
        });



        joystickMove = nipplejs.create({
            zone: document.getElementById('move'),
            mode: 'semi',
            color: 'red',
            size:65,
            catchDistance: 100
            //multitouch: false
        });


        joystickMove.on('start', (evt, data) => {

            joystickPressed = true;

        }).on('end', (evt, data) => {

            joystickPressed = false;

        }).on('move', (evt, data) => {

            joystickRadian = 6.3 - data.angle.radian;

        });
    } else {
        shotZone.classList.add("hide");
        moveZone.classList.add("hide");
    }



    app.stage.interactive = true;

    console.log("start");

    //click events - shot
    document.onpointerdown = () => {
        ++mouseDown;
    }
    document.onpointerup = () => {
        --mouseDown;
    }

    app.ticker.add((delta) => {
        if (isAlive) {
            playersArr[playerID].move();
            movePlayersNicks();

            if (!isMobile) {
                playersArr[playerID].rotate();
            }
        }

        let scratchesLength = scratchArr.length;  
        for(let i=0;i<scratchesLength;i++) {
            scratchArr[i].vanish(delta);
        }
    });
}



function rotateToPoint(mx, my, px, py) {
    var dist_Y = my - py;
    var dist_X = mx - px;
    var angle = Math.atan2(dist_Y, dist_X);
    //var degrees = angle * 180/ Math.PI;
    return angle;
    //return degrees;
}



// ŚRODEK EKRANU
//container.x = (app.renderer.width - container.width) / 2;
//container.y = (app.renderer.height - container.height) / 2;


function detectmob() {
    var check = false;
    (function (a) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};

var isMobile = detectmob();






function getAllUrlParams(url) {

    // get query string from url (optional) or window
    var queryString = url ? url.split('?')[1] : window.location.search.slice(1);

    // we'll store the parameters here
    var obj = {};

    // if query string exists
    if (queryString) {

        // stuff after # is not part of query string, so get rid of it
        queryString = queryString.split('#')[0];

        // split our query string into its component parts
        var arr = queryString.split('&');

        for (var i = 0; i < arr.length; i++) {
            // separate the keys and the values
            var a = arr[i].split('=');

            // set parameter name and value (use 'true' if empty)
            var paramName = a[0];
            var paramValue = typeof (a[1]) === 'undefined' ? true : a[1];

            // (optional) keep case consistent
            paramName = paramName.toLowerCase();
            if (typeof paramValue === 'string') paramValue = paramValue.toLowerCase();

            // if the paramName ends with square brackets, e.g. colors[] or colors[2]
            if (paramName.match(/\[(\d+)?\]$/)) {

                // create key if it doesn't exist
                var key = paramName.replace(/\[(\d+)?\]/, '');
                if (!obj[key]) obj[key] = [];

                // if it's an indexed array e.g. colors[2]
                if (paramName.match(/\[\d+\]$/)) {
                    // get the index value and add the entry at the appropriate position
                    var index = /\[(\d+)\]/.exec(paramName)[1];
                    obj[key][index] = paramValue;
                } else {
                    // otherwise add the value to the end of the array
                    obj[key].push(paramValue);
                }
            } else {
                // we're dealing with a string
                if (!obj[paramName]) {
                    // if it doesn't exist, create property
                    obj[paramName] = paramValue;
                } else if (obj[paramName] && typeof obj[paramName] === 'string') {
                    // if property does exist and it's a string, convert it to an array
                    obj[paramName] = [obj[paramName]];
                    obj[paramName].push(paramValue);
                } else {
                    // otherwise add the property
                    obj[paramName].push(paramValue);
                }
            }
        }
    }

    return obj;
}

let nickFromURL = getAllUrlParams().nick;
if(nickFromURL!=undefined&&nickFromURL) {
    nickInput.value = nickFromURL;
    nick = nickFromURL;
}

function checkForAutoplay() {
    let autoplay = getAllUrlParams().autoplay;
    if(autoplay!=undefined&&autoplay==1) {
        sendNick();
    }
}


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sanitarize(string) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        "/": '&#x2F;',
        "`": '&grave;',
    };
    const reg = /[&<>"'/]/ig;
    return string.replace(reg, (match)=>(map[match]));
}



/*var uint8array = new TextEncoder().encode("Hello world!Hello world!Hello world!Hello world!Hello world!Hello world!Hello world!Hello world!Hello world!Hello world!Hello world!Hello world!Hello world!Hello world!Hello world!Hello world!");
console.log(uint8array);*/



//string to binary
/*strToAB = str =>
new Uint8Array(str.split('')
    .map(c => c.charCodeAt(0))).buffer;

//binary to string
ABToStr = ab => 
new Uint8Array(ab).reduce((p, c) =>
p + String.fromCharCode(c), '');

console.log(ABToStr(strToAB({test:"test"})));*/
//console.log(strToAB('hello world!'));