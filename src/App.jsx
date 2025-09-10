import { useState,useEffect,useRef } from 'react'
import p5 from 'p5'
import JSZip from 'jszip'
import FlowCanvas from './flowCanvas.js'
import './main.css';
import {noiseAlgorithms} from './settings.jsx'
import { saveAs } from 'file-saver'
import LiquidCheckbox from './components/checkbox.jsx'
// import {p5asciify} from 'p5.asciify'
import LiquidDropdown from './components/dropdown.jsx'
import LiquidSlider from './components/slider.jsx'
import NumberInput from './components/numberinput.jsx'
import LiquidMenuTab from './components/menutab.jsx'
import LiquidTextBox from './components/textbox.jsx'
import LiquidColorPicker from './components/colorpicker.jsx'
import LiquidFilePicker from './components/filepicker.jsx'
import LiquidFlowSettings from './components/flowsettings.jsx';
import LiquidButton from './components/button.jsx';
import Webcam from 'react-webcam';

/*

okay new paradigm is:
everything is stored in state. LiquidPNG canvas only updates once per render.
*/


function App() {
  const [settings,setSettings] = useState({
    ready: false,
    recording : false,
    recordingFinished : false,
    recordedFrame : 0,
    startInHiRes : false,
    keyframes : {
      active : false,
      looping : false,
      currentAnimation : 0,
      currentFrame : 0,
      keyframes : [],
      needsToSetCanvasTo : null,
    },
    //flag set by the 'clear buffer' button to clear out the images added to the ZIP
    needToClearRenderBuffer:false,
    //set to 2.0 for HD
    pixelDensity : 1.0,
    hideUI : false,
    distortionMenu : {open:false},
    distortionPointsMenu : {open:false},
    backgroundMenu : {open:false},
    imageMenu : {open:true},
    keyframeMenu : {open:false},
    canvasMenu : {open:true},
    imageCoordinateOverflow: 'discarding', //options are discard, tile, and extend
    imageLink : './star.png',
    backgroundImageLink : './test_background.MOV',
    backgroundImage : null,
    backgroundIsVideo:false,
    playVideoOnKeyframes:true,
    fontLink : 'times.ttf',
    fontOptions : ['times.ttf','arial.ttf','CedarvilleCursive.ttf','chopin.ttf','SFMono.otf','NotoSerifTC.ttf'],
    // options are left, right, and centered
    textAlignment : 'left',
    inputType : 'text', //options are text or image
    lockTextBoundingBox: false,//false if new text being entered triggers the BB to be resized, true if it doesn't change size

    mainCanvas : null,
    srcImage : null,
    font : null,
    fontSize : 200,
    displayText : "liquid.\npng",
    centerText : true,
    fontColor : '#ff0000',
    canvasWidth : window.innerWidth,
    canvasHeight : window.innerHeight,
    fitCanvasTo:'window',
    globalScale : 1.0,

    //array for holding the flow nodes
    //stored as x,y, magnitude (has to be a flat array, not an array of arrays)
    // flowPoints : [
    //     0.5,0.5,-0.5,
    //     0.0,0.8,0.1
    // ],
    // flowPoints : [0,0,1],
    flowPoints:[],

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
      offset : {x:window.innerWidth/2+75,y:window.innerHeight/2+100},
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
    backgroundColor : '#0000ff',
    gridColor : '#ff0000',
    blurGridIntensity : 1.0,
    //0 == clear, 1 == color, 2 == image/video, 3 == grid, 4 == blurry-grid
    backgroundStyle : 0,
    gridThickness : 0.001,
    gridSize : 10,
    fillTextWith : 'color',
    
    activeNoiseAlgorithm : 0,
    //noise functions here should expose a float noise(vec2) function
    //but can also contain other hash functions
    noiseAlgorithms : noiseAlgorithms
  });

  const ml5 = useRef(window.ml5);
  const handpose = useRef();
  const predictions = useRef([]);
  const webcamRef = useRef();
  const webcamVideo = useRef();
  const hand = useRef({
    gesture : 'none',
    new : {x:0,y:0},//always the most recent one
    old : {x:0,y:0},//the one the sim renders with, and interpolates from
    justPinched : false
  });
  //loading in the ml5 models
  //borrowed from: https://eliraneln.medium.com/real-time-object-detection-using-ml5-js-and-react-c47612c60852
  useEffect(() => {
    let detectionInterval;
    const modelLoaded = () => {
      console.log("model ready!");
      handpose.current.on("predict", results => {
        predictions.current = results;
      });
    };
    handpose.current = ml5.current.handpose(modelLoaded); 
  }, []);

  //called when the webcam video stream is ready
  function setupWebcamVideo(e){
    console.log(e);
    webcamVideo.current = e.target;
    handpose.current.predict(webcamVideo.current);
  }

  const movingFlowPoint = useRef(false);
  const [numberOfFramesRecorded,setNumberOfFramesRecorded] = useState(0);
  const [showFlowPoints,setShowFlowPoints] = useState(true);
  const [targetFlowPoint,setTargetFlowPoint] = useState(0);
  const targetFlowPointRef = useRef(targetFlowPoint);
  useEffect(() => {
    targetFlowPointRef.current = targetFlowPoint;
  },[targetFlowPoint]);

  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  },[settings]);

  const viewWindow = useRef({
    dragStarted : false,
    start : {x:0,y:0},
    end : {x:0,y:0},
    sensitivity : 1,
    offset : {x:window.innerWidth/2+75,y:window.innerHeight/2+100},
    origin: {x:0,y:0}
  });
  const noiseWindow = useRef({
    dragStarted : false,
    start : {x:0,y:0},
    end : {x:0,y:0},
    sensitivity : 1,
    offset : {x:0,y:0},
    origin: {x:0,y:0}
  });

  // const flowPointCoordinatesRef = useRef(flowPointCoordinates);
  // useEffect(() => {
  //   flowPointCoordinatesRef.current = flowPointCoordinates;
  // },[flowPointCoordinates]);

  const [hidden,setHidden] = useState(settings.hideUI);
  const [showAbout,setShowAbout] = useState(false);

  const containerRef = useRef();
  const liquidPNG = useRef(new FlowCanvas(settings));
  const zip = useRef(new JSZip());

  function downloadZip(){
    zip.current.generateAsync({type : 'blob' }).then((content) => {
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
      zip.current.file(filename,blob);
      if(settings.recordingFinished && settings.recording){
        settings.recording = false;
        settings.recordingFinished = false;
        settings.recordedFrame = 0;
        settings.keyframes.active = false;
        downloadZip();
      }
    })
  }
  let sketch;
  p5.disableFriendlyErrors;
  useEffect(() => {
    sketch = new p5(mainSketch,containerRef.current);
    // sketch.disableFriendlyErrors = true;
    return () => sketch.remove();
  },[]);

  let asciifier;
  let brightnessRenderer;
  let edgeRenderer;
  
  function threeDDistance(x,y,z,x1,y1,z1){
    return Math.sqrt(Math.pow(x-x1,2) + Math.pow(y-y1,2) + Math.pow(z-z1,2));
  }
  //transforms coords from webcam space into canvas space
  function transformMLCoords(coord,scale = 2){
    //0,0 is top left of webcam vid, and then it ranges from (0,0) ==> (video width, video height)
    //also, vid coords need to be horizontally mirrored so it makes sense visually
    return {x:(settingsRef.current.canvasWidth - coord.x/webcamVideo.current.videoWidth*settingsRef.current.canvasWidth) * scale - settingsRef.current.canvasWidth/2,y:coord.y/webcamVideo.current.videoHeight*settingsRef.current.canvasHeight * scale - settingsRef.current.canvasHeight/2};
  }
  //P5 sketch body
  const mainSketch = (p) =>{

    // these callbacks NEED to use settingsRef, not just settings
    p.setup = async () => {
      const newSettings = {...settingsRef.current};
      newSettings.p5Inst = p;
      newSettings.image = await p.loadImage(newSettings.imageLink);
      newSettings.backgroundImage = newSettings.image;
      liquidPNG.current.font = await p.loadFont('./fonts/'+newSettings.fontLink);
      newSettings.p5Inst.setAttributes('antialias', false);
      const dims = liquidPNG.current.getCanvasDimensions();
      newSettings.mainCanvas = p.createCanvas(dims.width,dims.height,p.WEBGL);
      newSettings.p5Inst.pixelDensity(newSettings.pixelDensity);

      //init after setup() is called so that the p5 instance, font, and main canvas can be passed into liquidPNG
      liquidPNG.current.init(newSettings);

      //render image
      updateLiquidPNG(newSettings);
      //disable draw loop
      // p.noLoop();
      //set settings to update UI
      setSettings(newSettings);
    }
    p.draw = () =>{
      const smoothing = 8;
      //update flow field based on pinch recognition
      if(hand.current.gesture == 'pinch'){
        const coord = {x:hand.current.old.x + (hand.current.old.x - hand.current.new.x)/smoothing,y:hand.current.old.y + (hand.current.old.y - hand.current.new.y)/smoothing};
        if(!noiseWindow.current.dragStarted){
            noiseWindow.current.dragStarted = true;
            noiseWindow.current.start = coord;
        }
        else{
            noiseWindow.current.end = coord;
            const dX = noiseWindow.current.end.x - noiseWindow.current.start.x;
            const dY = noiseWindow.current.end.y - noiseWindow.current.start.y;
            noiseWindow.current.offset.x = -dX + noiseWindow.current.origin.x;
            noiseWindow.current.offset.y = -dY+ noiseWindow.current.origin.y;
        }
      }
      else if(hand.current.gesture == 'none' && hand.current.justPinched){
        const coord = {x:hand.current.old.x + (hand.current.old.x - hand.current.new.x)/5,y:hand.current.old.y + (hand.current.old.y - hand.current.new.y)/5};
        movingFlowPoint.current = false;
        if(noiseWindow.current.dragStarted){
          noiseWindow.current.end = coord;
          const dX = noiseWindow.current.end.x - noiseWindow.current.start.x;
          const dY = noiseWindow.current.end.y - noiseWindow.current.start.y;
          noiseWindow.current.origin.x -= dX;
          noiseWindow.current.origin.y -= dY;
          noiseWindow.current.dragStarted = false;
        }
      }

      if(settingsRef.current.ready){
        if(settingsRef.current.canvasHeight !== settingsRef.current.mainCanvas.height || settingsRef.current.canvasWidth !== settingsRef.current.mainCanvas.width){
          settingsRef.current.p5Inst.resizeCanvas(settingsRef.current.canvasWidth,settingsRef.current.canvasHeight);
        }
        updateLiquidPNG(settingsRef.current);
      }
      if(webcamVideo.current !== undefined && (p.frameCount%1 === 0)){
        handpose.current.predict(webcamVideo.current);
      }
      
      // predictions object looks like:
      // handInViewConfidence: 0.9990172386169434, 
      // boundingBox: {
      //   topLeft: Array(2),
      //   bottomRight: Array(2),
      // },
      // landmarks: Array(21),
      // annotations: {
      //   thumb: Array(4),
      //   indexFinger: Array(4),
      //   middleFinger: Array(4),
      //   ringFinger: Array(4)
      //   pinky: Array(4),
      //   palmBase: Array(1)
      // }

      //drawing hand
      p.resetShader();
      p.push();
      for(let i = 0; i<predictions.current.length; i++){
        const prediction = predictions.current[i];
        const colors = [[255,0,0],[0,255,0],[0,0,255],[255,255,0],[0,255,0]];
        const fingers = [prediction.annotations.thumb,prediction.annotations.indexFinger,prediction.annotations.middleFinger,prediction.annotations.ringFinger,prediction.annotations.pinky];
        const palmCoord = transformMLCoords({x:prediction.annotations.palmBase[0][0],y:prediction.annotations.palmBase[0][1]},1);
        for(let i = 0; i<fingers.length; i++){
          const finger = fingers[i];
          p.stroke(colors[i]);
          p.beginShape(p.LINES);
          for(let point = 0; point<finger.length-1; point++){
            const tP1 = transformMLCoords({x:finger[point][0],y:finger[point][1]},1);
            const tP2 = transformMLCoords({x:finger[point+1][0],y:finger[point+1][1]},1);
            p.vertex(tP1.x,tP1.y);
            p.vertex(tP2.x,tP2.y);
          }
          const baseCoord = transformMLCoords({x:finger[0][0],y:finger[0][1]},1)
          p.vertex(baseCoord.x,baseCoord.y);
          p.vertex(palmCoord.x,palmCoord.y);
          p.endShape();
        }
        const topLCoord = transformMLCoords({x:prediction.boundingBox.topLeft[0],y:prediction.boundingBox.topLeft[1]},1);
        const bottomRCoord = transformMLCoords({x:prediction.boundingBox.bottomRight[0],y:prediction.boundingBox.bottomRight[1]},1);
        p.stroke(255,0,0);
        p.noFill();
        p.rect(topLCoord.x,topLCoord.y,bottomRCoord.x-topLCoord.x,bottomRCoord.y-topLCoord.y);
      }
      p.pop();

      //run gesture predictions on em
      if(predictions.current.length>0){
        const thumb = predictions.current[0].annotations.thumb[3];
        const indexFinger = predictions.current[0].annotations.indexFinger[3];
        const pinchDist = threeDDistance(thumb[0],thumb[1],thumb[2],indexFinger[0],indexFinger[1],indexFinger[2]);
        const pinchThreshold = 20;
        if(pinchDist<pinchThreshold){
          const pinchCoord = transformMLCoords({
            x : (indexFinger[0] + thumb[0])/2,
            y : (indexFinger[1] + thumb[1])/2
          });
          hand.current = {
            ...hand.current,
            gesture:'pinch',
            new : {x:pinchCoord.x,y:pinchCoord.y},
            old : hand.current.justPinched?{...hand.current.old}:{x:pinchCoord.x,y:pinchCoord.y},
            justPinched : true
          };
        }
        else{
          hand.current = {...hand.current,gesture:'none',justPinched:false};
        }
      }
      else{
        console.log(predictions.current);
      }
    }
    p.mouseReleased = () =>{
      movingFlowPoint.current = false;
      if(p.keyIsDown(p.SHIFT)){
        if(viewWindow.current.dragStarted){
          viewWindow.current.end = {x:p.mouseX,y:p.mouseY}
          const dX = viewWindow.current.end.x - viewWindow.current.start.x;
          const dY = viewWindow.current.end.y - viewWindow.current.start.y;
          viewWindow.current.origin.x -= dX;
          viewWindow.current.origin.y -= dY;
        }
        viewWindow.current.dragStarted = false;
      }
      else{
        if(noiseWindow.current.dragStarted){
          noiseWindow.current.end = {x:p.mouseX,y:p.mouseY}
          const dX = noiseWindow.current.end.x - noiseWindow.current.start.x;
          const dY = noiseWindow.current.end.y - noiseWindow.current.start.y;
          noiseWindow.current.origin.x -= dX;
          noiseWindow.current.origin.y -= dY;
        }
        noiseWindow.current.dragStarted = false;
      }
    }
    p.mouseDragged = () =>{
      if(movingFlowPoint.current){
        const newSettings = {...settingsRef.current};
        const targetPoint = newSettings.flowPoints[targetFlowPointRef.current];
        targetPoint.x = p.mouseX/window.innerWidth;
        targetPoint.y = p.mouseY/window.innerHeight;
        setSettings(newSettings);
      }
      else{
        if(p.mouseX < settingsRef.current.mainCanvas.width && p.mouseY < settingsRef.current.mainCanvas.height && p.mouseX > 0 && p.mouseY > 0){
          // const newSettings = {...settingsRef.current};
          if(p.keyIsDown(p.SHIFT)){
            if(!viewWindow.current.dragStarted){
              viewWindow.current.dragStarted = true;
              viewWindow.current.start = {x:p.mouseX,y:p.mouseY};
            }
            else{
              viewWindow.current.end = {x:p.mouseX,y:p.mouseY}
              const dX = viewWindow.current.end.x - viewWindow.current.start.x;
              const dY = viewWindow.current.end.y - viewWindow.current.start.y;
              viewWindow.current.offset.x = -dX + viewWindow.current.origin.x;
              viewWindow.current.offset.y = -dY+ viewWindow.current.origin.y;
            }
          }
          else{
            if(!noiseWindow.current.dragStarted){
                noiseWindow.current.dragStarted = true;
                noiseWindow.current.start = {x:p.mouseX,y:p.mouseY};
            }
            else{
                noiseWindow.current.end = {x:p.mouseX,y:p.mouseY}
                const dX = noiseWindow.current.end.x - noiseWindow.current.start.x;
                const dY = noiseWindow.current.end.y - noiseWindow.current.start.y;
                noiseWindow.current.offset.x = -dX + noiseWindow.current.origin.x;
                noiseWindow.current.offset.y = -dY+ noiseWindow.current.origin.y;
            }
          }
          // setSettings(newSettings);
        }
      }
    }
    p.windowResized = (e) => {
      if(settingsRef.current.fitCanvasTo == 'window')
        setSettings({...settingsRef.current,canvasWidth:window.innerWidth,canvasHeight:window.innerHeight});
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

  const loadTargetImageFromFileURL = async (e) => {
      //make sure there's a file here
      if(e.target.files.length > 0){

          const file = e.target.files[0];
          const isVideo = file.type.startsWith('video/');
          const isImage = file.type.startsWith('image/');
          let fName = e.target.value.split('C:\\fakepath\\')[1];
          if(fName.length>10){
              fName = fName.slice(0,10)+'...'+fName.slice(-4);
          }
          
          if(isImage){
              //create a file reader object
              const reader = new FileReader();
              //attach a callback for when the FR is done opening the img
              reader.onload = async (e) => {
                  //using p5's loadImage()
                  const newImg = await settings.p5Inst.loadImage(reader.result);
                  setSettings({...settings,image:newImg});
                  liquidPNG.current.needsToReloadImage = true;
              };
              reader.readAsDataURL(file);
          }
          else if(isVideo){
              const videoURL = URL.createObjectURL(file);
              const vid = settings.p5Inst.createVideo([videoURL]);
              vid.hide();
              vid.volume(0);
              vid.loop();
              vid.elt.onloadedmetadata = () => {
                  setSettings({...settings,image:vid});
                  liquidPNG.current.needsToReloadImage = true;
              }
          }
      }
  }

  const loadBackgroundImageFromFileURL = async (e) => {
      //make sure there's a file here
      if(e.target.files.length > 0){

          const file = e.target.files[0];
          const isVideo = file.type.startsWith('video/');
          const isImage = file.type.startsWith('image/');
          let fName = e.target.value.split('C:\\fakepath\\')[1];
          if(fName.length>10){
              fName = fName.slice(0,10)+'...'+fName.slice(-4);
          }
          
          if(isImage){
              //create a file reader object
              const reader = new FileReader();
              //attach a callback for when the FR is done opening the img
              reader.onload = async (e) => {
                  //using p5's loadImage()
                  const newImg = await settings.p5Inst.loadImage(reader.result);
                  setSettings({...settings,backgroundImage:newImg});
                  liquidPNG.current.needsToReloadImage = true;
              };
              reader.readAsDataURL(file);
          }
          else if(isVideo){
              const videoURL = URL.createObjectURL(file);
              const vid = settings.p5Inst.createVideo([videoURL]);
              vid.hide();
              vid.volume(0);
              vid.loop();
              vid.elt.onloadedmetadata = () => {
                  setSettings({...settings,backgroundImage:vid});
                  liquidPNG.current.needsToReloadImage = true;
              }
          }
      }
  }
  function getDimensions(type){
    switch(type){
        case 'custom dimensions':
            {
            let w,h;
            //if window is landscape, max image dimension will be height
            if(window.innerWidth > window.innerHeight){
                h = window.innerHeight;
                w = settings.canvasWidth/settings.canvasHeight * h;
            }
            else{
                w = window.innerWidth;
                h = settings.canvasHeight/settings.canvasWidth * w;
            }
            return {width:w,height:h};
            }
        case 'background image':
            if(settings.backgroundImage !== undefined){
              return {width:settings.backgroundImage.width,height:settings.backgroundImage.height};
            }
            else{
              return {width:settings.canvasWidth,height:settings.canvasHeight};
            }
        case 'window':
            return {width:window.innerWidth,height:window.innerHeight};
    }
  }


  function updateLiquidPNG(s){
    if(s.keyframes.active){
      s = updateKeyframes();
      setSettings(s);
    }
    liquidPNG.current.render(s,viewWindow.current,noiseWindow.current);
    // if(s.recording){
    //   p.frameRate(1);
    //   captureFrame();
    //   s.recordedFrame++;
    //   //set react flags to update DOMs
    //   setRecording(true);
    //   setNumberOfFramesRecorded(s.recordedFrame);
    // }
    // else{
    //   p.frameRate(60);
    //   setRecording(false);
    //   if(s.needToClearRenderBuffer){
    //     s.needToClearRenderBuffer = false;
    //     s.recordedFrame = 0;
    //     setNumberOfFramesRecorded(s.recordedFrame);
    //   }
    // }
    // setSettings(s);
    // p.redraw();
  }

  const aboutChildren = (
    <div className = "description_container">
              <div className = "description_text">
              This is a small tool for distorting visual data and typography using digital noise algorithms
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
  )

  const canvasSettingsChildren = (
      <>
      <LiquidDropdown label = "fit canvas to " callback = {(val) => {const newDims = getDimensions(val);setSettings({...settings,fitCanvasTo:val,canvasWidth:newDims.width,canvasHeight:newDims.height})}} options = {['custom dimensions','window','background image']} value = {settings.fitCanvasTo}></LiquidDropdown>
      {(settings.fitCanvasTo == 'custom dimensions') && 
      <div style = {{display:'flex',gap:'10px'}}>
          <NumberInput name = "width: " value = {settings.canvasWidth} min = {1} max = {window.innerWidth} callback = {(val) => {setSettings({...settings,canvasWidth:val})}}></NumberInput>
          <NumberInput name = "height: " value = {settings.canvasHeight} min = {1} max = {window.innerHeight} callback = {(val) => {setSettings({...settings,canvasHeight:val})}}></NumberInput>
      </div>
      }
      <LiquidSlider callback = {(val) => {const newPixDensity = parseFloat(val);setSettings({...settings,pixelDensity: newPixDensity});settings.p5Inst.pixelDensity(newPixDensity);}} label = {"pixel density: "} min = {"0.01"} max = {"5.0"} stepsize = {"0.01"} defaultValue = {settings.pixelDensity}/>
      </>
  );



  const imageSettingsChildren = (
    <>
      <LiquidDropdown label = "warping " callback = {(val) => {setSettings({...settings,inputType:val});liquidPNG.current.needsToReloadImage = true;}} options = {['image','text']} value = {settings.inputType}></LiquidDropdown>
      <LiquidSlider callback = {(val) => {setSettings({...settings,imageScale: val});}} label = {settings.inputType + " scale: "} min = {"0.01"} max = {"4.0"} stepsize = {"0.01"} defaultValue = {settings.imageScale}/>
      <LiquidDropdown callback = {(val) => {setSettings({...settings,imageCoordinateOverflow: val});}} label = 'handle edges by ' options = {['extending','tiling','discarding']} value = {settings.imageCoordinateOverflow}></LiquidDropdown>
      {settings.inputType === 'image' &&
        <LiquidFilePicker callback = {loadTargetImageFromFileURL} value = {'[upload an image]'}></LiquidFilePicker>
      }
      {settings.inputType === 'text' &&
      <>
        <LiquidTextBox className = "text_input_box" placeholderText = {settings.displayText} callback = {(event) => {setSettings({...settings,displayText: event.target.value});liquidPNG.current.currentText = event.target.value;liquidPNG.current.needsToReloadImage = true;}}></LiquidTextBox>
        <LiquidCheckbox title = {'lock bounding box'} state={settings.lockTextBoundingBox} callback = {(val) => {setSettings({...settings,lockTextBoundingBox: !settings.lockTextBoundingBox});}}></LiquidCheckbox>
        <LiquidDropdown label = 'font: ' callback = {async (val) => {liquidPNG.current.font = await settings.p5Inst.loadFont('./fonts/'+val);liquidPNG.current.needsToReloadImage = true;setSettings({...settings,fontLink: val});}} options = {settings.fontOptions} value = {settings.fontLink}></LiquidDropdown>
        <LiquidSlider callback = {(val) => {setSettings({...settings,fontSize: parseInt(val)});liquidPNG.current.needsToReloadImage = true;}} label = {"font resolution: "} min = {"1"} max = {"400"} stepsize = {"1"} defaultValue = {settings.fontSize}/>
        <LiquidDropdown label = 'align to the ' callback = {(val) => {setSettings({...settings,textAlignment:val});liquidPNG.current.needsToReloadImage = true;}} options = {['left','center','right']} value = {settings.textAlignment}></LiquidDropdown>
        <LiquidDropdown callback = {(val) => {setSettings({...settings,fillTextWith: val});}} label = 'fill text with: ' options = {['color','background image']} value = {settings.fillTextWith}></LiquidDropdown>
        <LiquidColorPicker callback = {(val) => {setSettings({...settings,fontColor:val});}} defaultValue = {settings.fontColor} label = {"text color"}></LiquidColorPicker>
      </>
      }
    </>
  );

  function flowPointDivs(){
    if(!settingsRef.current.ready)
      return;
    const children = [];
    for(let i = 0; i<settingsRef.current.flowPoints.length; i++){
      const point = settingsRef.current.flowPoints[i];
      const size = Math.abs(point.amount*600);
      const coords = {x:point.x*settingsRef.current.canvasWidth - size/2,y:point.y*settingsRef.current.canvasHeight - size/2};
      const red = settingsRef.current.p5Inst.map(point.amount,-0.2,0.2,0,255);
      const blue = settingsRef.current.p5Inst.map(point.amount,-0.2,0.2,255,0);
      const color = '#'+parseInt(red,10).toString(16)+'00'+parseInt(blue,10).toString(16);
      // settings.p5Inst.colorMode(settings.p5Inst.HSB,255);
      // settings.p5Inst.colorMode(settings.p5Inst.RGB,255);
      const style = {
        position:'absolute',
        left:coords.x,
        top:coords.y,
        width:size,
        height:size,
        backgroundColor:color,
        zIndex : 5,
        borderRadius : size/2,
        border : 'dashed 1px black',
        cursor:'pointer',
        animation:'flowPoint 0.5s infinite'
      }
      const clickCallback = (e) => {
        movingFlowPoint.current = true;
        setTargetFlowPoint(i);
      }
      const unclickCallback = (e) => {
        movingFlowPoint.current = false;
      }
      children.push(
        <div key = {i} onMouseUp = {unclickCallback} onMouseDown = {clickCallback} style = {style}></div>
      )
    }
    return children;
  }

  function distortionPointsChildren(){
    const newCallback = () =>{
      const newFPs = settingsRef.current.flowPoints;
      newFPs.push({x:0.5,y:0.5,amount:0.1});
      setSettings({...settingsRef.current,flowPoints:newFPs});
      liquidPNG.current.updateShaders = true;
    }
    const children = [];
    children.push(<div key = {-3} style = {{display:'flex'}}>
    <LiquidButton key = {-2} callback = {newCallback} title = {'new'}></LiquidButton>
    {settings.flowPoints.length > 0 &&
      <LiquidButton key = {-1} callback = {() => {
        const newFPs = [];
        for(let i = 0; i<settings.flowPoints.length; i++){
          if(i != targetFlowPoint){
            newFPs.push(settingsRef.current.flowPoints[i]);
          }
        }
        liquidPNG.current.updateShaders = true;
        setSettings({...settingsRef.current,flowPoints:newFPs});
        setTargetFlowPoint(Math.max(0,newFPs.length-1));
      }} title = {'delete'}></LiquidButton>
    }
    <LiquidCheckbox title = {showFlowPoints?' hide':' show'} key = {-4} state = {showFlowPoints} callback = {() => {setShowFlowPoints(!showFlowPoints);}}></LiquidCheckbox>
    </div>)
    for(let i = 0; i<settings.flowPoints.length; i++){
      const style = {
        width: "100px",
        backgroundColor:(i==targetFlowPointRef.current)?"blue":"red"
      }
      children.push(
        <LiquidSlider key = {i+1} callback = {(val) => {const newFPs = settingsRef.current.flowPoints; newFPs[i].amount = val; setSettings({...settingsRef.current,flowPoints:newFPs});}} label = {((i==targetFlowPoint)?">":"")} min = '-0.2' max = "0.2" stepsize = '0.001' defaultValue = {settingsRef.current.flowPoints[i].amount}></LiquidSlider>
      )
    }
    return (<div>{children}</div>);
  }

  const distortionSettingsChildren = (
    <>
    {/* <LiquidDropdown label = {"algorithm: "} callback = {(val) => {setSettings({...settings,activeNoiseAlgorithm: val});liquidPNG.current.flowFieldShader = liquidPNG.current.createFlowFieldShader();}} options = {Array.from({length:settings.noiseAlgorithms.length},(v,k) => k)} value = {'1'}></LiquidDropdown> */}
    <LiquidCheckbox title = {'scroll thru'} state={settings.animation.active} callback = {(val) => {setSettings({...settings,animation:{...settings.animation,active:!settings.animation.active}})}}></LiquidCheckbox>
    {settings.animation.active && 
        <div className = "flow_slider_container">
        <LiquidSlider callback = {(val) => {setSettings({...settings,animation:{...settings.animation,xMotion : parseFloat(val)}});}} label = {"x: "} min = {-10.0} max = {10.0} stepsize = {1} defaultValue = {settings.animation.xMotion}/>
        <LiquidSlider callback = {(val) => {setSettings({...settings,animation:{...settings.animation,yMotion : parseFloat(val)}});}} label = {"y: "} min = {-10.0} max = {10.0} stepsize = {1} defaultValue = {settings.animation.yMotion}/>
        </div>
    }
    <LiquidFlowSettings title = {"flow"} active = {settings.lowFNoise.active} amplitudeSliderSettings = {{min:0.0,max:5.0,stepsize:0.001,default:settings.lowFNoise.amplitude}} scaleSliderSettings = {{min:0.0,max:2.5,stepsize:0.001,default:settings.lowFNoise.scale}} noiseSettings = {settings.lowFNoise} onOffCallback = {(val) => {setSettings({...settings,lowFNoise:{...settings.lowFNoise,active:!settings.lowFNoise.active}})}} amplitudeCallback={(val) => {setSettings({...settings,lowFNoise:{...settings.lowFNoise,amplitude:val}});}} scaleCallback={(val) => {setSettings({...settings,lowFNoise:{...settings.lowFNoise,scale:val}});}}></LiquidFlowSettings>
    <LiquidFlowSettings title = {"warp"} active={settings.mediumFNoise.active} amplitudeSliderSettings = {{min:0.0,max:5.0,stepsize:0.001,default:settings.mediumFNoise.amplitude}} scaleSliderSettings = {{min:0.0,max:5.0,stepsize:0.001,default:settings.mediumFNoise.scale}} noiseSettings = {settings.mediumFNoise} onOffCallback = {(val) => {setSettings({...settings,mediumFNoise:{...settings.mediumFNoise,active:!settings.mediumFNoise.active}})}} amplitudeCallback={(val) => {setSettings({...settings,mediumFNoise:{...settings.mediumFNoise,amplitude:val}});}} scaleCallback={(val) => {setSettings({...settings,mediumFNoise:{...settings.mediumFNoise,scale:val}});}}></LiquidFlowSettings>
    <LiquidFlowSettings title = {"ripple"} active={settings.perlinNoise.active} amplitudeSliderSettings = {{min:0.0,max:1.0,stepsize:0.001,default:settings.perlinNoise.amplitude}} scaleSliderSettings = {{min:0.0,max:5.0,stepsize:0.001,default:settings.perlinNoise.scale}} noiseSettings = {settings.perlinNoise} onOffCallback = {(val) => {setSettings({...settings,perlinNoise:{...settings.perlinNoise,active:!settings.perlinNoise.active}})}} amplitudeCallback={(val) => {setSettings({...settings,perlinNoise:{...settings.perlinNoise,amplitude:val}});}} scaleCallback={(val) => {setSettings({...settings,perlinNoise:{...settings.perlinNoise,scale:val}});}}></LiquidFlowSettings>
    <LiquidFlowSettings title = {"dust"} active={settings.highFNoise.active} amplitudeSliderSettings = {{min:0.0,max:1.0,stepsize:0.001,default:settings.highFNoise.amplitude}} scaleSliderSettings = {{min:10.0,max:1000.0,stepsize:1.0,default:settings.highFNoise.scale}} noiseSettings = {settings.highFNoise} onOffCallback = {(val) => {setSettings({...settings,highFNoise:{...settings.highFNoise,active:!settings.highFNoise.active}})}} amplitudeCallback={(val) => {setSettings({...settings,highFNoise:{...settings.highFNoise,amplitude:val}});}} scaleCallback={(val) => {setSettings({...settings,highFNoise:{...settings.highFNoise,scale:val}});}}></LiquidFlowSettings>
    </>
  )

  function backgroundSettingsChildren(){
    const options = ["transparency","color","image/video","grid","blur"];
    const callback = (val) => {
      let bg = 0;
      switch(val){
        case "transparency":
              bg = 0;
              break;
          case "color":
              bg = 1;
              break;
          case "image/video":
              bg = 2;
              break;
          case "grid":
              bg = 3;
              break;
          case "blur":
              bg = 4;
              break;
        }
        setSettings({...settingsRef.current,backgroundStyle:bg});
    }
    const children = (
      <>
      <LiquidDropdown label = {"background is a "} callback = {callback} options = {options}  value = {options[settings.backgroundStyle]} ></LiquidDropdown>
      {/* solid color */}
      {settings.backgroundStyle === 1 &&
        <LiquidColorPicker callback = {(val) => {setSettings({...settings,backgroundColor:val})}} defaultValue = {settings.backgroundColor}></LiquidColorPicker>
      }
      {/* image/video */}
      {settings.backgroundStyle === 2 &&
      <>
        <LiquidFilePicker callback = {loadBackgroundImageFromFileURL} value = {'[background image/video]'}></LiquidFilePicker>
        {/* <LiquidCheckbox title = {'play with keyframes'} setTitleInsideBrackets = {false} callback = {(val) => {settings.backgroundImage}}></LiquidCheckbox> */}
      </>
      }
      {/* grid */}
      {settings.backgroundStyle === 3 &&
      <>
        <LiquidColorPicker callback = {(val) => {setSettings({...settings,gridColor : val});}} defaultValue = {'#ff0000'} label = {"line"}></LiquidColorPicker>
        <LiquidColorPicker callback = {(val) => {setSettings({...settings,backgroundColor : val});}} defaultValue = {'#0000ff'} label = {"background"}></LiquidColorPicker>
        <br></br>
        <LiquidSlider callback = {(val) => {setSettings({...settings,gridThickness: val})}} label = {"thickness "} min = {"0.0"} max = {"0.05"} stepsize = {"0.001"} defaultValue = {settings.gridThickness}/>
        <LiquidSlider callback = {(val) => {setSettings({...settings,gridSize: val})}} label = {"resolution "} min = {"0.0"} max = {"100.0"} stepsize = {"1.0"} defaultValue = {settings.gridSize}/>
      </>
      }
      {settings.backgroundStyle === 4 &&
        <>
          <LiquidColorPicker callback = {(val) => {setSettings({...settings,gridColor : val});}} defaultValue = {'#ff0000'} label = {"line"}></LiquidColorPicker>
          <LiquidColorPicker callback = {(val) => {setSettings({...settings,backgroundColor : val});}} defaultValue = {'#0000ff'} label = {"background"}></LiquidColorPicker>
          <br></br>
          <LiquidSlider callback = {(val) => {setSettings({...settings,blurGridIntensity : val});}} label = {"thickness "} min = {"0.0"} max = {"10.0"} stepsize = {"0.001"} defaultValue = {settings.blurGridIntensity}/>
          <LiquidSlider callback = {(val) => {setSettings({...settings,gridSize : val});}} label = {"resolution "} min = {"0.0"} max = {"100.0"} stepsize = {"1.0"} defaultValue = {settings.gridSize}/>
        </>
      }
      </>
    );
    return children;
  }
  const getSettingsFromKeyframe = (keyframe) => {
    const flowPoints = [];
    for(let p of keyframe.flowPoints){
      flowPoints.push({x:p.x,y:p.y,amount:p.amount});
    }
    return {
      ...settingsRef.current,
      keyframes : {...settingsRef.current.keyframes},
      fontSize:keyframe.fontSize,
      displayText : keyframe.displayText,
      fontColor : keyframe.fontColor,
      viewWindow : {
          offset : {x:keyframe.viewWindow.offset.x,y:keyframe.viewWindow.offset.y},
          origin: {x:keyframe.viewWindow.origin.x,y:keyframe.viewWindow.origin.y},
      },
      noiseWindow : {
          offset : {x:keyframe.noiseWindow.offset.x,y:keyframe.noiseWindow.offset.y},
          origin: {x:keyframe.noiseWindow.origin.x,y:keyframe.noiseWindow.origin.y},
      },
      globalNoise :{
          amplitude:1.0,
          scale:1.0
      },
      lowFNoise :{
          active : keyframe.lowFNoise.active,
          amplitude:keyframe.lowFNoise.amplitude,
          scale: keyframe.lowFNoise.scale
      },
      mediumFNoise:{
          active : keyframe.mediumFNoise.active,
          amplitude: keyframe.mediumFNoise.amplitude,
          scale: keyframe.mediumFNoise.scale
      },
      highFNoise:{
          active : keyframe.highFNoise.active,
          amplitude: keyframe.highFNoise.amplitude,
          scale: keyframe.highFNoise.scale
      },
      perlinNoise:{
          active:keyframe.perlinNoise.active,
          amplitude: keyframe.perlinNoise.amplitude,
          scale: keyframe.perlinNoise.scale
      },
      imageScale : keyframe.imageScale,
      backgroundColor : keyframe.backgroundColor,
      gridColor : keyframe.gridColor,
      blurGridIntensity : keyframe.blurGridIntensity,
      gridThickness : keyframe.gridThickness,
      gridSize : keyframe.gridSize,
      flowPoints : flowPoints
    };
  }
  function interpolateBetweenKeyframes(frameA,frameB,amount){
    const p = settingsRef.current.p5Inst;
    const newFps = [];
    for(let i = 0; i<Math.max(frameA.flowPoints.length,frameB.flowPoints.length); i++){
      let A,B;
      if(i >= frameA.flowPoints.length){
        A = {x:frameB.flowPoints[i].x,y:frameB.flowPoints[i].y,amount:0};
      }
      else{
        A = frameA.flowPoints[i];
      }
      if(i >= frameB.flowPoints.length){
        B = {x:frameA.flowPoints[i].x,y:frameA.flowPoints[i].y,amount:0};
      }
      else{
        B = frameB.flowPoints[i];
      }
      newFps.push({x:p.lerp(A.x,B.x,amount),y:p.lerp(A.y,B.y,amount),amount:p.lerp(A.amount,B.amount,amount)});
    }

    return {...frameA,
      fontSize : p.lerp(frameA.fontSize,frameB.fontSize,amount),
      viewWindow : {
          offset : {x:p.lerp(frameA.viewWindow.offset.x,frameB.viewWindow.offset.x,amount),y:p.lerp(frameA.viewWindow.offset.y,frameB.viewWindow.offset.y,amount)},
          origin : {x:p.lerp(frameA.viewWindow.origin.x,frameB.viewWindow.origin.x,amount),y:p.lerp(frameA.viewWindow.origin.y,frameB.viewWindow.origin.y,amount)},
      },
      noiseWindow : {
          offset : {x:p.lerp(frameA.noiseWindow.offset.x,frameB.noiseWindow.offset.x,amount),y:p.lerp(frameA.noiseWindow.offset.y,frameB.noiseWindow.offset.y,amount)},
          origin : {x:p.lerp(frameA.noiseWindow.origin.x,frameB.noiseWindow.origin.x,amount),y:p.lerp(frameA.noiseWindow.origin.y,frameB.noiseWindow.origin.y,amount)},
      },
      lowFNoise : {
        active : frameA.lowFNoise.active,
        amplitude : p.lerp(frameA.lowFNoise.active?frameA.lowFNoise.amplitude:0,frameB.lowFNoise.active?frameB.lowFNoise.amplitude:0,amount),
        scale : p.lerp(frameA.lowFNoise.scale,frameB.lowFNoise.scale,amount)
      },
      mediumFNoise : {
        active : frameA.mediumFNoise.active,
        amplitude : p.lerp(frameA.mediumFNoise.active?frameA.mediumFNoise.amplitude:0,frameB.mediumFNoise.active?frameB.mediumFNoise.amplitude:0,amount),
        scale : p.lerp(frameA.mediumFNoise.scale,frameB.mediumFNoise.scale,amount)
      },
      highFNoise : {
        active : frameA.highFNoise.active,
        amplitude : p.lerp(frameA.highFNoise.active?frameA.highFNoise.amplitude:0,frameB.highFNoise.active?frameB.highFNoise.amplitude:0,amount),
        scale : p.lerp(frameA.highFNoise.scale,frameB.highFNoise.scale,amount)
      },
      perlinNoise : {
        active : frameA.perlinNoise.active,
        amplitude : p.lerp(frameA.perlinNoise.active?frameA.perlinNoise.amplitude:0,frameB.perlinNoise.active?frameB.perlinNoise.amplitude:0,amount),
        scale : p.lerp(frameA.perlinNoise.scale,frameB.perlinNoise.scale,amount)
      },
      imageScale : p.lerp(frameA.imageScale,frameB.imageScale,amount),
      flowPoints : newFps
    };
  }

  function updateKeyframes() {
    //bounds checking
    // if ((settingsRef.current.keyframes.keyframes[settingsRef.current.keyframes.currentAnimation] === undefined) || (settingsRef.current.keyframes.keyframes[settingsRef.current.keyframes.currentAnimation + 1] === undefined)) {
    //   settingsRef.current.keyframes.active = false;
    //   settingsRef.current.keyframes.currentAnimation = 0;
    //   //stop vid if needed
    //   if (settingsRef.current.backgroundIsVideo) {
    //   }
    //   return 
    // }

    //interpolating between frames
    const easeInOutSine = (t) => {
      return -0.5 * (Math.cos(Math.PI * t) - 1);
    }
    const easeInOutCubic = (t) => {
      return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    }

    let lerpPercent = settingsRef.current.keyframes.currentFrame / settingsRef.current.keyframes.keyframes[settingsRef.current.keyframes.currentAnimation].transitionLength;
    switch(settingsRef.current.keyframes.keyframes[settingsRef.current.keyframes.currentAnimation].easeType){
      case 'linear': break;
      case 'sine'  : lerpPercent = easeInOutSine(lerpPercent); break;
      case 'cubic' : lerpPercent = easeInOutCubic(lerpPercent); break;
    }

    //get a new frame somewhere between the two
    const newFrameData = interpolateBetweenKeyframes(settingsRef.current.keyframes.keyframes[settingsRef.current.keyframes.currentAnimation], settingsRef.current.keyframes.keyframes[settingsRef.current.keyframes.currentAnimation+1],lerpPercent);
    const newSettings = getSettingsFromKeyframe(newFrameData);

    //update frame (within animation)
    newSettings.keyframes.currentFrame++;
    if (newSettings.keyframes.currentFrame > newSettings.keyframes.keyframes[newSettings.keyframes.currentAnimation].transitionLength) {
      newSettings.keyframes.currentFrame = 0;
      //jump to next animation
      if (newSettings.keyframes.keyframes[newSettings.keyframes.currentAnimation + 2] !== undefined) {
        newSettings.keyframes.currentAnimation++;
      }
      //if ur looping
      else if (newSettings.keyframes.looping) {
        newSettings.keyframes.currentAnimation = 0;
        //reset vid if needed
        if (newSettings.backgroundIsVideo) {
          newSettings.backgroundImage.currentTime = 0;
        }
        if (newSettings.recording) {
          newSettings.recordingFinished = true;
        }
      }
      //if not
      else {
        newSettings.keyframes.active = false;
        newSettings.keyframes.currentAnimation = 0;
        if (newSettings.recording) {
          newSettings.recordingFinished = true;
        }
        //stop vid if needed
        if (newSettings.backgroundIsVideo) {
          newSettings.backgroundImage.stop();
        }
      }
    }
    else {
      if (newSettings.backgroundIsVideo) {
        const frameTime = 1 / 25;//25fps?
        newSettings.backgroundImage.currentTime = Math.min(newSettings.backgroundImage.duration, newSettings.backgroundImage.currentTime + frameTime * newSettings.keyframes.currentFrame);
      }
    }
    return newSettings;
  }

  function keyframeSettingsChildren(){
    const keyframeDisplayStyle = {
      width: 30,
      height:30,
      borderStyle:'dashed',
      borderColor:'#000000',
    };
    const keyframeDisplayStyle_focused = {
      borderStyle:'solid',
      borderColor:'#ff0000',
      animationName: 'example',
      animationDuration: '0.75s',
      animationIterationCount:'infinite'
    };
    const new_keyframe_button_style = {
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
    const saveCurrentStateAsKeyframe = (currentState) => {
      const flowPoints = [];
      for(let p of currentState.flowPoints){
        flowPoints.push({x:p.x,y:p.y,amount:p.amount});
      }
      return {
        fontSize : currentState.fontSize,
        displayText : currentState.displayText,
        fontColor : currentState.fontColor,
        viewWindow : {
            offset : {x:currentState.viewWindow.offset.x,y:currentState.viewWindow.offset.y},
            origin: {x:currentState.viewWindow.origin.x,y:currentState.viewWindow.origin.y},
        },
        noiseWindow : {
            offset : {x:currentState.noiseWindow.offset.x,y:currentState.noiseWindow.offset.y},
            origin: {x:currentState.noiseWindow.origin.x,y:currentState.noiseWindow.origin.y},
        },
        globalNoise :{
            amplitude:1.0,
            scale:1.0
        },
        lowFNoise :{
            active : true,
            amplitude:currentState.lowFNoise.active?currentState.lowFNoise.amplitude:0,
            scale: currentState.lowFNoise.scale
        },
        mediumFNoise:{
            active : true,
            amplitude:currentState.mediumFNoise.active?currentState.mediumFNoise.amplitude:0,
            scale: currentState.mediumFNoise.scale
        },
        highFNoise:{
            active : true,
            amplitude:currentState.highFNoise.active?currentState.highFNoise.amplitude:0,
            scale: currentState.highFNoise.scale
        },
        perlinNoise:{
            active:true,
            amplitude:currentState.perlinNoise.active?currentState.perlinNoise.amplitude:0,
            scale: currentState.perlinNoise.scale
        },
        imageScale : currentState.imageScale,
        backgroundColor : currentState.backgroundColor,
        gridColor : currentState.gridColor,
        blurGridIntensity : currentState.blurGridIntensity,
        gridThickness : currentState.gridThickness,
        gridSize : currentState.gridSize,
        flowPoints : flowPoints,
        transitionLength : 20,
        easeType: 'linear',
      };
    }
    const saveKeyframesAsJSON = (settings) => {
        const fileName = 'keyframes.json';
        // Create a blob of the data
        const fileToSave = new Blob([JSON.stringify(settings.keyframes.keyframes)], {
            type: 'application/json'
        });
        saveAs(fileToSave, fileName);
    }

    const keyframes = [];
    for(let kf = 0; kf<settingsRef.current.keyframes.keyframes.length; kf++){
        keyframes.push(<div key = {kf} className = {"keyframe_display"} style = {(kf == settings.keyframes.currentAnimation)?keyframeDisplayStyle_focused:keyframeDisplayStyle} onClick = {(e) => {
          const newS = getSettingsFromKeyframe(settingsRef.current.keyframes.keyframes[kf]);
          newS.keyframes.currentAnimation = kf;
          setSettings({...newS});
      }}></div>);
    }
    keyframes.push(<div key = '-1' className = "new_keyframe_button" style = {new_keyframe_button_style} onClick = {(e) => {const frames = settings.keyframes.keyframes;frames.push(saveCurrentStateAsKeyframe(settings));setSettings({...settings,keyframes:{...settings.keyframes,currentAnimation:frames.length-1,keyframes:frames}});}}>+</div>)
    return(
        <>
        <div style = {{color:'#ffffff',fontWeight:'bold',mixBlendMode:'difference'}}>{(settings.keyframes.keyframes.length == 0)?'Add a keyframe':('Frame '+(settings.keyframes.currentAnimation+1))}</div>
        <div className = "keyframe_display_container" style ={{display:'flex',gap:'3px'}}>
            {keyframes}
        </div>
        {settings.keyframes.keyframes.length &&
          <>
          <div style = {buttonHolderStyle}>
              <LiquidButton title = {'overwrite'} callback = {() => {const frames = settingsRef.current.keyframes.keyframes; frames[settingsRef.current.keyframes.currentAnimation] = saveCurrentStateAsKeyframe(settingsRef.current); setSettings({...settingsRef.current,keyframes:{...settingsRef.current.keyframes,keyframes:frames}});}}></LiquidButton>
              {/* delete */}
              <LiquidButton title = {'delete'} callback = {() => {
                const frames = settingsRef.current.keyframes.keyframes;
                const newFrames = [];
                for(let i = 0; i<frames.length; i++){
                  if(i != settingsRef.current.keyframes.currentAnimation){
                    newFrames.push(frames[i]);
                  }
                }
                const newCurrentA = Math.min(settingsRef.current.keyframes.currentAnimation,newFrames.length-1);
                setSettings({...settingsRef.current,keyframes:{...settingsRef.current.keyframes,keyframes:newFrames,currentAnimation:newCurrentA}});
              }}></LiquidButton>
              <LiquidButton title = {settings.keyframes.active?'stop':'play'} callback = {() => {
                const newS = {...settingsRef.current};
                newS.keyframes.active = !newS.keyframes.active;
                newS.keyframes.currentAnimation = 0;
                newS.keyframes.currentFrame = 0;
                setSettings(newS);
              }}></LiquidButton>
              <LiquidCheckbox title = {'loop'} state = {settings.keyframes.looping} setTitleInsideBrackets = {false} callback = {() => {setSettings({...settingsRef.current,keyframes:{...settingsRef.current.keyframes,looping:!settingsRef.current.keyframes.looping}})}}></LiquidCheckbox>
          </div>
          <LiquidSlider callback = {(val) => {const frames = settingsRef.current.keyframes.keyframes;frames[settingsRef.current.keyframes.currentAnimation].transitionLength = val;setSettings({...settingsRef.current,keyframes:{...settingsRef.current.keyframes,keyframes:frames}});}} label = {"length: "} min = {"1"} max = {"3600"} stepsize = {"1"} currentValue = {settings.keyframes.keyframes[settings.keyframes.currentAnimation].transitionLength} defaultValue = {settings.keyframes.keyframes[settings.keyframes.currentAnimation].transitionLength}/>
          <LiquidDropdown label = {"easing: "} callback = {(val) => {const frames = settingsRef.current.keyframes.keyframes; frames[settingsRef.current.keyframes.currentAnimation].easeType = val; setSettings({...settingsRef.current,keyframes:{...settingsRef.current.keyframes,keyframes:frames}});}} options = {['linear','sine','cubic']} value = {settings.keyframes.keyframes[settings.keyframes.currentAnimation].easeType}></LiquidDropdown>
          <LiquidButton title = {settings.recording?'stop rendering':'render & save'} callback = {()=>{}}></LiquidButton>
          <LiquidButton title = {'save as json'} callback = {()=>{saveKeyframesAsJSON(settings)}}></LiquidButton>
          {/* {(settings.recordedFrame != 0 && !settings.recording) &&
              <LiquidButton title = {'clear render buffer'} callback = {()=>{settings.needToClearRenderBuffer = true;}}></LiquidButton>
          } */}
          </>
        }
        </>
    );
  }

  //if init correctly
  // if(settings.ready){
  //   //update canvas size (this happens instantly because it's p5, unlike react state changes!)
    // if(settings.canvasHeight !== settings.mainCanvas.height || settings.canvasWidth !== settings.mainCanvas.width){
    //   settings.p5Inst.resizeCanvas(settings.canvasWidth,settings.canvasHeight);
    // }
  //   //update the sim
  //   updateLiquidPNG(settings);
  // }

  return (
    <div className = "app_container">
      <Webcam ref = {webcamRef} mirrored = {true} onLoadedData={(e) => {setupWebcamVideo(e);}} videoConstraints={{
        // frameRate: { ideal: 30, max: 60 },
        width: 160,
        height : 120,
      }} 
      // style={{ display: "none" }}
      />
      <div style = {{position:'absolute',width:'100%',left:'0px',top:'0px'}}>
        <main></main>
      </div>
      {/* holds the sketch */}
      {settings.recording &&
        <div style = {{position:'absolute',right:'20px',color:'#000000',fontSize:'20pt'}}>{'recording frame '+numberOfFramesRecorded}</div>
      }
      {showFlowPoints && flowPointDivs(settings)}
      <div className = "ui_container" style = {{backgroundColor : 'transparent'}}>
        {!hidden &&
        <span className = "title">liquid.png</span>
        }
        <LiquidCheckbox title = {"ui"}  state={hidden} callback = {(val) => {setHidden(!hidden)}}></LiquidCheckbox>
        {!hidden &&
          <>
          <LiquidButton title = 'save img' callback = {() => {settings.p5Inst.saveCanvas();}}></LiquidButton>
          <LiquidCheckbox title = {'about'} setTitleInsideBrackets = {true}  state = {showAbout} callback = {(e) => {setShowAbout(!showAbout);}}></LiquidCheckbox>
          {showAbout && aboutChildren}
          {/* canvas settings */}
          <LiquidMenuTab title = "canvas" background = {'#ff72b1ff'}defaultState = {settings.canvasMenu.open} children = {canvasSettingsChildren}></LiquidMenuTab>
          {/* image settings */}
          <LiquidMenuTab title = {settings.inputType} background = {'#ff0088ff'} defaultState = {settings.imageMenu.open} children = {imageSettingsChildren}></LiquidMenuTab>
          <LiquidMenuTab title = "distortion points" background = {'#00a2adff'} defaultState = {settings.distortionPointsMenu.open} children = {distortionPointsChildren()}></LiquidMenuTab>
          <LiquidMenuTab title = "distortion fields" background = {'#009dffff'}defaultState = {settings.distortionMenu.open} children = {distortionSettingsChildren}></LiquidMenuTab>
          <LiquidMenuTab title = "background" background = {'#009dffff'}defaultState = {settings.backgroundMenu.open} children = {backgroundSettingsChildren()}></LiquidMenuTab>
          <LiquidMenuTab title = "keyframes" background = {'#807bffff'} defaultState = {settings.keyframeMenu.open} children = {keyframeSettingsChildren()}></LiquidMenuTab>
          </>
        }
      </div>
    </div>
  )
}

export default App
