import { useState } from 'react'
import LiquidColorPicker from './colorpicker.jsx'
import LiquidDropdown from './dropdown.jsx'
import LiquidSlider from './slider.jsx'
import LiquidCheckbox from './checkbox.jsx'
import LiquidFilePicker from './filepicker.jsx'
import LiquidTextBox from './textbox.jsx'
import LiquidMenuTab from './menutab.jsx'

function LiquidImageSettings({parentCallback,settings,liquidPNGInstance}){

    const [inputType,setInputType] = useState(settings.inputType);
    const [imageCoordinateOverflow,setImageCoordinateOverflow] = useState(settings.imageCoordinateOverflow);
    const [fontLink,setFontLink] = useState(settings.fontLink);
    const [textAlignment,setTextAlignment] = useState(settings.textAlignment);
    const [filename,setFilename] = useState('[upload an image]');

    //used for updating the color slider
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if(result){
          return {r: parseInt(result[1], 16),g: parseInt(result[2], 16),b: parseInt(result[3], 16)}
        }
        return null;
    }

    const options = ['image','text'];
    const changeInputCallback = (val) =>{
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
    const alignOptions = ['left','center','right'];
    const changeTextAlignCallback = (val) => {
        if(val !== settings.textAlignment){
            settings.textAlignment = val;
            liquidPNGInstance.reloadText();
            setTextAlignment(val);
        }
    }

    const openFileURL = async (e) => {
        //make sure there's a file here
        if(e.target.files.length > 0){

            const file = e.target.files[0];
            const isVideo = file.type.startsWith('video/');
            const isImage = file.type.startsWith('image/');
            let fName = e.target.value.split('C:\\fakepath\\')[1];
            if(fName.length>10){
                fName = fName.slice(0,10)+'...'+fName.slice(-4);
            }
            setFilename('['+fName+']');
            
            if(isImage){
                //create a file reader object
                const reader = new FileReader();
                //attach a callback for when the FR is done opening the img
                reader.onload = async (e) => {
                    //using p5's loadImage()
                    const newImg = await settings.p5Inst.loadImage(reader.result);
                    settings.image = newImg;
                    liquidPNGInstance.reloadImage();
                };
                reader.readAsDataURL(file);
            }
            else if(isVideo){
                const videoURL = URL.createObjectURL(file);
                const vid = settings.p5Inst.createVideo([videoURL]);
                vid.hide();
                vid.volume(0);
                vid.loop();
                vid.elt.onloadedmetadata = () => {
                    settings.image = vid;
                }
            }
        }
    }
    const nonspecificChildren = (
        <div key = "0">
            <LiquidDropdown label = "warping " callback = {changeInputCallback} options = {options} value = {inputType}  ></LiquidDropdown>
            <LiquidSlider callback = {(val) => {settings.imageScale = val}} label = {inputType + " scale: "} min = {"0.01"} max = {"4.0"} stepsize = {"0.01"} defaultValue = {settings.imageScale}/>
            <LiquidDropdown callback = {(val) => {settings.imageCoordinateOverflow = val; setImageCoordinateOverflow(val);}} label = 'handle edges by ' options = {['extending','tiling','discarding']} value = {imageCoordinateOverflow}></LiquidDropdown>
        </div>
    );
    const specificChildren = (inputType == 'image')?(
            <LiquidFilePicker key = "1" callback = {openFileURL} value = {filename}></LiquidFilePicker>
        ):(
        <div key = "1">
            <LiquidTextBox className = "text_input_box" placeholderText = {settings.displayText} callback = {(event) => {settings.displayText = event.target.value;liquidPNGInstance.loadText(settings.displayText);}}></LiquidTextBox>
            <LiquidCheckbox title = {'lock bounding box'} defaultState={!settings.updateTextBoundingBox} callback = {(val) => {settings.updateTextBoundingBox = !val;if(settings.updateTextBoundingBox){liquidPNGInstance.loadText(settings.displayText);}}}></LiquidCheckbox>
            <LiquidDropdown label = 'font: ' callback = {async (val) => {settings.fontLink = val; settings.font = await settings.p5Inst.loadFont('./fonts/'+settings.fontLink);liquidPNGInstance.reloadText();setFontLink(val);}} options = {settings.fontOptions} value = {fontLink}></LiquidDropdown>
            <LiquidSlider callback = {(val) => {settings.fontSize = parseInt(val); liquidPNGInstance.loadText(settings.displayText);}} label = {"font resolution: "} min = {"1"} max = {"400"} stepsize = {"1"} defaultValue = {settings.fontSize}/>
            <LiquidDropdown label = 'align to the ' callback = {changeTextAlignCallback} options = {alignOptions} value = {textAlignment}></LiquidDropdown>
            <LiquidColorPicker callback = {(val) => {val = hexToRgb(val); settings.fontColor = [val.r/255.0,val.g/255.0,val.b/255.0];}} defaultValue = {'#ff0000'} label = {"text color"}></LiquidColorPicker>
    </div>
    )
    return(
        <LiquidMenuTab title = {inputType} background = {'#ff0088ff'} defaultState = {settings.imageMenu.open} children = {[nonspecificChildren,specificChildren]}></LiquidMenuTab>
    )
}
export default LiquidImageSettings;