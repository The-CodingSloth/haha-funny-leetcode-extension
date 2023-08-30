//TODO: fix these stupid tests so that they can run together properly
//For some reason, when you run them together, the scraper passes, but not the savetoJSON????

const {
  initiatePuppeteer,
  scrapeBlind75Problems,
  scrapeNeetCode150Problems,
  scrapeAllProblems,
  scrapeCategories,
  saveProblemstoJSON,
} = require('../scripts/web_scraper/web_scrape_problems');

const fs = require('fs');
const path = require('path');
const uuidv4 = require('uuid').v4;

// Variables for Puppeteer
let page, browser;

// Add or remove categories as needed
// Might need to find a better way to scrape the categories, since this is highly dependent on the website too, so these tests might break
const currentCategories = [
  'Arrays & Hashing',
  'Two Pointers',
  'Sliding Window',
  'Stack',
  'Binary Search',
  'Linked List',
  'Trees',
  'Tries',
  'Heap / Priority Queue',
  'Backtracking',
  'Graphs',
  'Advanced Graphs',
  '1-D Dynamic Programming',
  '2-D Dynamic Programming',
  'Greedy',
  'Intervals',
  'Math & Geometry',
  'Bit Manipulation',
  'JavaScript',
];

const testDirectory = '../testLeetcode-Problems';
let uniqueTestDirectory;

const removeFiles = () => {
  // Define filePath for each file to be deleted
  const allProblemsFilePath = path.join(
    __dirname,
    `${testDirectory}/allProblems.json`
  );
  const blind75ProblemsFilePath = path.join(
    __dirname,
    `${testDirectory}/blind75Problems.json`
  );
  const neetCode150ProblemsFilePath = path.join(
    __dirname,
    `${testDirectory}/neetCode150Problems.json`
  );

  // Delete allProblems.json if it exists
  if (fs.existsSync(allProblemsFilePath)) {
    fs.unlinkSync(allProblemsFilePath);
  }

  // Delete blind75Problems.json if it exists
  if (fs.existsSync(blind75ProblemsFilePath)) {
    fs.unlinkSync(blind75ProblemsFilePath);
  }

  // Delete neetCode150Problems.json if it exists
  if (fs.existsSync(neetCode150ProblemsFilePath)) {
    fs.unlinkSync(neetCode150ProblemsFilePath);
  }
};
describe('Scrape functions', () => {
  beforeAll(async () => {
    uniqueTestDirectory = path.join(testDirectory, uuidv4());
    removeFiles();
    console.log(
      'Before tests, Attemping to remove test directory',
      testDirectory
    );
    if (fs.existsSync(testDirectory)) {
      fs.rm(testDirectory);
    }
    jest.setTimeout(100000); // Setting global timeout for all tests in this file
    const puppeteerSetup = await initiatePuppeteer();
    browser = puppeteerSetup.browser;
    page = puppeteerSetup.page;
  });

  afterEach(() => {
    // Define filePath for each file to be deleted
    removeFiles();
  });
  afterAll(async () => {
    await browser.close();
    console.log(
      'After all tests, Attemping to remove test directory',
      testDirectory
    );
    if (fs.existsSync(testDirectory)) {
      fs.rm(testDirectory, { recursive: true });
    }
  });

  it('Scrape Categories returns expected categories ', async () => {
    const { categories } = await scrapeCategories(page);
    expect(categories).toEqual(currentCategories);
  }, 150000);
  // The order has to start at all problems because when you have a category opened that's not in the other tabs, the tab closes. So you have to start with the tab that has all the categories
  // Might need to find a better way to scrape the categories, since this is highly dependent on the website
  test('Scrape All Problems returns expected problems count', async () => {
    const problems = await scrapeAllProblems(page);
    // This number will change as more problems are added to the site (might need to make a function to get the count dynamically)
    expect(problems.length).toBe(441);
  });

  test('Scrape Blind 75 Problems returns expected problems count', async () => {
    const problems = await scrapeBlind75Problems(page);
    expect(problems.length).toBe(75);
  });

  test('Scrape NeetCode 150 Problems returns expected problems count', async () => {
    const problems = await scrapeNeetCode150Problems(page);
    expect(problems.length).toBe(150);
  });

  test('Should save all problems to JSON file', async () => {
    const problems = await scrapeAllProblems(page);
    saveProblemstoJSON('allProblems.json', testDirectory, problems);
    const filePath = path.join(__dirname, `${testDirectory}/allProblems.json`);
    expect(fs.existsSync(filePath)).toBe(true);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    expect(content).toEqual(problems);
  });

  test('Should save Blind 75 problems to JSON file', async () => {
    const problems = await scrapeBlind75Problems(page);
    saveProblemstoJSON('blind75Problems.json', testDirectory, problems);
    const filePath = path.join(
      __dirname,
      `${testDirectory}/blind75Problems.json`
    );
    expect(fs.existsSync(filePath)).toBe(true);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    expect(content).toEqual(problems);
  });
  test('Should save NeetCode 150 problems to JSON file', async () => {
    const problems = await scrapeNeetCode150Problems(page);
    saveProblemstoJSON('neetCode150Problems.json', testDirectory, problems);
    const filePath = path.join(
      __dirname,
      `${testDirectory}/neetCode150Problems.json`
    );
    expect(fs.existsSync(filePath)).toBe(true);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    expect(content).toEqual(problems);
  });
});
