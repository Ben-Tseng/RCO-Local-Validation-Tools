chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({ id: "mrz", title: "Validate MRZ", contexts: ["selection"] });
  chrome.contextMenus.create({ id: "hkid", title: "Validate HK ID", contexts: ["selection"] });
  chrome.contextMenus.create({ id: "twid", title: "Validate TW ID", contexts: ["selection"] });
});


chrome.contextMenus.onClicked.addListener((info, tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (type, input, autoCheck) => { window.__validatorArgs = [type, input, autoCheck]; },
    // pass autoCheck = true so validator can auto-run for selection
    args: [info.menuItemId, info.selectionText, true]
  }).then(() => {
    return chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["validator.js"]
    });
  }).catch((err) => console.error('scripting.executeScript error:', err));
});
