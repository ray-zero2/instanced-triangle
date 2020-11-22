import WebGLUtils from './modules/webgl/WebGLUtils';
import vertexShaderSource from './shaders/vertex.vert';
import fragmentShaderSource from './shaders/fragment.frag';

const CIRCLE_DIVISION = 3;
const CIRCLE_INSTANCE_NUM = 3000;
class Index {
  constructor() {
    this.webGLUtils = new WebGLUtils('.canvas');
    this.canvas = this.webGLUtils.canvas;
    this.gl = this.webGLUtils.gl;
    const { instancing } = this.webGLUtils.getWebGLExtensions();

    this.gl_ext = instancing;
    this.program = null;

    this.time = 0;

    this.uniLocation = [];
    this.uniType = [];

    this.init();
  }

  createProgram() {
    const utils = this.webGLUtils;
    const vertexShader = utils.createShader(vertexShaderSource, 'vertex');
    const fragmentShader = utils.createShader(fragmentShaderSource, 'fragment');
    const program = utils.createProgram(vertexShader, fragmentShader);
    return program;
  }

  setAttributes() {
    const gl = this.gl;
    const utils = this.webGLUtils;
    const circleInstanceGeometry = Array.from(
      Array(CIRCLE_DIVISION).keys()
    ).map(i => {
      var theta = (Math.PI * 2 * i) / CIRCLE_DIVISION;
      return [Math.cos(theta), Math.sin(theta)];
    });
    const instancedTheta = Array.from(Array(CIRCLE_INSTANCE_NUM).keys()).map(
      i => (i / CIRCLE_INSTANCE_NUM) * 2 * Math.PI
    );

    const vbo = [
      utils.createVbo(new Float32Array(circleInstanceGeometry.flat())),
      utils.createVbo(new Float32Array(instancedTheta))
    ];
    const attLocation = [
      gl.getAttribLocation(this.program, 'circlePoint'),
      gl.getAttribLocation(this.program, 'theta')
    ];
    const attStride = [circleInstanceGeometry[0].length, 1];
    const lastIndex = vbo.length - 1;

    vbo.forEach((vbo, index) => {
      const location = attLocation[index];
      const stride = attStride[index];
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, stride, gl.FLOAT, false, 0, 0);
      if (index === lastIndex)
        this.gl_ext.vertexAttribDivisorANGLE(location, 1.0);
    });
  }

  setUniforms() {
    const gl = this.gl;
    const utils = this.webGLUtils;
    this.uniLocation = [
      gl.getUniformLocation(this.program, 'time'),
      gl.getUniformLocation(this.program, 'alpha'),
      gl.getUniformLocation(this.program, 'resolution')
    ];
    const uniType = ['uniform1f', 'uniform1f', 'uniform2fv'];

    utils.setUniform(
      [
        [this.time],
        [Math.max(0, Math.min(1, (0.15 * 2000) / CIRCLE_INSTANCE_NUM))],
        [window.innerWidth, window.innerHeight]
      ],
      this.uniLocation,
      uniType
    );
  }

  setData() {
    this.setAttributes();
    this.setUniforms();
  }

  setCanvasSize() {
    const gl = this.gl;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  setup() {
    const gl = this.gl;
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    this.setCanvasSize();

    this.program = this.createProgram();
    if (!this.program) throw new Error('program object is not found');
    gl.useProgram(this.program);
    this.setData();
  }

  resize() {
    this.setCanvasSize();
  }

  bind() {
    window.addEventListener('resize', this.resize.bind(this));
  }

  render() {
    const gl = this.gl;
    const utils = this.webGLUtils;
    const deltaTime = utils.getDeltaTime();
    this.time += deltaTime;

    gl.clear(gl.COLOR_BUFFER_BIT);

    const uniformTimeLocation = this.uniLocation[0];
    gl['uniform1f'](uniformTimeLocation, this.time);

    this.gl_ext.drawArraysInstancedANGLE(
      gl.LINE_LOOP,
      0,
      CIRCLE_DIVISION,
      CIRCLE_INSTANCE_NUM
    );
  }

  animate() {
    this.render();
    requestAnimationFrame(this.animate.bind(this));
  }

  init() {
    this.setup();
    this.bind();
    this.animate();
  }
}

new Index();
