import { useState } from 'react'
import LiquidCheckbox from './checkbox.jsx'
import LiquidMenuTab from './menutab.jsx'
import LiquidFlowSettings from './flowsettings.jsx'
import LiquidAnimationSettings from './animationsettings.jsx'
import LiquidDropdown from './dropdown.jsx'

function LiquidDistortionSettings({settings,liquidPNGInstance}){
    const [activeNoiseAlgorithm,setActiveNoiseAlgorithm] = useState(settings.activeNoiseAlgorithm);
    const noiseAlgorithmOptions = ['1','2','3'];
    const children = (
        <>
        <LiquidDropdown label = {"algorithm: "} callback = {(val) => {setActiveNoiseAlgorithm(val); settings.activeNoiseAlgorithm = val;liquidPNGInstance.flowFieldShader = liquidPNGInstance.createFlowFieldShader();}} options = {Array.from({length:settings.noiseAlgorithms.length},(v,k) => k)} value = {noiseAlgorithmOptions[activeNoiseAlgorithm]}></LiquidDropdown>
        <LiquidAnimationSettings settings = {settings} liquidPNGInstance={liquidPNGInstance}></LiquidAnimationSettings>
        {/* <LiquidCheckbox title = {"floating point distortion "} helpText = {'<-- floating point distortion'} showHelpText = {settings.showHelpText} defaultState={settings.clampNoise} callback = {(val) => {settings.clampNoise = val;liquidPNGInstance.init();}}></LiquidCheckbox> */}
        <LiquidFlowSettings title = {"flow"} initialState = {settings.lowFNoise.active} amplitudeSliderSettings = {{min:0.0,max:5.0,stepsize:0.001,default:settings.lowFNoise.amplitude}} scaleSliderSettings = {{min:0.0,max:2.5,stepsize:0.001,default:settings.lowFNoise.scale}} noiseSettings = {settings.lowFNoise} amplitudeCallback={(val) => {settings.lowFNoise.amplitude = val;}} scaleCallback={(val) => {settings.lowFNoise.scale = val;}}></LiquidFlowSettings>
        <LiquidFlowSettings title = {"warp"} initialState={settings.mediumFNoise.active} amplitudeSliderSettings = {{min:0.0,max:5.0,stepsize:0.001,default:settings.mediumFNoise.amplitude}} scaleSliderSettings = {{min:0.0,max:5.0,stepsize:0.001,default:settings.mediumFNoise.scale}} noiseSettings = {settings.mediumFNoise} amplitudeCallback={(val) => {settings.mediumFNoise.amplitude = val;}} scaleCallback={(val) => {settings.mediumFNoise.scale = val;}}></LiquidFlowSettings>
        <LiquidFlowSettings title = {"ripple"} initialState={settings.perlinNoise.active} amplitudeSliderSettings = {{min:0.0,max:1.0,stepsize:0.001,default:settings.perlinNoise.amplitude}} scaleSliderSettings = {{min:0.0,max:5.0,stepsize:0.001,default:settings.perlinNoise.scale}} noiseSettings = {settings.perlinNoise} amplitudeCallback={(val) => {settings.perlinNoise.amplitude = val;}} scaleCallback={(val) => {settings.perlinNoise.scale = val;}}></LiquidFlowSettings>
        <LiquidFlowSettings title = {"dust"} initialState={settings.highFNoise.active} amplitudeSliderSettings = {{min:0.0,max:1.0,stepsize:0.001,default:settings.highFNoise.amplitude}} scaleSliderSettings = {{min:10.0,max:1000.0,stepsize:1.0,default:settings.highFNoise.scale}} noiseSettings = {settings.highFNoise} amplitudeCallback={(val) => {settings.highFNoise.amplitude = val;}} scaleCallback={(val) => {settings.highFNoise.scale = val;}}></LiquidFlowSettings>
        </>
    );
    return(
        <LiquidMenuTab title = "distortion" background = {'#009dffff'}defaultState = {settings.distortionMenu.open} children = {children}></LiquidMenuTab>
    )
}
export default LiquidDistortionSettings;