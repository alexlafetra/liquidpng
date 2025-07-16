import LiquidSlider from './slider.jsx'
import LiquidBackgroundSettings from './backgroundsettings.jsx'
import LiquidImageSettings from './imagesettings.jsx'
import LiquidFlowSettings from './flowsettings.jsx'
import LiquidCheckbox from './checkbox.jsx'
import { useState } from 'react'

function LiquidUIContainer({liquidPNGInstance,settings}){
    const [inputType,setInputType] = useState(settings.inputType);
    const [hidden,setHidden] = useState(settings.hideUI);
    if(hidden){
      return(
        <div className = "ui_container">
          <img id = "logo" src = "./logo.png" width = "100px"></img>
          <LiquidCheckbox title = {"ui"} defaultState={!settings.hideUI} callback = {(val) => {setHidden(!hidden)}}></LiquidCheckbox>
        </div>
      )
    }
    else{
      return(
        <div className = "ui_container">
          <img id = "logo" src = "./logo.png" width = "100px"></img>
          <LiquidCheckbox title = {"ui"} defaultState={!settings.hideUI} callback = {(val) => {setHidden(!hidden)}}></LiquidCheckbox>
          <br></br>
          <span className = "control_header">image/text</span>
          <LiquidImageSettings parentCallback = {(newInputType) => {setInputType(newInputType)}}settings = {settings} liquidPNGInstance={liquidPNGInstance}></LiquidImageSettings>
          {inputType === 'text' && (
            <>
              <span className = "control_header">background</span>
              <LiquidBackgroundSettings settings = {settings}></LiquidBackgroundSettings>
            </>
          )}
          {/* holds the noise display */}
          <div id = "noise_canvas" className = "noise_canvas_container"></div>

          <LiquidCheckbox title = {"sq"} defaultState={settings.clampNoise} callback = {(val) => {settings.clampNoise = val;}}></LiquidCheckbox>
          <LiquidFlowSettings title = {"flow"} initialState={settings.lowFNoise.active} amplitudeSliderSettings = {{min:0.0,max:5.0,stepsize:0.001,default:settings.lowFNoise.amplitude}} scaleSliderSettings = {{min:0.0,max:2.5,stepsize:0.001,default:settings.lowFNoise.scale}} noiseSettings = {settings.lowFNoise} amplitudeCallback={(val) => {settings.lowFNoise.amplitude = val;}} scaleCallback={(val) => {settings.lowFNoise.scale = val;}}></LiquidFlowSettings>
          <LiquidFlowSettings title = {"ripple"} initialState={settings.mediumFNoise.active} amplitudeSliderSettings = {{min:0.0,max:5.0,stepsize:0.001,default:settings.mediumFNoise.amplitude}} scaleSliderSettings = {{min:0.0,max:5.0,stepsize:0.001,default:settings.mediumFNoise.scale}} noiseSettings = {settings.mediumFNoise} amplitudeCallback={(val) => {settings.mediumFNoise.amplitude = val;}} scaleCallback={(val) => {settings.mediumFNoise.scale = val;}}></LiquidFlowSettings>
          <LiquidFlowSettings title = {"fuzz"} initialState={settings.highFNoise.active} amplitudeSliderSettings = {{min:0.0,max:1.0,stepsize:0.001,default:settings.highFNoise.amplitude}} scaleSliderSettings = {{min:10.0,max:1000.0,stepsize:1.0,default:settings.highFNoise.scale}} noiseSettings = {settings.highFNoise} amplitudeCallback={(val) => {settings.highFNoise.amplitude = val;}} scaleCallback={(val) => {settings.highFNoise.scale = val;}}></LiquidFlowSettings>
        </div>
      )
    }
}
export default LiquidUIContainer;