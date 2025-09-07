import { useState } from "react";

function LiquidCheckbox({onMouseEnter,onMouseLeave,setTitleInsideBrackets,title,state,callback}){
    return(
        <div className = "liquid_ui_component">
        {setTitleInsideBrackets &&
            <div className = "liquid_checkbox" onMouseEnter = {onMouseEnter} onMouseLeave = {onMouseLeave} onClick = {callback}><span style = {{color:(state?"#000000":"#ffffff"),backgroundColor: (state?"#ffffff":"transparent"),mixBlendMode:"difference"}}>[{title}]</span></div>
        }
        {!setTitleInsideBrackets &&
            <div className = "liquid_checkbox" onMouseEnter = {onMouseEnter} onMouseLeave = {onMouseLeave} onClick = {callback}><span className = "checkbox_header">{title}</span> <span style = {{color:(state?"#000000":"#ffffff"),backgroundColor: (state?"#ffffff":"transparent"),mixBlendMode:"difference",whiteSpace:"pre"}}>[{state?"x":"  "}]</span></div>
        }
        </div>
    )
}
export default LiquidCheckbox;