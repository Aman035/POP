// Detect page navigation using history changes
const observeHistoryChanges = () => {
  const originalPushState = history.pushState
  history.pushState = function () {
    originalPushState.apply(this, arguments)
    setTimeout(injectPopButtonOnPage, 500) // Handle history push
  }

  window.addEventListener('popstate', () => {
    setTimeout(injectPopButtonOnPage, 500) // Handle back/forward navigation
  })
}

// Main function to inject Pop Market button on compose page and detect all posts
function injectPopButtonOnPage() {
  // Check if we're on the compose page
  if (
    window.location.pathname === '/compose/post' ||
    window.location.pathname.includes('/compose/post')
  ) {
    window.checkForComposePage()
  }

  // Always check for all posts on any Twitter page
  window.checkForAllPosts()
}

// Initialize the MutationObserver for DOM changes
function initializeMutationObserver() {
  const observer = new MutationObserver(() => {
    injectPopButtonOnPage()
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })
}

// Initialize the script
window.addEventListener('load', () => {
  injectPopButtonOnPage()
  observeHistoryChanges()
  initializeMutationObserver()
})
