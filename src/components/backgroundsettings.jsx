import { useState } from 'react'
import LiquidColorPicker from './colorpicker.jsx'
import LiquidDropdown from './dropdown.jsx'
import LiquidSlider from './slider.jsx'
import LiquidCheckbox from './checkbox.jsx'
import LiquidMenuTab from './menutab.jsx'
import LiquidFilePicker from './filepicker.jsx'

function LiquidBackgroundSettings({settings,liquidPNGInstance}){
    const [backgroundStyle,setBackgroundStyle] = useState(settings.backgroundStyle);
    const [fileName,setFilename] = useState('[upload an image]');
    //used for updating the color slider
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if(result){
          const c = {r: parseInt(result[1], 16),g: parseInt(result[2], 16),b: parseInt(result[3], 16)};
          return c;
        }
        return null;
    }
    const options = ["transparency","color","image/video","grid","blur"];
    const callback = (val) => {
        switch(val){
            case "transparency":
                settings.backgroundStyle = 0;
                break;
            case "color":
                settings.backgroundStyle = 1;
                break;
            case "image/video":
                settings.backgroundStyle = 2;
                break;
            case "grid":
                settings.backgroundStyle = 3;
                break;
            case "blur":
                settings.backgroundStyle = 4;
                break;
            }
        setBackgroundStyle(settings.backgroundStyle);
    }

    const openFileURL = async (e) => {
        //make sure there's a file here
        if(e.target.files.length <= 0)
            return;

        const file = e.target.files[0];
        const isVideo = file.type.startsWith('video/');
        const isImage = file.type.startsWith('image/');
        let fName = e.target.value.split('C:\\fakepath\\')[1];
        if(fName.length>10){
            fName = fName.slice(0,10)+'...'+fName.slice(-4);
        }
        setFilename('['+fName+']');
        // console.log(e);
        //video
        if(isVideo){
            const videoURL = URL.createObjectURL(file);
            const vid = settings.p5Inst.createVideo([videoURL]);
            vid.hide();
            vid.volume(0);
            vid.elt.onloadedmetadata = () => {
                settings.backgroundImage = vid;
                settings.backgroundStyle = 2;
                settings.backgroundIsVideo = true;
                // URL.revokeObjectURL(videoURL);
                if(settings.fitCanvasTo == 'background image'){
                    liquidPNG.resetCanvasDimensions();
                }
            }
        }
        //image
        else if(isImage){
            //create a file reader object
            const reader = new FileReader();
            //attach a callback for when the FR is done opening the img
            reader.onload = async (e2) => {
                const dataURL = e2.target.result;
                //using p5's loadImage()
                settings.backgroundImage = await settings.p5Inst.loadImage(reader.result);
                settings.backgroundStyle = 2;
                settings.backgroundIsVideo = false;
                if(settings.fitCanvasTo == 'background image'){
                    liquidPNG.resetCanvasDimensions();
                }
            }
            //read in the file
            reader.readAsDataURL(file);
        }
    }

    let children;
    switch(backgroundStyle){
        //transparent background
        case 0:
            children = (
                <>
                <LiquidDropdown label = {"background is a "} callback = {callback} options = {options}  value = {options[backgroundStyle]} ></LiquidDropdown>
                </>
            );
            break;
        //solid color background
        case 1:
            children = (
                <>
                <LiquidDropdown label = {"background is a "} callback = {callback} options = {options}  value = {options[backgroundStyle]} ></LiquidDropdown>
                <LiquidColorPicker callback = {(val) => {val = hexToRgb(val); settings.backgroundColor = [val.r/255.0,val.g/255.0,val.b/255.0];}} defaultValue = {'#0000ff'}></LiquidColorPicker>
                </>
            );
            break;
        //image/video
        case 2:
            children = (
                <>
                <LiquidDropdown label = {"background is an "} callback = {callback} options = {options}  value = {options[backgroundStyle]} ></LiquidDropdown>
                <LiquidFilePicker callback = {openFileURL} value = {fileName}></LiquidFilePicker>
                <LiquidCheckbox title = {'play with keyframes'} setTitleInsideBrackets = {false} callback = {(val) => {settings.backgroundImage}}></LiquidCheckbox>
                </>
            )
            break;
        //grid background
        case 3:
            children = (
                <>
                <LiquidDropdown label = {"background is a "} callback = {callback} options = {options}  value = {options[backgroundStyle]} ></LiquidDropdown>
                <LiquidColorPicker callback = {(val) => {val = hexToRgb(val); settings.gridColor = [val.r/255.0,val.g/255.0,val.b/255.0];}} defaultValue = {'#ff0000'} label = {"line"}></LiquidColorPicker>
                <LiquidColorPicker callback = {(val) => {val = hexToRgb(val); settings.backgroundColor = [val.r/255.0,val.g/255.0,val.b/255.0];}} defaultValue = {'#0000ff'} label = {"background"}></LiquidColorPicker>
                <br></br>
                <LiquidSlider callback = {(val) => {settings.gridThickness = val;}} label = {"thickness "} min = {"0.0"} max = {"0.05"} stepsize = {"0.001"} defaultValue = {settings.gridThickness}/>
                <LiquidSlider callback = {(val) => {settings.gridSize = val;}} label = {"resolution "} min = {"0.0"} max = {"100.0"} stepsize = {"1.0"} defaultValue = {settings.gridSize}/>
                </>
            );
            break;
        //blur
        case 4:
            children = (
                <>
                <LiquidDropdown label = {"background is a "} callback = {callback} options = {options}  value = {options[backgroundStyle]} ></LiquidDropdown>
                <LiquidColorPicker callback = {(val) => {val = hexToRgb(val); settings.gridColor = [val.r/255.0,val.g/255.0,val.b/255.0];}} defaultValue = {'#ff0000'} label = {"line"}></LiquidColorPicker>
                <LiquidColorPicker callback = {(val) => {val = hexToRgb(val); settings.backgroundColor = [val.r/255.0,val.g/255.0,val.b/255.0];}} defaultValue = {'#0000ff'} label = {"background"}></LiquidColorPicker>
                <br></br>
                <LiquidSlider callback = {(val) => {settings.blurGridIntensity = val;}} label = {"thickness "} min = {"0.0"} max = {"10.0"} stepsize = {"0.001"} defaultValue = {settings.blurGridIntensity}/>
                <LiquidSlider callback = {(val) => {settings.gridSize = val;}} label = {"resolution "} min = {"0.0"} max = {"100.0"} stepsize = {"1.0"} defaultValue = {settings.gridSize}/>
                </>
            );
            break;
    }
    return (
        <LiquidMenuTab title = "background" defaultState = {settings.backgroundMenu.open} background = {'#0000ffff'}children = {children}></LiquidMenuTab>
    )
}
export default LiquidBackgroundSettings;