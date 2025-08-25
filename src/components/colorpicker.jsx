import { useState } from 'react'
import { HexColorPicker } from "react-colorful";

function LiquidColorPicker({label,callback,defaultValue}){

    const callbackFn = (hexColor) => {
        callback(hexColor);
    }

    return(
        <div className = "liquid_color_picker liquid_ui_component">
        <span className = "control_label">{label}</span>
        <HexColorPicker onChange={callbackFn} color = {defaultValue}></HexColorPicker>
        </div>
    )
}

export default LiquidColorPicker;