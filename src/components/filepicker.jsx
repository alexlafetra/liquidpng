import { useState } from 'react'

function LiquidFilePicker({value,callback}){
    const selectFileCallback = (e) =>{
        callback(e);
    }
    return(
        <div className = "liquid_ui_component">
        <label className = "liquid_file_input">
            <input className = "liquid_button" type = "file" accept="image/png, image/jpeg, image/svg+xml, video/*" onChange = {selectFileCallback}></input>
            {value}
        </label>
        </div>
    );
}
export default LiquidFilePicker;