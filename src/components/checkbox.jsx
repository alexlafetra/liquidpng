import { useState } from "react";

function LiquidCheckbox({title,defaultState,callback}){
    const [state,setState] = useState(defaultState);
    const componentCallback = (e) =>{
        callback(!state);
        setState(!state);
    }
    return(
        <div className = "liquid_checkbox" onClick = {componentCallback}><span className = "control_header">{title}</span> <span style = {{color:"#ffffff",backgroundColor: (state?"#000000":"transparent"),mixBlendMode:"difference"}}>[{state?"x":"  "}]</span></div>
    )
}
export default LiquidCheckbox;