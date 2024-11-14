chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'iframe') {
    chrome.windows.create({
      url: chrome.runtime.getURL("iframe.html"),
      type: "popup",
      top: request.top + 100,
      left: request.left - 200,
      width: 200,
      height: 136,
    }).then( r => {});
  } else if (request.action === 'transcribe') {
    chrome.tabs.query({active: true, currentWindow: false}, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: request.action, message: request.message}).then(r => {}).catch(err => console.log('transcribe', err))
    })
  } else if (request.action === 'destroy') {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: request.action}).then(r => {}).catch(err => console.log('destroy', err))
    })
  } else if (request.action === 'create') {
    chrome.windows.getCurrent(w => {
      chrome.tabs.query({active: true, windowId: w.id}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: request.action}).then(r => {}).catch(err => console.log('create', err))
      })
    })
  }

})

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete') {
    chrome.tabs.sendMessage( tabId, {action: 'create'}).then(r => {}).catch(err => console.log('create - ON UPDATED:', err))
  }
})