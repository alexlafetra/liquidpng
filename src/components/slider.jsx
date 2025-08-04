import { useState } from 'react'

function LiquidSlider({showHelpText,helpText,label,callback,id,min,max,stepsize,defaultValue}){

    const [value,setValue] = useState(defaultValue);

    const callbackFn = (event) => {
        callback(parseFloat(event.target.value));
        setValue(event.target.value);
    }

    return(
        <div className = "liquid_slider_container">
        <span className = "liquid_slider_label">{label + ":" + value}</span>
        <input className = "liquid_slider" type = "range" id = {id} min = {min} max = {max} step = {stepsize} value = {value}
            onInput  = {callbackFn}
            />
        </div>
    )
}

export default LiquidSlider;