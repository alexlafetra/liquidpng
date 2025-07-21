import { useState } from 'react'
import LiquidColorPicker from './colorpicker.jsx'
import LiquidDropdown from './dropdown.jsx'
import LiquidSlider from './slider.jsx'
import LiquidCheckbox from './checkbox.jsx'
import LiquidFilePicker from './filepicker.jsx'
import LiquidTextBox from './textbox.jsx'

function LiquidImageSettings({parentCallback,settings,liquidPNGInstance}){

    const [inputType,setInputType] = useState(settings.inputType);

    //used for updating the color slider
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if(result){
          return {r: parseInt(result[1], 16),g: parseInt(result[2], 16),b: parseInt(result[3], 16)}
        }
        return null;
    }

    const options = ['image','text'];
    const callback = (val) =>{
        if(val != settings.inputType){
            settings.inputType = val;
            if(settings.inputType == 'image'){
                liquidPNGInstance.reloadImage();
            }
            else if(settings.inputType == 'text'){
                liquidPNGInstance.reloadText();
            }
        }
        setInputType(val);
        parentCallback(val);
    }

    const openFileURL = async (e) => {
        //make sure there's a file here
        if(e.target.files.length > 0){

            //create a file reader object
            const reader = new FileReader();

            //attach a callback for when the FR is done opening the img
            reader.onload = async (e) => {
                //using p5's loadImage()
                const newImg = await settings.p5Inst.loadImage(reader.result);
                settings.image = newImg;
                liquidPNGInstance.reloadImage();
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    }

    if(inputType == 'image'){
        return(
            <>
            <LiquidDropdown callback = {callback} options = {options} defaultValue = {settings.inputType} showHelpText = {settings.showHelpText} helpText = "<-- choose between text or image input"></LiquidDropdown>
            <LiquidFilePicker callback = {openFileURL} helpText = "<-- select an image to warp" showHelpText = {settings.showHelpText}></LiquidFilePicker>
            <LiquidSlider callback = {(val) => {settings.imageScale = val}} label = {"scale"} showHelpText = {settings.showHelpText} helpText = "<-- shrink/grow image" min = {"0.01"} max = {"10.0"} stepsize = {"0.01"} defaultValue = {settings.imageScale}/>
            <LiquidDropdown callback = {(val) => {settings.imageCoordinateOverflow = val}} label = 'overflow' showHelpText = {settings.showHelpText} helpText = "<-- choose how to handle image coordinate overflow" options = {['extend','tile','discard']} defaultValue = {settings.imageCoordinateOverflow}></LiquidDropdown>
            </>
        );
    }
    else if(inputType == 'text'){
        return(
            <>
            <LiquidDropdown callback = {callback} options = {options} defaultValue = {settings.inputType} showHelpText = {settings.showHelpText} helpText = "<-- choose between text or image input"></LiquidDropdown>
            <LiquidTextBox className = "text_input_box" showHelpText = {settings.showHelpText} helpText = "<-- put your text here" placeholderText = {settings.displayText} callback = {(event) => {settings.displayText = event.target.value;liquidPNGInstance.loadText(settings.displayText);}}></LiquidTextBox>
            <LiquidDropdown callback = {async (val) => {settings.fontLink = val; settings.font = await settings.p5Inst.loadFont(settings.fontLink);liquidPNGInstance.reloadText();}} showHelpText = {settings.showHelpText} helpText = "<-- select font" options = {settings.fontOptions} defaultValue = {settings.inputType}></LiquidDropdown>
            <LiquidSlider callback = {(val) => {settings.imageScale = val}} label = {"scale"} min = {"0.01"} max = {"10.0"} stepsize = {"0.01"} defaultValue = {settings.imageScale} showHelpText = {settings.showHelpText} helpText = "<-- shrink/grow image"/>
            <LiquidDropdown callback = {(val) => {settings.imageCoordinateOverflow = val}} label = 'overflow' options = {['extend','tile','discard']} defaultValue = {settings.imageCoordinateOverflow} showHelpText = {settings.showHelpText} helpText = "<-- choose how to handle image coordinate overflow"></LiquidDropdown>
            <LiquidSlider callback = {(val) => {settings.fontSize = parseInt(val); liquidPNGInstance.loadText(settings.displayText);}} label = {"text res"} min = {"1"} max = {"400"} stepsize = {"1"} defaultValue = {settings.fontSize} showHelpText = {settings.showHelpText} helpText = "<-- change font size/resolution"/>
            <LiquidColorPicker callback = {(val) => {val = hexToRgb(val); settings.fontColor = [val.r/255.0,val.g/255.0,val.b/255.0];}} defaultValue = {'#ff0000'} label = {"text color"} showHelpText = {settings.showHelpText} helpText = "<-- change text color"></LiquidColorPicker>
            </>
        );
    }
}
export default LiquidImageSettings;