import { useState } from "react";

function LiquidCheckbox({onMouseEnter,onMouseLeave,setTitleInsideBrackets,showHelpText,helpText,title,defaultState,callback}){
    const [state,setState] = useState(defaultState);
    const componentCallback = (e) =>{
        callback(!state);
        setState(!state);
    }
    return(
        <div className = "liquid_component_with_helpText">
        <div className = "liquid_ui_component">
        {setTitleInsideBrackets &&
            <div className = "liquid_checkbox" onMouseEnter = {onMouseEnter} onMouseLeave = {onMouseLeave} onClick = {componentCallback}><span style = {{color:(state?"#000000":"#ffffff"),backgroundColor: (state?"#ffffff":"transparent"),mixBlendMode:"difference"}}>[{title}]</span></div>
        }
        {!setTitleInsideBrackets &&
            <div className = "liquid_checkbox" onMouseEnter = {onMouseEnter} onMouseLeave = {onMouseLeave} onClick = {componentCallback}><span className = "checkbox_header">{title}</span> <span style = {{color:(state?"#000000":"#ffffff"),backgroundColor: (state?"#ffffff":"transparent"),mixBlendMode:"difference"}}>[{state?"x":"  "}]</span></div>
        }
        </div>
        {showHelpText && <div className = "liquid_help_text">{helpText}</div>}
        </div>
    )
}
export default LiquidCheckbox;