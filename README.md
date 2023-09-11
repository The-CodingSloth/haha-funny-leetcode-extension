# [LeetCode Torture](https://chromewebstore.google.com/detail/leetcode-torture/clbhgfneekiimoaakhhdjimgnnbnfbeh)

![LeetCode Torture Logo](https://raw.githubusercontent.com/The-CodingSloth/haha-funny-leetcode-extension/main/public/icons/icon128.png)

LeetCode Torture is an extension designed to make you productive to ace those technical interviews. When you activate this extension, you won't be able to access any websites except LeetCode until you solve your randomly assigned LeetCode problem. [Here's the video on YouTube.](https://youtu.be/e4ReFOWMG9o?si=CJ2EdqVPFPdcc7GN)

## Features

- Random Problem Assignment: Get a random LeetCode problem every day
- Website Blocker: Prevents you from accessing any websites until you solve your problem

## Local Installation for Testing and Development

### Setting up:

- Have Node.js Installed on your machine
- Clone or download the repo
- Navigate to the root directory
- Run `npm install` to install the required dependencies
- Look at FAQs for additional steps for M1 Macs and other Macs **possibly**:

### Building the Extension to run locally:

- In the terminal run the command `npm run build` This will create a `dist` folder with the built extension.
- Open Chrome and open up your extensions page
- Enable Developer Mode using the toggle at the top right of the page
- Click on the Load unpacked button on the top left of the page
- Locate and select the dist folder you created from running the command
- The extension should now be installed have fun

## FAQ

### Why did you make this?

Just for fun

### Do I need to be a senior 10x developer to help and contribute?

Nope, anybody can contribute to this torture machine, skill level does not matter. I made this project with no knowledge about making extensions

### How do I help and improve LeetCode Torture?

Read our [CONTRIBUTING.md file](https://github.com/The-CodingSloth/haha-funny-leetcode-extension/blob/main/CONTRIBUTING.md) to learn how to help make this extension more painful for everyone

### I don't even know where to start

That's perfectly fine, take some time and read the code to understand what's going on. You don't have to make super big changes, they can be as small as fixing my dumb typos on these files or adding helpful comments to the code.

### I am getting an ERROR: Failed to set up Chrome/Chromium <somenumbershere> ! Set "PUPPETEER_SKIP_DOWNLOAD" env variable to skip download when I npm install on my Mac M1/just regular Mac

- Recommendation - ditch Chrome, use Chromium. If following this route, make sure to properly delete Chrome
- Open your terminal
- cd ~
- open your .bash_profile or .zshrc. You can use vi or nano or whatever
- add this line - export PUPPETEER_SKIP_DOWNLOAD=true and export PUPPETEER_EXECUTABLE_PATH=`which chromium`
- once done cat your file to see if you have added the line
- once this is done run 'source ~/.bash_profile' or .zshrc. This should reload and link everything.
- Try to install again via npm install. Everything should now work.
