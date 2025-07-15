import { useState } from 'react'

function LiquidColorPicker({label,callback,id,defaultValue}){

    const [value,setValue] = useState(defaultValue);

    const callbackFn = (event) => {
        callback(event.target.value);
        setValue(event.target.value);
    }

    return(
        <div className = "liquid_png_settings_colorpicker">
        <span className = "slider_label">{label + ":" + value}</span>
        <br/>
        <input type = "color" id = {id} value = {value}
            onInput  = {callbackFn}
            />
        </div>
    )
}

export default LiquidColorPicker;