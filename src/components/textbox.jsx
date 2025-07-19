import Textarea from '@mui/joy/Textarea';

function LiquidTextBox({callback,placeholderText}){
    return(
        <>
        <Textarea className = "liquid_text_box" onInput = {callback} placeholder = {placeholderText} variant="outlined"></Textarea>
        </>
    )
}

export default LiquidTextBox;