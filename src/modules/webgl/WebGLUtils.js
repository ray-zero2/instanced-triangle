export default class WebGLUtils {
  constructor(canvas) {
    this.canvas = null;
    this.gl = null;

    this.clock = {
      oldTime: 0,
      isRunning: false
    };

    this.init(canvas);
  }

  /**
   * シェーダオブジェクトを生成して返す。
   * @param {string} source - ソースコード
   * @param {'vertex'|'fragment'} type - gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
   * @return {WebGLShader} シェーダオブジェクト
   */
  createShader(source, type) {
    if (!this.gl) throw new Error('webgl not initialized');
    if (type !== 'vertex' && type !== 'fragment')
      throw new Error('invalid shader type');

    const gl = this.gl;
    const shaderType =
      type === 'vertex' ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER;
    const shader = gl.createShader(shaderType);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      return shader;
    } else {
      alert(gl.getShaderInfoLog(shader));
      return null;
    }
  }

  /**
   * プログラムオブジェクトを生成して返す。
   * @param {WebGLShader} vs - 頂点シェーダオブジェクト
   * @param {WebGLShader} fs - フラグメントシェーダオブジェクト
   * @return {WebGLProgram} プログラムオブジェクト
   */
  createProgram(vs, fs) {
    if (!this.gl) throw new Error('webgl not initialized');

    const gl = this.gl;
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.useProgram(program);
      return program;
    } else {
      alert(gl.getProgramInfoLog(program));
      return null;
    }
  }

  /**
   * VBO を生成して返す。
   * @param {Float32Array | Int16Array} data - 頂点属性データを格納した配列
   * @param {number} usage - vboのデータストア用途を指定. gl_STATIC_DRAW or gl.DYNAMIC_DRAW or gl.STREAM_DRAW
   * @return {WebGLBuffer} VBO
   */
  createVbo(data, usage) {
    if (!this.gl) throw new Error('webgl not initialized');
    const gl = this.gl;
    const type = usage || gl.STATIC_DRAW;
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, data, type);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    return vbo;
  }

  /**
   * IBO を生成して返す。
   * @param {Array} data - インデックスデータを格納した配列
   * @return {WebGLBuffer} IBO
   */
  createIbo(data) {
    if (!this.gl) throw new Error('webgl not initialized');

    const gl = this.gl;
    const ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Int16Array(data),
      gl.STATIC_DRAW
    );
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    return ibo;
  }

  /**
   * VBO を IBO をバインドし有効化する。
   * @param {Array} vbo - VBO を格納した配列
   * @param {Array} attL - attribute location を格納した配列
   * @param {Array} attS - attribute stride を格納した配列
   * @param {WebGLBuffer} ibo - IBO
   */
  setAttribute(vbo, attL, attS, ibo) {
    if (!this.gl) throw new Error('webgl not initialized');

    const gl = this.gl;
    vbo.forEach((v, index) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, v);
      gl.enableVertexAttribArray(attL[index]);
      gl.vertexAttribPointer(attL[index], attS[index], gl.FLOAT, false, 0, 0);
    });
    if (ibo) gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  }

  /**
   * uniform 変数をまとめてシェーダに送る。
   * @param {Array} value - 各変数の値
   * @param {Array} uniL - uniform location を格納した配列
   * @param {Array} uniT - uniform 変数のタイプを格納した配列
   */
  setUniform(value, uniL, uniT) {
    if (!this.gl) throw new Error('webgl not initialized');

    const gl = this.gl;
    value.forEach((v, index) => {
      const type = uniT[index];
      if (type.includes('Matrix') === true) {
        gl[type](uniL[index], false, v);
      } else {
        gl[type](uniL[index], v);
      }
    });
  }

  /**
   * 前回のrender実行から今回の実行までの時間を返す
   * @return {number} 前回のレンダリングからの経過時間
   */
  getDeltaTime() {
    const clock = this.clock;

    if (!clock.isRunning) {
      clock.isRunning = true;
      clock.oldTime = performance.now();
      return 0;
    }

    const newTime = performance.now();
    const deltaTime = (newTime - clock.oldTime) / 1000;
    clock.oldTime = newTime;

    return deltaTime;
  }

  /**
   * 主要な WebGL の拡張機能を取得する。
   * @return {object} 取得した拡張機能
   * @property {object} elementIndexUint - Uint32 フォーマットを利用できるようにする
   * @property {object} textureFloat - フロートテクスチャを利用できるようにする
   * @property {object} textureHalfFloat - ハーフフロートテクスチャを利用できるようにする
   * @property {object} instancing - インスタンシングを利用できるようにする
   */
  getWebGLExtensions() {
    if (!this.gl) throw new Error('webgl not initialized');

    const gl = this.gl;
    return {
      elementIndexUint: gl.getExtension('OES_element_index_uint'),
      textureFloat: gl.getExtension('OES_texture_float'),
      textureHalfFloat: gl.getExtension('OES_texture_half_float'),
      instancing: gl.getExtension('ANGLE_instanced_arrays')
    };
  }

  /**
   * 初期化: canvas要素からwebglコンテキストを取得する
   * @param {HTMLCanvasElement|string} canvas WebGLを使用するキャンバス要素もしくはそのセレクター
   */
  init(canvas) {
    if (canvas instanceof HTMLCanvasElement) {
      this.canvas = canvas;
    } else if (Object.prototype.toString.call(canvas) === '[object String]') {
      const canvasElement = document.querySelector(canvas);
      if (canvasElement instanceof HTMLCanvasElement)
        this.canvas = canvasElement;
    }

    if (!this.canvas) throw new Error('invalid argument');

    this.gl = this.canvas.getContext('webgl');
    if (!this.gl) throw new Error('webgl not supported');
  }
}
