import Textarea from '@mui/joy/Textarea';

function LiquidTextBox({showHelpText,helpText,callback,placeholderText}){
    return(
        <div className = "liquid_component_with_helpText">
        <div className = "liquid_ui_component">
        <Textarea className = "liquid_text_box" onInput = {callback} placeholder = {placeholderText} variant="outlined"></Textarea>
        </div>
        {showHelpText && <div className = "liquid_help_text">{helpText}</div>}
        </div>
    )
}

export default LiquidTextBox;