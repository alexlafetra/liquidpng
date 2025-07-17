import { useState } from "react";

function LiquidCheckbox({title,defaultState,callback}){
    const [state,setState] = useState(defaultState);
    const componentCallback = (e) =>{
        callback(!state);
        setState(!state);
    }
    return(
        <div className = "liquid_checkbox" onClick = {componentCallback}><span className = "control_header">{title}</span> <span style = {{color:(state?"#000000":"#ffffff"),backgroundColor: (state?"#ffffff":"transparent"),mixBlendMode:"difference"}}>[{state?"x":"  "}]</span></div>
    )
}
export default LiquidCheckbox;