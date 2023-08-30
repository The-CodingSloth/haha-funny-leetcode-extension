const {
  initiatePuppeteer,
  scrapeBlind75Problems,
  scrapeNeetCode150Problems,
  scrapeAllProblems,
  scrapeCategories,
  saveProblemstoJSON,
} = require('./web_scrape_problems');

(async () => {
  const { browser, page } = await initiatePuppeteer();
  const saveDirectoryLocation = '../leetcode-problems';

  await scrapeCategories(page);
  // The order has to start at all problems because when you have a category opened that's not in the other tabs, the tab closes. So you have to start with the tab that has all the categories
  // Might need to find a better way to scrape the categories, since this is highly dependent on the website
  const allProblems = await scrapeAllProblems(page);
  const blind75Problems = await scrapeBlind75Problems(page);
  const neetCode150Problems = await scrapeNeetCode150Problems(page);
  saveProblemstoJSON('allProblems.json', saveDirectoryLocation, allProblems);
  saveProblemstoJSON(
    'blind75Problems.json',
    saveDirectoryLocation,
    blind75Problems
  );
  saveProblemstoJSON(
    'neetCode150Problems.json',
    saveDirectoryLocation,
    neetCode150Problems
  );
  await browser.close();
})();
