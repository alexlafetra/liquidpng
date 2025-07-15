function LiquidCheckbox({defaultState,callback}){
    const componentCallback = (e) =>{
        callback(e.target.checked);
    }
    return(
        <input className = "liquid_checkbox" onChange = {componentCallback}type="checkbox" name="vehicle1" checked={defaultState}/>
    )
}
export default LiquidCheckbox;