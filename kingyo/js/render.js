var canvas, ctx;

//sprite loads
var headSprite = new Image();
headSprite.src = "./assets/parts/head.png";

var bodySprite = new Image();
bodySprite.src = "./assets/parts/body.png"

var tailRootSprite = new Image();
tailRootSprite.src = "./assets/parts/tailRoot.png"

var tailSprite = new Image();
tailSprite.src = "./assets/parts/tail.png"

var finLSprite = new Image();
finLSprite.src = "./assets/parts/finL.png";

var finRSprite = new Image();
finRSprite.src = "./assets/parts/finR.png";

var smallFinLSprite = new Image();
smallFinLSprite.src = "./assets/parts/smallFinL.png";

var smallFinRSprite = new Image();
smallFinRSprite.src = "./assets/parts/smallFinR.png";

var woodbck = new Image();
woodbck.src = "./assets/effects/wood.png";

var effectlyr = new Image();
effectlyr.src = "./assets/effects/layer.png";

var branchOneSprite = new Image();
branchOneSprite.src = "./assets/misc/cutleaf01.png";

// render
var spriteAngles = [0, 0, 0, 0, 0];
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //draw background
    ctx.drawImage(woodbck, 10, 10, 330, 230);


    ctx.lineWidth = 1;
    var agents = w.agents;

    // draw walls in environment
    ctx.strokeStyle = "rgb(0,0,0)";
    ctx.beginPath();
    for (var i = 0, n = w.walls.length; i < n; i++) {
        var q = w.walls[i];
        ctx.moveTo(q.p1.x, q.p1.y);
        ctx.lineTo(q.p2.x, q.p2.y);
    }
    ctx.stroke();

    // draw agents
    // color agent based on reward it is experiencing at the moment
    var r = Math.floor( /* agents[0].brain.latest_reward */ 0 * 200);
    if (r > 255) r = 255;
    if (r < 0) r = 0;
    ctx.fillStyle = "#444";
    ctx.strokeStyle = "rgb(0,0,0)";

    // draw items
    ctx.strokeStyle = "rgba(0,0,0,0)";
    for (var i = 0, n = w.items.length; i < n; i++) {
        var it = w.items[i];
        if (it.type === 1) {
            ctx.fillStyle = "rgb(255, 150, 150)";
            ctx.beginPath();
            ctx.arc(it.p.x, it.p.y, it.rad, 0, Math.PI * 2, true);
            ctx.fill();
            ctx.stroke();
        }
        if (it.type === 2) {
            ctx.fillStyle = "#ad8439"
            ctx.drawImage(branchOneSprite, it.p.x - 12, it.p.y - 24, 25, 25);
        };
    }

    for (var i = 0, n = agents.length; i < n; i++) {
        var a = agents[i];

        // draw sight
        for (var ei = 0, ne = a.eyes.length; ei < ne; ei++) {
            var e = a.eyes[ei];
            var sr = e.sensed_proximity;
            if (e.sensed_type === -1 || e.sensed_type === 0) {
                ctx.strokeStyle = "rgba(0,0,0,0)"; // wall or nothing
            }
            if (e.sensed_type === 1) { ctx.strokeStyle = "rgb(255,150,150)"; } // apples
            if (e.sensed_type === 2) { ctx.strokeStyle = "rgb(150,255,150)"; } // poison
            ctx.beginPath();
            ctx.moveTo(a.op.x, a.op.y);
            ctx.lineTo(a.op.x + sr * Math.sin(a.oangle + e.angle),
                a.op.y + sr * Math.cos(a.oangle + e.angle));
            ctx.stroke();
        }

        //that snake like effect
        spriteAngles[5] = spriteAngles[4];
        spriteAngles[4] = spriteAngles[3];
        spriteAngles[3] = spriteAngles[2];
        spriteAngles[2] = spriteAngles[1];
        spriteAngles[1] = spriteAngles[0];
        spriteAngles[0] = a.oangle;

        //render head
        ctx.translate(a.op.x, a.op.y);
        ctx.rotate(-1 * a.oangle + Math.PI - 0.4);
        ctx.drawImage(headSprite, -10, -10, 25, 25);
        ctx.rotate(a.oangle + Math.PI + 0.4);
        ctx.translate(-a.op.x, -a.op.y);

        //render smallFinR
        ctx.translate(a.op.x, a.op.y);
        ctx.rotate(-1 * spriteAngles[1] + Math.PI - 0.4);
        ctx.drawImage(smallFinRSprite, 4, 7, 25, 15);
        ctx.rotate(spriteAngles[1] + Math.PI + 0.4);
        ctx.translate(-a.op.x, -a.op.y);

        //render smallFinL
        ctx.translate(a.op.x, a.op.y);
        ctx.rotate(-1 * spriteAngles[1] + Math.PI - 0.4);
        ctx.drawImage(smallFinLSprite, -24, 7, 25, 15);
        ctx.rotate(spriteAngles[1] + Math.PI + 0.4);
        ctx.translate(-a.op.x, -a.op.y);

        //render tailRoot
        ctx.translate(a.op.x, a.op.y);
        ctx.rotate(-1 * spriteAngles[3] + Math.PI - 0.4);
        ctx.drawImage(tailRootSprite, -5, 14, 15, 15);
        ctx.rotate(spriteAngles[3] + Math.PI + 0.4);
        ctx.translate(-a.op.x, -a.op.y);

        //render tail
        ctx.translate(a.op.x, a.op.y);
        ctx.rotate(-1 * spriteAngles[4] + Math.PI - 0.4);
        ctx.drawImage(tailSprite, -5, 14, 15, 15);
        ctx.rotate(spriteAngles[4] + Math.PI + 0.4);
        ctx.translate(-a.op.x, -a.op.y);

        //render finL
        ctx.translate(a.op.x, a.op.y);
        ctx.rotate(-1 * spriteAngles[5] + Math.PI - 0.4);
        ctx.drawImage(finLSprite, -20, 26, 25, 35);
        ctx.rotate(spriteAngles[5] + Math.PI + 0.4);
        ctx.translate(-a.op.x, -a.op.y);

        //render finR
        ctx.translate(a.op.x, a.op.y);
        ctx.rotate(-1 * spriteAngles[5] + Math.PI - 0.4);
        ctx.drawImage(finRSprite, -1, 26, 25, 35);
        ctx.rotate(spriteAngles[5] + Math.PI + 0.4);
        ctx.translate(-a.op.x, -a.op.y);

        //render body
        ctx.translate(a.op.x, a.op.y);
        ctx.rotate(-1 * spriteAngles[2] + Math.PI - 0.4);
        ctx.drawImage(bodySprite, -10, -1, 25, 25);
        ctx.rotate(spriteAngles[2] + Math.PI + 0.4);
        ctx.translate(-a.op.x, -a.op.y);
    }

    //draw light effect
    ctx.globalAlpha = 0.3;
    ctx.drawImage(effectlyr, 10, 10, 330, 230);
    ctx.globalAlpha = 1;

    //draw frames
    ctx.fillStyle = "#ead7b7";
    ctx.fillRect(0, 0, 10, 250);
    ctx.fillRect(0, 0, 340, 10);
    ctx.fillRect(340, 0, 10, 250);
    ctx.fillRect(0, 240, 340, 10);
}

// Tick the world
function tick() {
    w.tick();
    if (!skipdraw || w.clock % 50 === 0) {
        draw();
    }
}

var simspeed = 1;

function fastRender() {
    window.clearInterval(current_interval_id);
    current_interval_id = setInterval(tick, 30);
    skipdraw = true;
    simspeed = 1;
}

function normalRender() {
    window.clearInterval(current_interval_id);
    current_interval_id = setInterval(tick, 130);
    skipdraw = false;
    simspeed = 0;
}
