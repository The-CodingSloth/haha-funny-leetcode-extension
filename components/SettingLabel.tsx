import Checkbox from "./Checkbox";
import Dropdown from "./Dropdown"
import Input from "./Input"

const SettingLabel = ({description, name, inputProps, dropdownProps, checkboxProps} : {
  description: any;
  name: any;
  inputProps?: any;
  dropdownProps?: any;
  checkboxProps?: any;
}) => {
  return (
    <label className="setting-label" htmlFor={name}>
      <div className="setting-text">
        <p className="name">{name}</p>
        <p className="description">{description}</p>
      </div>
      <div>
        {inputProps && <Input {...inputProps} name={name}/>}
        {dropdownProps && <Dropdown {...dropdownProps} name={name} />}
        {checkboxProps && <Checkbox {...checkboxProps} name={name} />}
      </div>
    </label>
  )
}

export default SettingLabel
