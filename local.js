// /* Local file content script */
// var chromeTabs
// chrome.windows.getCurrent(function (w) {
//   chrome.tabs.query({'windowId': w.id}, function (tabs) {
//     chromeTabs = tabs
//     for (var i = 0; i < tabs.length; i++) {
//       chrome.tabs.executeScript(tabs[i].id, {file: 'mouse-tracker.js'})
//       chrome.tabs.insertCSS(tabs[i].id, {file: 'asserts/chrome-tabs.css'})
//       chrome.tabs.executeScript(tabs[i].id, {file: 'asserts/chrome-tabs.js'})
//       chrome.tabs.executeScript(tabs[i].id, {file: 'asserts/draggabilly.js'})
//       chrome.tabs.insertCSS(tabs[i].id, {file: 'extra-styles.css'})
//       chrome.tabs.executeScript(tabs[i].id, {file: 'tabs.js'})
//       chrome.tabs.executeScript(tabs[i].id, {file: 'redirector.js'})
//       chrome.tabs.executeScript(tabs[i].id, {code: 'var currentTab = ' + tabs[i].id})
//       // chrome.tabs.executeScript(tabs[i].id, {code: 'console.log(currentTab)'})
//     }
//   })
// })
