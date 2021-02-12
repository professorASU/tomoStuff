var ant = {
    createNewHole: function (mode, x, y) {
        if (mode == 0) {
            var prespos = [];

            prespos.push(getRandomInt(dimensions[0]) - 1);
            prespos.push(getRandomInt(dimensions[1]) - 1)

            this.hole.push({ id: this.hole.length, posx: prespos[0], posy: prespos[1], hp: 2000, ants: 0, mode: 0 }); //modes: 0=invincible, 1=survival
        }
    },
    updateHole: function () {
        for (u = 0; u < this.hole.length; u++) {
            if (this.hole[u].mode == 0) {
                if (this.hole[u].ants == 0) {
                    for (o = 0; o < 2; o++) {
                        this.createNewAnt(this.hole[u].id);
                        this.hole[u].ants += 1;
                    }
                }
            }
        }
    },

    hole: [],
    ants: [],

    createNewAnt: function (holeid) {
        this.ants.push({ hid: holeid, uid: this.ants.length, posx: this.hole[holeid].posx, posy: this.hole[holeid].posy, hp: 100, foodH: 0 });
    }

}

// sim global values
var map = []; //map data of "100" is 0m above sea level
var mapRendering = false;
var renderKey = false; //render loop break boolean
var dimensions = [300, 300];
var frameCount = 0;
var plantcycle = 0;

//dom element
var c = document.getElementById("simArea");
var ctx = c.getContext("2d");

//color codes below:
// the ant hole: #4f4f4f
// the ants: #000
// the plants(food): #5b7f28 (amount defined with alpha, stacks spread)

window.onload = function () {
    console.log("start sim init");
    init();
}

//fill world with water, show height (altitude) by opacity(alpha), if ant position altitude low, hp goes down by drowning
function init() {
    terrainGeneration(0);

    //initiate spawn data arrays
    initMapArrayData();

    renderKey = true;
    animate();
}

function animate() {

    //animate function with no terrain below; terrainGeneration mode 0
    if (mapRendering == false) {
        if (frameCount == 0) {
            //fill sand
            ctx.fillStyle = "#b1a774";
            ctx.fillRect(0, 0, 300, 300);
        }
    }

    //update plantmap
    for (i = 0; i < plantmap.length; i++) {
        if (plantmap[i] != 0) {
            ctx.fillStyle = "#5b7f28";
            ctx.fillRect((i / dimensions[0]), (i % dimensions[0]), 300 / dimensions[0], 300 / dimensions[1]);
        }
    }

    //render ant holes 
    for (i = 0; i < ant.hole.length; i++) {
        var xreso = 300 / dimensions[0];
        var yreso = 300 / dimensions[1];
        var xpos = ant.hole[i].posx * xreso;
        var ypos = ant.hole[i].posy * yreso;
        ctx.fillStyle = "#474747";
        ctx.fillRect(xpos, ypos, xreso, yreso);
    }

    //ant hole action
    ant.updateHole();

    //ant action


    //render ants
    for (i = 0; i < ant.ants.length; i++) {
        var xreso = 300 / dimensions[0];
        var yreso = 300 / dimensions[1];
        var xpos = ant.ants[i].posx * xreso;
        var ypos = ant.ants[i].posy * yreso;
        ctx.fillStyle = "#000";
        ctx.fillRect(xpos, ypos, xreso, yreso);
    }

    if (renderKey == true) {
        setTimeout(function () {
            frameCount += 1;
            animate()
        }, 100)
    }
}

function initMapArrayData() {
    for (i = 0; i < dimensions[0] * dimensions[1]; i++) {
        plantmap.push(0);
        nuplantmap.push(0);
    }
}

//plants(food)
//0~10, spread from four
var plantmap = [];
var nuplantmap = [];
function seed(amount) {
    //plant a seed on random area
    for (i = 0; i < amount; i++) {
        var randseedpos = getRandomInt(dimensions[0] * dimensions[1]) - 1;
        console.log(randseedpos);
        plantmap[randseedpos] = 1;
    }
    nuplantmap = plantmap;
}

//ants
antmap = [];


// terrain stuff, probs gonna work on this after im done with coding rl fundamentals and ants module

function terrainGeneration(mode) {
    if (mode == 0) {
        for (i = 0; i < dimensions[0] * dimensions[1]; i++) {
            map.push(100);
        }
        mapRendering = false;
    } else {
        //create random mountain points
        mapRendering = true;
    }

}

//terrain rendering
function terrainRender() {
    //render water

    //render sand with alt alpha

}

//cast chadow on terrain render
function castShadow() {

}


//dom element code
function plantBtn() {
    console.log("planted");
    amountofseed = document.getElementById("seedNumber").value;

    seed(amountofseed);
    document.getElementById("seedNumber").value = "";
}


//utils
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}