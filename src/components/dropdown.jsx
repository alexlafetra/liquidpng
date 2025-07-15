import { useState } from 'react'

function LiquidDropdown({label,callback,id,defaultValue,options}){

    const [value,setValue] = useState(defaultValue);

    const callbackFn = (event) => {
        callback(event.target.value);
        setValue(event.target.value);
    }

    return(
        <div className = "liquid_png_settings_dropdown">
        <select type = "color" id = {id} value = {value}
            onInput  = {callbackFn}>
                <>{options.map(op => (<option key = {op}>{op}</option>))}</>
        </select>
        </div>
    )
}

export default LiquidDropdown;