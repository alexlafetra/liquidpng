import Textarea from '@mui/joy/Textarea';

function LiquidTextBox({callback}){
    return(
        <>
        <Textarea className = "liquid_text_box" onInput = {callback} placeholder = "Liquid" variant="outlined"></Textarea>
        </>
    )
}

export default LiquidTextBox;