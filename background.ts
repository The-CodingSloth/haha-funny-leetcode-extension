import { Storage } from "@plasmohq/storage"

//Constants
const LEETCODE_URL = "https://leetcode.com"
const RULE_ID = 1
const storage = new Storage()
// Helper functions
const isLeetCodeUrl = (url: string) => url.includes(LEETCODE_URL)

const isSubmissionSuccessURL = (url: string) =>
  url.includes("/submissions/detail/") && url.includes("/check/")

const sendUserSolvedMessage = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: "userSolvedProblem" })
    console.log("User solved problem message sent")
  })
}

//Global modifiable variables (I know, I know, but it's the easiest way to do it fix it yourself)

let leetcodeProblemSolved = false
let leetCodeProblem = {
  url: "",
  name: ""
}
let lastSubmissionDate = new Date(0)

// TODO: Need to find a way to filter out premium problems
const generateRandomLeetCodeProblem = async () => {
  try {
    const res = await fetch(
      chrome.runtime.getURL("leetcode-problems/blind75Problems.json")
    )
    const leetCodeProblems = await res.json()
    const randomIndex = Math.floor(Math.random() * leetCodeProblems.length)
    const randomProblem = leetCodeProblems[randomIndex]
    const randomProblemURL = randomProblem.href
    const randomProblemName = randomProblem.text
    return { randomProblemURL, randomProblemName }
  } catch (error) {
    console.error("Error generating random problem", error)
    return undefined
  }
}

// Communication functions between background.js, popup.js, and content.js
const onMessageReceived = (message, sender, sendResponse) => {
  switch (message.action) {
    case "getProblemStatus":
      sendResponse({
        problemSolved: leetcodeProblemSolved,
        problem: leetCodeProblem
      })
      break
    case "userClickedSubmit":
      lastSubmissionDate = new Date()
      break
    default:
      console.warn("Unknown message action:", message.action)
  }
}

async function setRedirectRule(newRedirectUrl: string) {
  // Can't use built in chrome types for firefox
  let newRedirectRule = {
    id: RULE_ID,
    priority: 1,
    action: {
      type: "redirect",
      redirect: { url: newRedirectUrl }
    },
    condition: {
      urlFilter: "*://*/*",

      excludedInitiatorDomains: ["leetcode.com"],

      resourceTypes: ["main_frame"]
    }
  }

  try {
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [RULE_ID],
      // Type error for addRules, but it works
      addRules: [newRedirectRule]
    })
    const currentRules = await chrome.declarativeNetRequest.getDynamicRules()
    console.log("Redirect rule updated")
    console.log("Current rules:", currentRules)
  } catch (error) {
    console.error("Error updating redirect rule:", error)
  }
}
const updateStorage = async () => {
  try {
    const result = await generateRandomLeetCodeProblem()

    const { randomProblemURL, randomProblemName } = result
    leetcodeProblemSolved = false
    leetCodeProblem = { url: randomProblemURL, name: randomProblemName }
    await storage.set("problemURL", randomProblemURL)
    await storage.set("problemName", randomProblemName)
    await storage.set("problemDate", new Date().toDateString())
    await storage.set("leetCodeProblemSolved", false)

    await setRedirectRule(randomProblemURL)
  } catch (error) {
    console.error(error)
  }
}
// Checks if a request is currently happening. In order to not make another request (prevents infinite loop)
let scriptInitiatedRequest = false

const checkIfUserSolvedProblem = async (details) => {
  if (scriptInitiatedRequest) {
    scriptInitiatedRequest = false
    return
  }
  // Checks if the request has been made within the last 30 seconds (could also be helpful for future features)
  if (lastSubmissionDate.getTime() + 30000 < Date.now()) return
  if (isSubmissionSuccessURL(details.url)) {
    try {
      scriptInitiatedRequest = true
      const response = await fetch(details.url)
      const data = await response.json()

      if (data.status_msg === "Accepted" && data.state === "SUCCESS") {
        console.log("User solved the problem")
        console.log(
          "Congratulations! You've solved the problem!, I'll see you tomorrow"
        )
        leetcodeProblemSolved = true
        // They solved the problem, so no need to redirect anymore they're free, for now
        chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds: [RULE_ID] // use RULE_ID constant
        })
        await storage.set("leetCodeProblemSolved", true)
        sendUserSolvedMessage()
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }
}

// Initialize the storage
chrome.runtime.onInstalled.addListener(async () => {
  await updateStorage()
})

// Ensure the alarm is set when the extension starts
chrome.alarms.get("updateStorage", (alarm) => {
  if (!alarm) {
    // Find the time duration until midnight
    const currentTime = Date.now()
    const midnight = new Date()
    midnight.setHours(24, 0, 0, 0)
    const msUntilMidnight = midnight.getTime() - currentTime
    //Create an alarm to update the storage every 24 hours at midnight
    chrome.alarms.create("updateStorage", {
      // When means the time the alarm will fire, so in this case it will fire at midnight
      when: Date.now() + msUntilMidnight,
      // Period means the time between each alarm firing, so in this case it will fire every 24 hours after the first midnight alarm
      periodInMinutes: 24 * 60
    })
  }
})

//Update the storage when the alarm is fired
chrome.alarms.onAlarm.addListener(async () => {
  updateStorage()
})

chrome.runtime.onMessage.addListener(onMessageReceived)
chrome.webRequest.onCompleted.addListener(checkIfUserSolvedProblem, {
  urls: ["*://leetcode.com/submissions/detail/*/check/"]
})
