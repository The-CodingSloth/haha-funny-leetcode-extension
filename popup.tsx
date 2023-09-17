import "styles.css"

import SettingDrawer from "components/SettingDrawer"
import { useEffect, useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import SettingsIcon from "~components/SettingsIcon"

import { updateStorage } from "./background"

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
  const [randomUnsolvedMessage, setRandomUnsolvedMessage] = useState("")
  const [randomSolvedMessage, setRandomSolvedMessage] = useState("")
  const [problemName] = useStorage<string>("problemName")
  const [problemURL] = useStorage<string>("problemURL")
  const [leetcodeProblemSolved] = useStorage<boolean>("leetCodeProblemSolved")
  const [currentStreak] = useStorage<number>("currentStreak")
  const [bestStreak] = useStorage<number>("bestStreak")
  const [drawerClosed, setDrawerClosed] = useState(true)
  const [loading, setLoading] = useStorage<boolean>("loading", true)
  const [permissionsEnabled] = useStorage<boolean>("permissionsEnabled", true)
  const [checkingPermissions, setCheckingPermissions] = useState(false)
  useEffect(() => {
    const randomUnsolvedIndex = Math.floor(
      Math.random() * possibleUnSolvedMessages.length
    )
    const randomSolvedIndex = Math.floor(
      Math.random() * possibleSolvedMessages.length
    )
    setRandomSolvedMessage(possibleSolvedMessages[randomSolvedIndex])
    setRandomUnsolvedMessage(possibleUnSolvedMessages[randomUnsolvedIndex])
    // Makes sure the loading screen isn't stuck on for initial render
    let timer
    if (loading) {
      timer = setTimeout(() => {
        setLoading(false)
      }, 100)
    }
    // everytime the popup is opened without permissions, we'll check with this function.
    // If the permissions are not enabled, this will check if they did
    // If permissions are enabled, this will do nothing
    if (!permissionsEnabled) {
      const checkPermissions = async () => {
        try {
          setCheckingPermissions(true)
          await updateStorage()
          console.log("done checking permissions")
          setCheckingPermissions(false)
        } catch (e) {
          console.log("error checking permissions", e)
          setCheckingPermissions(false)
        }
      }
      checkPermissions()
    }
    return () => {
      clearTimeout(timer)
    }
  }, [permissionsEnabled])
  const isFirefox = navigator.userAgent.includes("Firefox")
  return (
    <div className={drawerClosed ? "popup" : "popup settings"}>
      <nav>
        <h1 className="flex">Welcome to the LeetCode Gulag</h1>
        <button onClick={() => setDrawerClosed(!drawerClosed)}>
          <SettingsIcon />
        </button>
      </nav>

      {permissionsEnabled ? (
        loading || !problemName ? (
          <div className="loading">
            <p>Fetching torture problem...</p>
            <span className="loader"></span>
          </div>
        ) : (
          <>
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
            <h2 id="current-streak-message">
              Current Streak: {currentStreak ?? 0}
            </h2>
            <h2 id="best-streak-message">Best Streak: {bestStreak ?? 0}</h2>
          </>
        )
      ) : (
        <div className="permissions-warning">
          {checkingPermissions ? (
            <>
              <p>Checking permissions...</p>
              {/* You can include a spinner or some loading indication here if you want */}
              <span className="loader"></span>
            </>
          ) : (
            <>
              <p>Permissions are not enabled for this extension.</p>

              {isFirefox ? (
                <>
                  <p>
                    To do this, right click the extension and select manage
                    extension.
                  </p>
                  <p>
                    Then navigate to the permissions tab and enable the optional
                    permissions.
                  </p>
                  <p>
                    It will say "Access your data for all websites" but it is
                    only used for redirecting you to the problem page and
                    getting the leetcode problem. I Promise.
                  </p>
                </>
              ) : (
                <p>
                  Please navigate to the extensions page of your browser, locate
                  this extension, and enable the required permissions.
                </p>
              )}
            </>
          )}
        </div>
      )}

      <SettingDrawer close={drawerClosed} setClose={setDrawerClosed} />
    </div>
  )
}

export default IndexPopup
