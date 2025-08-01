import { useState } from 'react'
import LiquidColorPicker from './colorpicker.jsx'
import LiquidDropdown from './dropdown.jsx'
import LiquidSlider from './slider.jsx'
import LiquidCheckbox from './checkbox.jsx'
import LiquidMenuTab from './menutab.jsx'

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
    const options = ["transparent","color","grid","blur"];
    const callback = (val) => {
        switch(val){
            case "transparent":
                settings.backgroundStyle = 0;
                break;
            case "color":
                settings.backgroundStyle = 1;
                break;
            case "grid":
                settings.backgroundStyle = 2;
                break;
            case "blur":
                settings.backgroundStyle = 3;
                break;
            }
        setBackgroundStyle(settings.backgroundStyle);
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
        //grid background
        case 2:
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
        case 3:
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