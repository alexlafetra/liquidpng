import { useState } from "react";

function LiquidLocationDisplay({liquidPNGInstance,settings}){
    if(settings.srcImage === null){
        return(<div></div>);
    }
    const outerBoxStyle = {
        borderStyle : 'solid',
        borderColor : '#ff0000',
        borderWidth : '10px',
        display : 'block',
        width : '100px',
        height : '100px',
        // backgroundColor : '#000000'
    };
    const innerBoxStyle = {
        borderStyle : 'solid',
        borderColor : '#ff0000',
        borderWidth : '1px',
        display : 'block',
        position : 'relative',
        left : settings.viewWindow.offset.x,
        top : settings.viewWindow.offset.y,
        width : settings.srcImage.width / settings.width * 100 * settings.imageScale,
        height : settings.srcImage.height / settings.height * 100 * settings.imageScale,
    };
    return(
        <div style =  {outerBoxStyle}>
            <div style = {innerBoxStyle}>

            </div>
        </div>
    )
}
export default LiquidLocationDisplay;