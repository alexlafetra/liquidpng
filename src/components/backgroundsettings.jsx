import { useState } from 'react'
import LiquidColorPicker from './colorpicker.jsx'
import LiquidDropdown from './dropdown.jsx'
import LiquidSlider from './slider.jsx'
import LiquidCheckbox from './checkbox.jsx'
import LiquidMenuTab from './menutab.jsx'
import LiquidFilePicker from './filepicker.jsx'

function LiquidBackgroundSettings({settings}){
    const [backgroundStyle,setBackgroundStyle] = useState(settings.backgroundStyle);
    //used for updating the color slider
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if(result){
          const c = {r: parseInt(result[1], 16),g: parseInt(result[2], 16),b: parseInt(result[3], 16)};
          return c;
        }
        return null;
    }
    const options = ["transparent","color","image/video","grid","blur"];
    const callback = (val) => {
        switch(val){
            case "transparent":
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
        if(e.target.files.length > 0){

            //create a file reader object
            const reader = new FileReader();

            //attach a callback for when the FR is done opening the img
            reader.onload = async (e2) => {
                const dataURL = e2.target.result;
                // console.log(e);
                //video
                if(dataURL.startsWith('data:video')){
                    const vid = settings.p5Inst.createVideo([dataURL]);
                    vid.hide();
                    vid.volume(0);
                    vid.loop(); // or .play()

                    // Store the ready video in your settings
                    settings.backgroundImage = vid;
                    settings.backgroundStyle = 2;
                }
                //image
                else if(dataURL.startsWith('data:image')){
                    //using p5's loadImage()
                    settings.backgroundImage = await settings.p5Inst.loadImage(reader.result);
                    settings.backgroundStyle = 2;
                }
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    }

    let children;
    switch(backgroundStyle){
        //transparent background
        case 0:
            children = (
                <>
                <LiquidDropdown showHelpText = {settings.showHelpText} helpText = {'<-- change background style'} callback = {callback} options = {options} defaultValue = {"clear"}></LiquidDropdown>
                </>
            );
            break;
        //solid color background
        case 1:
            children = (
                <>
                <LiquidDropdown showHelpText = {settings.showHelpText} helpText = {'<-- change background style'} callback = {callback} options = {options} defaultValue = {"clear"}></LiquidDropdown>
                <LiquidColorPicker showHelpText = {settings.showHelpText} helpText = {'<-- change background color'}callback = {(val) => {val = hexToRgb(val); settings.backgroundColor = [val.r/255.0,val.g/255.0,val.b/255.0];}} defaultValue = {'#0000ff'}></LiquidColorPicker>
                </>
            );
            break;
        //image/video
        case 2:
            children = (
                <>
                <LiquidDropdown showHelpText = {settings.showHelpText} helpText = {'<-- change background style'} callback = {callback} options = {options} defaultValue = {"clear"}></LiquidDropdown>
                <LiquidFilePicker callback = {openFileURL} helpText = "<-- select background image" showHelpText = {settings.showHelpText}></LiquidFilePicker>
                </>
            )
            break;
        //grid background
        case 3:
            children = (
                <>
                <LiquidDropdown showHelpText = {settings.showHelpText} helpText = {'<-- change background style'} callback = {callback} options = {options} defaultValue = {"clear"}></LiquidDropdown>
                <LiquidColorPicker showHelpText = {settings.showHelpText} helpText = {'<-- change grid line color'} callback = {(val) => {val = hexToRgb(val); settings.gridColor = [val.r/255.0,val.g/255.0,val.b/255.0];}} defaultValue = {'#ff0000'} label = {"line"}></LiquidColorPicker>
                <LiquidColorPicker showHelpText = {settings.showHelpText} helpText = {'<-- change background color'} callback = {(val) => {val = hexToRgb(val); settings.backgroundColor = [val.r/255.0,val.g/255.0,val.b/255.0];}} defaultValue = {'#0000ff'} label = {"background"}></LiquidColorPicker>
                <br></br>
                <LiquidSlider showHelpText = {settings.showHelpText} helpText = {'<-- change grid line thickness'} callback = {(val) => {settings.gridThickness = val;}} label = {"thickness"} min = {"0.0"} max = {"0.05"} stepsize = {"0.001"} defaultValue = {settings.gridThickness}/>
                <LiquidSlider showHelpText = {settings.showHelpText} helpText = {'<-- change grid resolution'}callback = {(val) => {settings.gridSize = val;}} label = {"rez"} min = {"0.0"} max = {"100.0"} stepsize = {"1.0"} defaultValue = {settings.gridSize}/>
                </>
            );
            break;
        //blur
        case 4:
            children = (
                <>
                <LiquidDropdown showHelpText = {settings.showHelpText} helpText = {'<-- change background style'} callback = {callback} options = {options} defaultValue = {"clear"}></LiquidDropdown>
                <LiquidColorPicker showHelpText = {settings.showHelpText} helpText = {'<-- change grid line color'} callback = {(val) => {val = hexToRgb(val); settings.gridColor = [val.r/255.0,val.g/255.0,val.b/255.0];}} defaultValue = {'#ff0000'} label = {"line"}></LiquidColorPicker>
                <LiquidColorPicker showHelpText = {settings.showHelpText} helpText = {'<-- change background color'} callback = {(val) => {val = hexToRgb(val); settings.backgroundColor = [val.r/255.0,val.g/255.0,val.b/255.0];}} defaultValue = {'#0000ff'} label = {"background"}></LiquidColorPicker>
                <br></br>
                <LiquidSlider showHelpText = {settings.showHelpText} helpText = {'<-- change grid color intensity'} callback = {(val) => {settings.blurGridIntensity = val;}} label = {"intensity"} min = {"0.0"} max = {"10.0"} stepsize = {"0.001"} defaultValue = {settings.blurGridIntensity}/>
                <LiquidSlider showHelpText = {settings.showHelpText} helpText = {'<-- change grid resolution'}callback = {(val) => {settings.gridSize = val;}} label = {"rez"} min = {"0.0"} max = {"100.0"} stepsize = {"1.0"} defaultValue = {settings.gridSize}/>
                </>
            );
            break;
    }
    return (
        <LiquidMenuTab title = "background" defaultState = {settings.backgroundMenu.open} children = {children}></LiquidMenuTab>
    )
}
export default LiquidBackgroundSettings;