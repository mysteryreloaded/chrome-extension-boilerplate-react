console.log('This is the background page.')

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
      chrome.tabs.sendMessage(tabs[0].id, {action: request.action, message: request.message});
    })
  } else if (request.action === 'destroy') {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: request.action});
    })
  } else if (request.action === 'create') {
    chrome.windows.getCurrent(w => {
      chrome.tabs.query({active: true, windowId: w.id}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: request.action});
      })
    })
  }

})

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  console.log('ON UPDATED:', tabId, changeInfo, tab);
  if (changeInfo.status === 'complete') {
    chrome.tabs.sendMessage( tabId, {action: 'create'})
  }
})