import { useState,useEffect,useRef } from 'react'
import p5 from 'p5'
import './App.css'
import FlowCanvas from './flowCanvas.js'
import './main.css';
import {settings,updateAnimation} from './settings.jsx'
// import {p5asciify} from 'p5.asciify'

import LiquidUIContainer from './components/ui.jsx'
import JSZip from 'jszip'

function App() {
  const [numberOfFramesRecorded,setNumberOfFramesRecorded] = useState(0);
  const [recording,setRecording] = useState(false);
  const containerRef = useRef();
  const zip = new JSZip();

  function downloadZip(){
    zip.generateAsync({type : 'blob' }).then((content) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(content);
      a.download = 'liquidpng_animation.zip';
      a.click();
    });
  }

  function captureFrame(){
    const domCanvas = settings.mainCanvas.elt;

    domCanvas.toBlob((blob) => {
      const filename = 'frame_'+String(settings.recordedFrame)+'.png';
      zip.file(filename,blob);
      if(settings.recordingFinished && settings.recording){
        settings.recording = false;
        settings.recordingFinished = false;
        settings.recordedFrame = 0;
        settings.keyframes.active = false;
        downloadZip();
      }
    })
  }

  const liquidPNG = new FlowCanvas(settings);
  let asciifier;
  let brightnessRenderer;
  let edgeRenderer;

  //P5 sketch body
  const mainSketch = (p) =>{

    settings.p5Inst = p;

    p.setup = async () => {
      settings.image = await p.loadImage(settings.imageLink);
      settings.backgroundImage = settings.image;
      settings.font = await p.loadFont('./fonts/'+settings.fontLink);
      settings.p5Inst.setAttributes('antialias', false);
      const dims = liquidPNG.getCanvasDimensions();
      settings.mainCanvas = p.createCanvas(dims.width,dims.height,p.WEBGL);
      settings.p5Inst.pixelDensity(settings.pixelDensity);
      settings.srcImage = p.createFramebuffer({ width: settings.image.width, height: settings.image.height, textureFiltering: p.NEAREST, format: p.FLOAT});

      //init after setup() is called so that the p5 instance, font, and main canvas can be passed into liquidPNG
      liquidPNG.init();
    }
    p.draw = () => {
      updateAnimation(p);
      liquidPNG.render();
      if(settings.recording){
        p.frameRate(1);
        captureFrame();
        settings.recordedFrame++;
        //set react flags to update DOM
        setRecording(true);
        setNumberOfFramesRecorded(settings.recordedFrame);
      }
      else{
        p.frameRate(60);
        setRecording(false);
        if(settings.needToClearRenderBuffer){
          settings.needToClearRenderBuffer = false;
          settings.recordedFrame = 0;
          setNumberOfFramesRecorded(settings.recordedFrame);
        }
      }
    }
    p.mouseReleased = () =>{
        if(p.keyIsDown(p.SHIFT)){
            if(settings.viewWindow.dragStarted){
                settings.viewWindow.end = {x:p.mouseX,y:p.mouseY}
                const dX = settings.viewWindow.end.x - settings.viewWindow.start.x;
                const dY = settings.viewWindow.end.y - settings.viewWindow.start.y;
                settings.viewWindow.origin.x -= dX;
                settings.viewWindow.origin.y -= dY;
            }
            settings.viewWindow.dragStarted = false;
        }
        else{
            if(settings.noiseWindow.dragStarted){
                settings.noiseWindow.end = {x:p.mouseX,y:p.mouseY}
                const dX = settings.noiseWindow.end.x - settings.noiseWindow.start.x;
                const dY = settings.noiseWindow.end.y - settings.noiseWindow.start.y;
                settings.noiseWindow.origin.x -= dX;
                settings.noiseWindow.origin.y -= dY;
            }
            settings.noiseWindow.dragStarted = false;
        }
    }
    p.mouseDragged = () =>{
        if(p.mouseX < settings.mainCanvas.width && p.mouseY < settings.mainCanvas.height && p.mouseX > 0 && p.mouseY > 0){
            if(p.keyIsDown(p.SHIFT)){
                if(!settings.viewWindow.dragStarted){
                    settings.viewWindow.dragStarted = true;
                    settings.viewWindow.start = {x:p.mouseX,y:p.mouseY};
                }
                else{
                    settings.viewWindow.end = {x:p.mouseX,y:p.mouseY}
                    const dX = settings.viewWindow.end.x - settings.viewWindow.start.x;
                    const dY = settings.viewWindow.end.y - settings.viewWindow.start.y;
                    settings.viewWindow.offset.x = -dX + settings.viewWindow.origin.x;
                    settings.viewWindow.offset.y = -dY+ settings.viewWindow.origin.y;
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
                    settings.noiseWindow.offset.x = -dX + settings.noiseWindow.origin.x;
                    settings.noiseWindow.offset.y = -dY+ settings.noiseWindow.origin.y;
                }
            }
        }
    }
    p.windowResized = (e) => {
      if(settings.fitCanvasTo == 'window')
        p.resizeCanvas(window.innerWidth,window.innerHeight);
    }

    // Called automatically after p5.js `setup()`
    // to set up the rendering pipeline(s)
    p.setupAsciify = () => {
      // Fetch relevant objects from the library
      asciifier = p5asciify.asciifier();
      brightnessRenderer = asciifier
        .renderers() // get the renderer manager
        .get("brightness"); // get the "brightness" renderer

      edgeRenderer = asciifier
        .renderers() // get the renderer manager
        .get("edge"); // get the "edge" renderer

      // Update the font size of the rendering pipeline
      asciifier.fontSize(6);

      // Update properties of the brightness renderer
      brightnessRenderer.update({
        enabled: true, // redundant, but for clarity
        // characters: " .:-=+*%@#",
        characters: " ",
        characterColor: "#000000",
        characterColorMode: "fixed", // or "fixed"
        backgroundColor: "#ffffff",
        backgroundColorMode: "fixed", // or "sampled"
        invert: false, // swap char and bg colors
        rotation: 0, // rotation angle in degrees
        flipVertically: false, // flip chars vertically
        flipHorizontally: false, // flip chars horizontally
      });

      // Update properties of the edge renderer
      edgeRenderer.update({
        enabled: true, // redundant, but for clarity
        characters: "-/|\\-/|\\", // should be 8 characters long
        characterColor: "#000000",
        characterColorMode: "fixed", // or "sampled"
        backgroundColor: "#ffffff",
        backgroundColorMode: "fixed", // or "sampled"
        invert: false, // swap char and bg colors
        rotation: 0, // rotation angle in degrees
        flipVertically: false, // flip chars vertically
        flipHorizontally: false, // flip chars horizontally
        sampleThreshhold: 16, // sample threshold for edge detection
        sobelThreshold: 0.5, // sobel threshold for edge detection
      });
    }

    return () => {
      p.remove();
    }
  }
  
  useEffect(() => {
    let sketch = new p5(mainSketch,containerRef.current);
    return () => sketch.remove();
  },[]);

  return (
    <div className = "app_container">
      <div style = {{position:'absolute',width:'100%',left:'0px',top:'0px'}}>
        <main></main>
      </div>
      {/* holds the sketch */}
      {recording &&
        <div style = {{position:'absolute',right:'20px',color:'#000000',fontSize:'20pt'}}>{'recording frame '+numberOfFramesRecorded}</div>
      }
      <LiquidUIContainer liquidPNGInstance={liquidPNG} settings = {settings}></LiquidUIContainer>
    </div>
  )
}

export default App
