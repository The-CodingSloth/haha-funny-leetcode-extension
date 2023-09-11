import React from 'react'
import SettingLabel from './SettingLabel'

export const SettingDrawer = ({close, setClose}) => {
  const settingList = [
    {
      "name": "Problem Sets",
      "description": "Choose the leetcode problems you'd like",
      "dropdownProps": {
        "options": {
          "all": "All Problems"
        },
        "defaultValue": "all",
        "handleChange": (e) => {}
      }
    },
    {
      "name": "Problem Difficulty",
      "description": "Choose the leetcode difficulty you'd like",
      "dropdownProps": {
        "options": {
          "all": "All difficulty",
          "EASY": "Easy",
          "MEDIUM": "Medium",
          "HARD": "Hard"
        },
        "defaultValue": "EASY",
        "handleChange": (e) => {}
      }
    },
    {
      "name": "Number of problems to solve",
      "description": "Choose the amount of leetcode problems you'd like to solve before being able to access websites",
      "inputProps": {
        "type": "number",
        "handleChange": (e) => {}
      }
    },
  ]
  return (
    <div className={["drawer", close ? "" : "opened"].join(" ")}>
      <nav>
        <button onClick={() => setClose(!close)}>Icon</button>
        <h1>Settings</h1>
      </nav>
      <ul className='setting-labels'>
        {
          settingList.map((settingProps, key) => <li key={key} >
            <SettingLabel {...settingProps} />
          </li>)
        }
      </ul>
    </div>
  )
}
