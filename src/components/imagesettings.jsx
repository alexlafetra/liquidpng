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
            </>
        );
    }
    else if(inputType == 'text'){
        return(
            <>
            <LiquidDropdown callback = {callback} options = {options} defaultValue = {settings.inputType}></LiquidDropdown>
            <LiquidTextBox className = "text_input_box" callback = {(event) => {settings.displayText = event.target.value;liquidPNGInstance.loadText(settings.displayText);}}></LiquidTextBox>
            <LiquidDropdown callback = {async (val) => {settings.fontLink = val; settings.font = await settings.p5Inst.loadFont(settings.fontLink);liquidPNGInstance.reloadText();}} options = {['times.ttf','arial.ttf','chopin.ttf']} defaultValue = {settings.inputType}></LiquidDropdown>
            <LiquidSlider callback = {(val) => {settings.imageScale = val}} label = {"scale"} min = {"0.0"} max = {"10.0"} stepsize = {"0.01"} defaultValue = {settings.imageScale}/>
            <LiquidCheckbox title = {"centered"} defaultState={settings.centerText} callback = {(val) => {settings.centerText = val;liquidPNGInstance.reloadText();}}></LiquidCheckbox>
            <LiquidSlider callback = {(val) => {settings.fontSize = parseInt(val); liquidPNGInstance.loadText(settings.displayText);}} label = {"font size"} min = {"1"} max = {"200"} stepsize = {"1"} defaultValue = {settings.fontSize}/>
            <LiquidColorPicker callback = {(val) => {val = hexToRgb(val); settings.fontColor = [val.r,val.g,val.b];liquidPNGInstance.loadText(liquidPNGInstance.currentText);}} defaultValue = {'#ff0000'} label = {"color"}></LiquidColorPicker>
            </>
        );
    }
}
export default LiquidImageSettings;