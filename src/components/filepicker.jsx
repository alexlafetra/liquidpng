import { useState } from 'react'

function LiquidFilePicker({id,callback}){
    const [filename,setFilename] = useState(null);
    const submitCallback = () => {
        if(filename != null)
            callback(filename);
    }
    const selectFileCallback = (e) =>{
        setFilename(e.target.value);
    }
    return(
        <>
        <input type = "file" accept="image/png, image/jpeg" onChange = {selectFileCallback} id = {id} ></input>
        <input type = "button" onClick = {submitCallback} value = {filename !== null ? "submit":"no image selected"}></input>
        </>
    );
}
export default LiquidFilePicker;