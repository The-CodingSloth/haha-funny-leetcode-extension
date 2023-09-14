const Dropdown = ({ options, defaultValue, handleChange, name }) => {
  return (
    <select
      name={name}
      onChange={handleChange}
      id={name}
      className="setting-dropdown"
      defaultValue={defaultValue}>
      {Object.keys(options).map((value, key) => (
        <option value={value} key={key}>
          {options[value]}
        </option>
      ))}
    </select>
  )
}

export default Dropdown
