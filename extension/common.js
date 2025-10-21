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
  iframe.src = `http://localhost:3000/app/create?embed=true&hideUI=true` // Add parameters to hide UI elements
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
  iframe.src = `http://localhost:3000/app/markets/${tweetId}?embed=true&hideUI=true` // Use tweet ID in URL
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

// Helper function to create Pop Market button
function createPopButton() {
  const popButton = document.createElement('button')
  popButton.innerText = '🎯 Create Market'
  popButton.classList.add('pop-button')
  return popButton
}

// Helper function to create "Market" button for all posts
function createMarketButton() {
  const marketButton = document.createElement('button')
  marketButton.innerText = '📈 Market'
  marketButton.classList.add('market-button')
  return marketButton
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
    actionsArea.appendChild(marketButton)
  } else {
    // Fallback: append to the tweet element
    tweetElement.appendChild(marketButton)
  }

  // Add click event listener
  marketButton.addEventListener('click', function (event) {
    event.stopPropagation()
    console.log('Opening market for tweet ID:', tweetId)
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

// Expose functions globally
window.showPopModal = showPopModal
window.showMarketWidgetModal = showMarketWidgetModal
window.createPopButton = createPopButton
window.createMarketButton = createMarketButton
window.checkForComposePage = checkForComposePage
window.checkForAllPosts = checkForAllPosts
