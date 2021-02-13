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


//agent
function agent(opt, world) {
    this.car = new car(world, {})
    this.options = opt

    this.world = world
    this.frequency = 15
    this.reward = 0
    this.rewardBonus = 0
    this.loaded = false

    this.loss = 0
    this.timer = 0
    this.timerFrequency = 60 / this.frequency

    if (this.options.dynamicallyLoaded !== true) {
        this.init(null, null)
    }

    this.car.onContact = (speed) => {
        this.rewardBonus -= Math.max(speed, 50.0)
    };

};

agent.prototype.init = function (actor, critic) {
    var actions = 2
    var temporal = 1
    var states = this.car.states

    var input = window.neurojs.Agent.getInputDimension(states, actions, temporal)

    this.brain = new window.neurojs.Agent({

        actor: actor,
        critic: critic,

        states: states,
        actions: actions,

        algorithm: 'ddpg',

        temporalWindow: temporal,

        discount: 0.95,

        experience: 75e3,
        learningPerTick: 40,
        startLearningAt: 900,

        theta: 0.05, // progressive copy

        alpha: 0.1 // advantage learning

    })

    this.world.brains.shared.add('actor', this.brain.algorithm.actor)
    this.world.brains.shared.add('critic', this.brain.algorithm.critic)

    this.actions = actions
    this.car.addToWorld()
    this.loaded = true
};

agent.prototype.step = function (dt) {
    if (!this.loaded) {
        return
    }

    this.timer++

    if (this.timer % this.timerFrequency === 0) {
        var d = this.car.updateSensors()
        var vel = this.car.chassisBody.velocity
        var speed = this.car.speed.velocity

        this.reward = Math.pow(vel[1], 2) - 0.1 * Math.pow(vel[0], 2) - this.car.contact * 10 - this.car.impact * 20

        if (Math.abs(speed) < 1e-2) { // punish no movement; it harms exploration
            this.reward -= 1.0
        }

        this.loss = this.brain.learn(this.reward)
        this.action = this.brain.policy(d)

        this.rewardBonus = 0.0
        this.car.impact = 0
    }

    if (this.action) {
        this.car.handle(this.action[0], this.action[1])
    }

    return this.timer % this.timerFrequency === 0
};

agent.prototype.draw = function (context) {
};

module.exports = agent;