function keyboard(keyCode) {
    var key={};
    key.code=keyCode;
    key.isDown=false;
    key.isUp=true;
    key.press=undefined;
    key.release=undefined;

    key.downHandler=function(event) {
        if(event.keyCode===key.code) {
            if(key.isUp&&key.press) key.press();
            key.isDown=true;
            key.isUp=false;
        }
        event.preventDefault();
    }

    key.upHandler=function(event) {
        if(event.keyCode===key.code) {
            if(key.isDown&&key.release) key.release();
            key.isDown=false;
            key.isUp=true;
        }
        event.preventDefault();
    }

    window.addEventListener(
        "keydown",key.downHandler.bind(key),false
    );
    window.addEventListener(
        "keyup",key.upHandler.bind(key),false
    );

    return key;
}

var left=keyboard(37),
    up=keyboard(38),
    right=keyboard(39),
    down=keyboard(40),
    spacja=keyboard(32);
