var chromeTabs
var windowId
var Ports = {}

/* Testing */
chrome.windows.onFocusChanged.addListener(function () {
  console.log('Focus changed!')
})

/* Local file content script */
chrome.windows.getCurrent(function (w) {
  chrome.tabs.query({'windowId': w.id}, function (tabs) {
    chromeTabs = tabs
    for (var i = 0; i < tabs.length; i++) {
      if (tabs[i].url.indexOf('chrome://') === 0) return
      chrome.tabs.executeScript(tabs[i].id, {file: 'mouse-tracker.js'})
      chrome.tabs.insertCSS(tabs[i].id, {file: 'asserts/chrome-tabs.css'})
      chrome.tabs.executeScript(tabs[i].id, {file: 'asserts/chrome-tabs.js'})
      chrome.tabs.executeScript(tabs[i].id, {file: 'asserts/draggabilly.js'})
      chrome.tabs.insertCSS(tabs[i].id, {file: 'extra-styles.css'})
      chrome.tabs.executeScript(tabs[i].id, {file: 'tabs.js'})
      chrome.tabs.executeScript(tabs[i].id, {file: 'redirector.js'})
      chrome.tabs.executeScript(tabs[i].id, {code: 'var currentTab = ' + tabs[i].id})
      // chrome.tabs.executeScript(tabs[i].id, {code: 'console.log(currentTab)'})
    }
  })
})
/* End of contentScript */

function getTabs (callback) {
  var tabs = new Promise(function (resolve, reject) {
    chrome.windows.getCurrent(function (w) {
      chrome.tabs.query({'windowId': w.id}, function (tabs) {
        chromeTabs = tabs
        windowId = w.id
        resolve(chromeTabs)
      })
    })
  })
  tabs.then(function (valor) {
    if (typeof callback === 'function') {
      callback(valor)
    }
  })
}
getTabs()

function sendMessageToTabs (message) {
  for (var tabId in Ports) {
    if (Ports.hasOwnProperty(tabId)) {
      var port = Ports[tabId]
      port.postMessage(message)
    }
  }
}

chrome.runtime.onConnect.addListener(function (port) {
  console.assert(port.name === 'tabInfo')
  Ports[port.sender.tab.id] = port
  port.onMessage.addListener(function (msg) {
    if (msg.instruction === 'give me tabs') {
      getTabs(function (tabs) {
        port.postMessage({chromeTabs: tabs})
      })
    } else if (msg.deleteTab) {
      chrome.tabs.remove(msg.deleteTab)
    } else if (msg.updateTab) {
      chrome.tabs.update(msg.updateTab, msg.modifier)
    } else if (msg.createTab) {
      chrome.tabs.create({
        'url': msg.createTab
      })
    }
  })
})

chrome.tabs.onUpdated.addListener(function (tabId, change, tab) {
  if (tab.windowId === windowId) {
    getTabs(function (tabs) {
      if (change.status === 'loading') {
        chrome.tabs.executeScript(tabId, {file: 'mouse-tracker.js'})
        chrome.tabs.insertCSS(tabId, {file: 'asserts/chrome-tabs.css'})
        chrome.tabs.executeScript(tabId, {file: 'asserts/chrome-tabs.js'})
        chrome.tabs.executeScript(tabId, {file: 'asserts/draggabilly.js'})
        chrome.tabs.insertCSS(tabId, {file: 'extra-styles.css'})
        chrome.tabs.executeScript(tabId, {file: 'tabs.js'})
        chrome.tabs.executeScript(tabId, {file: 'redirector.js'})
        chrome.tabs.executeScript(tabId, {code: 'var currentTab = ' + tabId})
      }
      sendMessageToTabs({chromeTabs: tabs})
    })
  }
})

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
  console.log('removed', tabId, removeInfo)
  delete Ports[tabId]
  if (removeInfo.isWindowClosing) {
    return
  }
  if (removeInfo.windowId === windowId) {
    getTabs(function (tabs) {
      sendMessageToTabs({chromeTabs: tabs})
    })
  }
})
