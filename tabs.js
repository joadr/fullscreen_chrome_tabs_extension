function initializeTabs () {
  setTimeout(function () {
    var el = document.querySelector('.chrome-tabs')
    var chromeTabs = new ChromeTabs()
    chromeTabs.init(el, {
      tabOverlapDistance: 14,
      minWidth: 45,
      maxWidth: 243
    })
    el.addEventListener('activeTabChange', ({ detail }) => console.log('Active tab changed', detail.tabEl))
    el.addEventListener('tabAdd', ({ detail }) => console.log('Tab added', detail.tabEl))
    el.addEventListener('tabRemove', ({ detail }) => console.log('Tab removed', detail.tabEl))
  }, 1)
}
