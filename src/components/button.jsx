import { useState } from "react";

function LiquidButton({showHelpText,helpText,title,callback}){
    return(
        <div className = "liquid_component_with_helpText">
        <div className = "liquid_ui_component">
            <div className = "liquid_button" onClick = {callback}><span style = {{color:"#ffffff",backgroundColor:"transparent",mixBlendMode:"difference"}}>[{title}]</span></div>
        </div>
        {showHelpText && <div className = "liquid_help_text">{helpText}</div>}
        </div>
    )
}
export default LiquidButton;