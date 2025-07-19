import { useState } from 'react'
import p5 from 'p5'
import React from 'react'
import './App.css'
import FlowCanvas from './flowCanvas.js'
import './main.css';

import LiquidUIContainer from './components/ui.jsx'

function App() {
  const resolution = 800;
  let w,h;
  if(window.innerWidth>window.innerHeight){
    w = resolution;
    h = window.innerWidth/window.innerHeight * resolution;
  }
  else{
    h = resolution;
    w = window.innerHeight/window.innerWidth * resolution;
  }
  const settings = {
    hideUI : false,
    //0 is extend (default), 1 is wrap, 2 is fill with transparency
    imageCoordinateOverflow: 'discard',
    imageLink : './test.jpg',
    fontLink : './times.ttf',
    inputType : 'text',
    mainCanvas : null,
    srcImage : null,
    font : null,
    fontSize : 200,
    displayText : "liquid.\npng",
    centerText : true,
    fontColor : [255,0,0],
    canvasWidth : window.innerWidth,
    canvasHeight : window.innerHeight,
    width : w,
    height : h,

    viewWindow : {
      dragStarted : false,
      start : {x:0,y:0},
      end : {x:0,y:0},
      sensitivity : 1,
      offset : {x:w/2+75,y:h/2+100},
      origin: {x:0,y:0}
    },
    noiseWindow : {
      dragStarted : false,
      start : {x:0,y:0},
      end : {x:0,y:0},
      sensitivity : 1,
      offset : {x:0,y:0},
      origin: {x:0,y:0}
    },

    globalNoise :{
      amplitude:1.0,
      scale:1.0
    },
    lowFNoise :{
      active : true,
      amplitude:1.0,
      scale: 1.0
    },
    mediumFNoise:{
      active : false,
      amplitude:1.0,
      scale:3.0
    },
    highFNoise:{
      active : false,
      amplitude:0.05,
      scale:1000.0
    },
    clampNoise:false,
    imageScale : 1.0,
    backgroundColor : [0,0,255],
    backgroundStyle : 0,
    gridThickness : 0.001,
    gridSize : 10
  }

  const liquidPNG = new FlowCanvas(settings);

  //P5 sketch body
  const mainSketch = (p) =>{

    settings.p5Inst = p;

    p.setup = async () => {
      settings.image = await p.loadImage(settings.imageLink);
      settings.font = await p.loadFont(settings.fontLink);
      settings.mainCanvas = p.createCanvas(settings.canvasWidth,settings.canvasHeight,p.WEBGL);
      settings.mainCanvas.parent("sketch_canvas");
      // settings.srcImage = p.createFramebuffer({ width: settings.image.width, height: settings.image.height, textureFiltering: p.NEAREST, format: p.FLOAT});
      settings.srcImage = p.createFramebuffer({ width: settings.image.width, height: settings.image.height, textureFiltering: p.NEAREST});
      settings.srcImage.begin();
      p.image(settings.image,-settings.image.width/2,-settings.image.height/2,settings.image.width,settings.image.height);
      settings.srcImage.end();

      //init after setup() is called so that the p5 instance, font, and main canvas can be passed into liquidPNG
      liquidPNG.init();
    }
    p.draw = () => {
      liquidPNG.render();
    }
    p.mouseReleased = () =>{
        if(p.keyIsDown(p.SHIFT) || p.touches.length > 1){
            if(settings.viewWindow.dragStarted){
                settings.viewWindow.end = {x:p.mouseX,y:p.mouseY}
                const dX = settings.viewWindow.end.x - settings.viewWindow.start.x;
                const dY = settings.viewWindow.end.y - settings.viewWindow.start.y;
                settings.viewWindow.origin.x += dX;
                settings.viewWindow.origin.y += dY;
            }
            settings.viewWindow.dragStarted = false;
            // liquidPNG.loadText("two touches"); 
        }
        else{
            if(settings.noiseWindow.dragStarted){
                settings.noiseWindow.end = {x:p.mouseX,y:p.mouseY}
                const dX = settings.noiseWindow.end.x - settings.noiseWindow.start.x;
                const dY = settings.noiseWindow.end.y - settings.noiseWindow.start.y;
                settings.noiseWindow.origin.x += dX;
                settings.noiseWindow.origin.y += dY;
            }
            settings.noiseWindow.dragStarted = false;
        }
    }
    p.mouseDragged = () =>{
        if(p.mouseX < settings.mainCanvas.width && p.mouseY < settings.mainCanvas.height && p.mouseX > 0 && p.mouseY > 0){
            if(p.keyIsDown(p.SHIFT)  || p.touches.length > 1){
                if(!settings.viewWindow.dragStarted){
                    settings.viewWindow.dragStarted = true;
                    settings.viewWindow.start = {x:p.mouseX,y:p.mouseY};
                }
                else{
                    settings.viewWindow.end = {x:p.mouseX,y:p.mouseY}
                    const dX = settings.viewWindow.end.x - settings.viewWindow.start.x;
                    const dY = settings.viewWindow.end.y - settings.viewWindow.start.y;
                    settings.viewWindow.offset.x = dX + settings.viewWindow.origin.x;
                    settings.viewWindow.offset.y = dY+ settings.viewWindow.origin.y;
                }
                // liquidPNG.loadText("two touches"); 
            }
            else{
                if(!settings.noiseWindow.dragStarted){
                    settings.noiseWindow.dragStarted = true;
                    settings.noiseWindow.start = {x:p.mouseX,y:p.mouseY};
                }
                else{
                    settings.noiseWindow.end = {x:p.mouseX,y:p.mouseY}
                    const dX = settings.noiseWindow.end.x - settings.noiseWindow.start.x;
                    const dY = settings.noiseWindow.end.y - settings.noiseWindow.start.y;
                    settings.noiseWindow.offset.x = dX + settings.noiseWindow.origin.x;
                    settings.noiseWindow.offset.y = dY+ settings.noiseWindow.origin.y;
                }
            }
        }
    }
    p.windowResized = (e) => {
      p.resizeCanvas(window.innerWidth,window.innerHeight);
    }
    return () => {
        p.remove();
    }
  }

  const noiseDisplaySketch = (p) =>{
    let noiseCanvas;
    let noiseShader;

    p.setup = () => {
      noiseCanvas = p.createCanvas(75,75,p.WEBGL);
      noiseShader = liquidPNG.createFlowFieldShader(p);
      noiseCanvas.parent("noise_canvas");
    }
    p.draw = () => {
      p.clear();
      p.shader(noiseShader);
      noiseShader.setUniform('uHighFrequencyNoiseScale',settings.highFNoise.scale);
      noiseShader.setUniform('uMediumFrequencyNoiseScale',settings.mediumFNoise.scale);
      noiseShader.setUniform('uHighFrequencyNoiseAmplitude',settings.highFNoise.active?settings.highFNoise.amplitude:0.0);
      noiseShader.setUniform('uMediumFrequencyNoiseAmplitude',settings.mediumFNoise.active?settings.mediumFNoise.amplitude:0.0);
      noiseShader.setUniform('uLowFrequencyNoiseAmplitude',settings.lowFNoise.active?settings.lowFNoise.amplitude:0.0);
      noiseShader.setUniform('uLowFrequencyNoiseScale',settings.lowFNoise.scale);
      noiseShader.setUniform('uViewOffset',[settings.viewWindow.offset.x/settings.width,settings.viewWindow.offset.y/settings.height]);
      noiseShader.setUniform('uNoiseOffset',[settings.noiseWindow.offset.x/settings.width,settings.noiseWindow.offset.y/settings.height]);
      p.rect(-noiseCanvas.width / 2, -noiseCanvas.height / 2, noiseCanvas.width, noiseCanvas.height);

    }
  }
  // const noiseDisplay = new p5(noiseDisplaySketch,"noise_canvas");
  const p5Reference = new p5(mainSketch,"sketch_canvas");

  return (
    <div className = "app_container">
      {/* holds the sketch */}
      <LiquidUIContainer liquidPNGInstance={liquidPNG} settings = {settings}></LiquidUIContainer>
      <div id = "sketch_canvas" className = "canvas_container"></div>
    </div>
  )
}

export default App
