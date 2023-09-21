const Checkbox = ({handleChange, name, checked}) => {
    return (
      <input type="checkbox" checked={checked} onChange={handleChange} name={name} id={name} className="setting-checkbox"></input>
    )
  }
  
  export default Checkbox
  