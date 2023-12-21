import { useState } from "react"

const HyperTortureMode = ({ message, problemName }): React.JSX.Element => {
  const [noEscapeMessage, setNoEscapeMessage] = useState("")
  return (
    <>
      <h1 id="hyperTorture-message">❗Hyper 🤓 Torture mode active❗</h1>

      <h2 id="unsolved-message">{message}</h2>

      <div className="leetcode-info">
        <p id="leetcode-problem-name">{problemName}</p>
        <button
          id="leetcode-problem-button"
          onMouseOver={() => setNoEscapeMessage("There Is No Escape")}>
          {noEscapeMessage || "Solve it"}
        </button>
      </div>
    </>
  )
}

export default HyperTortureMode
