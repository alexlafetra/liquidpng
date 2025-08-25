import { useState } from 'react'
import LiquidCheckbox from './checkbox.jsx'
import LiquidMenuTab from './menutab.jsx'
import LiquidSlider from './slider.jsx'
import LiquidButton from './button.jsx'
import LiquidDropdown from './dropdown.jsx'
import { saveAs } from 'file-saver'


function saveKeyframe(settings,index,length,interpType){
    settings.keyframes.keyframes[index] = 
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
    transitionLength : length,
    easeType: interpType,
    };
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
function saveKeyframesAsJSON(settings){
    const fileName = 'keyframes.json';
    // Create a blob of the data
    const fileToSave = new Blob([JSON.stringify(settings.keyframes.keyframes)], {
        type: 'application/json'
    });
    saveAs(fileToSave, fileName);
}

function LiquidKeyframeSettings({settings,liquidPNGInstance}){
    const [activeKeyframe,setActiveKeyframe] = useState(undefined);
    const [playing,setPlaying] = useState(settings.keyframes.active);
    const [recording,setRecording] = useState(settings.recording);
    const [transitionLength,setTransitionLength] = useState(60);
    const [interpType,setInterpType] = useState('linear');
    const [keyframeCount,setKeyframeCount] = useState(settings.keyframes.keyframes.length);

    const keyframeDisplayStyle_full = {
        width: 30,
        height:30,
        borderStyle:'dashed',
        borderColor:'#000000',
    };
    const keyframeDisplayStyle_focused_full = {
        borderStyle:'solid',
        borderColor:'#ff0000',
        animationName: 'example',
        animationDuration: '0.75s',
        animationIterationCount:'infinite'
    };
    const new_keyframe_displayStyle = {
        width: 30,
        height:30,
        // marginTop:(keyframeCount == 0)?'10px':'0px',
        backgroundColor : 'transparent',
        borderColor:'#ffffff',
        borderStyle:'dashed',
        color:'#ffffff',
        fontSize:'24px',
        fontFamily:'monospace',
        display:'flex',
        justifyContent: 'center',
        alignItems: 'center',
        mixBlendMode:'difference',
    }

    const buttonHolderStyle = {
        display:'flex',
        floatDirection:'left',
        gap:'4px'
    }

    function getDisplayStyle(index,activeKf){
        let focused = false;
        let full = false;
        if(index == activeKf){
            focused = true;
        }
        if(!(settings.keyframes.keyframes[index] === undefined)){
            full = true;
        }
        if(full && focused)
            return keyframeDisplayStyle_focused_full;
        else if(full && !focused)
            return keyframeDisplayStyle_full;
    }
    const keyframes = [];
    for(let kf = 0; kf<settings.keyframes.keyframes.length; kf++){
        keyframes.push(<div className = {"keyframe_display"} style = {getDisplayStyle(kf,activeKeyframe)} onClick = {(e) => {settings.keyframes.needsToSetCanvasTo = kf; setActiveKeyframe(kf); setInterpType(settings.keyframes.keyframes[kf].easeType); setTransitionLength(settings.keyframes.keyframes[kf].transitionLength);}}></div>);
    }
    keyframes.push(<div className = "new_keyframe_button" style = {new_keyframe_displayStyle} onClick = {(e) => {saveKeyframe(settings,settings.keyframes.keyframes.length,transitionLength,interpType);setActiveKeyframe(settings.keyframes.keyframes.length-1);setKeyframeCount(settings.keyframes.keyframes.length);}}>+</div>)
    let children = [(
        <>
        <div style = {{color:'#ffffff',fontWeight:'bold',mixBlendMode:'difference'}}>{(keyframeCount == 0)?'Add a keyframe':('Frame '+(activeKeyframe+1))}</div>
        <div className = "keyframe_display_container" style ={{display:'flex',gap:'3px'}}>
            {keyframes}
        </div>
        </>
    )];
    if(settings.keyframes.keyframes.length){
        children[1] = 
        (
            <>
            <div style = {buttonHolderStyle}>
                <LiquidButton title = {'overwrite'} callback = {() => {saveKeyframe(settings,activeKeyframe,transitionLength,interpType);setActiveKeyframe(activeKeyframe);setKeyframeCount(settings.keyframes.keyframes.length);}}></LiquidButton>
                <LiquidButton title = {'delete'} callback = {() => {removeKeyframe(settings,activeKeyframe);setActiveKeyframe(activeKeyframe>0?(activeKeyframe-1):((settings.keyframes.keyframes.length == 0)?undefined:0));setKeyframeCount(settings.keyframes.keyframes.length);}}></LiquidButton>
                <LiquidButton title = {'play'} callback = {() => {settings.keyframes.active = !settings.keyframes.active;setPlaying(settings.keyframes.active);if(settings.backgroundIsVideo){settings.keyframes.active?settings.backgroundImage.play():settings.backgroundImage.stop()}}}></LiquidButton>
                <LiquidCheckbox title = {'loop'} setTitleInsideBrackets = {false} callback = {(val) => {settings.keyframes.looping = val;}}></LiquidCheckbox>
            </div>
            <LiquidSlider callback = {(val) => {settings.keyframes.keyframes[activeKeyframe].transitionLength = val; setTransitionLength(val);}} label = {"length: "} min = {"1"} max = {"3600"} stepsize = {"1"} currentValue = {transitionLength} defaultValue = {transitionLength}/>
            <LiquidDropdown label = {"easing: "} callback = {(val) => {setInterpType(val);}} options = {['linear','sine','cubic']} value = {interpType}></LiquidDropdown>
            <LiquidButton title = {recording?'stop rendering':'render & save'} callback = {()=>{const state = !settings.recording; settings.keyframes.active = state; settings.recording = state; setPlaying(state); setRecording(state);}}></LiquidButton>
            <LiquidButton title = {'save as json'} callback = {()=>{saveKeyframesAsJSON(settings)}}></LiquidButton>
            {/* {(settings.recordedFrame != 0 && !settings.recording) &&
                <LiquidButton title = {'clear render buffer'} callback = {()=>{settings.needToClearRenderBuffer = true;}}></LiquidButton>
            } */}
            </>
        );
    }
    return(
        <LiquidMenuTab title = "keyframes" background = {'#807bffff'} defaultState = {settings.keyframeMenu.open} children = {children}></LiquidMenuTab>
    )
}
export default LiquidKeyframeSettings;