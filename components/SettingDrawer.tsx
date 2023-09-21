import { useStorage } from "@plasmohq/storage/hook"

import { updateStorage } from "~background"

import BackIcon from "./BackIcon"
import SettingLabel from "./SettingLabel"

const SettingDrawer = ({ close, setClose }) => {
  const [problemSets, setProblemSets] = useStorage<string>("problemSets")
  const [difficulty, setDifficulty] = useStorage<string>("difficulty")
  const [leetcodeProblemSolved] = useStorage<boolean>("leetCodeProblemSolved")
  const [includePremium, setIncludePremium] = useStorage<boolean>("includePremium")
  const settingList = [
    {
      name: "Problem Sets",
      description: "Choose the leetcode problems you'd like",
      dropdownProps: {
        options: {
          all: "All Leetcode Problems",
          allNeetcode: "All Neetcode Problems",
          NeetCode150: "Neetcode 150",
          Blind75: "Blind 75",
          "lg-5htp6xyg": "LeetCode Curated SQL 70",
          "lg-79h8rn6": "Top 100 Liked Questions",
          "lg-wpwgkgt": "Top Interview Questions",
          "lg-o9exaktc": "Tayomide's Questions",
        },
        defaultValue: problemSets,
        handleChange: async (e) => {
          setProblemSets(e.target.value)
          !leetcodeProblemSolved ? await updateStorage() : null
        }
      }
    },
    {
      name: "Problem Difficulty",
      description: "Choose the leetcode difficulty you'd like",
      dropdownProps: {
        options: {
          all: "All difficulties",
          EASY: "Easy",
          MEDIUM: "Medium",
          HARD: "Hard"
        },
        defaultValue: difficulty,
        handleChange: async (e) => {
          setDifficulty(e.target.value)
          !leetcodeProblemSolved ? await updateStorage() : null
        }
      }
    },
    {
      name: "Include Premium Problems",
      description: "Toggle whether to include premium problems",
      checkboxProps: {
        checked: includePremium ?? false,
        handleChange: async (e) => {
          setIncludePremium(e.target.checked)
          !leetcodeProblemSolved ? await updateStorage() : null
        }
      }
    },
    /* TODO: Add this feature later
    {
      name: "Number of problems to solve",
      description:
        "Choose the amount of leetcode problems you'd like to solve before being able to access websites",
      inputProps: {
        type: "number",
        handleChange: (e) => {}
      }
    }
    */
  ]
  return (
    <div className={["drawer", close ? "" : "opened"].join(" ")}>
      <nav>
        <button onClick={() => setClose(!close)}>
          <BackIcon />
        </button>
        <h1>Settings</h1>
      </nav>
      <ul className="setting-labels">
        {leetcodeProblemSolved && (
          <p className="settings-problem-solved">
            Congrats you solved your problem today, these settings will be
            applied tomorrow
          </p>
        )}
        {settingList.map((settingProps, key) => (
          <li key={key}>
            <SettingLabel {...settingProps} />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default SettingDrawer
