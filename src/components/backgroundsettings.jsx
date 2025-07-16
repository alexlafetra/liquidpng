import { useState } from 'react'
import LiquidColorPicker from './colorpicker.jsx'
import LiquidDropdown from './dropdown.jsx'
import LiquidSlider from './slider.jsx'
import LiquidCheckbox from './checkbox.jsx'

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
    switch(backgroundStyle){
        //transparent background
        case 0:
            return(
                <>
                <LiquidDropdown callback = {callback} label = {"style"} options = {options} defaultValue = {"clear"}></LiquidDropdown>
                </>
            );
        //solid color background
        case 1:
            return(
                <>
                <LiquidDropdown callback = {callback} label = {"style"} options = {options} defaultValue = {"clear"}></LiquidDropdown>
                <LiquidColorPicker callback = {(val) => {val = hexToRgb(val); settings.backgroundColor = [val.r/255.0,val.g/255.0,val.b/255.0];}} defaultValue = {'#0000ff'} label = {"background color"}></LiquidColorPicker>
                </>
            );
        //grid background
        case 2:
            return(
                <>
                <LiquidDropdown callback = {callback} label = {"style"} options = {options} defaultValue = {"clear"}></LiquidDropdown>
                <LiquidColorPicker callback = {(val) => {val = hexToRgb(val); settings.backgroundColor = [val.r/255.0,val.g/255.0,val.b/255.0];}} defaultValue = {'#0000ff'} label = {"background color"}></LiquidColorPicker>
                <LiquidSlider callback = {(val) => {settings.gridThickness = val;}} label = {"thickness"} min = {"0.0"} max = {"0.05"} stepsize = {"0.001"} defaultValue = {settings.gridThickness}/>
                <LiquidSlider callback = {(val) => {settings.gridSize = val;}} label = {"size"} min = {"0.0"} max = {"20.0"} stepsize = {"1.0"} defaultValue = {settings.gridSize}/>
                </>
            );
        //blur
        case 3:
            return(
                <>
                <LiquidDropdown callback = {callback} label = {"style"} options = {options} defaultValue = {"clear"}></LiquidDropdown>
                <LiquidColorPicker callback = {(val) => {val = hexToRgb(val); settings.backgroundColor = [val.r/255.0,val.g/255.0,val.b/255.0];}} defaultValue = {'#0000ff'} label = {"background color"}></LiquidColorPicker>
                <LiquidSlider callback = {(val) => {settings.gridThickness = val;}} label = {"thickness"} min = {"0.0"} max = {"0.05"} stepsize = {"0.001"} defaultValue = {settings.gridThickness}/>
                <LiquidSlider callback = {(val) => {settings.gridSize = val;}} label = {"size"} min = {"0.0"} max = {"20.0"} stepsize = {"1.0"} defaultValue = {settings.gridSize}/>
                </>
            );
    }
}
export default LiquidBackgroundSettings;