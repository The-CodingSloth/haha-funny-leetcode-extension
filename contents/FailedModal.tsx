import styleText from "data-text:./modal.css"
import type { PlasmoCSConfig } from "plasmo"
import React, { useEffect, useState } from "react"

import FailImage from "~components/FailImage"

export const config: PlasmoCSConfig = {
  matches: ["https://leetcode.com/*"]
}
// Have to do this in order to get the css to apply (see the plasmo docs for more info)
export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = styleText
  return style
}

const FailedModal = () => {
  const [showModal, setShowModal] = useState(false)

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
      if (message.action === "userFailedProblem") {
        setShowModal(true)
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
          <h1>Congratulations! You've made a mistake!</h1>

          <div className="fail-image">
            <FailImage />
          </div>
          <h3>The Hyper Torture streak has been reset to zero.</h3>
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

export default FailedModal
