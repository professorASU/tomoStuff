// bddy.edit.js is too low level than i intended it to be
// so its like a start-over i guess...
var bddy = {
    name: "bddy",
    mode: 0, //mode here means theme. 0=plain white interface, 1=stealth cool interface, 2=custom (only gonna make 0, until i get this library completed)
    //the thing that decompiles input and converts to task sequence 
    lang: {
        memory: [],
        network: {
            vocab: [], //words
            type: [],  //vocab types here
            transition: [], // transition meanings: 0=no transition, 1=next word (ex:a, an)
            allGrammer: [], //all grammer combinations
            backprop: [] // array of objects, storing unique patterns of grammers, which oppose to revious data sets
        },
        reponse: {
            return: function (lcomp) {

            },
            network: {
                //idk yet
            }
        }
    },
    //everything that links intentions with system actions
    action: {
        throw: function (langCode) {
            var langDecode = langCode.split(" ");
        }
    },

    //whole system of reading external file of memory
    file: {
        load: function (bfile, mode) {
            //loads uploaded .dat files to memory
            //mode: 0=overwrite, 1=add
        },
        save: function () {
            //saves a .dat file of whole memory
        }
    },
    //learning functions here, connected with tools
    brain: {
        openConsole: function () {
            //open learning tool HTML DOM element
        },
        throw: function (mode) {
            //mode: 0=lang, 1=action, 2=brain
        }
    },
    //idk, something that i feel is necessary later
    network: {

    }
}