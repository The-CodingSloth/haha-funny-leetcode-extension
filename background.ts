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
  })
}

//Global modifiable variables (I know, I know, but it's the easiest way to do it fix it yourself)

let leetcodeProblemSolved = false
let leetCodeProblem = {
  url: "",
  name: ""
}
let lastSubmissionDate = new Date(0)

// Get Problem List from leetcode graphql API
const getProblemList = async () => {
  const difficulty = await storage.get("difficulty")
  try {
    let reply
    const query = `
      query problemsetQuestionList {
        problemsetQuestionList: questionList(
          categorySlug: ""
          limit: -1
          skip: 0
          filters: {
            ${(difficulty && difficulty !== "all") ? "difficulty: " + difficulty : "" }
          }
        ) {
          questions: data {
            acRate
            difficulty
            freqBar
            frontendQuestionId: questionFrontendId
            isFavor
            paidOnly: isPaidOnly
            status
            title
            titleSlug
            topicTags {
              name
              id
              slug
            }
            hasSolution
            hasVideoSolution
          }
        }
      }
    `
  
    const body = {
      query
    }
  
    await fetch('https://leetcode.com/graphql', {method: "POST", body: JSON.stringify(body), headers: {
      "Content-Type": "application/json",
    }})
    .then(response => response.json())
    .then(response => {
      reply = response
    })
    return reply.data.problemsetQuestionList.questions
  } catch (error) {
    console.log(error.toString())
  }
}

// TODO: Need to find a way to filter out premium problems
const generateRandomLeetCodeProblem = async () => {
  try {
    const leetCodeProblems = await getProblemList()
    let randomIndex = Math.floor(Math.random() * leetCodeProblems.length)
    while(leetCodeProblems[randomIndex].paidOnly){
      randomIndex++
      randomIndex = (leetCodeProblems.length + randomIndex) % leetCodeProblems.length
    }
    const randomProblem = leetCodeProblems[randomIndex]
    const randomProblemURL = "https://leetcode.com/problems/" + randomProblem.title.replace(/ /g, "-").toLowerCase() + "/"
    const randomProblemName = randomProblem.title
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
  let newRedirectRule: chrome.declarativeNetRequest.Rule = {
    id: RULE_ID,
    priority: 1,
    action: {
      type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
      redirect: { url: newRedirectUrl }
    },
    condition: {
      urlFilter: "*://*/*",
      excludedDomains: [
        "leetcode.com",
        "www.leetcode.com",
        "developer.chrome.com"
      ],
      resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME]
    }
  }

  try {
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [RULE_ID],
      addRules: [newRedirectRule]
    })
    console.log("Redirect rule updated")
  } catch (error) {
    console.error("Error updating redirect rule:", error)
  }
}
export const updateStorage = async () => {
  const result = await generateRandomLeetCodeProblem()
  if (!result) {
    throw new Error("Error generating random problem")
  } else {
    const { randomProblemURL, randomProblemName } = result
    console.log(
      "Random problem generated:",
      randomProblemName,
      randomProblemURL
    )
    leetcodeProblemSolved = false
    leetCodeProblem = { url: randomProblemURL, name: randomProblemName }
    await storage.set("problemURL", randomProblemURL)
    await storage.set("problemName", randomProblemName)
    await storage.set("problemDate", new Date().toDateString())
    await storage.set("leetCodeProblemSolved", false)

    await setRedirectRule(randomProblemURL)
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
        updateStreak()
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

// Check if a streak should be updated. Should only be called when a problem has been completed.
async function updateStreak() {
  const lastCompletedString = await storage.get('lastCompleted')
  const lastCompleted = lastCompletedString ? new Date(lastCompletedString) : new Date(0)
  const now = new Date();

  if (lastCompleted.toDateString() === now.toDateString()) return

  // This is the first problem that was solved today
  const currentStreak: number = await storage.get('currentStreak') ?? 0
  const bestStreak: number = await storage.get('bestStreak') ?? 0
  const newStreak = currentStreak + 1;

  // Update streak
  await storage.set("currentStreak", newStreak)
  await storage.set("lastCompleted", now.toDateString())
  if (newStreak > bestStreak) await storage.set("bestStreak", newStreak)
}

// Check if a streak should be reset. Should be called when extension starts up and peridically.
async function checkResetStreak() {
  const lastCompletedString = await storage.get('lastCompleted')
  const lastCompleted = lastCompletedString ? new Date(lastCompletedString) : new Date(0) // Returns Unix Epoch if item is null
  const now = new Date();
  const yesterday = now.getDate() - 1;

  if (lastCompleted.getDate() < yesterday) {
    await storage.set("currentStreak", 0)
  }
}

// Initialize
chrome.runtime.onInstalled.addListener(async () => {
  await updateStorage()
  await checkResetStreak()
})

// Ensure the alarm is set when the extension starts
chrome.alarms.get("midnightAlarm", (alarm) => {
  if (!alarm) {
    // Find the time duration until midnight
    const currentTime = Date.now()
    const midnight = new Date()
    midnight.setHours(24, 0, 0, 0)
    const msUntilMidnight = midnight.getTime() - currentTime
    //Create an alarm to update the storage every 24 hours at midnight
    chrome.alarms.create("midnightAlarm", {
      // When means the time the alarm will fire, so in this case it will fire at midnight
      when: Date.now() + msUntilMidnight,
      // Period means the time between each alarm firing, so in this case it will fire every 24 hours after the first midnight alarm
      periodInMinutes: 24 * 60
    })
  }
})

// Update the storage and check if streak should be reset when the alarm is fired
chrome.alarms.onAlarm.addListener(async () => {
  updateStorage();
  checkResetStreak();
});


chrome.runtime.onMessage.addListener(onMessageReceived)
chrome.webRequest.onCompleted.addListener(checkIfUserSolvedProblem, {
  urls: ["*://leetcode.com/submissions/detail/*/check/"]
})
