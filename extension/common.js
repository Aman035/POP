// Configuration - Change these to your production URLs
const POP_SITE_URL = 'https://predict-on-posts.vercel.app'
// const POP_SITE_URL = 'http://localhost:3000'
const POP_API_URL = 'https://13.213.208.119.sslip.io' // Backend API URL (for AI analysis only)
const ENVIO_INDEXER_URL = 'https://api.13.213.208.119.sslip.io/v1/graphql' // Envio indexer for market data

// Function to create and show the Pop Market modal
function showPopModal(iframeUrl) {
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
  iframe.src = iframeUrl || `${POP_SITE_URL}/app/create?embed=true&hideUI=true`
  iframe.style = `
      width: 1000px; 
      height: 1000px; 
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

// Function to create and show the Market Widget modal with tweet ID
async function showMarketWidgetModal(tweetId) {
  // Get market data from cache or fetch it
  let marketData = null
  if (marketStatusCache.has(tweetId)) {
    const status = marketStatusCache.get(tweetId)
    marketData = status.market
  } else {
    const status = await fetchMarketStatus(tweetId)
    marketData = status.market
  }

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

  // Create the iframe with market address URL
  const marketAddress = marketData?.address || tweetId
  const iframe = document.createElement('iframe')
  iframe.src = `${POP_SITE_URL}/app/markets/${marketAddress}?hideUI=true`
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

// Function to create and show My Predictions modal
function showMyPredictionsModal() {
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
  iframe.src = `${POP_SITE_URL}/app/my-predictions?embed=true&hideUI=true`
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

// Function to create and show My Markets modal
function showMyMarketsModal() {
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
  iframe.src = `${POP_SITE_URL}/app/my-markets?embed=true&hideUI=true`
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

const marketStatusCache = new Map()
const marketStatusRequests = new Map()
const tweetAnalysisCache = new Map()

async function analyzePostContent(content, postId) {
  if (!content || !postId) return null

  // Check cache first
  if (tweetAnalysisCache.has(postId)) {
    return tweetAnalysisCache.get(postId)
  }

  console.log(`[Pop] Analyzing post content for ${postId}`)

  try {
    const response = await fetch(`${POP_API_URL}/api/post-analyzer/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: content.trim(),
        postId: postId,
      }),
    })

    if (!response.ok) {
      throw new Error(`Post analysis failed with ${response.status}`)
    }

    const analysis = await response.json()
    console.log(`[Pop] Post analysis result for ${postId}:`, analysis)

    // Cache the result
    tweetAnalysisCache.set(postId, analysis)
    return analysis
  } catch (error) {
    console.warn('[Pop] Post analysis failed:', error)
    return null
  }
}

async function fetchMarketStatus(tweetId) {
  if (!tweetId) return { exists: false }

  if (marketStatusCache.has(tweetId)) {
    return marketStatusCache.get(tweetId)
  }

  if (marketStatusRequests.has(tweetId)) {
    return marketStatusRequests.get(tweetId)
  }

  console.log(`[Pop] Checking market existence for tweet: ${tweetId}`)

  // GraphQL query to check if a market exists for this tweet
  const query = `
    query CheckMarketExists($identifier: String!) {
      MarketFactory_MarketCreated(where: { params_2: { _eq: $identifier } }) {
        market
      }
    }
  `

  const requestPromise = fetch(ENVIO_INDEXER_URL, {
    method: 'POST',
    headers: {
      'x-hasura-admin-secret': 'testing',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: query,
      variables: {
        identifier: tweetId,
      },
    }),
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`GraphQL query failed with ${response.status}`)
      }
      const data = await response.json()

      if (data.errors) {
        console.warn('[Pop] GraphQL errors:', data.errors)
        return { exists: false, error: true }
      }

      const markets = data.data?.MarketFactory_MarketCreated || []
      const result = {
        exists: markets.length > 0,
        market: markets.length > 0 ? { address: markets[0].market } : null,
      }

      console.log(`[Pop] Market status for ${tweetId}:`, result)

      // Only cache if market exists - so we don't repeatedly query for tweets without markets
      if (result.exists) {
        marketStatusCache.set(tweetId, result)
      }

      return result
    })
    .catch((error) => {
      console.warn('[Pop] Market existence lookup failed:', error)
      return { exists: false, error: true }
    })
    .finally(() => {
      marketStatusRequests.delete(tweetId)
    })

  marketStatusRequests.set(tweetId, requestPromise)
  return requestPromise
}

function getComposeQuestionText() {
  const editor = document.querySelector(
    'div[role="textbox"][data-testid="tweetTextarea_0"]'
  )
  if (!editor) return ''
  return editor.textContent?.trim() || ''
}

function getPollOptions() {
  const optionInputs = document.querySelectorAll('input[name^="Choice"]')
  const options = []

  optionInputs.forEach((input) => {
    const value = input.value?.trim()
    if (value) {
      options.push(value)
    }
  })

  return options
}

function getPollDuration() {
  const daysSelect = document.querySelector('[data-testid="selectPollDays"]')
  const hoursSelect = document.querySelector('[data-testid="selectPollHours"]')
  const minutesSelect = document.querySelector(
    '[data-testid="selectPollMinutes"]'
  )

  const parseValue = (element) => {
    if (!element) return 0
    const value = parseInt(element.value, 10)
    return Number.isNaN(value) ? 0 : value
  }

  return {
    days: parseValue(daysSelect),
    hours: parseValue(hoursSelect),
    minutes: parseValue(minutesSelect),
  }
}

function collectPollDataFromCompose() {
  const duration = getPollDuration()
  const totalMinutes =
    duration.days * 24 * 60 + duration.hours * 60 + duration.minutes

  return {
    source: 'twitter-poll',
    question: getComposeQuestionText(),
    options: getPollOptions(),
    duration,
    totalMinutes,
  }
}

function buildCreateMarketUrl(params = {}) {
  const url = new URL('/app/create', POP_SITE_URL)
  url.searchParams.set('hideUI', 'true')

  if (params.question) {
    url.searchParams.set('question', params.question)
  }

  if (Array.isArray(params.options)) {
    params.options.forEach((option, index) => {
      if (option) {
        url.searchParams.set(`option${index + 1}`, option)
      }
    })
  }

  // Handle options as comma-separated string (from analysis)
  if (params.options && typeof params.options === 'string') {
    const optionsArray = params.options.split(',')
    optionsArray.forEach((option, index) => {
      if (option && option.trim()) {
        url.searchParams.set(`option${index + 1}`, option.trim())
      }
    })
  }

  if (params.category) {
    url.searchParams.set('category', params.category)
  }

  if (params.tweetId) {
    url.searchParams.set('identifier', params.tweetId) // Use tweetId as identifier
  }

  url.searchParams.set('platform', 'twitter')

  return url.toString()
}

function openCreateMarketFromPoll() {
  const pollData = collectPollDataFromCompose()
  console.log('[Pop] Captured poll data:', pollData)

  const createUrl = buildCreateMarketUrl(pollData)
  showPopModal(createUrl)
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

function extractTweetText(tweetElement) {
  const textNodes = tweetElement.querySelectorAll('[data-testid="tweetText"]')
  if (!textNodes.length) {
    return ''
  }

  const combined = Array.from(textNodes)
    .map((node) => node.textContent || '')
    .join(' ')

  return combined.replace(/\s+/g, ' ').trim()
}

function extractTweetUrl(tweetElement, tweetId) {
  const candidateLink = tweetElement.querySelector('a[href*="/status/"]')
  if (!candidateLink) {
    if (tweetId) {
      return `https://x.com/i/status/${tweetId}`
    }
    return ''
  }

  const href = candidateLink.getAttribute('href') || ''
  if (!href) {
    return ''
  }

  if (href.startsWith('http')) {
    return href
  }

  return `https://x.com${href}`
}

function createInlineCreateButton(tweetElement, tweetId) {
  const button = document.createElement('button')
  button.type = 'button'
  button.classList.add('pop-create-button')
  button.setAttribute('aria-label', 'Create market for this post')
  button.innerHTML = `
    <span class="pop-create-button-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" focusable="false">
        <path d="M11 11V4h2v7h7v2h-7v7h-2v-7H4v-2h7z" fill="currentColor"></path>
      </svg>
    </span>
    <span class="pop-create-button-label">Create</span>
  `

  button.addEventListener('click', async (event) => {
    event.preventDefault()
    event.stopPropagation()

    // Disable button during analysis
    button.disabled = true
    button.innerHTML = `
      <span class="pop-create-button-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2">
            <animateTransform attributeName="transform" type="rotate" dur="1s" repeatCount="indefinite" values="0 12 12;360 12 12"/>
          </circle>
        </svg>
      </span>
      <span class="pop-create-button-label">Analyzing...</span>
    `

    try {
      const tweetContent = extractTweetText(tweetElement)
      const tweetUrl = extractTweetUrl(tweetElement, tweetId)

      console.log(`[Pop] Analyzing post content: "${tweetContent}"`)

      // Analyze tweet content with backend
      const analysis = await analyzePostContent(tweetContent, tweetId)

      if (analysis && analysis.question && analysis.options) {
        // Use analyzed data to create market
        const createUrl = buildCreateMarketUrl({
          source: 'twitter-post',
          tweetId,
          tweetUrl,
          question: analysis.question,
          options: analysis.options.join(','),
          category: analysis.category,
          confidence: analysis.confidence,
        })

        console.log(
          `[Pop] Opening create market modal with analysis:`,
          analysis
        )
        showPopModal(createUrl)
      } else {
        // Fallback to original behavior if analysis fails
        console.warn('[Pop] Analysis failed, using fallback')
        const createUrl = buildCreateMarketUrl({
          source: 'twitter-post',
          tweetId,
          tweetUrl,
          question: tweetContent,
        })

        showPopModal(createUrl)
      }
    } catch (error) {
      console.error('[Pop] Error creating market:', error)
      // Show error or fallback
      alert('Failed to analyze post. Please try again.')
    } finally {
      // Re-enable button
      button.disabled = false
      button.innerHTML = `
        <span class="pop-create-button-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false">
            <path d="M11 11V4h2v7h7v2h-7v7h-2v-7H4v-2h7z" fill="currentColor"></path>
          </svg>
        </span>
        <span class="pop-create-button-label">Create</span>
      `
    }
  })

  return button
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

  // Create Markets sidebar item - matching X's exact styling
  const allMarketsItem = document.createElement('div')
  allMarketsItem.className = 'pop-sidebar-item'
  allMarketsItem.innerHTML = `
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
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" style="filter: brightness(0) saturate(100%) invert(89%) sepia(6%) saturate(464%) hue-rotate(169deg) brightness(95%) contrast(89%);">
          <path d="M3 3h18v18H3V3zm16 16V5H5v14h14zM7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z" fill="currentColor"/>
        </svg>
      </div>
      <span class="pop-sidebar-text" style="
        color: rgb(231, 233, 234);
        font-size: 20px;
        font-weight: 400;
        font-family: 'TwitterChirp', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        transition: opacity 0.2s;
      ">Markets</span>
    </div>
  `

  // Create Activity sidebar item - matching X's exact styling
  const activityItem = document.createElement('div')
  activityItem.className = 'pop-sidebar-item'
  activityItem.innerHTML = `
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
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" style="filter: brightness(0) saturate(100%) invert(89%) sepia(6%) saturate(464%) hue-rotate(169deg) brightness(95%) contrast(89%);">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
        </svg>
      </div>
      <span class="pop-sidebar-text" style="
        color: rgb(231, 233, 234);
        font-size: 20px;
        font-weight: 400;
        font-family: 'TwitterChirp', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        transition: opacity 0.2s;
      ">Activity</span>
    </div>
  `

  // Add click event listeners
  predictionsItem.addEventListener('click', function (event) {
    event.stopPropagation()
    window.showMyPredictionsModal()
  })

  marketsItem.addEventListener('click', function (event) {
    event.stopPropagation()
    window.showMyMarketsModal()
  })

  allMarketsItem.addEventListener('click', function (event) {
    event.stopPropagation()
    window.showAllMarketsModal()
  })

  activityItem.addEventListener('click', function (event) {
    event.stopPropagation()
    window.showActivityModal()
  })

  // Append items to container
  popSidebarContainer.appendChild(allMarketsItem)
  popSidebarContainer.appendChild(activityItem)
  popSidebarContainer.appendChild(marketsItem)
  popSidebarContainer.appendChild(predictionsItem)

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
      event.preventDefault()
      event.stopPropagation()
      if (popButton.disabled) return
      openCreateMarketFromPoll()
    })
  }

  const popButton = composeToolbar?.querySelector('.pop-button')
  if (!popButton) return

  const pollActive = Boolean(
    document.querySelector('[data-testid="selectPollDays"]') ||
      document.querySelector('[data-testid="selectPollHours"]') ||
      document.querySelector('[data-testid="selectPollMinutes"]') ||
      document.querySelector('[data-testid="removePollButton"]')
  )

  if (!pollActive) {
    popButton.style.display = 'none'
    popButton.setAttribute('aria-hidden', 'true')
    popButton.disabled = true
    popButton.classList.add('pop-button--disabled')
    return
  }

  popButton.style.display = 'inline-flex'
  popButton.removeAttribute('aria-hidden')

  const tweetButton = document.querySelector('[data-testid="tweetButton"]')
  const tweetDisabled =
    !tweetButton ||
    tweetButton.getAttribute('aria-disabled') === 'true' ||
    tweetButton.hasAttribute('disabled')

  if (tweetDisabled) {
    popButton.disabled = true
    popButton.classList.add('pop-button--disabled')
  } else {
    popButton.disabled = false
    popButton.classList.remove('pop-button--disabled')
  }
}

// Function to add market button to a tweet
async function addMarketButtonToTweet(tweetElement) {
  if (!tweetElement || !tweetElement.isConnected) return

  const parentArticle = tweetElement.closest('article[data-testid="tweet"]')
  if (parentArticle) {
    tweetElement = parentArticle
  }

  if (!tweetElement.matches?.('article[data-testid="tweet"]')) {
    return
  }

  const tweetId = extractTweetId(tweetElement)
  if (!tweetId) return

  const statusFlag = tweetElement.dataset.popMarketStatus
  if (statusFlag === 'loading') {
    return
  }

  if (
    statusFlag === 'loaded' &&
    tweetElement.querySelector('.pop-market-action')
  ) {
    return
  }

  tweetElement.dataset.popMarketStatus = 'loading'

  const actionsArea =
    tweetElement.querySelector('[role="group"]') ||
    tweetElement.querySelector('[data-testid="reply"]')?.parentElement ||
    tweetElement.querySelector('[aria-label*="Reply"]')?.parentElement

  if (!actionsArea) {
    delete tweetElement.dataset.popMarketStatus
    return
  }

  let wrapper = actionsArea.querySelector('.pop-market-action')
  if (!wrapper) {
    wrapper = document.createElement('div')
    wrapper.classList.add('market-button-wrapper', 'pop-market-action')
    actionsArea.appendChild(wrapper)
  }

  wrapper.innerHTML = ''
  wrapper.dataset.tweetId = tweetId

  try {
    const status = await fetchMarketStatus(tweetId)

    if (!tweetElement.isConnected || !wrapper.isConnected) {
      return
    }

    wrapper.innerHTML = ''

    if (status.exists) {
      // Market exists - show "Predict" button
      const marketButton = window.createMarketButton()
      marketButton.title = 'View and predict on this market'
      marketButton.addEventListener('click', (event) => {
        event.preventDefault()
        event.stopPropagation()
        window.showMarketWidgetModal(tweetId)
      })

      wrapper.appendChild(marketButton)
      console.log(`[Pop] Added predict button for tweet ${tweetId}`)
    } else if (!status.error) {
      // Market doesn't exist - show "Create" button
      const createButton = createInlineCreateButton(tweetElement, tweetId)
      createButton.title = 'Create prediction market for this post'
      wrapper.appendChild(createButton)
      console.log(`[Pop] Added create button for tweet ${tweetId}`)
    } else {
      // API error - show error state or nothing
      console.warn(`[Pop] API error for tweet ${tweetId}, not showing button`)
    }

    tweetElement.dataset.popMarketStatus = 'loaded'
  } catch (error) {
    console.warn('[Pop] Failed to render market button:', error)
    wrapper.innerHTML = ''
    delete tweetElement.dataset.popMarketStatus
  }
}

// Function to check for compose page (disabled - no longer adding buttons to compose)
function checkForComposePage() {
  // Compose page functionality removed as requested
  return
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

// Function to create and show All Markets modal
function showAllMarketsModal() {
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
  iframe.src = `${POP_SITE_URL}/app/markets?embed=true&hideUI=true`
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
  modal.appendChild(floatingCloseButton)
  document.body.appendChild(modal)

  // Show/hide close button based on cursor position
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

  function closeModal() {
    modal.remove()
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('click', handleOutsideClick)
  }

  // Add event listeners
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('click', handleOutsideClick)
}

// Function to create and show Activity modal
function showActivityModal() {
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
  iframe.src = `${POP_SITE_URL}/app?embed=true&hideUI=true`
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
  modal.appendChild(floatingCloseButton)
  document.body.appendChild(modal)

  // Show/hide close button based on cursor position
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

  function closeModal() {
    modal.remove()
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('click', handleOutsideClick)
  }

  // Add event listeners
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('click', handleOutsideClick)
}

// Function to check for sidebar and add Pop items
function checkForSidebar() {
  addSidebarItems()
}

// Expose functions globally
window.showPopModal = showPopModal
window.showMarketWidgetModal = showMarketWidgetModal
window.showMyPredictionsModal = showMyPredictionsModal
window.showMyMarketsModal = showMyMarketsModal
window.showAllMarketsModal = showAllMarketsModal
window.showActivityModal = showActivityModal
window.createPopButton = createPopButton
window.createMarketButton = createMarketButton
window.checkForComposePage = checkForComposePage
window.checkForAllPosts = checkForAllPosts
window.checkForSidebar = checkForSidebar
