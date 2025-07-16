import { useState } from 'react'
import { HexColorPicker } from "react-colorful";

function LiquidColorPicker({label,callback,id,defaultValue}){

    const [value,setValue] = useState(defaultValue);

    const callbackFn = (hexColor) => {
        callback(hexColor);
        setValue(hexColor);
    }

    return(
        <div className = "liquid_color_picker">
        <span className = "control_label">{label}</span>
        <HexColorPicker onChange={callbackFn} color = {defaultValue}></HexColorPicker>
        </div>
    )
}

export default LiquidColorPicker;