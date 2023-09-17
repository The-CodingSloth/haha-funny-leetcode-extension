import { useStorage } from "@plasmohq/storage/hook"

import { updateStorage } from "~background"

import BackIcon from "./BackIcon"
import SettingLabel from "./SettingLabel"

const SettingDrawer = ({ close, setClose }) => {
  const [problemSets, setProblemSets] = useStorage<string>("problemSets")
  const [difficulty, setDifficulty] = useStorage<string>("difficulty")
  const [category, setCategory] = useStorage<string>("category")
  const [leetcodeProblemSolved] = useStorage<boolean>("leetCodeProblemSolved")
  const settingList = [
    {
      name: "Problem Sets",
      description: "Choose the leetcode problems you'd like",
      dropdownProps: {
        options: {
          all: "All Leetcode Problems",
          allNeetcode: "All Neetcode Problems",
          NeetCode150: "Neetcode 150",
          Blind75: "Blind 75"
        },
        defaultValue: problemSets,
        handleChange: (e) => {
          setProblemSets(e.target.value)
          !leetcodeProblemSolved ? updateStorage() : null
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
        handleChange: (e) => {
          setDifficulty(e.target.value)
          !leetcodeProblemSolved ? updateStorage() : null
        }
      }
    },
    {
      name: "Problem Category",
      description: "Choose the category you'd like to solve",
      dropdownProps: {
        options: {
          all: "All categories",
          "arrays & hashing": "Arrays & Hashing",
          "two pointers": "Two Pointers",
          "sliding window": "Sliding Window",
          stack: "Stack",
          "binary search": "Binary Search",
          "linked list": "Linked List",
          trees: "Trees",
          tries: "Tries",
          "heap / priority queue": "Heap / Priority Queue",
          backtracking: "Backtracking",
          graphs: "Graphs",
          "advanced graphs": "Advanced Graphs",
          "1-d dynamic programming": "1-D Dynamic Programming",
          "2-d dynamic programming": "2-D Dynamic Programming",
          greedy: "Greedy",
          intervals: "Intervals",
          "math & geometry": "Math & Geometry",
          "bit manipulation": "Bit Manipulation",
          javascript: "JavaScript"
        },
        defaultValue: category,
        handleChange: async (e) => {
          setCategory(e.target.value)
          !leetcodeProblemSolved ? updateStorage() : null
        }
    }
  }
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
