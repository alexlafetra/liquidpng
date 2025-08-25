import LiquidBackgroundSettings from './backgroundsettings.jsx'
import LiquidImageSettings from './imagesettings.jsx'
import LiquidCheckbox from './checkbox.jsx'
import { useState } from 'react'
import LiquidDistortionSettings from './distortionsettings.jsx'
import LiquidKeyframeSettings from './keyframesettings.jsx'

function LiquidUIContainer({liquidPNGInstance,settings}){
    const [inputType,setInputType] = useState(settings.inputType);
    const [hidden,setHidden] = useState(settings.hideUI);
    const [showAbout,setShowAbout] = useState(false);
    const UIStyle = {
      backgroundColor : 'transparent'
    };
    return(
      <>
      <div className = "ui_container" style = {UIStyle}>
        {!hidden &&
        <span className = "title">liquid.png</span>
        }
        <LiquidCheckbox title = {"ui"}  defaultState={!settings.hideUI} callback = {(val) => {setHidden(!hidden)}}></LiquidCheckbox>
        {!hidden &&
          <>
          <LiquidCheckbox title = {'about'} setTitleInsideBrackets = {true}  defaultState = {false} callback = {(e) => {setShowAbout(e);}}></LiquidCheckbox>
          {showAbout &&
            <div className = "description_container">
              <div className = "description_text">
              This is a small tool for distorting visual data and typography using digital noise algorithms
              born out of a love for experimental typography, warped graphics, and a belief that data can be tangible, corruptible, and liquid. 
              {/* <br></br>
              <br></br>
              The current technological paradigm holds that data is intangible, inorganic, and static. And yet,
              living our lives through and with data we know that digital data can be liquid, corruptible, and weird. */}
              <br></br>
              <br></br>
              Created by <a href = "https://www.instagram.com/alexlafetra/">alex lafetra</a><br></br>
              <a href = "https://github.com/alexlafetra/liquidpng">github/contribute</a>
              </div>
              <img src = "leaf.png" className = "example_image"></img>
            </div>
          }
          <LiquidImageSettings parentCallback = {(newInputType) => {setInputType(newInputType)}} settings = {settings} liquidPNGInstance={liquidPNGInstance}></LiquidImageSettings>
          <LiquidDistortionSettings settings = {settings} liquidPNGInstance = {liquidPNGInstance}></LiquidDistortionSettings>
          {/* <LiquidSlider callback = {(val) => {settings.globalScale = parseFloat(val);}} label = {"global scale"} min = {-10.0} max = {10.0} stepsize = {0.01} defaultValue = {settings.globalScale}/> */}
          <LiquidBackgroundSettings settings = {settings}></LiquidBackgroundSettings>
          <LiquidKeyframeSettings settings = {settings} liquidPNGInstance={liquidPNGInstance}></LiquidKeyframeSettings>
          </>
        }
      </div>
      </>
    )
}
export default LiquidUIContainer;