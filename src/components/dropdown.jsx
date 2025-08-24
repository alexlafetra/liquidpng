import { useState } from 'react'

function LiquidDropdown({label,callback,value,options}){

    const callbackFn = (event) => {
        callback(event.target.value);
    }

    const labelStyle = {
        float:'left',
        whiteSpace:'pre',
        mixBlendMode:'difference',
        color:'#ffffff'
    }
    const dropdownStyle = {
        width:'fit-content',
        display:'block',
        padding: '3px 3px',
        border: 'none',
        borderRadius: '0px',
        backgroundColor: '#ffffff',
        color:'#000000',
        fontFamily:"'Times New Roman', Times, serif",
        mixBlendMode: 'difference'
    };

    return(
        <div className = "liquid_ui_component">
        <span className = "dropdown_label" style = {labelStyle}>{label}</span>
        <select className = "liquid_dropdown" style = {dropdownStyle} value = {value}
            onInput  = {callbackFn}>
                <>{options.map(op => (<option key = {op}>{op}</option>))}</>
        </select>
        </div>
    )
}

export default LiquidDropdown;