function randf(a, b) {
    return a + Math.random() * (b - a);
}

function randi(a, b) {
    return Math.floor(Math.random() * (b - a) + a);
}

// A 2D vector utility not by me
var Vec = function (x, y) {
    this.x = x;
    this.y = y;
}
Vec.prototype = {

    // utilities
    dist_from: function (v) {
        return Math.sqrt(Math.pow(this.x - v.x, 2) + Math.pow(this.y - v.y, 2));
    },
    length: function () {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    },

    // new vector returning operations
    add: function (v) {
        return new Vec(this.x + v.x, this.y + v.y);
    },
    sub: function (v) {
        return new Vec(this.x - v.x, this.y - v.y);
    },
    rotate: function (a) { // CLOCKWISE
        return new Vec(this.x * Math.cos(a) + this.y * Math.sin(a), -this.x * Math.sin(a) + this.y * Math.cos(a));
    },

    // in place operations
    scale: function (s) {
        this.x *= s;
        this.y *= s;
    },
    normalize: function () {
        var d = this.length();
        this.scale(1.0 / d);
    }
}

// line intersection helper function: does line segment (p1,p2) intersect segment (p3,p4) ?
var line_intersect = function (p1, p2, p3, p4) {
    var denom = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);
    if (denom === 0.0) {
        return false;
    } // parallel lines
    var ua = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denom;
    var ub = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / denom;
    if (ua > 0.0 && ua < 1.0 && ub > 0.0 && ub < 1.0) {
        var up = new Vec(p1.x + ua * (p2.x - p1.x), p1.y + ua * (p2.y - p1.y));
        return { ua: ua, ub: ub, up: up }; // up is intersection point
    }
    return false;
}

var line_point_intersect = function (p1, p2, p0, rad) {
    var v = new Vec(p2.y - p1.y, -(p2.x - p1.x)); // perpendicular vector
    var d = Math.abs((p2.x - p1.x) * (p1.y - p0.y) - (p1.x - p0.x) * (p2.y - p1.y));
    d = d / v.length();
    if (d > rad) {
        return false;
    }

    v.normalize();
    v.scale(d);
    var up = p0.add(v);
    if (Math.abs(p2.x - p1.x) > Math.abs(p2.y - p1.y)) {
        var ua = (up.x - p1.x) / (p2.x - p1.x);
    } else {
        var ua = (up.y - p1.y) / (p2.y - p1.y);
    }
    if (ua > 0.0 && ua < 1.0) {
        return { ua: ua, up: up };
    }
    return false;
}

// Wall is made up of two points
var Wall = function (p1, p2) {
    this.p1 = p1;
    this.p2 = p2;
}

// World object contains many agents and walls and food and stuff
var util_add_box = function (lst, x, y, w, h) {
    lst.push(new Wall(new Vec(x, y), new Vec(x + w, y)));
    lst.push(new Wall(new Vec(x + w, y), new Vec(x + w, y + h)));
    lst.push(new Wall(new Vec(x + w, y + h), new Vec(x, y + h)));
    lst.push(new Wall(new Vec(x, y + h), new Vec(x, y)));
}

// visualizable hitbox of items (food)
var Item = function (x, y, type) {
    this.p = new Vec(x, y); // position
    this.type = type;
    this.rad = 3; // size
    this.age = 0;
    this.cleanup_ = false;
}

var World = function () {
    this.agents = [];
    this.W = canvas.width;
    this.H = canvas.height;

    this.clock = 0;

    // set up wall
    this.walls = [];
    var yohaku = 10;
    util_add_box(this.walls, yohaku, yohaku, this.W - yohaku * 2, this.H - yohaku * 2);

    // set up food and branches
    this.items = []
    for (var k = 0; k < 30; k++) {
        var x = randf(20, this.W - 20);
        var y = randf(20, this.H - 20);
        var t = randi(1, 3); // food or poison (1 and 2)
        var it = new Item(x, y, t);
        this.items.push(it);
    }
}



World.prototype = {
    // helper function to get closest colliding walls/items
    stuff_collide_: function (p1, p2, check_walls, check_items) {
        var minres = false;

        // collide with walls
        if (check_walls) {
            for (var i = 0, n = this.walls.length; i < n; i++) {
                var wall = this.walls[i];
                var res = line_intersect(p1, p2, wall.p1, wall.p2);
                if (res) {
                    res.type = 0; // 0 is wall
                    if (!minres) { minres = res; } else {
                        // check if its closer
                        if (res.ua < minres.ua) {
                            // if yes replace it
                            minres = res;
                        }
                    }
                }
            }
        }

        // collide with items
        if (check_items) {
            for (var i = 0, n = this.items.length; i < n; i++) {
                var it = this.items[i];
                var res = line_point_intersect(p1, p2, it.p, it.rad);
                if (res) {
                    res.type = it.type; // store type of item
                    if (!minres) { minres = res; } else {
                        if (res.ua < minres.ua) { minres = res; }
                    }
                }
            }
        }

        return minres;
    },
    tick: function () {
        // tick the environment
        this.clock++;

        // fix input to all agents based on environment
        // process eyes
        this.collpoints = [];
        for (var i = 0, n = this.agents.length; i < n; i++) {
            var a = this.agents[i];
            for (var ei = 0, ne = a.eyes.length; ei < ne; ei++) {
                var e = a.eyes[ei];
                // we have a line from p to p->eyep
                var eyep = new Vec(a.p.x + e.max_range * Math.sin(a.angle + e.angle),
                    a.p.y + e.max_range * Math.cos(a.angle + e.angle));
                var res = this.stuff_collide_(a.p, eyep, true, true);
                if (res) {
                    // eye collided with wall
                    e.sensed_proximity = res.up.dist_from(a.p);
                    e.sensed_type = res.type;
                } else {
                    e.sensed_proximity = e.max_range;
                    e.sensed_type = -1;
                }
            }
        }

        // let the agents behave in the world based on their input
        for (var i = 0, n = this.agents.length; i < n; i++) {
            this.agents[i].forward();
        }

        // apply outputs of agents on evironment
        for (var i = 0, n = this.agents.length; i < n; i++) {
            var a = this.agents[i];
            a.op = a.p; // back up old position
            a.oangle = a.angle; // and angle

            // steer the agent according to outputs of wheel velocities
            var v = new Vec(0, a.rad / 2.0);
            v = v.rotate(a.angle + Math.PI / 2);
            var w1p = a.p.add(v); // positions of wheel 1 and 2
            var w2p = a.p.sub(v);
            var vv = a.p.sub(w2p);
            vv = vv.rotate(-a.rot1);
            var vv2 = a.p.sub(w1p);
            vv2 = vv2.rotate(a.rot2);
            var np = w2p.add(vv);
            np.scale(0.5);
            var np2 = w1p.add(vv2);
            np2.scale(0.5);
            a.p = np.add(np2);

            a.angle -= a.rot1;
            if (a.angle < 0) a.angle += 2 * Math.PI;
            a.angle += a.rot2;
            if (a.angle > 2 * Math.PI) a.angle -= 2 * Math.PI;

            // agent is trying to move from p to op. Check walls
            var res = this.stuff_collide_(a.op, a.p, true, false);
            if (res) {
                // wall collision! reset position
                a.p = a.op;
            }

            // handle boundary conditions
            if (a.p.x < 0) a.p.x = 0;
            if (a.p.x > this.W) a.p.x = this.W;
            if (a.p.y < 0) a.p.y = 0;
            if (a.p.y > this.H) a.p.y = this.H;
        }

        // tick all items
        var update_items = false;
        for (var i = 0, n = this.items.length; i < n; i++) {
            var it = this.items[i];
            it.age += 1;

            // see if some agent gets lunch
            for (var j = 0, m = this.agents.length; j < m; j++) {
                var a = this.agents[j];
                var d = a.p.dist_from(it.p);
                if (d < it.rad + a.rad) {

                    // wait lets just make sure that this isn't through a wall
                    var rescheck = this.stuff_collide_(a.p, it.p, true, false);
                    if (!rescheck) {
                        // ding! nom nom nom
                        if (it.type === 1) a.digestion_signal += 5.0; // mmm delicious apple
                        if (it.type === 2) a.digestion_signal += -6.0; // ewww poison
                        it.cleanup_ = true;
                        update_items = true;
                        break; // break out of loop, item was consumed
                    }
                }
            }

            if (it.age > 5000 && this.clock % 100 === 0 && randf(0, 1) < 0.1) {
                it.cleanup_ = true; // replace this one, has been around too long
                update_items = true;
            }
        }
        if (update_items) {
            var nt = [];
            for (var i = 0, n = this.items.length; i < n; i++) {
                var it = this.items[i];
                if (!it.cleanup_) nt.push(it);
            }
            this.items = nt; // swap
        }
        if (this.items.length < 30 && this.clock % 10 === 0 && randf(0, 1) < 0.25) {
            var newitx = randf(20, this.W - 20);
            var newity = randf(20, this.H - 20);
            var newitt = randi(1, 3); // food or poison (1 and 2)
            var newit = new Item(newitx, newity, newitt);
            this.items.push(newit);
        }

        // agents are given the opportunity to learn based on feedback of their action on environment
        for (var i = 0, n = this.agents.length; i < n; i++) {
            this.agents[i].backward();
        }
    }
}

// Eye sensor has a maximum range and senses walls
var Eye = function (angle) {
    this.angle = angle; // angle relative to agent its on
    this.max_range = 85;
    this.sensed_proximity = 85; // what the eye is seeing. will be set in world.tick()
    this.sensed_type = -1; // what does the eye see?
}

// A single agent
var Agent = function () {

    // positional information
    this.p = new Vec(randi(50, 300), randi(50, 200)); // init position
    this.op = this.p; // old position
    this.angle = 0; // direction facing

    this.actions = [];
    this.actions.push([1, 1]);
    this.actions.push([0.8, 1]);
    this.actions.push([1, 0.8]);
    this.actions.push([0.5, 0]);
    this.actions.push([0, 0.5]);

    // properties
    this.rad = 10;
    this.eyes = [];
    for (var k = 0; k < 9; k++) { this.eyes.push(new Eye((k - 3) * 0.25)); }

    // // braaain
    // //this.brain = new deepqlearn.Brain(this.eyes.length * 3, this.actions.length);
    // var spec = document.getElementById('qspec').value;
    // eval(spec);
    // this.brain = brain;
    this.brain = window.brain;

    this.reward_bonus = 0.0;
    this.digestion_signal = 0.0;

    // outputs on world
    this.rot1 = 0.0; // rotation speed of 1st wheel
    this.rot2 = 0.0; // rotation speed of 2nd wheel

    this.prevactionix = -1;
}
Agent.prototype = {
    forward: function () {
        // in forward pass the agent simply behaves in the environment
        // create input to brain
        var num_eyes = this.eyes.length;
        var input_array = new Array(num_eyes * 3);
        for (var i = 0; i < num_eyes; i++) {
            var e = this.eyes[i];
            input_array[i * 3] = 1.0;
            input_array[i * 3 + 1] = 1.0;
            input_array[i * 3 + 2] = 1.0;
            if (e.sensed_type !== -1) {
                // sensed_type is 0 for wall, 1 for food and 2 for poison.
                // lets do a 1-of-k encoding into the input array
                input_array[i * 3 + e.sensed_type] = e.sensed_proximity / e.max_range; // normalize to [0,1]
            }
        }

        input_array.push(this.p.x / w.W, this.p.y / w.H)

        // get action
        // var actionix = this.brain.forward(input_array);
        // var actionix = 0
        var action = this.brain.policy(input_array);
        // this.actionix = actionix; //backup

        // insert demultiplex into behavior variables
        this.rot1 = action[0] * 1;
        this.rot2 = action[1] * 1;

        //this.rot1 = 0;
        //this.rot2 = 0;
    },
    backward: function () {
        // in backward pass agent learns.
        // compute reward 
        var proximity_reward = 0.0;
        var num_eyes = this.eyes.length;
        for (var i = 0; i < num_eyes; i++) {
            var e = this.eyes[i];
            // agents dont like to see walls, especially up close
            proximity_reward += e.sensed_type === 0 ? e.sensed_proximity / e.max_range : 1.0;
        }
        proximity_reward = proximity_reward / num_eyes;
        proximity_reward = Math.min(1.0, proximity_reward * 2);

        // agents like to go straight forward
        var rotation_penalty = Math.abs(this.rot1 - this.rot2) * 0.5;
        //if(proximity_reward > 0.75) forward_reward = 0.1 * proximity_reward * (1.0 - dist_perf);

        // agents like to eat good things
        var digestion_reward = this.digestion_signal;
        this.digestion_signal = 0.0;

        var reward = proximity_reward - rotation_penalty + digestion_reward;

        // pass to brain for learning
        this.brain.learn(reward);
    }
}