

function LiquidTextBox({callback}){
    return(
        <>
        {/* <input type = "text" id = "input_text"
            onInput    = {callback}
            /> */}
            <textarea onInput = {callback}></textarea>
        </>
    )
}

export default LiquidTextBox;