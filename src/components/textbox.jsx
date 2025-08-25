import Textarea from '@mui/joy/Textarea';

function LiquidTextBox({callback,placeholderText}){
    return(
        <div className = "liquid_ui_component">
        <Textarea className = "liquid_text_box" onInput = {callback} placeholder = {placeholderText} variant="outlined"></Textarea>
        </div>
    )
}

export default LiquidTextBox;