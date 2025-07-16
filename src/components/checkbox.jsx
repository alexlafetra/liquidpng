import { useState } from "react";

function LiquidCheckbox({title,defaultState,callback}){
    const [state,setState] = useState(defaultState);
    const componentCallback = (e) =>{
        callback(!state);
        setState(!state);
    }
    return(
        <div className = "liquid_checkbox"  onClick = {componentCallback}><span className = "control_header">{title}</span> [{state?"x":"  "}]</div>
    )
}
export default LiquidCheckbox;