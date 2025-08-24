import LiquidBackgroundSettings from './backgroundsettings.jsx'
import LiquidImageSettings from './imagesettings.jsx'
import LiquidCheckbox from './checkbox.jsx'
import { useState } from 'react'
import LiquidDistortionSettings from './distortionsettings.jsx'
import LiquidKeyframeSettings from './keyframesettings.jsx'

function LiquidUIContainer({liquidPNGInstance,settings}){
    const [inputType,setInputType] = useState(settings.inputType);
    const [hidden,setHidden] = useState(settings.hideUI);
    const [showHelpText,setShowHelpText] = useState(settings.showHelpText);
    const UIStyle = {
      backgroundColor : 'transparent'
    };
    return(
      <>
      {settings.showHelpText &&
        <div className = "description_container">
          <div className = "description_text">
          Code for distorting visual data and typography<br></br>
          using digital noise algorithms<br></br>
          Built by <a href = "https://www.instagram.com/alexlafetra/">alex lafetra</a><br></br>
          </div>
          <img src = "leaf.png" className = "example_image"></img>
          <div className = "description_text">
          <br></br>
          click & drag to change the image distortion<br></br>
          shift-click & drag to change the image location
          <br></br>
          <a href = "https://github.com/alexlafetra/liquidpng">github/contribute</a>
          </div>
        </div>
      }
      <div className = "ui_container" style = {UIStyle}>
        <span className = "title">liquid.png</span>
        <LiquidCheckbox title = {"ui"} helpText = '<-- show/hide the user interface' showHelpText = {settings.showHelpText} defaultState={!settings.hideUI} callback = {(val) => {setHidden(!hidden)}}></LiquidCheckbox>
        <span className = "liquid_button" onClick ={(e) => {liquidPNGInstance.saveImage();}}>[save]</span>
        <LiquidCheckbox title = {'help'} setTitleInsideBrackets = {true} helpText = '<-- show/hide info' showHelpText = {settings.showHelpText} defaultState={settings.showHelpText} callback = {(e) => {settings.showHelpText = !settings.showHelpText;setShowHelpText(settings.showHelpText);}}></LiquidCheckbox>
        {!hidden &&
          <>
          <br></br>
          <LiquidImageSettings parentCallback = {(newInputType) => {setInputType(newInputType)}} settings = {settings} liquidPNGInstance={liquidPNGInstance}></LiquidImageSettings>
          {/* <LiquidSlider showHelpText = {settings.showHelpText} helpText = {'<-- scale the whole scene'} callback = {(val) => {settings.globalScale = parseFloat(val);}} label = {"global scale"} min = {-10.0} max = {10.0} stepsize = {0.01} defaultValue = {settings.globalScale}/> */}
          <LiquidBackgroundSettings settings = {settings}></LiquidBackgroundSettings>
          <LiquidDistortionSettings settings = {settings} liquidPNGInstance = {liquidPNGInstance}></LiquidDistortionSettings>
          <LiquidKeyframeSettings settings = {settings} liquidPNGInstance={liquidPNGInstance}></LiquidKeyframeSettings>
          </>
        }
      </div>
      </>
    )
}
export default LiquidUIContainer;