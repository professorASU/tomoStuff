// 2021 Tomoyoshi Yamamoto
// This is for editing/updating the library. Use bddy.js for any parposes other than testing.

var bddy = {
    name: "buddy",
    throw: function (cont) {
        var ward = cont.split(" ");
        //the filter to make sure assistant was called
        var initBol = ward.indexOf(this.name) != -1 && this.mode == 0;
        var overwriteBol = this.mode == 1;
        if (initBol) {
            this.mode = 2;
            var hit = false;

            //store codes from all sequence, with keywords replaced with user command content
            var codePreCompile = [];
            for (i = 0; i < this.trigKeys.length; i++) {

                //find any matches to existing protocols
                if (ward.indexOf(this.trigKeys[i]) != -1) {
                    if (hit == false) {
                        hit = true;
                    }

                    actionCodeExtract = this.actionCode[i].toString().split();
                    console.log(actionCodeExtract);

                    var trigWordPosition = ward.indexOf(this.trigKeys[i]);
                    for (p = 0; p < actionCodeExtract.length; p++) {
                        var keyNumber = actionCodeExtract[p];
                        if (this.paramKeyType[keyNumber] == 1) {
                            //val exists after trigger word
                            var valExtract = this.actionBlocks[keyNumber].split("val");
                            //replace val with reference, search memory

                            //boolean to check if theres any match
                            var matchSwitch = false;
                            //search memory for reference
                            for (q = 0; q < this.memory.length; q++) {
                                if (this.memory[q].actionBlock == keyNumber) {
                                    if (this.memory[q].form == ward[trigWordPosition + 1]) {
                                        matchSwitch = true;
                                        //check type of data we are looking for from "this.paramType"
                                        if (this.paramType[keyNumber] == 0) {
                                            // type of data is url, get the url, and store it inside valJoinKey
                                            var valJoinKey = this.memory[q].refer;
                                        }
                                    }
                                }
                            }

                            //if there wasnt any memory about the val word, create new one
                            if (matchSwitch == false) {
                                //get type of data we need to make
                                if (this.paramType[keyNumber] == 0) {
                                    //type of data is url, make object consisting of form and refer (refer = user text input of url)
                                    var userInputData = this.getUserInput(0); // get url input from user
                                    var newMemoryPiece = { actionBlock: keyNumber, form: ward[trigWordPosition + 1], refer: userInputData };
                                    this.memory.push(newMemoryPiece);
                                    //set valJoinKey to new referal
                                    var valJoinKey = userInputData;
                                }
                            }

                            //replace "val" with actual key
                            var codeModule = valExtract.join(valJoinKey);
                            codePreCompile.push(codeModule);


                        } else if (this.paramKeyType == 0) {
                            //val exists in front of trigger word
                        } else {
                            //val doesnt exist
                        }
                    }

                    //run protocol sequence
                    for (p = 0; p < codePreCompile.length; p++) {
                        eval(codePreCompile[p]);
                    }

                    this.mode = 0;

                }

                //if there were no protocols existing
                if (hit == false) {
                    // ask for protocol explanation
                    console.log("please explain the steps, one by one");
                    mode = 1;
                }

            }

            return "system: end master protocol"
        } else if (overwriteBol) {
            // any commands intended for coding the agent
            for (i = 0; i < ward.length; i++) {
                ward[i]
            }


            //ask if there are next step

        }
    },
    mode: 0, //mode keys: 0=free mode, 1=protocol overwrite, 2=not accepting any new commands
    tone: new Audio(),
    setTone: function (audiof) {
        this.tone.src = audiof;
    },
    trigKeys: ["open"],
    paramKeyType: [1], //1: after, 2: before, 3: none
    paramType: [0], // 0:url
    actionCode: [0],
    actionKeys: ["open"], //this too
    actionBlocks: ["window.open('val')"],　//this is really stupid actually
    defineHolder: new Array(),
    transKey: ["to"],
    transKeyType: [0], //simply forward=0, or refer to something=?? (this is gonna be a challenge)
    memory: [], //array of objects, stores new memories. it is saved on localStorage (toDo); { actionBlock: int, form : <voice detectable string> , refer: <user input or, sequence > },
    getUserInput: function (type) { //types: 0=url, 1=string, 2=number
        if (type == 0) {
            var usrInputPre = prompt("Enter URL");
            let confirmInput = confirm('Confirm?');
            if (confirmInput == true) {
                return usrInputPre.toString();
            } else {
                this.getUserInput(type);
            }
        } else if (type == 1) {
            var usrInputPre = prompt("Enter String");
            let confirmInput = confirm('Confirm?');
            if (confirmInput == true) {
                return usrInputPre.toString();
            } else {
                this.getUserInput(type);
            }
        } else if (type == 2) {
            var usrInputPre = prompt("Enter Number");
            let confirmInput = confirm('Confirm?');
            if (confirmInput == true) {
                return parseInt(usrInputPre);
            } else {
                this.getUserInput(type);
            }
        }
    }
}