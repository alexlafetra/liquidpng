import LiquidBackgroundSettings from './backgroundsettings.jsx'
import LiquidImageSettings from './imagesettings.jsx'
import LiquidFlowSettings from './flowsettings.jsx'
import LiquidCheckbox from './checkbox.jsx'
import LiquidLocationDisplay from './locationdisplay.jsx'
import { useState } from 'react'

function LiquidUIContainer({liquidPNGInstance,settings}){
    const [inputType,setInputType] = useState(settings.inputType);
    const [hidden,setHidden] = useState(settings.hideUI);
    const [showHelpText,setShowHelpText] = useState(settings.showHelpText);

    if(hidden){
      return(
        <div className = "ui_container">
          <span className = "control_header">liquid.png</span>
          <LiquidCheckbox title = {"ui"} helpText = '<-- show/hide the user interface' showHelpText = {settings.showHelpText} defaultState={!settings.hideUI} callback = {(val) => {setHidden(!hidden)}}></LiquidCheckbox>
          <span className = "liquid_button" onClick ={(e) => {liquidPNGInstance.saveImage();}}>[save]</span>
          <LiquidCheckbox title = {'help'} setTitleInsideBrackets = {true} helpText = '<-- show/hide info' showHelpText = {settings.showHelpText} defaultState={settings.showHelpText} callback = {(e) => {settings.showHelpText = !settings.showHelpText;setShowHelpText(settings.showHelpText);}}></LiquidCheckbox>
        </div>
      )
    }
    else{
      return(
        <div className = "ui_container">
          <span className = "control_header">liquid.png</span>
          <LiquidCheckbox title = {"ui"} helpText = '<-- show/hide the user interface' showHelpText = {settings.showHelpText} defaultState={!settings.hideUI} callback = {(val) => {setHidden(!hidden)}}></LiquidCheckbox>
          <span className = "liquid_button" onClick ={(e) => {liquidPNGInstance.saveImage();}}>[save]</span>
          <LiquidCheckbox title = {'help'} setTitleInsideBrackets = {true} helpText = '<-- show/hide info' showHelpText = {settings.showHelpText} defaultState={settings.showHelpText} callback = {(e) => {settings.showHelpText = !settings.showHelpText;setShowHelpText(settings.showHelpText);}}></LiquidCheckbox>
          <br></br>
          {/* <span className = "control_header">image/text</span> */}
          <LiquidImageSettings parentCallback = {(newInputType) => {setInputType(newInputType)}} settings = {settings} liquidPNGInstance={liquidPNGInstance}></LiquidImageSettings>
          <span className = "control_header">background</span>
          <LiquidBackgroundSettings settings = {settings}></LiquidBackgroundSettings>
          {/* holds the noise display */}
          {/* <div id = "noise_canvas" className = "noise_canvas_container"></div> */}
          {/* <LiquidLocationDisplay liquidPNGInstance = {liquidPNGInstance} settings = {settings}></LiquidLocationDisplay> */}
          <LiquidCheckbox title = {"jagged"} helpText = {'<-- turn on/off floating point distortion'} showHelpText = {settings.showHelpText} defaultState={settings.clampNoise} callback = {(val) => {settings.clampNoise = val;liquidPNGInstance.init();}}></LiquidCheckbox>
          <LiquidFlowSettings title = {"flow"} helpText = {'<-- turn on/off low-frequency distortion'} showHelpText = {settings.showHelpText} initialState={settings.lowFNoise.active} amplitudeSliderSettings = {{min:0.0,max:5.0,stepsize:0.001,default:settings.lowFNoise.amplitude}} scaleSliderSettings = {{min:0.0,max:2.5,stepsize:0.001,default:settings.lowFNoise.scale}} noiseSettings = {settings.lowFNoise} amplitudeCallback={(val) => {settings.lowFNoise.amplitude = val;}} scaleCallback={(val) => {settings.lowFNoise.scale = val;}}></LiquidFlowSettings>
          <LiquidFlowSettings title = {"ripple"} helpText = {'<-- turn on/off mid-frequency distortion'} showHelpText = {settings.showHelpText}initialState={settings.mediumFNoise.active} amplitudeSliderSettings = {{min:0.0,max:5.0,stepsize:0.001,default:settings.mediumFNoise.amplitude}} scaleSliderSettings = {{min:0.0,max:5.0,stepsize:0.001,default:settings.mediumFNoise.scale}} noiseSettings = {settings.mediumFNoise} amplitudeCallback={(val) => {settings.mediumFNoise.amplitude = val;}} scaleCallback={(val) => {settings.mediumFNoise.scale = val;}}></LiquidFlowSettings>
          <LiquidFlowSettings title = {"dust"} helpText = {'<-- turn on/off high-frequency distortion'} showHelpText = {settings.showHelpText}initialState={settings.highFNoise.active} amplitudeSliderSettings = {{min:0.0,max:1.0,stepsize:0.001,default:settings.highFNoise.amplitude}} scaleSliderSettings = {{min:10.0,max:1000.0,stepsize:1.0,default:settings.highFNoise.scale}} noiseSettings = {settings.highFNoise} amplitudeCallback={(val) => {settings.highFNoise.amplitude = val;}} scaleCallback={(val) => {settings.highFNoise.scale = val;}}></LiquidFlowSettings>
        </div>
      )
    }
}
export default LiquidUIContainer;