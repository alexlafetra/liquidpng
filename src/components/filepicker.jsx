import { useState } from 'react'

function LiquidFilePicker({showHelpText,helpText,callback}){
    const [filename,setFilename] = useState(null);
    const selectFileCallback = (e) =>{
        callback(e);
        setFilename(e.target.value);
    }
    if(filename !== null){
        return(
            <div className = "liquid_component_with_helpText">
            <div className = "liquid_ui_component">
            <label className = "liquid_file_input">
                <input className = "liquid_button" type = "file" accept="image/png, image/jpeg, image/svg+xml, video/*" onChange = {selectFileCallback}></input>
            {'['+filename.split('C:\\fakepath\\')[1]+' -- upload another image]'}
            </label>
            </div>
            {showHelpText && <div className = "liquid_help_text">{helpText}</div>}
            </div>
        );
    }
    else{
        return(
            <div className = "liquid_component_with_helpText">
            <div className = "liquid_ui_component">
            <label className = "liquid_file_input">
            <input className = "liquid_button" type = "file" accept="image/png, image/jpeg, image/svg+xml, video/*" onChange = {selectFileCallback}></input>
            [upload an image]
            </label>
            </div>
            {showHelpText && <div className = "liquid_help_text">{helpText}</div>}
            </div>
        );
    }
}
export default LiquidFilePicker;