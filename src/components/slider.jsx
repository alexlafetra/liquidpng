import { useState } from 'react'

function LiquidSlider({showHelpText,helpText,label,callback,id,min,max,stepsize,defaultValue}){

    const [value,setValue] = useState(defaultValue);

    const callbackFn = (event) => {
        callback(event.target.value);
        setValue(event.target.value);
    }

    return(
        <div className = "liquid_component_with_helpText">
        <div className = "liquid_ui_component">
        <div className = "liquid_slider_container">
        <span className = "liquid_slider_label">{label + ":" + value}</span>
        <input className = "liquid_slider" type = "range" id = {id} min = {min} max = {max} step = {stepsize} value = {value}
            onInput  = {callbackFn}
            />
        </div>
        </div>
        {showHelpText && <div className = "liquid_help_text">{helpText}</div>}
        </div>
    )
}

export default LiquidSlider;