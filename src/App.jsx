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
    //set to 2.0 for HD
    pixelDensity : 1.0,
    hideUI : false,
    showHelpText : false,
    imageCoordinateOverflow: 'discard', //options are discard, tile, and extend
    imageLink : './test.jpg',
    fontLink : 'times.ttf',
    fontOptions : ['times.ttf','arial.ttf','chopin.ttf','NotoSerifTC.ttf'],
    inputType : 'text', //options are text or image
    mainCanvas : null,
    srcImage : null,
    font : null,
    fontSize : 200,
    displayText : "liquid.\npng",
    centerText : true,
    fontColor : [1.0,0,0],
    canvasWidth : window.innerWidth,
    canvasHeight : window.innerHeight,
    width : w,
    height : h,

    animation: {
      active:false,
      xMotion : -2.0,
      yMotion : 0.0
    },

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
    perlinNoise:{
      active:false,
      amplitude : 0.1,
      scale: 1.0
    },
    clampNoise:false,
    imageScale : 1.0,
    backgroundColor : [0,0,1.0],
    gridColor : [1.0,0,0],
    blurGridIntensity : 1.0,
    backgroundStyle : 0,
    gridThickness : 0.001,
    gridSize : 10,
    
    activeNoiseAlgorithm : 0,
    //noise functions here should expose a float noise(vec2) function
    //but can also contain other hash functions
    noiseAlgorithms :[ 
    `
    float hash(float n) { return fract(sin(n) * 1e4); }
    float hash(vec2 p) { return fract(1e4 * sin(11.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }
    float noise(vec2 x) {
        vec2 i = floor(x);
        vec2 f = fract(x);

        // Four corners in 2D of a tile
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));

        // Same code, with the clamps in smoothstep and common subexpressions
        // optimized away.
        vec2 u = f * f * (3.0 - 2.0 * f);
        float val = mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        return val;
    }`,
    `
    float rand(float n){return fract(sin(n) * 43758.5453123);}
    float rand(vec2 n) { 
      return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
    }
    float noise(vec2 n) {
      const vec2 d = vec2(0.0, 1.0);
      vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
      return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
    }`,
    //simplex
    `
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

    float noise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
              -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
      + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
        dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }`
    ],
  }

  const liquidPNG = new FlowCanvas(settings);

  //P5 sketch body
  const mainSketch = (p) =>{

    settings.p5Inst = p;

    p.setup = async () => {
      settings.image = await p.loadImage(settings.imageLink);
      settings.font = await p.loadFont(settings.fontLink);
      settings.mainCanvas = p.createCanvas(settings.canvasWidth,settings.canvasHeight,p.WEBGL);
      settings.p5Inst.pixelDensity(settings.pixelDensity);
      settings.srcImage = p.createFramebuffer({ width: settings.image.width, height: settings.image.height, textureFiltering: p.NEAREST, format: p.FLOAT});

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
      /*
      the shortest dimension of the output image should always be scaled by scale, but the longest
      dim should be scaled so that the image stays in original proportion.
      EG: when window is shrunk in X, image shrinks in Y to stay in proportion
      
      */
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
    </div>
  )
}

export default App
