import { Storage } from "@plasmohq/storage"

//Constants
const LEETCODE_URL = "https://leetcode.com"
const RULE_ID = 1
const storage = new Storage()
// Helper functions
const isLeetCodeUrl = (url: string) => url.includes(LEETCODE_URL)

const isSubmissionSuccessURL = (url: string) =>
  url.includes("/submissions/detail/") && url.includes("/check/")

const sendUserSolvedMessage = (languageUsed: string) => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: "userSolvedProblem",
      language: languageUsed
    })
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
const getProblemListFromLeetCodeAPI = async (difficulty, problemSet) => {
  try { 
    const query = `
      query problemsetQuestionList {
        problemsetQuestionList: questionList(
          categorySlug: ""
          limit: -1
          skip: 0
          filters: {
            ${(difficulty && difficulty !== "all"
            ? "difficulty: " + difficulty
            : "")}
            ${(problemSet?.length
            ? "listId: " + '"' + problemSet + '"'
            : "")}
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

    const response = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json"
      }
    })

    const responseData = await response.json()
    await storage.set("permissionsEnabled", true)
    return responseData.data.problemsetQuestionList.questions
  } catch (error) {
    console.log(error.toString())
    if (
      error.message.includes("NetworkError") ||
      error.message.includes("CORS") ||
      error.message === "Network response was not ok"
    ) {
      console.log("CORS error detected.")
      await storage.set("permissionsEnabled", false)
    }
    return undefined
  }
}

const generateRandomLeetCodeProblem = async () => {
  try {
    const problemSet = (await storage.get("problemSets")) ?? "all"
    const difficulty = (await storage.get("difficulty")) ?? "all"
    let leetCodeProblems = []
    // Check if list is from Leetcode Graphql or all
    if (problemSet === "all" || problemSet.startsWith("lg")) {
      await storage.set("loading", true)
      // Remove lg- or all from string for better logic processing
      leetCodeProblems = await getProblemListFromLeetCodeAPI(difficulty, problemSet?.slice(3) || "")
      let randomIndex = Math.floor(Math.random() * leetCodeProblems.length)
      while (leetCodeProblems[randomIndex].paidOnly) {
        randomIndex++
        randomIndex =
          (leetCodeProblems.length + randomIndex) % leetCodeProblems.length
      }
      const randomProblem = leetCodeProblems[randomIndex]
      const randomProblemURL =
        "https://leetcode.com/problems/" +
        randomProblem.title.replace(/ /g, "-").toLowerCase() +
        "/"
      const randomProblemName = randomProblem.title
      await storage.set("loading", false)
      return { randomProblemURL, randomProblemName }
    } else {
      // TODO: Need to find a way to filter out premium problems for these JSON files
      const problemSetURLs = {
        allNeetcode: "leetcode-problems/allProblems.json",
        NeetCode150: "leetcode-problems/neetCode150Problems.json",
        Blind75: "leetcode-problems/blind75Problems.json"
      }
      const res = await fetch(chrome.runtime.getURL(problemSetURLs[problemSet]))
      leetCodeProblems = await res.json()
      if (difficulty !== "all") {
        leetCodeProblems = leetCodeProblems.filter((problem) => {
          return problem.difficulty.toLowerCase() === difficulty.toLowerCase()
        })
      }

      let randomIndex = Math.floor(Math.random() * leetCodeProblems.length)
      // If the problem is premium, then skip it and go to the next problem until you find a non-premium problem
      while (leetCodeProblems[randomIndex].isPremium) {
        randomIndex++
        // Prevent index from going out of bounds
        randomIndex =
          (leetCodeProblems.length + randomIndex) % leetCodeProblems.length
      }
      const randomProblem = leetCodeProblems[randomIndex]
      const randomProblemURL = randomProblem.href
      const randomProblemName = randomProblem.text
      return { randomProblemURL, randomProblemName }
    }
  } catch (error) {
    console.error("Error generating random problem", error)
    return undefined
  } finally {
    await storage.set("loading", false)
  }
}

// Communication functions between background.js, popup.js, and content.js
const onMessageReceived = (message, sender, sendResponse) => {
  switch (message.action) {
    case "fetchingProblem":
      // Handle the start of the problem fetch.
      // Currently, we'll just log it for clarity, but you can add other logic here if needed.
      console.log("Fetching problem started.")
      break
    case "problemFetched":
      // Handle the end of the problem fetch.
      console.log("Fetching problem completed.")
      break
    case "getProblemStatus":
      sendResponse({
        problemSolved: leetcodeProblemSolved,
        problem: leetCodeProblem
      })
      return true
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
      // Modify this if we want to exclude more specific domains (redirect won't apply to them)
      excludedInitiatorDomains: [
        "leetcode.com",
        "www.leetcode.com",
        "developer.chrome.com"
      ],

      resourceTypes: ["main_frame"]
    }
  }

  try {
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [RULE_ID],
      // Type error for addRules, but it works
      // @ts-ignore
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
let lastCheckedUrl = ""
let lastCheckedTimestamp = 0
const debounceTime = 500 // 500 miliseconds (for the future possibly)
const checkIfUserSolvedProblem = async (details) => {
  const now = Date.now()
  console.log(
    "oh so you're a developer huh, nice check this out and see if there's any errors"
  )

  // Get the current active tab's URL
  let currentURL = ""
  try {
    const [activeTab] = await new Promise<chrome.tabs.Tab[]>((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, resolve)
    })

    currentURL = activeTab.url
  } catch (error) {
    console.error("Error getting active tab:", error)
    return
  }

  const leetCodeURL = await storage.get("problemURL")

  const sameUrl =
    leetCodeURL === currentURL || leetCodeURL + "description/" === currentURL

  if (
    !sameUrl || // Checking with the active tab's URL
    scriptInitiatedRequest ||
    (now - lastCheckedTimestamp < debounceTime &&
      details.url === lastCheckedUrl)
  ) {
    return
  }
  console.log("Checking now if it's a success submission URL")
  lastCheckedUrl = details.url
  lastCheckedTimestamp = now

  if (isSubmissionSuccessURL(details.url)) {
    try {
      scriptInitiatedRequest = true
      const response = await fetch(details.url)
      const data = await response.json()
      if (data.state === "STARTED") {
        console.log("Started state, returning")
        return
      }
      console.log("Checking if state is success")

      if (
        data.status_msg === "Accepted" &&
        data.state === "SUCCESS" &&
        !data.code_answer
      ) {
        console.log("It is a success submission, user solved problem")
        updateStreak()

        leetcodeProblemSolved = true
        // They solved the problem, so no need to redirect anymore they're free, for now
        chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds: [RULE_ID] // use RULE_ID constant
        })
        await storage.set("leetCodeProblemSolved", true)
        //chrome.webRequest.onCompleted.removeListener(checkIfUserSolvedProblem)
        sendUserSolvedMessage(data?.lang)
        console.log("User solved problem, should've gotten the success message")
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      scriptInitiatedRequest = false
    }
  }
}
// Check if a streak should be updated. Should only be called when a problem has been completed.
async function updateStreak() {
  const lastCompletedString = await storage.get("lastCompleted")
  const lastCompleted = lastCompletedString
    ? new Date(lastCompletedString)
    : new Date(0)
  const now = new Date()

  if (lastCompleted.toDateString() === now.toDateString()) return

  // This is the first problem that was solved today
  const currentStreak: number = (await storage.get("currentStreak")) ?? 0
  const bestStreak: number = (await storage.get("bestStreak")) ?? 0
  const newStreak = currentStreak + 1

  // Update streak
  await storage.set("currentStreak", newStreak)
  await storage.set("lastCompleted", now.toDateString())
  if (newStreak > bestStreak) await storage.set("bestStreak", newStreak)
}

// Check if a streak should be reset. Should be called when extension starts up and peridically.
async function checkResetStreak() {
  const lastCompletedString = await storage.get("lastCompleted")
  const lastCompleted = lastCompletedString
    ? new Date(lastCompletedString)
    : new Date(0) // Returns Unix Epoch if item is null
  const now = new Date()
  const yesterday = now.getDate() - 1

  if (lastCompleted.getDate() < yesterday) {
    await storage.set("currentStreak", 0)
  }
}

// Initialize
chrome.runtime.onInstalled.addListener(async () => {
  await updateStorage()
  await checkResetStreak()
  chrome.webRequest.onCompleted.addListener(checkIfUserSolvedProblem, {
    urls: ["*://leetcode.com/submissions/detail/*/check/"]
  })
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
  updateStorage()
  checkResetStreak()
  if (!chrome.webRequest.onCompleted.hasListener(checkIfUserSolvedProblem)) {
    chrome.webRequest.onCompleted.addListener(checkIfUserSolvedProblem, {
      urls: ["*://leetcode.com/submissions/detail/*/check/"]
    })
  }
})

chrome.runtime.onMessage.addListener(onMessageReceived)
