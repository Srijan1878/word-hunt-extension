let isActivated = false

chrome.browserAction.onClicked.addListener(onExtensionClick)


function onExtensionClick(tab) {
    isActivated = !isActivated
    let status = {
        activate: isActivated,
    }
    chrome.tabs.sendMessage(tab.id, status)
}