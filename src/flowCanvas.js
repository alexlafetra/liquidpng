const glsl = x => x;


/*
feed video in as backgroundcolor AND textcolor? but the pixels it grqbs need to be from the original coords, not warped coords
*/

class FlowCanvas{
    constructor(settings){
        this.settings = settings;
        this.currentText = settings.displayText;
    }
    reset(){
        this.settings.p5Inst.resizeCanvas(window.innerWidth,window.innerHeight);
        this.settings.p5Inst.pixelDensity(this.settings.pixelDensity);
        this.settings.srcImage = this.settings.p5Inst.createFramebuffer({ width: this.settings.image.width, height: this.settings.image.height, textureFiltering: this.settings.p5Inst.NEAREST, format: this.settings.p5Inst.FLOAT});
        this.init();
    }
    saveImage(){
        this.render();
        let dataURL = this.settings.mainCanvas.elt.toDataURL('image/png');
        console.log(this.settings.mainCanvas);
        let a = document.createElement('a');
        a.href = dataURL;
        a.download = 'liquid.png';
        a.click();
    }
    init(){
        this.p5 = this.settings.p5Inst;
        this.mainCanvas = this.settings.mainCanvas;
        //holds the flow field
        this.flowFieldCanvas = this.p5.createFramebuffer({ width: this.settings.canvasWidth, height: this.settings.canvasWidth, textureFiltering: this.p5.NEAREST, format: this.settings.clampNoise?this.p5.UNSIGNED_BYTE:this.p5.FLOAT});
        this.flowFieldShader = this.createFlowFieldShader(this.p5);
        this.outputShader = this.createOutputShader();
        if(this.settings.inputType == 'text'){
            this.reloadText();
        }
        else{
            this.reloadImage();
        }
    }
    async loadNewImage(fname){
        const img = await this.p5.loadImage(fname);
        this.loadImage(img);
    }
    reloadImage(){
        this.loadImage(this.settings.image);
    }
    loadImage(im){
        this.settings.image = im;
        this.settings.srcImage = this.p5.createFramebuffer({ width: this.settings.image.width, height: this.settings.image.height, textureFiltering: this.p5.NEAREST, format: this.settings.clampNoise?this.p5.UNSIGNED_BYTE:this.p5.FLOAT});
        this.settings.srcImage.begin();
        this.p5.clear();
        this.p5.image(im,-im.width/2,-im.height/2,im.width,im.height);
        this.settings.srcImage.end();
    }
    reloadText(){
        this.loadText(this.currentText);
    }
    getTextBounds(t){
        //obj to store bounds
        const bounds = {
            width : 0,
            height : 0
        };

        //split text by newline character to get each line
        let splitText = t.split(/\r?\n/);

        //get length of each line to find the widest
        for(let line of splitText){
            let b = this.p5.fontBounds(line,0,0);
            if(b.w > bounds.width){
                bounds.width = b.w;
            }
        }
        //add in the textLeading() val for each line height
        bounds.height += splitText.length * this.p5.textLeading();

        //round the bounds UP
        bounds.height = Math.ceil(bounds.height);
        bounds.width = Math.ceil(bounds.width);
        return bounds;
    }
    getAlignment(){
        switch(this.settings.textAlignment){
            case "left":
                return this.p5.LEFT;
            case "right":
                return this.p5.RIGHT;
            case "center":
                return this.p5.CENTER;
        }
    }
    loadText(t){

        if(t === null || t === undefined){
            return;
        }

        //set font settings
        this.p5.textFont(this.settings.font);
        this.p5.fill(0,0,0);
        this.p5.noStroke();
        this.p5.textSize(this.settings.fontSize);
        this.p5.textAlign(this.getAlignment(),this.p5.TOP);

        if(this.settings.updateTextBoundingBox){
            const bounds = this.getTextBounds(t);
            this.settings.srcImage = this.p5.createFramebuffer({ width: bounds.width, height: bounds.height, textureFiltering: this.p5.NEAREST, format: this.settings.clampNoise?this.p5.UNSIGNED_BYTE:this.p5.FLOAT});
        }

        this.settings.srcImage.begin();
        this.p5.clear();
        this.p5.text(t,this.settings.textAlignment == 'left'?-this.settings.srcImage.width/2:(this.settings.textAlignment == 'right'?this.settings.srcImage.width/2:0),-this.settings.srcImage.height/2);
        this.settings.srcImage.end();
        this.currentText = t;
    }
    updateFlow(){
        this.flowFieldCanvas.begin();
        this.p5.clear();
        this.p5.shader(this.flowFieldShader);
        this.flowFieldShader.setUniform('uClampFloats',true);
        this.flowFieldShader.setUniform('uHighFrequencyNoiseAmplitude',this.settings.highFNoise.active?this.settings.highFNoise.amplitude:0.0);
        this.flowFieldShader.setUniform('uHighFrequencyNoiseScale',this.settings.highFNoise.scale/this.settings.globalScale);
        this.flowFieldShader.setUniform('uLowFrequencyNoiseAmplitude',this.settings.lowFNoise.active?this.settings.lowFNoise.amplitude:0.0);
        this.flowFieldShader.setUniform('uLowFrequencyNoiseScale',this.settings.lowFNoise.scale/this.settings.globalScale);
        this.flowFieldShader.setUniform('uMediumFrequencyNoiseAmplitude',this.settings.mediumFNoise.active?this.settings.mediumFNoise.amplitude:0.0);
        this.flowFieldShader.setUniform('uMediumFrequencyNoiseScale',this.settings.mediumFNoise.scale/this.settings.globalScale);
        this.flowFieldShader.setUniform('uPerlinNoiseAmplitude',this.settings.perlinNoise.active?this.settings.perlinNoise.amplitude:0.0);
        this.flowFieldShader.setUniform('uPerlinNoiseScale',this.settings.perlinNoise.scale/this.settings.globalScale);
        this.flowFieldShader.setUniform('uViewOffset',[this.settings.viewWindow.offset.x/this.settings.canvasWidth,this.settings.viewWindow.offset.y/this.settings.canvasHeight]);
        this.flowFieldShader.setUniform('uNoiseOffset',[this.settings.noiseWindow.offset.x/this.settings.canvasWidth,this.settings.noiseWindow.offset.y/this.settings.canvasHeight]);
        this.p5.rect(-this.flowFieldCanvas.width / 2, -this.flowFieldCanvas.height / 2, this.flowFieldCanvas.width, this.flowFieldCanvas.height);
        this.flowFieldCanvas.end();
    }
    render(){
        if(this.settings.needsToReloadImage){
            this.settings.needsToReloadImage = false;
            if(this.settings.inputType == 'image')
                this.reloadImage();
            else
                this.reloadText();
        }
        if(this.settings.animation.active){
            this.settings.noiseWindow.offset.x += this.settings.animation.xMotion;
            this.settings.noiseWindow.offset.y += this.settings.animation.yMotion;
        }
        this.updateFlow();
        this.p5.clear();
        this.p5.shader(this.outputShader);
        this.outputShader.setUniform('uTargetImage',this.settings.srcImage);
        this.outputShader.setUniform('uCoordinateOverflowStyle',(this.settings.imageCoordinateOverflow == 'extending')?0:((this.settings.imageCoordinateOverflow == 'tiling')?1:2));
        this.outputShader.setUniform('uInputType',(this.settings.inputType == 'text')?0:1);
        this.outputShader.setUniform('uTextColor',this.settings.fontColor);
        
        //scaling to keep the image in proportion when the canvas is at a different aspect ratio
        const proportionScale = {
            x:this.settings.srcImage.width/this.settings.mainCanvas.width * 400.0/this.settings.fontSize,
            y:this.settings.srcImage.height/this.settings.mainCanvas.height * 400.0/this.settings.fontSize
        };
        this.outputShader.setUniform('uImageScale',[this.settings.imageScale*proportionScale.x*this.settings.globalScale,this.settings.imageScale*proportionScale.y*this.settings.globalScale]);
        this.outputShader.setUniform('uFlowTexture',this.flowFieldCanvas);
        this.outputShader.setUniform('uBackgroundStyle',this.settings.backgroundStyle);
        this.outputShader.setUniform('uUseBackgroundImage',this.settings.useBackgroundImage);
        this.outputShader.setUniform('uBackgroundColor',this.settings.backgroundColor);
        this.outputShader.setUniform('uBackgroundImage',this.settings.backgroundImage);
        this.outputShader.setUniform('uGridSize',this.settings.gridSize);
        this.outputShader.setUniform('uGridColor',this.settings.gridColor);
        this.outputShader.setUniform('uGridThickness',this.settings.gridThickness);
        this.outputShader.setUniform('uBlurGridIntensity',this.settings.blurGridIntensity);
        this.outputShader.setUniform('uViewOffset',[this.settings.viewWindow.offset.x/this.settings.canvasWidth,this.settings.viewWindow.offset.y/this.settings.canvasHeight]);
        this.p5.quad(1,1,-1,1,-1,-1,1,-1);
        // this.p5.quad(1,1,1,-1,-1,-1,-1,1);
        this.p5.resetShader();
    }
    createFlowFieldShader(){
        const shaderSource = {
            vertexShader: ``+glsl`#version 300 es
            precision highp float;

            //screen position attribute
            in vec3 aPosition;
            //screen position varying that gets passed to the fragment shader
            out vec2 vPosition;

            void main(){
                vPosition = vec2(aPosition.x,aPosition.y);
                gl_Position = vec4(aPosition*2.0-1.0,1.0);
            }
            `,

            //stole the noise algos from: https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83
            fragmentShader:``+glsl`#version 300 es
            precision highp float;

            uniform vec2 uNoiseOffset;
            uniform vec2 uViewOffset;
            uniform float uLowFrequencyNoiseAmplitude;
            uniform float uLowFrequencyNoiseScale;
            uniform float uMediumFrequencyNoiseScale;
            uniform float uMediumFrequencyNoiseAmplitude;
            uniform float uHighFrequencyNoiseAmplitude;
            uniform float uHighFrequencyNoiseScale;
            uniform float uPerlinNoiseAmplitude;
            uniform float uPerlinNoiseScale;

            uniform bool uClampFloats;

            in vec2 vPosition;
            out vec4 fragColor;`+this.settings.noiseAlgorithms[this.settings.activeNoiseAlgorithm]+glsl`
            float perlinRand(vec2 c){
                return fract(sin(dot(c.xy ,vec2(12.9898,78.233))) * 43758.5453);
            }

            float _noise(vec2 p, float freq ){
                float PI = 3.14159265358979323846;
                float screenWidth = 1.0;
                float unit = screenWidth/freq;
                vec2 ij = floor(p/unit);
                vec2 xy = mod(p,unit)/unit;
                //xy = 3.*xy*xy-2.*xy*xy*xy;
                xy = .5*(1.-cos(PI*xy));
                float a = perlinRand((ij+vec2(0.,0.)));
                float b = perlinRand((ij+vec2(1.,0.)));
                float c = perlinRand((ij+vec2(0.,1.)));
                float d = perlinRand((ij+vec2(1.,1.)));
                float x1 = mix(a, b, xy.x);
                float x2 = mix(c, d, xy.x);
                return mix(x1, x2, xy.y);
            }

            float perlinNoise(vec2 p){
                //this matters a lot!
                int res = 6;
                float persistance = 0.5;
                float n = 0.;
                float normK = 0.;
                float f = 4.;
                float amp = 1.0;
                int iCount = 0;
                for (int i = 0; i<50; i++){
                    n+=amp*_noise(p, f);
                    f*=2.;
                    normK+=amp;
                    amp*=persistance;
                    if (iCount == res) break;
                    iCount++;
                }
                float nf = n/normK;
                return uPerlinNoiseAmplitude*(nf*nf*nf*nf);
            }
            void main() {
                float r =   ((uLowFrequencyNoiseAmplitude>0.0)?(uLowFrequencyNoiseAmplitude * (noise(vPosition*uLowFrequencyNoiseScale + uNoiseOffset) - 0.5)):0.0)+ 
                            ((uMediumFrequencyNoiseAmplitude>0.0)?(uMediumFrequencyNoiseAmplitude * (noise(vPosition*uMediumFrequencyNoiseScale + uNoiseOffset) - 0.5)):0.0) + 
                            ((uHighFrequencyNoiseAmplitude>0.0)?(uHighFrequencyNoiseAmplitude * (noise(vPosition*uHighFrequencyNoiseScale + uNoiseOffset) - 0.5)):0.0) +
                            ((uPerlinNoiseAmplitude>0.0)?perlinNoise(vPosition*uPerlinNoiseScale + uNoiseOffset):0.0);
                float g =   ((uLowFrequencyNoiseAmplitude>0.0)?(uLowFrequencyNoiseAmplitude * (noise(vPosition.yx*uLowFrequencyNoiseScale + uNoiseOffset) - 0.5)):0.0)+ 
                            ((uMediumFrequencyNoiseAmplitude>0.0)?(uMediumFrequencyNoiseAmplitude * (noise(vPosition.yx*uMediumFrequencyNoiseScale + uNoiseOffset) - 0.5)):0.0) + 
                            ((uHighFrequencyNoiseAmplitude>0.0)?(uHighFrequencyNoiseAmplitude * (noise(vPosition.yx*uHighFrequencyNoiseScale + uNoiseOffset) - 0.5)):0.0) +
                            ((uPerlinNoiseAmplitude>0.0)?perlinNoise(vPosition.yx*uPerlinNoiseScale + uNoiseOffset):0.0);
                fragColor = vec4(r,g,1.0,1.0);
            }
            `
        }
        return this.p5.createShader(shaderSource.vertexShader, shaderSource.fragmentShader);
    }
    createOutputShader(){
        const shaderSource = {
            vertexShader:``+glsl`#version 300 es
            precision highp float;
            precision highp sampler2D;

            //screen position attribute
            in vec3 aPosition;
            //screen position varying that gets passed to the fragment shader
            out vec2 vPosition;

            void main(){
                vPosition = vec2(aPosition.x,1.0 - aPosition.y);
                // vPosition = vec2(aPosition.x,aPosition.y);
                gl_Position = vec4(aPosition*2.0-1.0,1.0);
            }
            `,
            fragmentShader:``+glsl`#version 300 es
            precision highp float;
            precision highp sampler2D;

            in vec2 vPosition;
            uniform sampler2D uFlowTexture;
            uniform sampler2D uTargetImage;
            uniform sampler2D uBackgroundImage;
            uniform vec2 uViewOffset;

            uniform bool uUseBackgroundImage;
            
            //value to scale the image by
            uniform vec2 uImageScale;
            uniform float uGridSize;
            uniform float uGridThickness;
            uniform vec3 uGridColor;
            uniform float uBlurGridIntensity;
            uniform vec3 uBackgroundColor;
            //image or text
            uniform int uInputType;
            uniform vec3 uTextColor;

            //0 is clear, 1 is solid color, 2 is grid
            uniform int uBackgroundStyle;
            //0 is repeat, 1 is wrap, 2 is fill w/ transparency
            uniform int uCoordinateOverflowStyle;

            out vec4 fragColor;

            void main() {
                vec2 sampleCoordinates = texture(uFlowTexture,vPosition).xy - 0.5 + uViewOffset;
                vec2 warpedCoordinates = vPosition + sampleCoordinates;
                vec2 adjustedCoordinates = (warpedCoordinates - 0.5)/(uImageScale) + 0.5;
                bool skipImage = false;
                switch(uCoordinateOverflowStyle){
                    //extend
                    case 0:
                        break;
                    //wrap
                    case 1:
                        while(adjustedCoordinates.x > 1.0){
                            adjustedCoordinates.x -= 1.0;
                        }
                        while(adjustedCoordinates.x < 0.0){
                            adjustedCoordinates.x += 1.0;
                        }
                        while(adjustedCoordinates.y > 1.0){
                            adjustedCoordinates.y -= 1.0;
                        }
                        while(adjustedCoordinates.y < 0.0){
                            adjustedCoordinates.y += 1.0;
                        }
                        break;
                    //fill w/ BG
                    case 2:
                        if(adjustedCoordinates.x > 1.0 || adjustedCoordinates.y > 1.0 || adjustedCoordinates.x < 0.0 || adjustedCoordinates.y < 0.0){
                            skipImage = true;
                        }
                }

                //check if it's on a grid coordinate
                float alpha = max(max(1.0 / uGridSize - mod(warpedCoordinates.x,1.0/uGridSize),mod(warpedCoordinates.x,1.0/uGridSize)),max(1.0 / uGridSize - mod(warpedCoordinates.y,1.0/uGridSize),mod(warpedCoordinates.y,1.0/uGridSize)));
                vec4 gridColor = vec4(0.0,0.0,1.0,1.0);
                vec4 imageColor;
                if(!skipImage){
                    //text
                    imageColor = texture(uTargetImage,adjustedCoordinates);
                    //if it's text
                    if(uInputType == 0 && imageColor.a > 0.0){
                        imageColor = vec4(uTextColor,imageColor.a);
                    }
                }
                
                //clear background
                if(uBackgroundStyle == 0){
                    //image
                    if(uInputType == 1){
                        fragColor = imageColor;
                    }
                    //text
                    else if(imageColor.a != 0.0){
                        fragColor = imageColor;
                    }
                    else{
                        discard;
                    }
                }
                //solid color
                else if(uBackgroundStyle == 1){
                    fragColor = vec4(uBackgroundColor,1.0)*(1.0 - imageColor.a) + (vec4(imageColor.rgb,1.0)*imageColor.a);
                }
                //image
                else if(uBackgroundStyle == 2){
                    fragColor = texture(uBackgroundImage,vPosition)*(1.0 - imageColor.a) + (vec4(imageColor.rgb,1.0)*imageColor.a);
                }
                //grid
                else if(uBackgroundStyle == 3){
                    vec3 gridColor = uGridColor;
                    if(alpha < (1.0 / uGridSize - uGridThickness)){
                        gridColor = uBackgroundColor;
                    }
                    fragColor = vec4(gridColor,1.0)*(1.0 - imageColor.a) + (vec4(imageColor.rgb,1.0)*imageColor.a);
                }
                //blur
                else if(uBackgroundStyle == 4){
                    vec4 blurColor = mix(vec4(uGridColor,1.0),vec4(uBackgroundColor,1.0),1.0 - (alpha * uBlurGridIntensity));
                    fragColor = vec4(blurColor.rgb,1.0)*(1.0 - imageColor.a) + (vec4(imageColor.rgb,1.0)*imageColor.a);
                }
            }
            `
        }
        return this.p5.createShader(shaderSource.vertexShader, shaderSource.fragmentShader);
    }
}

export default FlowCanvas