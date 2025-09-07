import { useState } from 'react'
import LiquidSlider from './slider.jsx'
import LiquidCheckbox from './checkbox.jsx'

function LiquidFlowSettings({active,title,noiseSettings,amplitudeSliderSettings,scaleSliderSettings,amplitudeCallback,scaleCallback,onOffCallback}){
    return(
        <div className = "liquid_ui_component">
        <>
        <LiquidCheckbox title = {title} state={active} callback = {onOffCallback}></LiquidCheckbox>
        {active &&
            <div className = "flow_slider_container">
                <LiquidSlider className = "flow_slider"  callback = {amplitudeCallback} label = {"amplitude"} min = {amplitudeSliderSettings.min} max = {amplitudeSliderSettings.max} stepsize = {amplitudeSliderSettings.stepsize} defaultValue = {amplitudeSliderSettings.default}/>
                <LiquidSlider className = "flow_slider"  callback = {scaleCallback} label = {"scale"} min = {scaleSliderSettings.min} max = {scaleSliderSettings.max} stepsize = {scaleSliderSettings.stepsize} defaultValue = {scaleSliderSettings.default}/>
            </div>
        }
        </>
        </div>
    )
}
export default LiquidFlowSettings;