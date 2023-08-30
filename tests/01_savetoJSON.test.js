const fs = require('fs');
const path = require('path');
const {
  saveProblemstoJSON,
} = require('../scripts/web_scraper/web_scrape_problems');
const uuidv4 = require('uuid').v4;

const testDirectory = '../testDirectory';
const testFilename = 'testFile.json';
const testData = { key: 'value' };

describe('saveProblemstoJSON function', () => {
  let uniqueTestDirectory;
  const getFilePath = () => path.join(testDirectory, testFilename);
  // Setup: Create unique directory for tests
  beforeAll(() => {
    uniqueTestDirectory = path.join(testDirectory, uuidv4());
    console.log('Before attemping tests, deleting directory: ', testDirectory);
    if (fs.existsSync(testDirectory)) {
      fs.rmSync(testDirectory, { recursive: true }); // Using recursive to ensure it deletes non-empty directories
    }
  });

  // Cleanup: Delete test file after each test
  afterEach(() => {
    const filePath = getFilePath();
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });

  // Cleanup: Delete unique test directory after all tests
  afterAll(() => {
    console.log('attempting to delete directory: ', testDirectory);
    if (fs.existsSync(testDirectory)) {
      fs.rmSync(testDirectory, { recursive: true }); // Using recursive to ensure it deletes non-empty directories
    }
  });

  it('should create a new directory if it does not exist', () => {
    expect(fs.existsSync(testDirectory)).toBe(false);
    saveProblemstoJSON(testFilename, testDirectory, testData);
    expect(fs.existsSync(testDirectory)).toBe(true);
  });

  it('should create a file with the given filename', () => {
    saveProblemstoJSON(testFilename, testDirectory, testData);
    const filePath = getFilePath();
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it('should write correct data to the file', () => {
    saveProblemstoJSON(testFilename, testDirectory, testData);
    const filePath = getFilePath();
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    expect(content).toEqual(testData);
  });

  it('should overwrite existing file with new data', () => {
    const initialData = { initial: 'data' };
    const filePath = getFilePath();
    saveProblemstoJSON(testFilename, testDirectory, initialData);
    saveProblemstoJSON(testFilename, testDirectory, testData);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    expect(content).not.toEqual(initialData);
    expect(content).toEqual(testData);
  });
});
