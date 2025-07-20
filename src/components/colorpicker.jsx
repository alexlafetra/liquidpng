import { useState } from 'react'
import { HexColorPicker } from "react-colorful";

function LiquidColorPicker({showHelpText,helpText,label,callback,id,defaultValue}){

    const [value,setValue] = useState(defaultValue);

    const callbackFn = (hexColor) => {
        callback(hexColor);
        setValue(hexColor);
    }

    return(
        <div className = "liquid_component_with_helpText">
        <div className = "liquid_color_picker liquid_ui_component">
        <span className = "control_label">{label}</span>
        <HexColorPicker onChange={callbackFn} color = {defaultValue}></HexColorPicker>
        </div>
        {showHelpText && <div className = "liquid_help_text">{helpText}</div>}
        </div>
    )
}

export default LiquidColorPicker;