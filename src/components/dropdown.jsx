import { useState } from 'react'

function LiquidDropdown({label,callback,id,defaultValue,options}){

    const [value,setValue] = useState(defaultValue);

    const callbackFn = (event) => {
        callback(event.target.value);
        setValue(event.target.value);
    }

    return(
        <select className = "liquid_dropdown" id = {id} value = {value}
            onInput  = {callbackFn}>
                <>{options.map(op => (<option key = {op}>{op}</option>))}</>
        </select>
    )
}

export default LiquidDropdown;