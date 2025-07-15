import { useState } from 'react'
import LiquidSlider from './slider.jsx'
import LiquidCheckbox from './checkbox.jsx'

function LiquidFlowSettings({title,initialState,noiseSettings,amplitudeSliderSettings,scaleSliderSettings,amplitudeCallback,scaleCallback}){
    const [active,setActive] = useState(initialState);

    if(active){
        return(
            <>
            <span className = "control_header">{title}</span>
            <LiquidCheckbox defaultState={noiseSettings.active} callback = {(val) => {console.log("hey!");noiseSettings.active = val;setActive(val);}}></LiquidCheckbox>
            <LiquidSlider callback = {amplitudeCallback} label = {"amplitude"} min = {amplitudeSliderSettings.min} max = {amplitudeSliderSettings.max} stepsize = {amplitudeSliderSettings.stepsize} defaultValue = {amplitudeSliderSettings.default}/>
            <LiquidSlider callback = {scaleCallback} label = {"scale"} min = {scaleSliderSettings.min} max = {scaleSliderSettings.max} stepsize = {scaleSliderSettings.stepsize} defaultValue = {scaleSliderSettings.default}/>
            </>
        )
    }
    else{
        return(
            <>
            <span className = "control_header">{title}</span>
            <LiquidCheckbox defaultState={active} callback = {setActive}></LiquidCheckbox>
            </>
        );

    }
}
export default LiquidFlowSettings;