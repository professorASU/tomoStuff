function savenet() {
    var j = w.agents[0].brain.value_net.toJSON();
    var t = JSON.stringify(j);
    document.getElementById('tt').value = t;
}

function loadnet() {
    var t = document.getElementById('tt').value;
    var j = JSON.parse(t);
    w.agents[0].brain.value_net.fromJSON(j);
    stoplearn(); // also stop learning
    gonormal();
}

function startlearn() {
    //w.agents[0].brain.learning = true;
}

function stoplearn() {
    //w.agents[0].brain.learning = false;
}

function reload() {
    w.agents = [new Agent(), new Agent()]; // this should simply work. I think... ;\
    reward_graph = new cnnvis.Graph(); // reinit
}

var w; // global world object
var current_interval_id;
var skipdraw = false;

function start() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    w = new World();
    normalRender();
}

function newFish() {
    w.agents.push(new Agent())
    for (i = 0; i < 5; i++) {
        spriteAngles[i].push(0);
    }
}

function downloadAgent() {
    console.log(window.brain.algorithm.actor);
    var a = window.brain.algorithm.actor.config.write()
    var b = window.brain.algorithm.critic.config.write()
    var out = new Float64Array(a.length + b.length)
    out.set(a, 0)
    out.set(b, a.length)

    saveAs(new DataView(out.buffer))

}

function readBrain(e) {
    var input = event.target;

    var reader = new FileReader();
    reader.onload = function () {
        var buffer = reader.result;
        var joined = new Float64Array(buffer)
        var a = joined.slice(0, window.brain.algorithm.actor.config.countOfParameters)
        var b = joined.slice(window.brain.algorithm.actor.config.countOfParameters)

        window.brain.algorithm.actor.config.read(a)
        window.brain.algorithm.critic.config.read(b)
        window.brain.algorithm.targetActor.config.read(a)
        window.brain.algorithm.targetCritic.config.read(b)
    };

    reader.readAsArrayBuffer(input.files[0]);
}

function saveAs(dv) {
    var a;
    if (typeof window.downloadAnchor == 'undefined') {
        a = window.downloadAnchor = document.createElement("a");
        a.style = "display: none";
        document.body.appendChild(a);
    } else {
        a = window.downloadAnchor
    }

    var blob = new Blob([dv], { type: 'application/octet-binary' }),
        tmpURL = window.URL.createObjectURL(blob);

    a.href = tmpURL;
    a.download = 'brain.bin';
    a.click();

    window.URL.revokeObjectURL(tmpURL);
    a.href = "";

}


function changeResolution(canvas, scaleFactor) {
    // Set up CSS size if it's not set up already
    if (!canvas.style.width)
        canvas.style.width = canvas.width + 'px';
    if (!canvas.style.height)
        canvas.style.height = canvas.height + 'px';

    canvas.width = Math.ceil(canvas.width * scaleFactor);
    canvas.height = Math.ceil(canvas.height * scaleFactor);
    var ctx = canvas.getContext('2d');
    ctx.scale(scaleFactor, scaleFactor);
}

changeResolution(document.getElementById('canvas'), 0.5)

//stuff for saving excel
var Results = [
    ["Col1"],
    ["Data"],
    ["Data"],
];

var exportToCsv = function () {
    var CsvString = "";
    Results.forEach(function (RowItem, RowIndex) {
        RowItem.forEach(function (ColItem, ColIndex) {
            CsvString += ColItem + ',';
        });
        CsvString += "\r\n";
    });
    CsvString = "data:application/csv," + encodeURIComponent(CsvString);
    var x = document.createElement("A");
    x.setAttribute("href", CsvString);
    x.setAttribute("download", "somedata.csv");
    document.body.appendChild(x);
    x.click();
}