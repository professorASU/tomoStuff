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
let settingBtn = document.getElementById("settingBtn");
let elementCheck = document.getElementById("elementCheck");
let displayMode = 0;

elementCheck.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: manageWaavElement,
    });
});

function manageWaavElement() {
    chrome.storage.sync.get("switchHandlerPre", ({ switchHandlerPre }) => {
        if (switchHandlerPre) {
            //it works add the element
            alert("wow");
        }
    })
}

settingBtn.addEventListener("click", async () => {
    if (displayMode == 0) {
        displayMode = 1;
        document.getElementById("settingsInterface").style.display = "block";
        document.getElementById("mainInterface").style.display = "none'"
    } else {
        displayMode = 0;
        document.getElementById("mainInterface").style.display = "block";
        document.getElementById("settingsInterface").style.display = "none'"
    }
});