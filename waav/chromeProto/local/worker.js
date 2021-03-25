// Initialize button with user's preferred color
let switchHandler;

chrome.storage.sync.get("switchHandlerPre", ({ switchHandlerPre }) => {
    // when loaded, check if switchHandlerPre is on
});

// When the button is clicked, inject setPageBackgroundColor into current page
// changeColor.addEventListener("click", async () => {
//     let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

//     chrome.scripting.executeScript({
//         target: { tabId: tab.id },
//         function: manageWaavElement,
//     });
// });

// The body of this function will be executed as a content script inside the
// current page
// function manageWaavElement() {
//     chrome.storage.sync.get("switchHandlerPre", ({ switchHandlerPre }) => {
//         if (switchHandlerPre) {
//             document.write("yea");
//         }
//     });
// }

// the ui/ux interface stuff

//elements
var launchbtn = document.getElementById("launchbtn");
var checkbtn = document.getElementById("checkbtn");
var loadbtn = document.getElementById("loadbtn");

//variables holding important values
//status : 0=nothing 1=loading 2=done
var statusHandler = 0


let displayMode = 0;

launchbtn.addEventListener("click", async () => {
    //ui sciript and scan
    launchbtn.style.display = "none";
    loadbtn.style.display = "inline-block";
    statusHandler = 1;

    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: initWaav
    });
});

function initWaav() {

}