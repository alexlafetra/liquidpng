import LiquidBackgroundSettings from './backgroundsettings.jsx'
import LiquidImageSettings from './imagesettings.jsx'
import LiquidFlowSettings from './flowsettings.jsx'
import LiquidCheckbox from './checkbox.jsx'
import LiquidLocationDisplay from './locationdisplay.jsx'
import { useState } from 'react'
import LiquidDropdown from './dropdown.jsx'
import LiquidAnimationSettings from './animationsettings.jsx'

function LiquidUIContainer({liquidPNGInstance,settings}){
    const [inputType,setInputType] = useState(settings.inputType);
    const [hidden,setHidden] = useState(settings.hideUI);
    const [showHelpText,setShowHelpText] = useState(settings.showHelpText);

    return(
      <div className = "ui_container">
        <span className = "title">liquid.png</span>
        <LiquidCheckbox title = {"ui"} helpText = '<-- show/hide the user interface' showHelpText = {settings.showHelpText} defaultState={!settings.hideUI} callback = {(val) => {setHidden(!hidden)}}></LiquidCheckbox>
        <span className = "liquid_button" onClick ={(e) => {liquidPNGInstance.saveImage();}}>[save]</span>
        <LiquidCheckbox title = {'help'} setTitleInsideBrackets = {true} helpText = '<-- show/hide info' showHelpText = {settings.showHelpText} defaultState={settings.showHelpText} callback = {(e) => {settings.showHelpText = !settings.showHelpText;setShowHelpText(settings.showHelpText);}}></LiquidCheckbox>
        {!hidden &&
          <>
          <br></br>
          <LiquidImageSettings parentCallback = {(newInputType) => {setInputType(newInputType)}} settings = {settings} liquidPNGInstance={liquidPNGInstance}></LiquidImageSettings>
          <span className = "control_header">background</span>
          <LiquidBackgroundSettings settings = {settings}></LiquidBackgroundSettings>
          <LiquidDropdown label = {"algorithm"} showHelpText = {settings.showHelpText} helpText = {'<-- noise algorithm'} callback = {(val) => {settings.activeNoiseAlgorithm = val;liquidPNGInstance.flowFieldShader = liquidPNGInstance.createFlowFieldShader();}} options = {Array.from({length:settings.noiseAlgorithms.length},(v,k) => k)} defaultValue = {0}></LiquidDropdown>
          <LiquidAnimationSettings settings = {settings} liquidPNGInstance={liquidPNGInstance}></LiquidAnimationSettings>
          <LiquidCheckbox title = {"jagged"} helpText = {'<-- floating point distortion'} showHelpText = {settings.showHelpText} defaultState={settings.clampNoise} callback = {(val) => {settings.clampNoise = val;liquidPNGInstance.init();}}></LiquidCheckbox>
          <LiquidFlowSettings title = {"flow"} helpText = {'<-- low-frequency distortion'} showHelpText = {settings.showHelpText} initialState={settings.lowFNoise.active} amplitudeSliderSettings = {{min:0.0,max:5.0,stepsize:0.001,default:settings.lowFNoise.amplitude}} scaleSliderSettings = {{min:0.0,max:2.5,stepsize:0.001,default:settings.lowFNoise.scale}} noiseSettings = {settings.lowFNoise} amplitudeCallback={(val) => {settings.lowFNoise.amplitude = val;}} scaleCallback={(val) => {settings.lowFNoise.scale = val;}}></LiquidFlowSettings>
          <LiquidFlowSettings title = {"warp"} helpText = {'<-- mid-frequency distortion'} showHelpText = {settings.showHelpText}initialState={settings.mediumFNoise.active} amplitudeSliderSettings = {{min:0.0,max:5.0,stepsize:0.001,default:settings.mediumFNoise.amplitude}} scaleSliderSettings = {{min:0.0,max:5.0,stepsize:0.001,default:settings.mediumFNoise.scale}} noiseSettings = {settings.mediumFNoise} amplitudeCallback={(val) => {settings.mediumFNoise.amplitude = val;}} scaleCallback={(val) => {settings.mediumFNoise.scale = val;}}></LiquidFlowSettings>
          <LiquidFlowSettings title = {"ripple"} helpText = {'<-- perlin distortion'} showHelpText = {settings.showHelpText}initialState={settings.perlinNoise.active} amplitudeSliderSettings = {{min:0.0,max:1.0,stepsize:0.001,default:settings.perlinNoise.amplitude}} scaleSliderSettings = {{min:0.0,max:5.0,stepsize:0.001,default:settings.perlinNoise.scale}} noiseSettings = {settings.perlinNoise} amplitudeCallback={(val) => {settings.perlinNoise.amplitude = val;}} scaleCallback={(val) => {settings.perlinNoise.scale = val;}}></LiquidFlowSettings>
          <LiquidFlowSettings title = {"dust"} helpText = {'<-- high-frequency distortion'} showHelpText = {settings.showHelpText}initialState={settings.highFNoise.active} amplitudeSliderSettings = {{min:0.0,max:0.2,stepsize:0.001,default:settings.highFNoise.amplitude}} scaleSliderSettings = {{min:10.0,max:1000.0,stepsize:1.0,default:settings.highFNoise.scale}} noiseSettings = {settings.highFNoise} amplitudeCallback={(val) => {settings.highFNoise.amplitude = val;}} scaleCallback={(val) => {settings.highFNoise.scale = val;}}></LiquidFlowSettings>
          </>
        }
      </div>
    )
}
export default LiquidUIContainer;