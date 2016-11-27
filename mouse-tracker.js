var timeout

document.onmousemove = function (e) {
  var y = e.clientY
  clearTimeout(timeout)
  if (y < 5) {
    timeout = setTimeout(function () {
      // alert('wiwi')
    }, 1000)
  }
}
