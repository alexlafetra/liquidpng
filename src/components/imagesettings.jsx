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

    if(inputType == 'image'){
        return(
            <>
            <LiquidDropdown callback = {callback} options = {options} defaultValue = {settings.inputType}></LiquidDropdown>
            {/* <LiquidFilePicker id = "image_selector" callback = {(fname) => {liquidPNGInstance.loadNewImage(fname);}}></LiquidFilePicker> */}
            <LiquidSlider callback = {(val) => {settings.imageScale = val}} label = {"scale"} min = {"0.0"} max = {"10.0"} stepsize = {"0.01"} defaultValue = {settings.imageScale}/>
            <LiquidDropdown callback = {(val) => {settings.imageCoordinateOverflow = val}} options = {['extend','wrap','discard']} defaultValue = {settings.imageCoordinateOverflow}></LiquidDropdown>
            </>
        );
    }
    else if(inputType == 'text'){
        return(
            <>
            <LiquidDropdown callback = {callback} options = {options} defaultValue = {settings.inputType}></LiquidDropdown>
            <LiquidTextBox className = "text_input_box" placeholderText = {settings.displayText} callback = {(event) => {settings.displayText = event.target.value;liquidPNGInstance.loadText(settings.displayText);}}></LiquidTextBox>
            <LiquidDropdown callback = {async (val) => {settings.fontLink = val; settings.font = await settings.p5Inst.loadFont(settings.fontLink);liquidPNGInstance.reloadText();}} options = {['times.ttf','arial.ttf','chopin.ttf']} defaultValue = {settings.inputType}></LiquidDropdown>
            <LiquidSlider callback = {(val) => {settings.imageScale = val}} label = {"scale"} min = {"0.0"} max = {"10.0"} stepsize = {"0.01"} defaultValue = {settings.imageScale}/>
            <LiquidDropdown callback = {(val) => {settings.imageCoordinateOverflow = val}} options = {['extend','wrap','discard']} defaultValue = {settings.imageCoordinateOverflow}></LiquidDropdown>
            <LiquidSlider callback = {(val) => {settings.fontSize = parseInt(val); liquidPNGInstance.loadText(settings.displayText);}} label = {"text resolution"} min = {"1"} max = {"600"} stepsize = {"1"} defaultValue = {settings.fontSize}/>
            <LiquidColorPicker callback = {(val) => {val = hexToRgb(val); settings.fontColor = [val.r/255.0,val.g/255.0,val.b/255.0];}} defaultValue = {'#ff0000'} label = {"color"}></LiquidColorPicker>
            </>
        );
    }
}
export default LiquidImageSettings;