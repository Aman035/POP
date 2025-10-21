// Configuration - Change this to your production URL
const POP_SITE_URL = 'http://localhost:3000'

// Function to create and show the Pop Market modal
function showPopModal() {
  // Create the modal container
  const modal = document.createElement('div')
  modal.style = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    `

  // Create the iframe
  const iframe = document.createElement('iframe')
  iframe.src = `${POP_SITE_URL}/app/create?embed=true&hideUI=true`
  iframe.style = `
      width: 450px; 
      height: 750px; 
      border: none; 
      border-radius: 40px; 
      background-color: transparent; 
      padding: 20px;`

  // Create a close button that follows the cursor
  const floatingCloseButton = document.createElement('button')
  floatingCloseButton.innerText = 'X'
  floatingCloseButton.style = `
      position: absolute;
      padding: 11px 20px;
      font-size: 22px;
      font-weight: 700;
      background-color: #FF605C;
      color: black;
      border: none;
      border-radius: 50px;
      font-family: sans-serif;
      z-index: 1001;
      cursor: pointer;
      transform: translate(-50%, -50%);
    `

  // Append elements to modal
  modal.appendChild(iframe)
  document.body.appendChild(modal)
  document.body.appendChild(floatingCloseButton)

  // Function to close modal
  const closeModal = () => {
    document.body.removeChild(modal)
    document.body.removeChild(floatingCloseButton)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('click', handleOutsideClick)
  }

  // Update floating button position based on mouse position
  const handleMouseMove = (event) => {
    const iframeRect = iframe.getBoundingClientRect()
    const isOutsideIframe =
      event.clientX < iframeRect.left ||
      event.clientX > iframeRect.right ||
      event.clientY < iframeRect.top ||
      event.clientY > iframeRect.bottom

    if (isOutsideIframe) {
      floatingCloseButton.style.display = 'block'
      floatingCloseButton.style.left = `${event.pageX}px`
      floatingCloseButton.style.top = `${event.pageY}px`
    } else {
      floatingCloseButton.style.display = 'none'
    }
  }

  // Close modal when the floating button is clicked
  floatingCloseButton.onclick = closeModal

  // Close modal when clicking outside the iframe
  const handleOutsideClick = (event) => {
    const iframeRect = iframe.getBoundingClientRect()
    const isOutsideIframe =
      event.clientX < iframeRect.left ||
      event.clientX > iframeRect.right ||
      event.clientY < iframeRect.top ||
      event.clientY > iframeRect.bottom

    if (isOutsideIframe) {
      closeModal()
    }
  }

  // Add event listeners
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('click', handleOutsideClick)
}

// Function to create and show the Market Widget modal with tweet ID
function showMarketWidgetModal(tweetId) {
  // Create the modal container
  const modal = document.createElement('div')
  modal.style = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    `

  // Create the iframe with tweet-specific market URL
  const iframe = document.createElement('iframe')
  iframe.src = `${POP_SITE_URL}/app/markets/${tweetId}?embed=true&hideUI=true`
  iframe.style = `
      width: 500px; 
      height: 600px; 
      border: none; 
      border-radius: 20px; 
      background-color: white; 
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    `

  // Create a close button that follows the cursor
  const floatingCloseButton = document.createElement('button')
  floatingCloseButton.innerText = 'X'
  floatingCloseButton.style = `
      position: absolute;
      padding: 11px 20px;
      font-size: 22px;
      font-weight: 700;
      background-color: #FF605C;
      color: black;
      border: none;
      border-radius: 50px;
      font-family: sans-serif;
      z-index: 1001;
      cursor: pointer;
      transform: translate(-50%, -50%);
    `

  // Append elements to modal
  modal.appendChild(iframe)
  document.body.appendChild(modal)
  document.body.appendChild(floatingCloseButton)

  // Function to close modal
  const closeModal = () => {
    document.body.removeChild(modal)
    document.body.removeChild(floatingCloseButton)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('click', handleOutsideClick)
  }

  // Update floating button position based on mouse position
  const handleMouseMove = (event) => {
    const iframeRect = iframe.getBoundingClientRect()
    const isOutsideIframe =
      event.clientX < iframeRect.left ||
      event.clientX > iframeRect.right ||
      event.clientY < iframeRect.top ||
      event.clientY > iframeRect.bottom

    if (isOutsideIframe) {
      floatingCloseButton.style.display = 'block'
      floatingCloseButton.style.left = `${event.pageX}px`
      floatingCloseButton.style.top = `${event.pageY}px`
    } else {
      floatingCloseButton.style.display = 'none'
    }
  }

  // Close modal when the floating button is clicked
  floatingCloseButton.onclick = closeModal

  // Close modal when clicking outside the iframe
  const handleOutsideClick = (event) => {
    const iframeRect = iframe.getBoundingClientRect()
    const isOutsideIframe =
      event.clientX < iframeRect.left ||
      event.clientX > iframeRect.right ||
      event.clientY < iframeRect.top ||
      event.clientY > iframeRect.bottom

    if (isOutsideIframe) {
      closeModal()
    }
  }

  // Add event listeners
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('click', handleOutsideClick)
}

// Function to create and show Prediction History modal
function showPredictionHistoryModal() {
  // Create the modal container
  const modal = document.createElement('div')
  modal.style = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    `

  // Create the iframe
  const iframe = document.createElement('iframe')
  iframe.src = `${POP_SITE_URL}/app/history?embed=true&hideUI=true`
  iframe.style = `
      width: 600px; 
      height: 700px; 
      border: none; 
      border-radius: 20px; 
      background-color: white; 
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    `

  // Create a close button that follows the cursor
  const floatingCloseButton = document.createElement('button')
  floatingCloseButton.innerText = 'X'
  floatingCloseButton.style = `
      position: absolute;
      padding: 11px 20px;
      font-size: 22px;
      font-weight: 700;
      background-color: #FF605C;
      color: black;
      border: none;
      border-radius: 50px;
      font-family: sans-serif;
      z-index: 1001;
      cursor: pointer;
      transform: translate(-50%, -50%);
    `

  // Append elements to modal
  modal.appendChild(iframe)
  document.body.appendChild(modal)
  document.body.appendChild(floatingCloseButton)

  // Function to close modal
  const closeModal = () => {
    document.body.removeChild(modal)
    document.body.removeChild(floatingCloseButton)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('click', handleOutsideClick)
  }

  // Update floating button position based on mouse position
  const handleMouseMove = (event) => {
    const iframeRect = iframe.getBoundingClientRect()
    const isOutsideIframe =
      event.clientX < iframeRect.left ||
      event.clientX > iframeRect.right ||
      event.clientY < iframeRect.top ||
      event.clientY > iframeRect.bottom

    if (isOutsideIframe) {
      floatingCloseButton.style.display = 'block'
      floatingCloseButton.style.left = `${event.pageX}px`
      floatingCloseButton.style.top = `${event.pageY}px`
    } else {
      floatingCloseButton.style.display = 'none'
    }
  }

  // Close modal when the floating button is clicked
  floatingCloseButton.onclick = closeModal

  // Close modal when clicking outside the iframe
  const handleOutsideClick = (event) => {
    const iframeRect = iframe.getBoundingClientRect()
    const isOutsideIframe =
      event.clientX < iframeRect.left ||
      event.clientX > iframeRect.right ||
      event.clientY < iframeRect.top ||
      event.clientY > iframeRect.bottom

    if (isOutsideIframe) {
      closeModal()
    }
  }

  // Add event listeners
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('click', handleOutsideClick)
}

// Function to create and show Market Bookmarks modal
function showMarketBookmarksModal() {
  // Create the modal container
  const modal = document.createElement('div')
  modal.style = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    `

  // Create the iframe
  const iframe = document.createElement('iframe')
  iframe.src = `${POP_SITE_URL}/app/bookmarks?embed=true&hideUI=true`
  iframe.style = `
      width: 600px; 
      height: 700px; 
      border: none; 
      border-radius: 20px; 
      background-color: white; 
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    `

  // Create a close button that follows the cursor
  const floatingCloseButton = document.createElement('button')
  floatingCloseButton.innerText = 'X'
  floatingCloseButton.style = `
      position: absolute;
      padding: 11px 20px;
      font-size: 22px;
      font-weight: 700;
      background-color: #FF605C;
      color: black;
      border: none;
      border-radius: 50px;
      font-family: sans-serif;
      z-index: 1001;
      cursor: pointer;
      transform: translate(-50%, -50%);
    `

  // Append elements to modal
  modal.appendChild(iframe)
  document.body.appendChild(modal)
  document.body.appendChild(floatingCloseButton)

  // Function to close modal
  const closeModal = () => {
    document.body.removeChild(modal)
    document.body.removeChild(floatingCloseButton)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('click', handleOutsideClick)
  }

  // Update floating button position based on mouse position
  const handleMouseMove = (event) => {
    const iframeRect = iframe.getBoundingClientRect()
    const isOutsideIframe =
      event.clientX < iframeRect.left ||
      event.clientX > iframeRect.right ||
      event.clientY < iframeRect.top ||
      event.clientY > iframeRect.bottom

    if (isOutsideIframe) {
      floatingCloseButton.style.display = 'block'
      floatingCloseButton.style.left = `${event.pageX}px`
      floatingCloseButton.style.top = `${event.pageY}px`
    } else {
      floatingCloseButton.style.display = 'none'
    }
  }

  // Close modal when the floating button is clicked
  floatingCloseButton.onclick = closeModal

  // Close modal when clicking outside the iframe
  const handleOutsideClick = (event) => {
    const iframeRect = iframe.getBoundingClientRect()
    const isOutsideIframe =
      event.clientX < iframeRect.left ||
      event.clientX > iframeRect.right ||
      event.clientY < iframeRect.top ||
      event.clientY > iframeRect.bottom

    if (isOutsideIframe) {
      closeModal()
    }
  }

  // Add event listeners
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('click', handleOutsideClick)
}

// Helper function to create Pop Market button
function createPopButton() {
  const popButton = document.createElement('button')
  popButton.innerText = '🎯 Create Market'
  popButton.classList.add('pop-button')
  return popButton
}

// Helper function to create "Predict" button for all posts
function createMarketButton() {
  const marketButton = document.createElement('button')
  marketButton.type = 'button'
  marketButton.setAttribute('aria-label', 'Open prediction market')
  marketButton.setAttribute('data-title', 'Predict')
  marketButton.classList.add('market-button')
  marketButton.innerHTML = `
    <span class="market-button-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" focusable="false">
        <path d="M12 3a7 7 0 0 0-4.89 12H7a1 1 0 0 0-1 1v3.25A1.75 1.75 0 0 0 7.75 21h8.5A1.75 1.75 0 0 0 18 19.25V16a1 1 0 0 0-1-1h-.11A7 7 0 0 0 12 3Zm4 16v2h-8v-2h8Zm-4-4a5 5 0 1 1 5-5 5 5 0 0 1-5 5Z" fill="currentColor"></path>
      </svg>
    </span>
  `
  const tooltipText = 'Predict'
  let tooltipElement = null

  const positionTooltip = () => {
    if (!tooltipElement) return
    const rect = marketButton.getBoundingClientRect()
    const tooltipRect = tooltipElement.getBoundingClientRect()
    const viewportWidth = document.documentElement.clientWidth
    const viewportHeight = document.documentElement.clientHeight
    const horizontalPadding = 12

    let centerX = rect.left + rect.width / 2
    const halfTooltipWidth = tooltipRect.width / 2
    if (centerX - halfTooltipWidth < horizontalPadding) {
      centerX = horizontalPadding + halfTooltipWidth
    } else if (centerX + halfTooltipWidth > viewportWidth - horizontalPadding) {
      centerX = viewportWidth - horizontalPadding - halfTooltipWidth
    }

    let top = rect.bottom + 8
    const tooltipHeight = tooltipRect.height
    const fitsBelow = top + tooltipHeight <= viewportHeight - 8

    if (!fitsBelow) {
      top = rect.top - tooltipHeight - 8
      tooltipElement.classList.add('above')
    } else {
      tooltipElement.classList.remove('above')
    }

    tooltipElement.style.left = `${centerX}px`
    tooltipElement.style.top = `${top}px`
  }

  const removeTooltipListeners = () => {
    window.removeEventListener('scroll', positionTooltip, true)
    window.removeEventListener('resize', positionTooltip, true)
  }

  const showTooltip = () => {
    if (tooltipElement || document.body == null) return
    tooltipElement = document.createElement('div')
    tooltipElement.className = 'market-tooltip'
    tooltipElement.textContent = tooltipText
    document.body.appendChild(tooltipElement)
    positionTooltip()
    requestAnimationFrame(() => {
      if (tooltipElement) {
        positionTooltip()
        tooltipElement.classList.add('show')
      }
    })
    window.addEventListener('scroll', positionTooltip, true)
    window.addEventListener('resize', positionTooltip, true)
  }

  const hideTooltip = () => {
    if (!tooltipElement) return
    const tooltipToRemove = tooltipElement
    tooltipElement = null
    tooltipToRemove.classList.remove('show')
    removeTooltipListeners()
    setTimeout(() => {
      tooltipToRemove.remove()
    }, 60)
  }

  marketButton.addEventListener('mouseenter', showTooltip)
  marketButton.addEventListener('mouseleave', hideTooltip)
  marketButton.addEventListener('focus', showTooltip)
  marketButton.addEventListener('blur', hideTooltip)
  marketButton.addEventListener('mousedown', hideTooltip)
  marketButton.addEventListener('click', hideTooltip)

  return marketButton
}

// Function to add sidebar items to Twitter's navigation
function addSidebarItems() {
  // Try multiple selectors to find the navigation
  const selectors = [
    'nav[aria-label="Primary"]',
    '[data-testid="sidebarColumn"]',
    'nav[role="navigation"]',
    '[role="navigation"]',
    '.css-175oi2r.r-15zivkp.r-1bymd8e.r-13qz1uu',
  ]

  let sidebar = null
  for (const selector of selectors) {
    sidebar = document.querySelector(selector)
    if (sidebar) {
      break
    }
  }

  if (!sidebar) {
    // Try to find any navigation element
    const navElements = document.querySelectorAll('nav')

    for (let i = 0; i < navElements.length; i++) {
      const nav = navElements[i]
      if (
        nav.getAttribute('aria-label') === 'Primary' ||
        nav.querySelector('a[href="/home"]')
      ) {
        sidebar = nav
        break
      }
    }
  }

  if (sidebar) {
    addSidebarItemsToContainer(sidebar)
  }
}

// Helper function to add sidebar items to a specific container
function addSidebarItemsToContainer(container) {
  // Check if sidebar items already exist to prevent duplicates
  if (container.querySelector('.pop-sidebar-item')) {
    return
  }

  // Create container for Pop sidebar items
  const popSidebarContainer = document.createElement('div')
  popSidebarContainer.className = 'pop-sidebar-container'
  popSidebarContainer.style = `
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  `

  // Create My Predictions sidebar item - matching X's exact styling
  const predictionsItem = document.createElement('div')
  predictionsItem.className = 'pop-sidebar-item'
  predictionsItem.innerHTML = `
    <div style="
      display: flex;
      align-items: center;
      padding: 12px 16px;
      border-radius: 9999px;
      cursor: pointer;
      transition: background-color 0.2s;
      margin-bottom: 4px;
      width: fit-content;
    " onmouseover="this.style.backgroundColor='rgba(231, 233, 234, 0.1)'" onmouseout="this.style.backgroundColor='transparent'">
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 26.25px;
        height: 26.25px;
        margin-right: 16px;
      ">
        <img src="${chrome.runtime.getURL('icons/prediction.png')}" 
             alt="My Predictions" 
             style="width: 30px; height: 30px; filter: brightness(0) saturate(100%) invert(89%) sepia(6%) saturate(464%) hue-rotate(169deg) brightness(95%) contrast(89%);">
      </div>
      <span class="pop-sidebar-text" style="
        font-weight: 400; 
        font-size: 20px; 
        color: rgb(231, 233, 234);
        font-family: 'TwitterChirp', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        transition: opacity 0.2s;
      ">My Predictions</span>
    </div>
  `

  // Create My Markets sidebar item - matching X's exact styling
  const marketsItem = document.createElement('div')
  marketsItem.className = 'pop-sidebar-item'
  marketsItem.innerHTML = `
    <div style="
      display: flex;
      align-items: center;
      padding: 12px 16px;
      border-radius: 9999px;
      cursor: pointer;
      transition: background-color 0.2s;
      margin-bottom: 4px;
      width: fit-content;
    " onmouseover="this.style.backgroundColor='rgba(231, 233, 234, 0.1)'" onmouseout="this.style.backgroundColor='transparent'">
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 26.25px;
        height: 26.25px;
        margin-right: 16px;
      ">
        <img src="${chrome.runtime.getURL('icons/market.png')}" 
             alt="My Markets" 
             style="width: 30px; height: 30px; filter: brightness(0) saturate(100%) invert(89%) sepia(6%) saturate(464%) hue-rotate(169deg) brightness(95%) contrast(89%);">
      </div>
      <span class="pop-sidebar-text" style="
        font-weight: 400; 
        font-size: 20px; 
        color: rgb(231, 233, 234);
        font-family: 'TwitterChirp', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        transition: opacity 0.2s;
      ">My Markets</span>
    </div>
  `

  // Add click event listeners
  predictionsItem.addEventListener('click', function (event) {
    event.stopPropagation()
    window.showPredictionHistoryModal()
  })

  marketsItem.addEventListener('click', function (event) {
    event.stopPropagation()
    window.showMarketBookmarksModal()
  })

  // Append items to container
  popSidebarContainer.appendChild(predictionsItem)
  popSidebarContainer.appendChild(marketsItem)

  // Insert the container into the sidebar
  container.appendChild(popSidebarContainer)

  // Add responsive behavior - hide text when sidebar is collapsed
  addResponsiveBehavior(popSidebarContainer)
}

// Function to add responsive behavior like X
function addResponsiveBehavior(container) {
  // Create a ResizeObserver to watch for sidebar width changes
  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const sidebarWidth = entry.contentRect.width
      const textElements = container.querySelectorAll('.pop-sidebar-text')

      // If sidebar is narrow (collapsed), hide text
      if (sidebarWidth < 200) {
        textElements.forEach((text) => {
          text.style.opacity = '0'
          text.style.width = '0'
          text.style.overflow = 'hidden'
        })
      } else {
        // If sidebar is wide (expanded), show text
        textElements.forEach((text) => {
          text.style.opacity = '1'
          text.style.width = 'auto'
          text.style.overflow = 'visible'
        })
      }
    }
  })

  // Start observing the sidebar container
  resizeObserver.observe(container)

  // Also observe the parent sidebar element
  const sidebar = container.parentElement
  if (sidebar) {
    resizeObserver.observe(sidebar)
  }
}

// Function to extract tweet ID from a tweet element
function extractTweetId(tweetElement) {
  // Try multiple methods to extract tweet ID

  // Method 1: Look for data-tweet-id attribute
  let tweetId = tweetElement.getAttribute('data-tweet-id')
  if (tweetId) return tweetId

  // Method 2: Look for aria-labelledby that contains tweet ID
  const ariaLabel = tweetElement.getAttribute('aria-labelledby')
  if (ariaLabel) {
    const idMatch = ariaLabel.match(/tweet-(\d+)/)
    if (idMatch) return idMatch[1]
  }

  // Method 3: Look for links that contain tweet IDs
  const links = tweetElement.querySelectorAll('a[href*="/status/"]')
  for (const link of links) {
    const href = link.getAttribute('href')
    const match = href.match(/\/status\/(\d+)/)
    if (match) return match[1]
  }

  // Method 4: Look for any element with tweet ID in ID attribute
  const elementsWithId = tweetElement.querySelectorAll('[id*="tweet-"]')
  for (const element of elementsWithId) {
    const idMatch = element.id.match(/tweet-(\d+)/)
    if (idMatch) return idMatch[1]
  }

  // Fallback: return null if no ID found
  return null
}

// Function to add Pop Market button to compose page
function addPopButtonToCompose() {
  // Look for the compose toolbar or similar element
  const composeToolbar =
    document.querySelector('[data-testid="toolBar"]') ||
    document.querySelector('[role="toolbar"]') ||
    document.querySelector('[data-testid="tweetTextarea_0"]')?.parentElement
      ?.parentElement

  if (composeToolbar && !composeToolbar.querySelector('.pop-button')) {
    const popButton = window.createPopButton()

    // Insert the button into the toolbar
    composeToolbar.appendChild(popButton)

    popButton.addEventListener('click', function (event) {
      event.stopPropagation()
      window.showPopModal()
    })
  }
}

// Function to add market button to a tweet
function addMarketButtonToTweet(tweetElement) {
  // Check if button already exists to prevent duplicates
  if (tweetElement.querySelector('.market-button')) return

  const marketButton = window.createMarketButton()
  const tweetId = extractTweetId(tweetElement)

  // Find the tweet actions area (where like, retweet, etc. buttons are)
  const actionsArea =
    tweetElement.querySelector('[role="group"]') ||
    tweetElement.querySelector('[data-testid="reply"]')?.parentElement ||
    tweetElement.querySelector('[aria-label*="Reply"]')?.parentElement

  if (actionsArea) {
    // Insert the market button in the actions area
    const wrapper = document.createElement('div')
    wrapper.classList.add('market-button-wrapper')
    wrapper.appendChild(marketButton)
    actionsArea.appendChild(wrapper)
  } else {
    // Fallback: append to the tweet element
    const wrapper = document.createElement('div')
    wrapper.classList.add('market-button-wrapper')
    wrapper.appendChild(marketButton)
    tweetElement.appendChild(wrapper)
  }

  // Add click event listener
  marketButton.addEventListener('click', function (event) {
    event.stopPropagation()
    window.showMarketWidgetModal(tweetId)
  })
}

// Function to check for compose page and add Pop Market button
function checkForComposePage() {
  // Check if we're on compose page and add the button
  if (
    window.location.pathname === '/compose/post' ||
    window.location.pathname.includes('/compose/post')
  ) {
    addPopButtonToCompose()
  }
}

// Function to detect and add market buttons to all tweets
function checkForAllPosts() {
  // Look for all tweet articles
  const tweetElements = document.querySelectorAll(
    'article[data-testid="tweet"]'
  )

  tweetElements.forEach((tweetElement) => {
    addMarketButtonToTweet(tweetElement)
  })

  // Also look for tweet containers with different selectors
  const tweetContainers = document.querySelectorAll('[data-testid="tweet"]')
  tweetContainers.forEach((container) => {
    if (!container.querySelector('.market-button')) {
      addMarketButtonToTweet(container)
    }
  })
}

// Function to check for sidebar and add Pop items
function checkForSidebar() {
  addSidebarItems()
}

// Expose functions globally
window.showPopModal = showPopModal
window.showMarketWidgetModal = showMarketWidgetModal
window.showPredictionHistoryModal = showPredictionHistoryModal
window.showMarketBookmarksModal = showMarketBookmarksModal
window.createPopButton = createPopButton
window.createMarketButton = createMarketButton
window.checkForComposePage = checkForComposePage
window.checkForAllPosts = checkForAllPosts
window.checkForSidebar = checkForSidebar
