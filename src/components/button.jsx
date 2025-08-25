import { useState } from "react";

function LiquidButton({title,callback}){
    return(
        <div className = "liquid_ui_component">
            <div className = "liquid_button" onClick = {callback}><span style = {{color:"#ffffff",backgroundColor:"transparent",mixBlendMode:"difference"}}>[{title}]</span></div>
        </div>
    )
}
export default LiquidButton;