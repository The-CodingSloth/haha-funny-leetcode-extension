const Input = ({type, handleChange, name}) => {
  return (
    <input type={type} onInput={handleChange} name={name} id={name} className="setting-input"></input>
  )
}

export default Input
