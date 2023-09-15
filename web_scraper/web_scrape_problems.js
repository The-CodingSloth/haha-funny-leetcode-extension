const puppeteer = require("puppeteer")
const fs = require("fs")
const path = require("path")

const url = "https://neetcode.io/practice/"

// This function will add a delay to the code execution (in milliseconds)
const addDelay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const initiatePuppeteer = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null
  })
  const page = await browser.newPage()
  await page.goto(url)
  return { browser, page }
}

const scrapeCategories = async (page) => {
  // Click on the all problems tab to get all the categories
  // Might need to find a better way to scrape the categories, since this is highly dependent on the website
  const tabLinks = await page.$$(
    "div.tabs.is-centered.is-boxed.is-large ul.tabs-list li a.tab-link"
  )
  // If the website changes, and the tabs are no longer in the same order, or there's a new tab, you'll need to change this index
  await tabLinks[2].click()
  // Wait for necessary elements
  await page.waitForSelector("app-pattern-table", { timeout: 1000 })
  await page.waitForSelector(
    "button.flex-container-row.accordion.button.is-fullwidth.ng-tns-c41-0",
    { timeout: 1000 }
  )

  // Get category count
  const categoryCount = await page.$$eval(
    "app-pattern-table",
    (categories) => categories.length
  )

  // Expand each category to reveal problems
  for (let i = 0; i < categoryCount; i++) {
    const selector = `button.flex-container-row.accordion.button.is-fullwidth.ng-tns-c41-${i}`
    await page.waitForSelector(selector)
    await addDelay(750)
    await page.click(selector)
  }

  // Extract category names
  const categories = await page.$$eval(
    "button.flex-container-row.accordion.button.is-fullwidth.active",
    (buttons) => {
      return buttons
        .map((button) => {
          const paragraph = button.querySelector("p")
          return paragraph ? paragraph.textContent.trim() : null
        })
        .filter(Boolean)
    }
  )

  return { categories, categoryCount }
}

const scrapeProblemsFromTab = async (page, tabIndex) => {
  const tabLinks = await page.$$(
    "div.tabs.is-centered.is-boxed.is-large ul.tabs-list li a.tab-link"
  )
  await tabLinks[tabIndex].click()
  await page.waitForTimeout(3000)
  // Extract problem details
  const problems = await await page.$$eval("tr.ng-star-inserted", (rows) => {
    return rows.map((row) => {
      const anchor = row.querySelector("td a.table-text")
      const isPremium = row.querySelector(
        "td a.has-tooltip-bottom.ng-star-inserted"
      )
      const difficultyElement = row.querySelector("td.diff-col b")
      const container = row.closest(".accordion-container")
      const categoryElement = container
        ? container.querySelector(
            "button.flex-container-row.accordion.button.is-fullwidth.active p"
          )
        : null
      const category = categoryElement
        ? categoryElement.textContent.trim()
        : null
      return {
        category: category,
        href: anchor ? anchor.href : null,
        text: anchor ? anchor.textContent.trim() : null,
        // In the future we could use the lintcode url as well, not sure
        difficulty: difficultyElement
          ? difficultyElement.textContent.trim()
          : null,
        isPremium: isPremium ? true : false
      }
    })
  })
  return problems
}

//These functions highly depend on their position in the tabs, and number
//of tabs. If the website changes, these functions will need to be updated
//to reflect the changes.
// Might need to find a better way to scrape the problems

//Adding scrapeCategories to each function to ensure that the categories are scraped
const scrapeBlind75Problems = async (page) => {
  return await scrapeProblemsFromTab(page, 1)
}

const scrapeNeetCode150Problems = async (page) => {
  return await scrapeProblemsFromTab(page, 2)
}

const scrapeAllProblems = async (page) => {
  return await scrapeProblemsFromTab(page, 3)
}

const saveProblemstoJSON = (filename, dirLocation, data) => {
  const directory = path.join(__dirname, dirLocation) // Adjust the path based on your directory structure
  console.log(`Trying to save data to ${dirLocation}/${filename}`)
  try {
    if (!fs.existsSync(directory)) {
      console.log(`Directory ${directory} doesn't exist. Creating now.`)
      fs.mkdirSync(directory, { recursive: true }) // Creates the directory if it doesn't exist
    }
  } catch (err) {
    console.error(err)
  }
  try {
    fs.writeFileSync(
      path.join(directory, filename),
      JSON.stringify(data, null, 2),
      "utf-8"
    )
  } catch (err) {
    console.error(err)
  }
  console.log(`Data saved to ${directory}`)
}

/*
  Just in case the website changes, and the tabs are no longer in the same order, or there's a new tab, here's the code to check (hopefully it still works)
  const tabCount = (
    await page.$$(
      'div.tabs.is-centered.is-boxed.is-large ul.tabs-list li a.tab-link'
    )
  ).length;
  */

module.exports = {
  initiatePuppeteer,
  scrapeCategories,
  scrapeBlind75Problems,
  scrapeNeetCode150Problems,
  scrapeAllProblems,
  saveProblemstoJSON
}
