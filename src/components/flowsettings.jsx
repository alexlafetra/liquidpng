import { useState } from 'react'
import LiquidSlider from './slider.jsx'
import LiquidCheckbox from './checkbox.jsx'

function LiquidFlowSettings({title,initialState,noiseSettings,amplitudeSliderSettings,scaleSliderSettings,amplitudeCallback,scaleCallback}){
    const [active,setActive] = useState(noiseSettings.active);
    if(active){
        return(
            <>
            <LiquidCheckbox title = {title} defaultState={active} callback = {(val) => {noiseSettings.active = val;setActive(val);}}></LiquidCheckbox>
                <div className = "flow_slider_container">
                    <LiquidSlider className = "flow_slider" callback = {amplitudeCallback} label = {"amplitude"} min = {amplitudeSliderSettings.min} max = {amplitudeSliderSettings.max} stepsize = {amplitudeSliderSettings.stepsize} defaultValue = {amplitudeSliderSettings.default}/>
                    <LiquidSlider className = "flow_slider" callback = {scaleCallback} label = {"scale"} min = {scaleSliderSettings.min} max = {scaleSliderSettings.max} stepsize = {scaleSliderSettings.stepsize} defaultValue = {scaleSliderSettings.default}/>
                </div>
            </>
        )
    }
    else{
        return(
            <>
            <LiquidCheckbox title = {title} defaultState={active} callback = {(val) => {noiseSettings.active = val;setActive(val);}}></LiquidCheckbox>
            </>
        );

    }
}
export default LiquidFlowSettings;