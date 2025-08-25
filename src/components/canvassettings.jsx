import { useState } from 'react'
import LiquidCheckbox from './checkbox.jsx'
import LiquidMenuTab from './menutab.jsx'
import LiquidFlowSettings from './flowsettings.jsx'
import LiquidAnimationSettings from './animationsettings.jsx'
import LiquidDropdown from './dropdown.jsx'
import LiquidSlider from './slider.jsx'
import NumberInput from './numberinput.jsx'

function LiquidCanvasSettings({settings,liquidPNGInstance}){
    const [width,setWidth] = useState(settings.canvasWidth);
    const [height,setHeight] = useState(settings.canvasHeight);
    //can be window, background image, or custom dimensions
    const [fitCanvasTo,setFitCanvasTo] = useState(settings.fitCanvasTo);
    function setDimensions(type){
        settings.fitCanvasTo = type;
        switch(type){
            case 'custom dimensions':
                {
                let w,h;
                //if window is landscape, max image dimension will be height
                if(window.innerWidth > window.innerHeight){
                    h = window.innerHeight;
                    w = width/height * h;
                }
                else{
                    w = window.innerWidth;
                    h = height/width * w;
                }
                settings.canvasWidth = w;
                settings.canvasHeight = h;
                break;
                }
            case 'background image':
                break;
            case 'window':
                settings.canvasWidth = window.innerWidth;
                settings.canvasHeight = window.innerHeight;
                break;
        }
        liquidPNGInstance.resetCanvasDimensions();
    }
    setDimensions(fitCanvasTo);
    const children = (
        <>
        <LiquidDropdown label = "fit canvas to " callback = {(val) => {setDimensions(val);setFitCanvasTo(val);}} options = {['custom dimensions','window','background image']} value = {fitCanvasTo}></LiquidDropdown>
        {(fitCanvasTo == 'custom dimensions') && 
        <div style = {{display:'flex',gap:'10px'}}>
            <NumberInput name = "width: " value = {width} min = {1} max = {window.innerWidth} callback = {(val) => {setWidth(val);}}></NumberInput>
            <NumberInput name = "height: " value = {height} min = {1} max = {window.innerHeight} callback = {(val) => {setHeight(val);}}></NumberInput>
        </div>
        }
        <LiquidSlider callback = {(val) => {settings.pixelDensity = parseFloat(val);liquidPNGInstance.reset();}} label = {"pixel density: "} min = {"0.01"} max = {"5.0"} stepsize = {"0.01"} defaultValue = {settings.pixelDensity}/>
        </>
    );
    return(
        <LiquidMenuTab title = "canvas" background = {'#ff72b1ff'}defaultState = {settings.canvasMenu.open} children = {children}></LiquidMenuTab>
    )
}
export default LiquidCanvasSettings;