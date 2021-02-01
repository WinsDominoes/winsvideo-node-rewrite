// Sticky navbar
// =========================
$(document).ready(function () {
  // Custom function which toggles between sticky class (is-sticky)
  const stickyToggle = function (sticky, stickyWrapper, scrollElement) {
    const stickyHeight = sticky.outerHeight()
    const stickyTop = stickyWrapper.offset().top
    if (scrollElement.scrollTop() >= stickyTop) {
      stickyWrapper.height(stickyHeight)
      sticky.addClass('is-sticky')
    } else {
      sticky.removeClass('is-sticky')
      stickyWrapper.height('auto')
    }
  }

  // Find all data-toggle="sticky-onscroll" elements
  $('[data-toggle="sticky-onscroll"]').each(function () {
    const sticky = $(this)
    const stickyWrapper = $('<div>').addClass('sticky-wrapper') // insert hidden element to maintain actual top offset on page
    sticky.before(stickyWrapper)
    sticky.addClass('sticky')

    // Scroll & resize events
    $(window).on('scroll.sticky-onscroll resize.sticky-onscroll', function () {
      stickyToggle(sticky, stickyWrapper, $(this))
    })

    // On page load
    stickyToggle(sticky, stickyWrapper, $(window))
  })
})
