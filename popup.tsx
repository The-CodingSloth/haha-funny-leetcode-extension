import "styles.css"

import SettingDrawer from "components/SettingDrawer"
import { useEffect, useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import HyperTortureMode from "~components/HyperTortureMode"
import NoPermissions from "~components/NoPermissions"
import SettingsIcon from "~components/SettingsIcon"

import {
  generateRandomLeetCodeProblem,
  handleAdditionalProblemRedirect,
  updateProblemState
} from "./background"

const IndexPopup = () => {
  const unSolvedMessages = [
    "Another day, another LeetCode problem, so go solve it buddy",
    "One LeetCode problem a day keeps the unemployment away",
    "Welcome to your daily dose of LeetCode",
    "Never back down, Never what"
  ]
  const solvedMessages = [
    "Bro you only solved one problem, chill out",
    "You survived another day of LeetCode, congrats",
    "You're one step closer to getting that job, keep it up",
    "The LeetCode Torture gods are pleased. Rest, for tomorrow brings a new challenge",
    "Solved your problem for the day, nice, go treat yourself"
  ]
  const hyperTortureMessages = [
    "Your code is compiling... just kidding, prepare for eternal agony.",
    "Infinite loop of despair activated.",
    "Feel the burn(out), keep those functions running.",
    "Error 404: Social life not found. Keep coding.",
    "Another day, another dollar... subtracted from your sanity budget.",
    "Commit to the code grind, the keyboard is your only friend."
  ]
  const [unsolvedMessage, setUnsolvedMessage] = useState("")
  const [solvedMessage, setSolvedMessage] = useState("")
  const [hyperTortureMessage, setHyperTortureMessage] = useState("")
  const [problemName] = useStorage<string>("problemName")
  const [problemURL] = useStorage<string>("problemURL")
  const [leetcodeProblemSolved] = useStorage<boolean>("leetCodeProblemSolved")
  const [hyperTortureMode] = useStorage<boolean>("hyperTortureMode")
  const [currentStreak] = useStorage<number>("currentStreak")
  const [bestStreak] = useStorage<number>("bestStreak")
  const [HT_currentStreak] = useStorage<number>("HT_currentStreak")
  const [HT_bestStreak] = useStorage<number>("HT_bestStreak")
  const [permissionsEnabled] = useStorage<boolean>("permissionsEnabled", true)
  const [drawerClosed, setDrawerClosed] = useState(true)

  const getRandomInt = (max: number) => Math.floor(Math.random() * max)

  const solveAnother = async () => {
    const problem = await generateRandomLeetCodeProblem()
    await updateProblemState(problem)
    await handleAdditionalProblemRedirect(problem.url)
  }

  useEffect(() => {
    const unsolvedIndex = getRandomInt(unSolvedMessages.length)
    const hyperTortureIndex = getRandomInt(hyperTortureMessages.length)
    const randomSolvedIndex = getRandomInt(solvedMessages.length)

    setSolvedMessage(solvedMessages[randomSolvedIndex])
    setHyperTortureMessage(hyperTortureMessages[hyperTortureIndex])
    setUnsolvedMessage(unSolvedMessages[unsolvedIndex])
  }, [])

  if (!permissionsEnabled) {
    return <NoPermissions permissionsEnabled={permissionsEnabled} />
  }

  return (
    <div className="popup">
      <nav>
        <h1 className="flex">Welcome to the LeetCode Gulag</h1>
        <button onClick={() => setDrawerClosed(!drawerClosed)}>
          <SettingsIcon />
        </button>
      </nav>

      {!problemName && (
        <div className="loading">
          <p>Fetching torture problem...</p>
          <span className="loader"></span>
        </div>
      )}

      {hyperTortureMode && (
        <HyperTortureMode
          message={hyperTortureMessage}
          problemName={problemName}
        />
      )}

      {!leetcodeProblemSolved && !hyperTortureMode && (
        <>
          <h2 id="unsolved-message">{unsolvedMessage}</h2>

          <div className="leetcode-info">
            <p className="question-of-day-msg">Today's Question</p>
            <p id="leetcode-problem-name">{problemName}</p>
            <button
              id="leetcode-problem-button"
              onClick={() => chrome.tabs.create({ url: problemURL })}>
              Solve it
            </button>
          </div>
        </>
      )}
      {leetcodeProblemSolved && (
        <div className="solved-section">
          <h2 id="solved-message">{solvedMessage}</h2>
          <button id="leetcode-problem-button" onClick={() => solveAnother()}>
            Solve another
          </button>
        </div>
      )}
      <div className="streak-section">
        <div className="current-streak">
          <h2 id="current-streak-message">Current Streak: </h2>
          <p>{hyperTortureMode ? HT_currentStreak ?? 0 : currentStreak ?? 0}</p>
        </div>
        <div className="current-streak">
          <h2 id="best-streak-message">Best Streak: </h2>
          <p>{hyperTortureMode ? HT_bestStreak ?? 0 : bestStreak ?? 0}</p>
        </div>
      </div>

      <SettingDrawer close={drawerClosed} setClose={setDrawerClosed} />
    </div>
  )
}

export default IndexPopup
