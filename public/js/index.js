(()=>{class g{constructor(t){this.canvas=null,this.gl=null,this.clock={oldTime:0,isRunning:!1},this.init(t)}createShader(t,r){if(!this.gl)throw new Error("webgl not initialized");if(r!=="vertex"&&r!=="fragment")throw new Error("invalid shader type");const e=this.gl,i=r==="vertex"?e.VERTEX_SHADER:e.FRAGMENT_SHADER,n=e.createShader(i);return e.shaderSource(n,t),e.compileShader(n),e.getShaderParameter(n,e.COMPILE_STATUS)?n:(alert(e.getShaderInfoLog(n)),null)}createProgram(t,r){if(!this.gl)throw new Error("webgl not initialized");const e=this.gl,i=e.createProgram();return e.attachShader(i,t),e.attachShader(i,r),e.linkProgram(i),e.getProgramParameter(i,e.LINK_STATUS)?(e.useProgram(i),i):(alert(e.getProgramInfoLog(i)),null)}createVbo(t,r){if(!this.gl)throw new Error("webgl not initialized");const e=this.gl,i=r||e.STATIC_DRAW,n=e.createBuffer();return e.bindBuffer(e.ARRAY_BUFFER,n),e.bufferData(e.ARRAY_BUFFER,t,i),e.bindBuffer(e.ARRAY_BUFFER,null),n}createIbo(t){if(!this.gl)throw new Error("webgl not initialized");const r=this.gl,e=r.createBuffer();return r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,e),r.bufferData(r.ELEMENT_ARRAY_BUFFER,new Int16Array(t),r.STATIC_DRAW),r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,null),e}setAttribute(t,r,e,i){if(!this.gl)throw new Error("webgl not initialized");const n=this.gl;t.forEach((a,o)=>{n.bindBuffer(n.ARRAY_BUFFER,a),n.enableVertexAttribArray(r[o]),n.vertexAttribPointer(r[o],e[o],n.FLOAT,!1,0,0)}),i&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,i)}setUniform(t,r,e){if(!this.gl)throw new Error("webgl not initialized");const i=this.gl;t.forEach((n,a)=>{const o=e[a];o.includes("Matrix")===!0?i[o](r[a],!1,n):i[o](r[a],n)})}getDeltaTime(){const t=this.clock;if(!t.isRunning)return t.isRunning=!0,t.oldTime=performance.now(),0;const r=performance.now(),e=(r-t.oldTime)/1e3;return t.oldTime=r,e}getWebGLExtensions(){if(!this.gl)throw new Error("webgl not initialized");const t=this.gl;return{elementIndexUint:t.getExtension("OES_element_index_uint"),textureFloat:t.getExtension("OES_texture_float"),textureHalfFloat:t.getExtension("OES_texture_half_float"),instancing:t.getExtension("ANGLE_instanced_arrays")}}init(t){if(t instanceof HTMLCanvasElement)this.canvas=t;else if(Object.prototype.toString.call(t)==="[object String]"){const r=document.querySelector(t);r instanceof HTMLCanvasElement&&(this.canvas=r)}if(!this.canvas)throw new Error("invalid argument");if(this.gl=this.canvas.getContext("webgl"),!this.gl)throw new Error("webgl not supported")}}var f=`precision highp float;
attribute vec2 circlePoint;
attribute float theta;
varying vec3 vColor;
uniform vec2 resolution;
uniform float time;
const float PI = 3.1415926535;

float random (in vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main () {
    float aspectRatio = resolution.y / resolution.x;
    vec2 aspect = resolution.y < resolution.x ? vec2(aspectRatio, 1.) : vec2(1., 1./aspectRatio ) ;

    // Use lots of sines and cosines to place the circles
    vec2 circleCenter = vec2(cos(theta), sin(theta))
    * (0.6 + 0.2 * cos(theta * 6.0 + cos(theta * 8.0 + time)));

    // Modulate the circle sizes around the circle and in time
    float rnd = random(circlePoint.xy * theta) ;
    float circleSize = 0.2 + 0.12  * cos(theta * 9.0  - time * 0.5);

    vec2 xy = (circleCenter + circlePoint * circleSize) * aspect;

    // Define some pretty colors
    float th = 8.0 * theta + time * 0.5;
    vColor = 0.6 + 0.2 * vec3(
    cos(th),
    cos(th - PI / 3.0),
    cos(th - PI * 2.0 / 3.0)
    ) + 0.2 * rnd;


    gl_Position = vec4(xy, 0.0, 1.0);
}
`,u=`precision highp float;
varying vec3 vColor;
uniform float alpha;
uniform float time;

void main () {
  gl_FragColor = vec4(vColor, alpha);
}
`;const m=3,c=3e3;class A{constructor(){this.webGLUtils=new g(".canvas"),this.canvas=this.webGLUtils.canvas,this.gl=this.webGLUtils.gl;const{instancing:t}=this.webGLUtils.getWebGLExtensions();this.gl_ext=t,this.program=null,this.time=0,this.uniLocation=[],this.uniType=[],this.init()}createProgram(){const t=this.webGLUtils,r=t.createShader(f,"vertex"),e=t.createShader(u,"fragment"),i=t.createProgram(r,e);return i}setAttributes(){const t=this.gl,r=this.webGLUtils,e=Array.from(Array(m).keys()).map(l=>{var s=Math.PI*2*l/m;return[Math.cos(s),Math.sin(s)]}),i=Array.from(Array(c).keys()).map(l=>l/c*2*Math.PI),n=[r.createVbo(new Float32Array(e.flat())),r.createVbo(new Float32Array(i))],a=[t.getAttribLocation(this.program,"circlePoint"),t.getAttribLocation(this.program,"theta")],o=[e[0].length,1],d=n.length-1;n.forEach((l,s)=>{const h=a[s],b=o[s];t.bindBuffer(t.ARRAY_BUFFER,l),t.enableVertexAttribArray(h),t.vertexAttribPointer(h,b,t.FLOAT,!1,0,0),s===d&&this.gl_ext.vertexAttribDivisorANGLE(h,1)})}setUniforms(){const t=this.gl,r=this.webGLUtils;this.uniLocation=[t.getUniformLocation(this.program,"time"),t.getUniformLocation(this.program,"alpha"),t.getUniformLocation(this.program,"resolution")];const e=["uniform1f","uniform1f","uniform2fv"];r.setUniform([[this.time],[Math.max(0,Math.min(1,.15*2e3/c))],[window.innerWidth,window.innerHeight]],this.uniLocation,e)}setData(){this.setAttributes(),this.setUniforms()}setCanvasSize(){const t=this.gl,r=window.innerWidth,e=window.innerHeight;this.canvas.width=r,this.canvas.height=e,t.viewport(0,0,this.canvas.width,this.canvas.height)}setup(){const t=this.gl;if(t.clearColor(.1,.1,.1,1),t.enable(t.BLEND),t.blendFunc(t.SRC_ALPHA,t.ONE_MINUS_SRC_ALPHA),this.setCanvasSize(),this.program=this.createProgram(),!this.program)throw new Error("program object is not found");t.useProgram(this.program),this.setData()}resize(){console.log("resize");const t=this.gl,r=this.uniLocation[2];t.uniform2fv(r,[window.innerWidth,window.innerHeight]),this.setCanvasSize()}bind(){window.addEventListener("resize",this.resize.bind(this))}render(){const t=this.gl,r=this.webGLUtils,e=r.getDeltaTime();this.time+=e,console.log(this.time),t.clear(t.COLOR_BUFFER_BIT);const i=this.uniLocation[0];t.uniform1f(i,this.time),this.gl_ext.drawArraysInstancedANGLE(t.LINE_LOOP,0,m,c)}animate(){this.render(),requestAnimationFrame(this.animate.bind(this))}init(){this.setup(),this.bind(),this.animate()}}new A;})();
