This is a [Plasmo extension](https://docs.plasmo.com/) project bootstrapped with [`plasmo init`](https://www.npmjs.com/package/plasmo).

# [LeetCode Torture](https://chromewebstore.google.com/detail/leetcode-torture/clbhgfneekiimoaakhhdjimgnnbnfbeh)

![LeetCode Torture Logo](https://raw.githubusercontent.com/The-CodingSloth/haha-funny-leetcode-extension/main/assets/icon.png)

LeetCode Torture is an extension designed to make you productive to ace those technical interviews. When you activate this extension, you won't be able to access any websites except LeetCode until you solve your randomly assigned LeetCode problem. [Here's the video on YouTube.](https://youtu.be/e4ReFOWMG9o?si=CJ2EdqVPFPdcc7GN)

## Features

- Random Problem Assignment: Get a random LeetCode problem every day
- Website Blocker: Prevents you from accessing any websites until you solve your problem

## Local Installation for Testing and Development

### Setting up:

- Have Node.js Installed on your machine
- Clone or download the repo
- Navigate to the root directory
- Install pnpm if you don't have it (it's recommended to use it from plasmo)
- Run `pnpm install` to install the required dependencies

### Building the Extension to run locally on Chrome:

- In the terminal run the command `pnpm dev` or `npm run dev`
- Open Chrome and open up your extensions page
- Enable Developer Mode using the toggle at the top right of the page
- Click on the Load unpacked button on the top left of the page
- Locate and select the appropriate development build. For example, if you are developing for the chrome browser, using manifest v3, use: `build/chrome-mv3-dev`.
- The extension should now be installed have fun
- You can start editing the popup by modifying `popup.tsx`. It should auto-update as you make changes.

### For Firefox development

- Make sure your Firefox is on version 109 (we're using manifest v3)
- In the terminal run the command `pnpm dev --target=firefox-mv3` or `npm run dev-firefox`
- In the build folder you should now see `build/firefox-mv3-dev`
- In Firefox type about:debugging in the URL.
- Go to "This Firefox"
- In Temporary Extensions click "Load Temporary Add-on"
- Select any file from your folder

#### To get the extension working properly right now on Firefox

- Go to leetcode.com and right click the extension, and give the extension permission
- Do the same for any websites you visit (FIrefox, doesn't give permissions automatically like chrome which is why we have to do this, it's annoying)

## FAQ

### Why did you make this?

Just for fun

### Do I need to be a senior 10x developer to help and contribute?

Nope, anybody can contribute to this torture machine, skill level does not matter. I made this project with no knowledge about making extensions

### How do I help and improve LeetCode Torture?

Read our [CONTRIBUTING.md file](https://github.com/The-CodingSloth/haha-funny-leetcode-extension/blob/main/CONTRIBUTING.md) to learn how to help make this extension more painful for everyone

### I don't even know where to start

That's perfectly fine, take some time and read the code to understand what's going on. You don't have to make super big changes, they can be as small as fixing my dumb typos on these files or adding helpful comments to the code.

For further guidance, [visit our Documentation](https://docs.plasmo.com/)
