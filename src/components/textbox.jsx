import Textarea from '@mui/joy/Textarea';

function LiquidTextBox({callback}){
    return(
        <>
        <Textarea onInput = {callback} placeholder = "Liquid" variant="outlined"></Textarea>
        {/* <input type = "text" className = "liquid_text_box"
            onInput    = {callback}
            /> */}
            {/* <textarea onInput = {callback}></textarea> */}
        </>
    )
}

export default LiquidTextBox;