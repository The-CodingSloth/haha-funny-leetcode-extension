import { useEffect, useState } from "react"

const Dropdown = ({ options, defaultValue, handleChange, name }) => {
  const [value, setValue] = useState(defaultValue || "")
  const onChange = (e) => {
    setValue(e.target.value)
    handleChange(e)
  }
  useEffect(() => {
    setValue(defaultValue)
  }, [defaultValue])
  return (
    <select
      name={name}
      onChange={onChange}
      id={name}
      className="setting-dropdown"
      value={value}>
      {Object.keys(options).map((value, key) => (
        <option value={value} key={key}>
          {options[value]}
        </option>
      ))}
    </select>
  )
}

export default Dropdown
