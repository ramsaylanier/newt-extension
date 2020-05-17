function handleClick() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { method: "menuClicked" });
  });
}

chrome.runtime.onInstalled.addListener(function () {
  chrome.contextMenus.create({
    id: "nextContextMenu",
    title: "Add selection to Newt",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener(handleClick);
