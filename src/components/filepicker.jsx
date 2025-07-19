import { useState } from 'react'

function LiquidFilePicker({id,callback}){
    const [filename,setFilename] = useState(null);
    const selectFileCallback = (e) =>{
        callback(e);
        setFilename(e.target.value);
    }
    if(filename !== null){
        return(
            <label className = "liquid_file_input">
                <input className = "liquid_button" type = "file" accept="image/png, image/jpeg" onChange = {selectFileCallback}></input>
            {'['+filename+' -- upload another image]'}
            </label>
        );
    }
    else{
        return(
            <label className = "liquid_file_input">
                <input className = "liquid_button" type = "file" accept="image/png, image/jpeg" onChange = {selectFileCallback}></input>
            [upload an image]
            </label>
        );
    }
}
export default LiquidFilePicker;