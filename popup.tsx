import "styles.css"

import { useStorage } from "@plasmohq/storage/hook"
import SettingLabel from "components/SettingLabel"
import { useState } from "react"
import { SettingDrawer } from "~components/SettingDrawer"

const IndexPopup = () => {
  // Gets information from background.js and displays it on popup.html
  const possibleUnSolvedMessages = [
    "Another day, another LeetCode problem, so go solve it buddy",
    "One LeetCode problem a day keeps the unemployment away",
    "Welcome to your daily dose of LeetCode",
    "Never back down, Never what"
  ]
  const possibleSolvedMessages = [
    "Bro you only solved one problem, chill out",
    "You survived another day of LeetCode, congrats",
    "You're one step closer to getting that job, keep it up",
    "The LeetCode Torture gods are pleased. Rest, for tomorrow brings a new challenge",
    "Solved your problem for the day, nice, go treat yourself"
  ]
  const randomUnsolvedIndex = Math.floor(
    Math.random() * possibleUnSolvedMessages.length
  )
  const randomSolvedIndex = Math.floor(
    Math.random() * possibleSolvedMessages.length
  )
  const randomUnsolvedMessage = possibleUnSolvedMessages[randomUnsolvedIndex]
  const randomSolvedMessage = possibleSolvedMessages[randomSolvedIndex]
  const [problemName] = useStorage<string>("problemName")
  const [problemURL] = useStorage<string>("problemURL")
  const [leetcodeProblemSolved] = useStorage<boolean>("leetCodeProblemSolved")
  const [currentStreak] = useStorage<number>("currentStreak")
  const [bestStreak] = useStorage<number>("bestStreak")

  const [drawerClosed, setDrawerClosed] = useState(true)

  return (
    <div>
      <nav>
        <h1 className="flex">Welcome to the LeetCode Gulag</h1>
        <button onClick={() => setDrawerClosed(!drawerClosed)}>icon</button>
      </nav>
      {!leetcodeProblemSolved ? (
        <>
          <h2 id="unsolved-message">{randomUnsolvedMessage}</h2>

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
      ) : (
        <h2 id="solved-message">{randomSolvedMessage}</h2>
      )}
      <h2 id="current-streak-message">Current Streak: {currentStreak ?? 0}</h2>
      <h2 id="best-streak-message">Best Streak: {bestStreak ?? 0}</h2>
      <SettingDrawer close={drawerClosed} setClose={setDrawerClosed} />
    </div>
  )
}

export default IndexPopup
