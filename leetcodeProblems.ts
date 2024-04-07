import { storage } from "storage"
import type { APILeetCodeProblem, JSONLeetCodeProblem } from "types"

import { getProblemListFromLeetCodeAPI } from "~background"

export async function getAllLeetCodeProblems(
  difficulty: string,
  problemSet: string
) {
  try {
    // Remove lg- or all from string for better logic processing
    const leetCodeProblems: APILeetCodeProblem[] =
      await getProblemListFromLeetCodeAPI(
        difficulty,
        problemSet?.slice(3) || ""
      )
    let randomIndex = Math.floor(Math.random() * leetCodeProblems.length)
    while (leetCodeProblems[randomIndex].paidOnly) {
      randomIndex++
      randomIndex =
        (leetCodeProblems.length + randomIndex) % leetCodeProblems.length
    }
    const randomProblem = leetCodeProblems[randomIndex]
    // Replace anything that is not a string or whitespace with "" then replace empty spaces with "-"
    //Error with some problems with special characters TODO: Fix this ex: nondrecreasing subequence -> non-decreasing-subsequence
    const randomProblemURL =
      "https://leetcode.com/problems/" +
      randomProblem.title
        .trim()
        .replace(/[^a-zA-Z\s]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase() +
      "/"
    const randomProblemName = randomProblem.title
    // await storage.set("loading", false)
    await storage.stopLoading()
    return { url: randomProblemURL, name: randomProblemName }
  } catch (error) {
    console.error(error)
  }
}

export async function getLeetCodeProblemFromProblemSet(
  difficulty: string,
  problemSet: string
) {
  try {
    const includePremium = await storage.getIncludePremium()
    // TODO: Need to find a way to filter out premium problems for these JSON files
    const problemSetURLs: Record<string, string> = {
      allNeetcode: "leetcode-problems/allProblems.json",
      NeetCode150: "leetcode-problems/neetCode150Problems.json",
      Blind75: "leetcode-problems/blind75Problems.json",
      metaTop100: "leetcode-problems/metaTop100.json"
    }

    const res = await fetch(chrome.runtime.getURL(problemSetURLs[problemSet]))
    const leetCodeProblems: JSONLeetCodeProblem[] = await res.json()
    const filteredLeetCodeProblems: JSONLeetCodeProblem[] =
      leetCodeProblems.filter((problem) => {
        return (
          (includePremium || !problem.isPremium) &&
          (difficulty == "all" ||
            problem.difficulty.toLowerCase() === difficulty.toLowerCase())
        )
      })

    let randomIndex = Math.floor(
      Math.random() * filteredLeetCodeProblems.length
    )
    const randomProblem = filteredLeetCodeProblems[randomIndex]
    const randomProblemURL = randomProblem.href
    const randomProblemName = randomProblem.text
    return { url: randomProblemURL, name: randomProblemName }
  } catch (error) {
    console.error(error)
  }
}
