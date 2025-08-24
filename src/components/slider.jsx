import { useState } from 'react'

function LiquidSlider({showHelpText,helpText,label,callback,id,min,max,stepsize,defaultValue,currentValue}){

    const [value,setValue] = useState(defaultValue);
    if(value != currentValue && currentValue != undefined){
        setValue(currentValue);
    }

    const callbackFn = (event) => {
        callback(parseFloat(event.target.value));
        setValue(event.target.value);
    }

    const labelStyle = {
        fontFamily:"'Times New Roman', Times, serif",
        pointerEvents:'none',
        zIndex:1,
        color:'#ffffff',
        cursor:'pointer',
        mixBlendMode:'difference',
        width:'fit-content'
    };

    const valueStyle = {
        position:'relative',
        left:'2ch',
        fontFamily:"'Times New Roman', Times, serif",
        pointerEvents:'none',
        zIndex:1,
        color:'#ffffff',
        cursor:'pointer',
        mixBlendMode:'difference',
    }

    const parentContainerStyle = {
        width:'100%',
        height:'fit-content',
        display:'flex',
        whiteSpace:'pre'
    }
    // slider code adapted from: https://www.w3schools.com/howto/howto_js_rangeslider.asp and https://blog.logrocket.com/creating-custom-css-range-slider-javascript-upgrades/
    const sliderContainerStyle = {
        display:'flex',
        flexGrow:1,
        // border:'solid 1px black',
    };
    
    const sliderStyle = {
        WebkitAppearance: 'none',  /* Override default CSS styles */
        appearance: 'none',
        height: '20px',
        width:'100%',
        backgroundColor:'#0000ff',
        outline: 'none',
        overflow: 'hidden',
        cursor:'pointer',
        mixBlendMode:'difference',
        position:'absolute'
    };

    return(
        <div className = "liquid_slider_container" style = {parentContainerStyle}>
            <div className = "liquid_slider_label" style = {labelStyle}>{label}</div>
            <div className = "slider_container" style = {sliderContainerStyle}>
                <div style = {valueStyle}>{value}</div>
                <input className = "liquid_slider" style = {sliderStyle} type = "range" id = {id} min = {min} max = {max} step = {stepsize} value = {value}
                    onInput  = {callbackFn}
                    />
            </div>
        </div>
    )
}

export default LiquidSlider;