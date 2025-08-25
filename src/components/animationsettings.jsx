import { useState } from 'react'
import LiquidSlider from './slider.jsx'
import LiquidCheckbox from './checkbox.jsx'

function LiquidAnimationSettings({settings,liquidPNGInstance}){
    const [active,setActive] = useState(settings.animation.active);
    return(
        <>
        <LiquidCheckbox title = {'animate'} defaultState={active} callback = {(val) => {settings.animation.active = val;setActive(val);}}></LiquidCheckbox>
        {active && 
            <div className = "flow_slider_container">
            <LiquidSlider callback = {(val) => {settings.animation.xMotion = parseFloat(val);}} label = {"x: "} min = {-10.0} max = {10.0} stepsize = {1} defaultValue = {settings.animation.xMotion}/>
            <LiquidSlider callback = {(val) => {settings.animation.yMotion = parseFloat(val);}} label = {"y: "} min = {-10.0} max = {10.0} stepsize = {1} defaultValue = {settings.animation.yMotion}/>
            </div>
        }
        </>
    );
}
export default LiquidAnimationSettings;