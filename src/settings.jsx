export const settings = {
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
    backgroundMenu : {open:false},
    imageMenu : {open:true},
    keyframeMenu : {open:false},
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
    updateTextBoundingBox:true,//true if new text being entered triggers the BB to be resized, false if it doesn't change size
    needsToReloadImage : false,

    mainCanvas : null,
    srcImage : null,
    font : null,
    fontSize : 200,
    displayText : "liquid.\npng",
    centerText : true,
    fontColor : [1.0,0,0],
    canvasWidth : window.innerWidth,
    canvasHeight : window.innerHeight,
    globalScale : 1.0,

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
    backgroundColor : [0,0,1.0],
    gridColor : [1.0,0,0],
    blurGridIntensity : 1.0,
    //0 == clear, 1 == color, 2 == image/video, 3 == grid, 4 == blurry-grid
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
    ]
  }
function easeInOutSine(t) {
    return -0.5 * (Math.cos(Math.PI * t) - 1);
}
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

function setSettingsFromKeyframe(lerpPercent, active, next, p) {
    const currentAnimation = settings.keyframes.keyframes[active];
    const nextAnimation = settings.keyframes.keyframes[next];
    const newFontSize = p.lerp(currentAnimation.fontSize, nextAnimation.fontSize, lerpPercent);
    switch (currentAnimation.easeType) {
        case 'linear':
            break;
        case 'sine':
            lerpPercent = easeInOutSine(lerpPercent);
            break;
        case 'cubic':
            lerpPercent = easeInOutCubic(lerpPercent);
            break;
    }
    // settings.fontColor = p.lerpColor(currentAnimation.fontColor,nextAnimation.fontColor,lerpPercent); //Not done yet lmfao
    settings.viewWindow = {
        offset: {
            x: p.lerp(currentAnimation.viewWindow.offset.x, nextAnimation.viewWindow.offset.x, lerpPercent),
            y: p.lerp(currentAnimation.viewWindow.offset.y, nextAnimation.viewWindow.offset.y, lerpPercent)
        },
        origin: {
            x: p.lerp(currentAnimation.viewWindow.origin.x, nextAnimation.viewWindow.origin.x, lerpPercent),
            y: p.lerp(currentAnimation.viewWindow.origin.y, nextAnimation.viewWindow.origin.y, lerpPercent)
        },
    };
    settings.noiseWindow = {
        offset: {
            x: p.lerp(currentAnimation.noiseWindow.offset.x, nextAnimation.noiseWindow.offset.x, lerpPercent),
            y: p.lerp(currentAnimation.noiseWindow.offset.y, nextAnimation.noiseWindow.offset.y, lerpPercent)
        },
        origin: {
            x: p.lerp(currentAnimation.noiseWindow.origin.x, nextAnimation.noiseWindow.origin.x, lerpPercent),
            y: p.lerp(currentAnimation.noiseWindow.origin.y, nextAnimation.noiseWindow.origin.y, lerpPercent)
        },
    };
    settings.lowFNoise = {
        active: true,
        amplitude: p.lerp(currentAnimation.lowFNoise.amplitude, nextAnimation.lowFNoise.amplitude, lerpPercent),
        scale: p.lerp(currentAnimation.lowFNoise.scale, (nextAnimation.lowFNoise.scale), lerpPercent)
    };
    settings.mediumFNoise = {
        active: true,
        amplitude: p.lerp(currentAnimation.mediumFNoise.amplitude, nextAnimation.mediumFNoise.amplitude, lerpPercent),
        scale: p.lerp(currentAnimation.mediumFNoise.scale, nextAnimation.mediumFNoise.scale, lerpPercent)
    };
    settings.highFNoise = {
        active: true,
        amplitude: p.lerp(currentAnimation.highFNoise.amplitude, nextAnimation.highFNoise.amplitude, lerpPercent),
        scale: p.lerp(currentAnimation.highFNoise.scale, nextAnimation.highFNoise.scale, lerpPercent)
    };
    settings.perlinNoise = {
        active: true,
        amplitude: p.lerp(currentAnimation.perlinNoise.amplitude, nextAnimation.perlinNoise.amplitude, lerpPercent),
        scale: p.lerp(currentAnimation.perlinNoise.scale, nextAnimation.perlinNoise.scale, lerpPercent)
    };
    settings.imageScale = p.lerp(currentAnimation.imageScale, nextAnimation.imageScale, lerpPercent);
    if (newFontSize != settings.fontSize) {
        settings.fontSize = newFontSize;
        settings.needsToReloadImage = true;
    }

    // settings.backgroundColor = p.lerpColor(currentAnimation.backgroundColor,nextAnimation.backgroundColor,lerpPercent);
}

export function updateAnimation(p) {
    //if the flag is set for jumping the sim to an animation frame (and if that frame exists)
    if (settings.keyframes.needsToSetCanvasTo != null && !(settings.keyframes.keyframes[settings.keyframes.needsToSetCanvasTo] === undefined)) {
        setSettingsFromKeyframe(0, settings.keyframes.needsToSetCanvasTo, settings.keyframes.needsToSetCanvasTo, p);
        settings.keyframes.needsToSetCanvasTo = null;
    }
    else if (settings.keyframes.active) {
        //bounds checking
        if ((settings.keyframes.keyframes[settings.keyframes.currentAnimation] === undefined) || (settings.keyframes.keyframes[settings.keyframes.currentAnimation + 1] === undefined)) {
            settings.keyframes.active = false;
            settings.keyframes.currentAnimation = 0;
            //stop vid if needed
            if (settings.backgroundIsVideo) {
            }
            return;
        }
        const lerpPercent = settings.keyframes.currentFrame / settings.keyframes.keyframes[settings.keyframes.currentAnimation].transitionLength;
        setSettingsFromKeyframe(lerpPercent, settings.keyframes.currentAnimation, settings.keyframes.currentAnimation + 1, p);

        //update frame (within animation)
        settings.keyframes.currentFrame++;
        if (settings.keyframes.currentFrame > settings.keyframes.keyframes[settings.keyframes.currentAnimation].transitionLength) {
            settings.keyframes.currentFrame = 0;
            //jump to next animation
            if (!(settings.keyframes.keyframes[settings.keyframes.currentAnimation + 2] === undefined)) {
                settings.keyframes.currentAnimation++;
            }
            //if ur looping
            else if (settings.keyframes.looping) {
                settings.keyframes.currentAnimation = 0;
                //reset vid if needed
                if (settings.backgroundIsVideo) {
                    settings.backgroundImage.currentTime = 0;
                }
                if (settings.recording) {
                    settings.recordingFinished = true;
                }
            }
            //if not
            else {
                settings.keyframes.active = false;
                settings.keyframes.currentAnimation = 0;
                if (settings.recording) {
                    settings.recordingFinished = true;
                }
                //stop vid if needed
                if (settings.backgroundIsVideo) {
                    settings.backgroundImage.stop();
                }
            }
        }
        else {
            if (settings.backgroundIsVideo) {
                const frameTime = 1 / 25;//25fps?
                settings.backgroundImage.currentTime = Math.min(settings.backgroundImage.duration, settings.backgroundImage.currentTime + frameTime * settings.keyframes.currentFrame);
            }
        }
    }
}