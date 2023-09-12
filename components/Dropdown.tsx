
const Dropdown = ({options, defaultValue, handleChange, name}) => {
  return (
    <select name={name} onChange={handleChange} id={name} className="setting-dropdown">
      {Object.keys(options).map((value, key) => 
        <option value={value} key={key} selected={defaultValue === value}>{options[value]}</option>
      )}
    </select>
  )
}

export default Dropdown
