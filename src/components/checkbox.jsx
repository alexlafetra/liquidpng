import { useState } from "react";

function LiquidCheckbox({title,defaultState,callback}){
    const [state,setState] = useState(defaultState);
    const componentCallback = (e) =>{
        callback(!state);
        setState(!state);
    }
    return(
        <div className = "liquid_checkbox" onClick = {componentCallback}><span className = "control_header">{title}</span> <span style = {{color:(state?"white":"black"),backgroundColor: (state?"black":"transparent")}}>[{state?"x":"  "}]</span></div>
    )
}
export default LiquidCheckbox;