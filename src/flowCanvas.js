class FlowCanvas{
    constructor(settings){
        this.settings = settings;
        this.currentText = settings.displayText;
    }
    saveImage(){
        this.render();
        console.log(this.settings.mainCanvas);
        let dataURL = this.settings.mainCanvas.elt.toDataURL('image/png');
        let a = document.createElement('a');
        a.href = dataURL;
        a.download = 'liquid.png';
        a.click();
    }
    init(){
        this.p5 = this.settings.p5Inst;
        this.mainCanvas = this.settings.mainCanvas;
        //holds the flow field
        this.flowFieldCanvas = this.p5.createFramebuffer({ width: this.settings.width, height: this.settings.height, textureFiltering: this.p5.NEAREST, format: this.settings.clampNoise?this.p5.UNSIGNED_BYTE:this.p5.FLOAT});
        this.outputCanvas = this.p5.createFramebuffer({ width: this.settings.width, height: this.settings.height, textureFiltering: this.p5.NEAREST, format: this.settings.clampNoise?this.p5.UNSIGNED_BYTE:this.p5.FLOAT});
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
    loadText(t){

        if(t === null || t == ""){
            return;
        }

        //set font settings
        this.p5.textFont(this.settings.font);
        this.p5.fill(0,0,0);
        this.p5.noStroke();
        this.p5.textSize(this.settings.fontSize);
        this.p5.textAlign(this.p5.LEFT,this.p5.TOP);

        const bounds = this.getTextBounds(t,0,0);

        this.settings.srcImage = this.p5.createFramebuffer({ width: bounds.width, height: bounds.height, textureFiltering: this.p5.NEAREST, format: this.settings.clampNoise?this.p5.UNSIGNED_BYTE:this.p5.FLOAT});

        this.settings.srcImage.begin();
        this.p5.clear();
        this.p5.text(t,-bounds.width/2,-bounds.height/2);
        this.settings.srcImage.end();
        this.currentText = t;
    }
    updateFlow(){
        this.flowFieldCanvas.begin();
        this.p5.clear();
        this.p5.shader(this.flowFieldShader);
        this.flowFieldShader.setUniform('uClampFloats',true);
        this.flowFieldShader.setUniform('uHighFrequencyNoiseScale',this.settings.highFNoise.scale);
        this.flowFieldShader.setUniform('uMediumFrequencyNoiseScale',this.settings.mediumFNoise.scale);
        this.flowFieldShader.setUniform('uLowFrequencyNoiseScale',this.settings.lowFNoise.scale);
        this.flowFieldShader.setUniform('uHighFrequencyNoiseAmplitude',this.settings.highFNoise.active?this.settings.highFNoise.amplitude:0.0);
        this.flowFieldShader.setUniform('uMediumFrequencyNoiseAmplitude',this.settings.mediumFNoise.active?this.settings.mediumFNoise.amplitude:0.0);
        this.flowFieldShader.setUniform('uLowFrequencyNoiseAmplitude',this.settings.lowFNoise.active?this.settings.lowFNoise.amplitude:0.0);
        this.flowFieldShader.setUniform('uViewOffset',[this.settings.viewWindow.offset.x/this.settings.width,this.settings.viewWindow.offset.y/this.settings.height]);
        this.flowFieldShader.setUniform('uNoiseOffset',[this.settings.noiseWindow.offset.x/this.settings.width,this.settings.noiseWindow.offset.y/this.settings.height]);
        this.p5.rect(-this.flowFieldCanvas.width / 2, -this.flowFieldCanvas.height / 2, this.flowFieldCanvas.width, this.flowFieldCanvas.height);
        this.flowFieldCanvas.end();
    }
    render(){
        this.updateFlow();
        this.outputCanvas.begin();
        this.p5.clear();
        this.p5.shader(this.outputShader);
        this.outputShader.setUniform('uTargetImage',this.settings.srcImage);
        this.outputShader.setUniform('uImageProportionFactor',[this.settings.mainCanvas.height/this.settings.mainCanvas.width,this.settings.srcImage.height/this.settings.srcImage.width]);
        this.outputShader.setUniform('uCoordinateOverflowStyle',(this.settings.imageCoordinateOverflow == 'extend')?0:((this.settings.imageCoordinateOverflow == 'tile')?1:2));
        this.outputShader.setUniform('uInputType',(this.settings.inputType == 'text')?0:1);
        this.outputShader.setUniform('uTextColor',this.settings.fontColor);
        this.outputShader.setUniform('uImageScale',this.settings.imageScale);
        this.outputShader.setUniform('uFlowTexture',this.flowFieldCanvas);
        this.outputShader.setUniform('uBackgroundStyle',this.settings.backgroundStyle);
        this.outputShader.setUniform('uBackgroundColor',this.settings.backgroundColor);
        this.outputShader.setUniform('uGridSize',this.settings.gridSize);
        this.outputShader.setUniform('uGridColor',this.settings.gridColor);
        this.outputShader.setUniform('uGridThickness',this.settings.gridThickness);
        this.outputShader.setUniform('uBlurGridIntensity',this.settings.blurGridIntensity);
        this.outputShader.setUniform('uViewOffset',[this.settings.viewWindow.offset.x/this.settings.width,this.settings.viewWindow.offset.y/this.settings.height]);
        this.outputShader.setUniform('uWarpAmount',this.settings.globalNoise.amplitude);
        this.p5.rect(-this.outputCanvas.width / 2, -this.outputCanvas.height / 2, this.outputCanvas.width, this.outputCanvas.height);
        this.outputCanvas.end();
        this.p5.clear();
        this.p5.image(this.outputCanvas,-this.mainCanvas.width/2,-this.mainCanvas.height/2,this.mainCanvas.width,this.mainCanvas.height);
    }
    createFlowFieldShader(p5){
        const glsl = x => x;

        const shaderSource = {
            vertexShader: `#version 300 es
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
            fragmentShader:`#version 300 es
            precision highp float;

            uniform vec2 uNoiseOffset;
            uniform vec2 uViewOffset;
            uniform float uLowFrequencyNoiseAmplitude;
            uniform float uLowFrequencyNoiseScale;
            uniform float uMediumFrequencyNoiseScale;
            uniform float uMediumFrequencyNoiseAmplitude;
            uniform float uHighFrequencyNoiseAmplitude;
            uniform float uHighFrequencyNoiseScale;

            uniform bool uClampFloats;

            in vec2 vPosition;
            out vec4 fragColor;

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

                // Simple 2D lerp using smoothstep envelope between the values.
                // return vec3(mix(mix(a, b, smoothstep(0.0, 1.0, f.x)),
                //			mix(c, d, smoothstep(0.0, 1.0, f.x)),
                //			smoothstep(0.0, 1.0, f.y)));

                // Same code, with the clamps in smoothstep and common subexpressions
                // optimized away.
                vec2 u = f * f * (3.0 - 2.0 * f);
                float val = mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
                return val;
            }
            void main() {
                float r =   uLowFrequencyNoiseAmplitude * (noise(vPosition*uLowFrequencyNoiseScale + uNoiseOffset) - 0.5)+ 
                            uMediumFrequencyNoiseAmplitude * (noise(vPosition*uMediumFrequencyNoiseScale + uNoiseOffset) - 0.5) + 
                            uHighFrequencyNoiseAmplitude * (noise(vPosition*uHighFrequencyNoiseScale + uNoiseOffset) - 0.5);
                float g =   uLowFrequencyNoiseAmplitude * (noise(vPosition.yx*uLowFrequencyNoiseScale + uNoiseOffset.yx) - 0.5) + 
                            uMediumFrequencyNoiseAmplitude * (noise(vPosition.yx*uMediumFrequencyNoiseScale + uNoiseOffset.yx) - 0.5) +
                            uHighFrequencyNoiseAmplitude * (noise(vPosition.yx*uHighFrequencyNoiseScale + uNoiseOffset.yx) - 0.5);
                fragColor = vec4(r,g,r*g,1.0);
            }
            `
        }
        return p5.createShader(shaderSource.vertexShader, shaderSource.fragmentShader);
    }
    createOutputShader(){
        const shaderSource = {
            vertexShader:`#version 300 es
            precision highp float;
            precision highp sampler2D;

            //screen position attribute
            in vec3 aPosition;
            //screen position varying that gets passed to the fragment shader
            out vec2 vPosition;

            void main(){
                vPosition = vec2(aPosition.x,aPosition.y);
                gl_Position = vec4(aPosition*2.0-1.0,1.0);
            }
            `,
            fragmentShader:`#version 300 es
            precision highp float;
            precision highp sampler2D;

            in vec2 vPosition;
            uniform sampler2D uFlowTexture;
            uniform sampler2D uTargetImage;
            uniform vec2 uImageProportionFactor;
            uniform float uWarpAmount;
            uniform vec2 uViewOffset;
            
            //value to scale the image by
            uniform float uImageScale;
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
                vec4 sampleCoordinates = texture(uFlowTexture,vPosition) - 0.5 + vec4(uViewOffset,1.0,1.0);
                vec2 warpedCoordinates = vPosition+sampleCoordinates.xy * uWarpAmount;
                //centering the coordinates
                float aR = uImageProportionFactor.x/uImageProportionFactor.y;
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
                    //fill w/ transparency
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
                    if(uInputType == 1){
                        fragColor = imageColor;
                    }
                    else if(imageColor.a != 0.0 && !(imageColor.r >= 0.9 && imageColor.g >= 0.9 && imageColor.b >= 0.9)){
                        fragColor = imageColor;
                    }
                    else{
                        discard;
                    }
                }
                //solid color
                else if(uBackgroundStyle == 1){
                    fragColor = vec4(uBackgroundColor,1.0)*(1.0 - imageColor.a) + imageColor;
                }
                //grid
                else if(uBackgroundStyle == 2){
                    if(imageColor.a != 0.0){
                        fragColor = vec4(uBackgroundColor,1.0)*(1.0 - imageColor.a) + imageColor;
                    }
                    else{
                        if(alpha < (1.0 / uGridSize - uGridThickness)){
                            fragColor = vec4(uBackgroundColor,1.0)*(1.0 - imageColor.a) + imageColor;
                        }
                        else{
                            fragColor = vec4(uGridColor,1.0)*(1.0 - imageColor.a) + imageColor;
                        }
                    }
                }
                //blur
                else if(uBackgroundStyle == 3){
                    if(imageColor.a != 0.0){
                        fragColor = vec4(uBackgroundColor,1.0)*(1.0 - imageColor.a) + imageColor;
                    }
                    else{
                        fragColor = mix(vec4(uGridColor,1.0),vec4(uBackgroundColor,1.0),1.0 - (alpha * uBlurGridIntensity));
                    }
                }
            }
            `
        }
        return this.p5.createShader(shaderSource.vertexShader, shaderSource.fragmentShader);
    }
}

export default FlowCanvas