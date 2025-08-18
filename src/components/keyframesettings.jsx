import { useState } from 'react'
import LiquidCheckbox from './checkbox.jsx'
import LiquidMenuTab from './menutab.jsx'
import LiquidSlider from './slider.jsx'
import LiquidButton from './button.jsx'
import LiquidFlowSettings from './flowsettings.jsx'
import LiquidAnimationSettings from './animationsettings.jsx'
import LiquidDropdown from './dropdown.jsx'


function saveKeyframe(settings){
    settings.keyframes.keyframes[settings.keyframes.editingKeyframe] = 
    {       
    fontSize : settings.fontSize,
    displayText : settings.displayText,
    fontColor : settings.fontColor,
    viewWindow : {
        offset : {x:settings.viewWindow.offset.x,y:settings.viewWindow.offset.y},
        origin: {x:settings.viewWindow.origin.x,y:settings.viewWindow.origin.y},
    },
    noiseWindow : {
        offset : {x:settings.noiseWindow.offset.x,y:settings.noiseWindow.offset.y},
        origin: {x:settings.noiseWindow.origin.x,y:settings.noiseWindow.origin.y},
    },
    globalNoise :{
        amplitude:1.0,
        scale:1.0
    },
    lowFNoise :{
        active : true,
        amplitude:settings.lowFNoise.active?settings.lowFNoise.amplitude:0,
        scale: settings.lowFNoise.scale
    },
    mediumFNoise:{
        active : true,
        amplitude:settings.mediumFNoise.active?settings.mediumFNoise.amplitude:0,
        scale: settings.mediumFNoise.scale
    },
    highFNoise:{
        active : true,
        amplitude:settings.highFNoise.active?settings.highFNoise.amplitude:0,
        scale: settings.highFNoise.scale
    },
    perlinNoise:{
        active:true,
        amplitude:settings.perlinNoise.active?settings.perlinNoise.amplitude:0,
        scale: settings.perlinNoise.scale
    },
    imageScale : settings.imageScale,
    backgroundColor : settings.backgroundColor,
    gridColor : settings.gridColor,
    blurGridIntensity : settings.blurGridIntensity,
    gridThickness : settings.gridThickness,
    gridSize : settings.gridSize,
    };
    if(settings.keyframes.editingKeyframe == settings.keyframes.keyframes.length-1){
        settings.keyframes.keyframes.push(undefined);
        settings.keyframes.editingKeyframe=settings.keyframes.keyframes.length-1;
    }
    // console.log(settings.keyframes.editingKeyframe);
}
function removeKeyframe(settings,index){
    let temp = [];
    for(let i = 0; i<settings.keyframes.keyframes.length; i++){
        if(i != index){
            temp.push(settings.keyframes.keyframes[i]);
        }
    }
    settings.keyframes.keyframes = temp;
}

function LiquidKeyframeSettings({settings,liquidPNGInstance}){
    const [activeKeyframe,setActiveKeyframe] = useState(settings.keyframes.editingKeyframe);
    const [fullKeyframes,setFullKeyframes] = useState({A:false,B:true});
    const [playing,setPlaying] = useState(settings.keyframes.active);
    const keyframeDisplayStyle_empty = {
        width: 30,
        height:30,
        backgroundColor : 'transparent',
        borderColor:'#000000',
        marginRight:10,
        borderStyle:'dashed',
    };
    const keyframeDisplayStyle_focused_empty = {
        width: 30,
        height:30,
        backgroundColor : 'transparent',
        marginRight:10,
        borderStyle:'solid',
        borderColor:'#ff0000',
    };
    const keyframeDisplayStyle_full = {
        width: 30,
        height:30,
        backgroundColor : '#ffddff',
        marginRight:10,
        borderStyle:'dashed',
        borderColor:'#000000',
    };
    const keyframeDisplayStyle_focused_full = {
        width: 30,
        height:30,
        backgroundColor : '#ff77ff',
        marginRight:10,
        borderStyle:'solid',
        borderColor:'#ff0000',
    };

    function getDisplayStyle(index){
        let focused = false;
        let full = false;
        if(index == settings.keyframes.editingKeyframe){
            focused = true;
        }
        if(!(settings.keyframes.keyframes[index] === undefined)){
            full = true;
        }
        if(full && focused)
            return keyframeDisplayStyle_focused_full;
        else if(full && !focused)
            return keyframeDisplayStyle_full;
        else if(!full && focused)
            return keyframeDisplayStyle_focused_empty;
        else if(!full && !focused)
            return keyframeDisplayStyle_empty;
    }
    const keyframes = [];
    for(let kf = 0; kf<settings.keyframes.keyframes.length; kf++){
        keyframes.push(<div className = "keyframe_display" style = {getDisplayStyle(kf)} onClick = {(e) => {settings.keyframes.editingKeyframe = kf;settings.keyframes.needsToSetCanvasTo = kf; setActiveKeyframe(kf);}}></div>);
    }

    const children = (
        <>
        <div className = "keyframe_display_container" style ={{display:'flex'}}>
            {keyframes}
        </div>
        <LiquidButton title = {'store frame'} callback = {() => {saveKeyframe(settings);setFullKeyframes({A:(settings.keyframes.keyframes.length>0),B:(settings.keyframes.keyframes.length>1)});}}></LiquidButton>
        <LiquidButton title = {'delete frame'} callback = {() => {removeKeyframe(settings,settings.keyframes.editingKeyframe);setFullKeyframes({A:(settings.keyframes.keyframes.length>0),B:(settings.keyframes.keyframes.length>1)});}}></LiquidButton>
        <LiquidDropdown label = {"ease type"} showHelpText = {settings.showHelpText} helpText = {'<-- pick interpolation type'} callback = {(val) => {settings.keyframes.easeType = val;}} options = {['linear','sine','cubic']} defaultValue = {settings.keyframes.easeType}></LiquidDropdown>
        <LiquidButton title = {'play'} callback = {() => {settings.keyframes.active = !settings.keyframes.active;setPlaying(settings.keyframes.active);}}></LiquidButton>
        <LiquidCheckbox title = {'loop'} setTitleInsideBrackets = {false} callback = {(val) => {settings.keyframes.looping = val;}}></LiquidCheckbox>
        <LiquidSlider callback = {(val) => {settings.keyframes.transitionLength = val;}} label = {"trans. time"} min = {"1"} max = {"480"} stepsize = {"1"} defaultValue = {settings.keyframes.transitionLength}/>
        <LiquidButton title = {'render & save'} callback = {()=>{settings.keyframes.active = true; settings.recording = true; setPlaying(true);}}></LiquidButton>
        </>
    );
    return(
        <LiquidMenuTab title = "keyframes" defaultState = {settings.keyframeMenu.open} children = {children}></LiquidMenuTab>
    )
}
export default LiquidKeyframeSettings;