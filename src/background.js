function handleClick() {
  chrome.tabs.query(
    { active: true, currentWindow: true },
    async function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { method: "menuClicked" });
    }
  );
}

function setPopup() {
  const user = chrome.storage.sync.get(["newtUser"]);
  if (user) {
    chrome.action.setPopup({
      popup: "./popup_authenticated.html",
    });
  } else {
    chrome.action.setPopup({
      popup: "./popup.html",
    });
  }
}

chrome.runtime.onInstalled.addListener(function () {
  setPopup();

  chrome.contextMenus.create({
    id: "nextContextMenu",
    title: "Add selection to Newt",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener(handleClick);
chrome.storage.onChanged.addListener(setPopup);
