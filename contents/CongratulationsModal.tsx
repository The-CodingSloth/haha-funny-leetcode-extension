import styleText from "data-text:./modal.css"
import type { PlasmoCSConfig } from "plasmo"
import React, { useEffect, useState } from "react"

import { messages } from "../constants"

export const config: PlasmoCSConfig = {
  matches: ["https://leetcode.com/*"]
}
// Have to do this in order to get the css to apply (see the plasmo docs for more info)
export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = styleText
  return style
}

const CongratulationsModal = () => {
  const [showModal, setShowModal] = useState(false)
  const [language, setLanguage] = useState("")
  useEffect(() => {
    const handleClick = (event: any) => {
      let currentTarget = event.target
      while (currentTarget) {
        if (
          currentTarget.matches(
            'button[data-e2e-locator="console-submit-button"]'
          )
        ) {
          chrome.runtime.sendMessage({ action: "userClickedSubmit" })
        }
        // We hit a child element, so we go up the DOM until we're at the button
        currentTarget = currentTarget.parentElement
      }
    }
    const handleMessage = (message: any, sender: any, sendResponse: any) => {
      if (message.action === "userSolvedProblem") {
        setShowModal(true)
        setLanguage(message.language)
      }
    }

    // Listen for user interaction, e.g., when they click "Submit".
    document.addEventListener("click", handleClick)

    // Listen for messages from the background script or other parts of the extension.
    chrome.runtime.onMessage.addListener(handleMessage)

    // Cleanup on component unmount
    return () => {
      document.removeEventListener("click", handleClick)
      chrome.runtime.onMessage.removeListener(handleMessage)
    }
  }, [])

  return (
    showModal && (
      <div className="modal-background">
        <div className="modal-content">
          <h1>Congratulations! You've solved the problem!</h1>
          <h3>{messages[language].message}</h3>
          <button
            className="close-modal-button"
            onClick={() => setShowModal(false)}>
            Close
          </button>
        </div>
      </div>
    )
  )
}

export default CongratulationsModal
