import { useState } from 'react'

function LiquidDropdown({helpText,showHelpText,label,callback,id,defaultValue,options}){

    const [value,setValue] = useState(defaultValue);

    const callbackFn = (event) => {
        callback(event.target.value);
        setValue(event.target.value);
    }

    return(
        <div className = "liquid_component_with_helpText">
        <div className = "liquid_ui_component">
        <span className = "control_label">{label}</span>
        <select className = "liquid_dropdown" id = {id} value = {value}
            onInput  = {callbackFn}>
                <>{options.map(op => (<option key = {op}>{op}</option>))}</>
        </select>
        </div>
        {showHelpText && <div className = "liquid_help_text">{helpText}</div>}
        </div>
    )
}

export default LiquidDropdown;