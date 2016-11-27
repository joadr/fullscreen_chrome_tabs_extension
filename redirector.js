var currentTab

chrome.tabs.query({}, function (tabs) {
  for (var i = 0; i < tabs.length; i++) {
    chrome.tabs.executeScript(tabs[i].id, {file: 'mouse-tracker.js'})
  }
})

// does some very basic manipulation of the url in the input box
// from version 1.2.4 keeps backwards compatibility but replicates omnibox search functionality
function getLocation () {
  var url = document.getElementById('launch_url').value
  if (new RegExp('([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?').test(url)) {
    if (url.substring(0, 4) !== 'http') {
      url = 'http://' + url
    }
  } else if (url.substring(0, 2) === 'd?') {
    url = 'http://www.duckduckgo.com/?q=' + url.replace('d?', '').replace(' ', '+')
  } else {
    if (url.substring(0, 1) === '?') {
      url = url.substring(1)
    } else if (url.substring(1, 1) === '?') {
      url = url.substring(2)
    }
    url = 'http://www.google.com/search?q=' + url.replace(' ', '+')
  }
  return url
}

// handles hitting 'enter' inside the input box
function handleKeypress (e) {
  var key = e.keyCode ? e.keyCode : e.charCode
  if (key === 13 && !e.shiftKey) {
    chrome.windows.getCurrent(function (w) {
      chrome.tabs.getSelected(w.id, function (tab) {
        chrome.tabs.update(tab.id, { 'url': getLocation() })
        window.close()
      })
    })
  } else if (key === 13) {
    // create a new tab - since 1.2.3
    chrome.tabs.create({
      'url': getLocation()
    })
  } else {
    return true
  }
}

// handle clicking on the tab list and selecting the correct tab
function redirectToTab (e, t) {
  // get the tab id using the <li data-id> attribute
  var tabid = parseInt(this.dataset['id'])

  // check if ctrl key is held - this closes the clicked tab (since 1.2.3)
  if (e.ctrlKey) {
    chrome.tabs.remove(tabid)
    if (this.parentNode) {
      this.parentNode.removeChild(this)
    }
  } else {
    // select the requested tab
    chrome.tabs.update(tabid, {'active': true})
  }
}

function closeTab (e, t) {
  var tabid = parseInt(this.parentElement.dataset.id)
  chrome.tabs.remove(tabid)
}

// lists the tabs in the ul
function doListTabs (w) {
  // list the tabs in the ul
  chrome.tabs.query({'windowId': w.id}, function (tabs) {
    var tablist = document.getElementsByClassName('chrome-tabs-content')[0]

    // remove old elements
    tablist.innerHTML = ''

    tabs.forEach(function (tab) {
      console.log(tab)
      // new
      // Divs structure
      var tabDiv = document.createElement('div')
      var tabBackground = document.createElement('div')
      var tabFavicon = document.createElement('div')
      var tabTitle = document.createElement('div')
      var tabClose = document.createElement('div')

      // Give identifier to each tab and add class
      tabDiv.setAttribute('data-id', tab.id)
      tabDiv.setAttribute('class', 'chrome-tab')
      if (tab.pinned) {
        // tabDiv.setAttribute('class', 'chrome-tab pinned')
      }
      // Create tab Title
      // if (!tab.pinned) {
        tabTitle.appendChild(document.createTextNode(tab.title))
        tabTitle.setAttribute('class', 'chrome-tab-title')
      // }

      // create tab Background
      tabBackground.innerHTML = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg"><defs><symbol id="topleft" viewBox="0 0 214 29" ><path d="M14.3 0.1L214 0.1 214 29 0 29C0 29 12.2 2.6 13.2 1.1 14.3-0.4 14.3 0.1 14.3 0.1Z"/></symbol><symbol id="topright" viewBox="0 0 214 29"><use xlink:href="#topleft"/></symbol><clipPath id="crop"><rect class="mask" width="100%" height="100%" x="0"/></clipPath></defs><svg width="50%" height="100%" transfrom="scale(-1, 1)"><use xlink:href="#topleft" width="214" height="29" class="chrome-tab-background"/><use xlink:href="#topleft" width="214" height="29" class="chrome-tab-shadow"/></svg><g transform="scale(-1, 1)"><svg width="50%" height="100%" x="-100%" y="0"><use xlink:href="#topright" width="214" height="29" class="chrome-tab-background"/><use xlink:href="#topright" width="214" height="29" class="chrome-tab-shadow"/></svg></g></svg>'
      tabBackground.setAttribute('class', 'chrome-tab-background')

      // Add classes to favicon and close
      tabFavicon.setAttribute('class', 'chrome-tab-favicon')
      tabFavicon.setAttribute('style', 'background-image: url(' + tab.favIconUrl + ')')
      tabClose.setAttribute('class', 'chrome-tab-close')

      // Append structure
      tabDiv.appendChild(tabBackground)
      tabDiv.appendChild(tabFavicon)
      // if (!tab.pinned) {
        tabDiv.appendChild(tabTitle)
        tabDiv.appendChild(tabClose)
      // }

      // Add event listener to click
      tabDiv.addEventListener('click', redirectToTab)
      tabClose.addEventListener('click', closeTab)

      // attach tab to tablist
      if (tab.id === currentTab) {
        tabDiv.setAttribute('class', 'chrome-tab chrome-tab-current')
      }

      tablist.appendChild(tabDiv)
    })

    // resize the popup to fit the list
    // var html = document.getElementsByTagName('html')[0]
    // var height = document.getElementsByTagName('ul')[0].clientHeight +
    //   document.getElementById('launch_url').clientHeight + 10
    // html.style.height = height + 'px'
  })
  initializeTabs()
}

function createRemoteTabs () {
  var tabs = document.createElement('div')
  var content = document.createElement('div')
  var bottomBar = document.createElement('div')
  var searchBar = document.createElement('div')
  var inputField = document.createElement('input')

  tabs.setAttribute('class', 'chrome-tabs')
  content.setAttribute('class', 'chrome-tabs-content')
  bottomBar.setAttribute('class', 'chrome-tabs-bottom-bar')
  searchBar.setAttribute('class', 'search-bar')
  inputField.setAttribute('id', 'launch_url')
  inputField.setAttribute('type', 'text')

  var body = document.getElementsByTagName('body')[0]

  searchBar.appendChild(inputField)

  bottomBar.appendChild(searchBar)

  tabs.appendChild(content)
  tabs.appendChild(bottomBar)

  body.appendChild(tabs)
}

// sets up the list of tabs and the event handling
document.addEventListener('DOMContentLoaded', function () {
  createRemoteTabs()
  // hook up the key press
  document.body.onkeyup = handleKeypress

  // find the input field
  var inputField = document.getElementById('launch_url')

  // put the current url in there and select it
  chrome.windows.getCurrent(function (w) {
    chrome.tabs.getSelected(w.id, function (tab) {
      currentTab = tab.id
      inputField.value = tab.url
      inputField.focus()
      inputField.select()
    })
    doListTabs(w)
  })
})
