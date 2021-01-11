var isShiftPressed = false;
var onKeyDown = function (event) {
    switch (event.keyCode) {
        case 16:
            isShiftPressed = true;
            break;
    }
};
var onKeyUp = function (event) {
    switch (event.keyCode) {
        case 16:
            isShiftPressed = false;
            break;
    }
};

document.addEventListener('keydown', onKeyDown, false);
document.addEventListener('keyup', onKeyUp, false);