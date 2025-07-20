import { useState } from 'react'
import LiquidSlider from './slider.jsx'
import LiquidCheckbox from './checkbox.jsx'

function LiquidFlowSettings({showHelpText,helpText,title,initialState,noiseSettings,amplitudeSliderSettings,scaleSliderSettings,amplitudeCallback,scaleCallback}){
    const [active,setActive] = useState(noiseSettings.active);
    if(active){
        return(
            <div className = "liquid_component_with_helpText">
            <div className = "liquid_ui_component">
            <>
            <LiquidCheckbox title = {title} showHelpText = {showHelpText} helpText = {helpText} defaultState={active} callback = {(val) => {noiseSettings.active = val;setActive(val);}}></LiquidCheckbox>
            <div className = "flow_slider_container">
                <LiquidSlider className = "flow_slider" showHelpText = {showHelpText} helpText = '<-- amount image is effected' callback = {amplitudeCallback} label = {"amplitude"} min = {amplitudeSliderSettings.min} max = {amplitudeSliderSettings.max} stepsize = {amplitudeSliderSettings.stepsize} defaultValue = {amplitudeSliderSettings.default}/>
                <LiquidSlider className = "flow_slider" showHelpText = {showHelpText} helpText = '<-- size of the effect' callback = {scaleCallback} label = {"scale"} min = {scaleSliderSettings.min} max = {scaleSliderSettings.max} stepsize = {scaleSliderSettings.stepsize} defaultValue = {scaleSliderSettings.default}/>
            </div>
            </>
            </div>
            </div>
        )
    }
    else{
        return(
            <>
            <LiquidCheckbox title = {title} showHelpText = {showHelpText} helpText = {helpText} defaultState={active} callback = {(val) => {noiseSettings.active = val;setActive(val);}}></LiquidCheckbox>
            </>
        );

    }
}
export default LiquidFlowSettings;