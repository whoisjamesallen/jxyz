var CLEAR_COLOR = [0.0, 0.0, 0.0, 1.0];
var GEOMETRY_ORIGIN = [-1000.0, -1000.0];
var GEOMETRY_SIZE = 2000;

var SIZE_OF_FLOAT = 4;
var VERT_STRIDE = 7;
var TEXCOORD_OFFSET = 3;
var OCEANCOORD_OFFSET = 5;

var TEXTURE_COORDINATES_UNIT = 1;
var OCEAN_COORDINATES_UNIT = 2;

var SLICES_TEXTURE_UNIT = 0;
var NOISE_TEXTURE_UNIT = 1;

var FOV = (60 / 180) * Math.PI,
    NEAR = 1,
    FAR = 10000,
    MIN_ASPECT = 16 / 9;
    
var NONE = 0,
    ORBITING = 1;

var CAMERA_DISTANCE = 1600;

var addToVector = function (out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    return out;
};

var subtractFromVector = function (out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    return out;
};

var multiplyVectorByScalar = function (out, v, k) {
    out[0] = v[0] * k;
    out[1] = v[1] * k;
    out[2] = v[2] * k;
    return out;
};

var makeIdentityMatrix = function (matrix) {
    matrix[0] = 1.0;
    matrix[1] = 0.0;
    matrix[2] = 0.0;
    matrix[3] = 0.0;
    matrix[4] = 0.0;
    matrix[5] = 1.0;
    matrix[6] = 0.0;
    matrix[7] = 0.0;
    matrix[8] = 0.0;
    matrix[9] = 0.0;
    matrix[10] = 1.0;
    matrix[11] = 0.0;
    matrix[12] = 0.0;
    matrix[13] = 0.0;
    matrix[14] = 0.0;
    matrix[15] = 1.0;
    return matrix;
};

var makeXRotationMatrix = function (matrix, angle) {
    matrix[0] = 1.0;
    matrix[1] = 0.0;
    matrix[2] = 0.0;
    matrix[3] = 0.0;
    matrix[4] = 0.0;
    matrix[5] = Math.cos(angle);
    matrix[6] = Math.sin(angle);
    matrix[7] = 0.0;
    matrix[8] = 0.0;
    matrix[9] = -Math.sin(angle);
    matrix[10] = Math.cos(angle);
    matrix[11] = 0.0;
    matrix[12] = 0.0;
    matrix[13] = 0.0;
    matrix[14] = 0.0;
    matrix[15] = 1.0;
    return matrix;
};

var makeYRotationMatrix = function (matrix, angle) {
    matrix[0] = Math.cos(angle);
    matrix[1] = 0.0;
    matrix[2] = -Math.sin(angle);
    matrix[3] = 0.0;
    matrix[4] = 0.0;
    matrix[5] = 1.0;
    matrix[6] = 0.0;
    matrix[7] = 0.0;
    matrix[8] = Math.sin(angle);
    matrix[9] = 0.0;
    matrix[10] = Math.cos(angle);
    matrix[11] = 0.0;
    matrix[12] = 0.0;
    matrix[13] = 0.0;
    matrix[14] = 0.0;
    matrix[15] = 1.0;
    return matrix;
};

var distanceBetweenVectors = function (a, b) {
    var xDist = b[0] - a[0],
        yDist = b[1] - a[1],
        zDist = b[2] - a[2];
    return Math.sqrt(xDist * xDist + yDist * yDist + zDist * zDist);
};

var lengthOfVector = function (v) {
    var x = v[0], y = v[1], z = v[2];
    return Math.sqrt(x * x + y * y + z * z);
};

var setVector4 = function (out, x, y, z, w) {
    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = w;
    return out;
};

var projectVector4 = function (out, v) {
    var reciprocalW = 1 / v[3];
    out[0] = v[0] * reciprocalW;
    out[1] = v[1] * reciprocalW;
    out[2] = v[2] * reciprocalW;
    return out;
};

var transformVectorByMatrix = function (out, v, m) {
    var x = v[0], y = v[1], z = v[2], w = v[3];
    out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
    out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
    out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
    out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
    return out;
};

var invertMatrix = function (out, m) {
    var m0 = m[0], m4 = m[4], m8 = m[8], m12 = m[12],
        m1 = m[1], m5 = m[5], m9 = m[9], m13 = m[13],
        m2 = m[2], m6 = m[6], m10 = m[10], m14 = m[14],
        m3 = m[3], m7 = m[7], m11 = m[11], m15 = m[15],

        temp0 = m10 * m15,
        temp1 = m14 * m11,
        temp2 = m6 * m15,
        temp3 = m14 * m7,
        temp4 = m6 * m11,
        temp5 = m10 * m7,
        temp6 = m2 * m15,
        temp7 = m14 * m3,
        temp8 = m2 * m11,
        temp9 = m10 * m3,
        temp10 = m2 * m7,
        temp11 = m6 * m3,
        temp12 = m8 * m13,
        temp13 = m12 * m9,
        temp14 = m4 * m13,
        temp15 = m12 * m5,
        temp16 = m4 * m9,
        temp17 = m8 * m5,
        temp18 = m0 * m13,
        temp19 = m12 * m1,
        temp20 = m0 * m9,
        temp21 = m8 * m1,
        temp22 = m0 * m5,
        temp23 = m4 * m1,

        t0 = (temp0 * m5 + temp3 * m9 + temp4 * m13) - (temp1 * m5 + temp2 * m9 + temp5 * m13),
        t1 = (temp1 * m1 + temp6 * m9 + temp9 * m13) - (temp0 * m1 + temp7 * m9 + temp8 * m13),
        t2 = (temp2 * m1 + temp7 * m5 + temp10 * m13) - (temp3 * m1 + temp6 * m5 + temp11 * m13),
        t3 = (temp5 * m1 + temp8 * m5 + temp11 * m9) - (temp4 * m1 + temp9 * m5 + temp10 * m9),

        d = 1.0 / (m0 * t0 + m4 * t1 + m8 * t2 + m12 * t3);
        
    out[0] = d * t0;
    out[1] = d * t1;
    out[2] = d * t2;
    out[3] = d * t3;
    out[4] = d * ((temp1 * m4 + temp2 * m8 + temp5 * m12) - (temp0 * m4 + temp3 * m8 + temp4 * m12));
    out[5] = d * ((temp0 * m0 + temp7 * m8 + temp8 * m12) - (temp1 * m0 + temp6 * m8 + temp9 * m12));
    out[6] = d * ((temp3 * m0 + temp6 * m4 + temp11 * m12) - (temp2 * m0 + temp7 * m4 + temp10 * m12));
    out[7] = d * ((temp4 * m0 + temp9 * m4 + temp10 * m8) - (temp5 * m0 + temp8 * m4 + temp11 * m8));
    out[8] = d * ((temp12 * m7 + temp15 * m11 + temp16 * m15) - (temp13 * m7 + temp14 * m11 + temp17 * m15));
    out[9] = d * ((temp13 * m3 + temp18 * m11 + temp21 * m15) - (temp12 * m3 + temp19 * m11 + temp20 * m15));
    out[10] = d * ((temp14 * m3 + temp19 * m7 + temp22 * m15) - (temp15 * m3 + temp18 * m7 + temp23 * m15));
    out[11] = d * ((temp17 * m3 + temp20 * m7 + temp23 * m11) - (temp16 * m3 + temp21 * m7 + temp22 * m11));
    out[12] = d * ((temp14 * m10 + temp17 * m14 + temp13 * m6) - (temp16 * m14 + temp12 * m6 + temp15 * m10));
    out[13] = d * ((temp20 * m14 + temp12 * m2 + temp19 * m10) - (temp18 * m10 + temp21 * m14 + temp13 * m2));
    out[14] = d * ((temp18 * m6 + temp23 * m14 + temp15 * m2) - (temp22 * m14 + temp14 * m2 + temp19 * m6));
    out[15] = d * ((temp22 * m10 + temp16 * m2 + temp21 * m6) - (temp20 * m6 + temp23 * m10 + temp17 * m2));

    return out;
};

var premultiplyMatrix = function (out, matrixA, matrixB) {
    var b0 = matrixB[0], b4 = matrixB[4], b8 = matrixB[8], b12 = matrixB[12],
        b1 = matrixB[1], b5 = matrixB[5], b9 = matrixB[9], b13 = matrixB[13],
        b2 = matrixB[2], b6 = matrixB[6], b10 = matrixB[10], b14 = matrixB[14],
        b3 = matrixB[3], b7 = matrixB[7], b11 = matrixB[11], b15 = matrixB[15],

        aX = matrixA[0], aY = matrixA[1], aZ = matrixA[2], aW = matrixA[3];
    out[0] = b0 * aX + b4 * aY + b8 * aZ + b12 * aW;
    out[1] = b1 * aX + b5 * aY + b9 * aZ + b13 * aW;
    out[2] = b2 * aX + b6 * aY + b10 * aZ + b14 * aW;
    out[3] = b3 * aX + b7 * aY + b11 * aZ + b15 * aW;

    aX = matrixA[4], aY = matrixA[5], aZ = matrixA[6], aW = matrixA[7];
    out[4] = b0 * aX + b4 * aY + b8 * aZ + b12 * aW;
    out[5] = b1 * aX + b5 * aY + b9 * aZ + b13 * aW;
    out[6] = b2 * aX + b6 * aY + b10 * aZ + b14 * aW;
    out[7] = b3 * aX + b7 * aY + b11 * aZ + b15 * aW;

    aX = matrixA[8], aY = matrixA[9], aZ = matrixA[10], aW = matrixA[11];
    out[8] = b0 * aX + b4 * aY + b8 * aZ + b12 * aW;
    out[9] = b1 * aX + b5 * aY + b9 * aZ + b13 * aW;
    out[10] = b2 * aX + b6 * aY + b10 * aZ + b14 * aW;
    out[11] = b3 * aX + b7 * aY + b11 * aZ + b15 * aW;

    aX = matrixA[12], aY = matrixA[13], aZ = matrixA[14], aW = matrixA[15];
    out[12] = b0 * aX + b4 * aY + b8 * aZ + b12 * aW;
    out[13] = b1 * aX + b5 * aY + b9 * aZ + b13 * aW;
    out[14] = b2 * aX + b6 * aY + b10 * aZ + b14 * aW;
    out[15] = b3 * aX + b7 * aY + b11 * aZ + b15 * aW;

    return out;
};

var makePerspectiveMatrix = function (matrix, fov, aspect, near, far) {
    var f = Math.tan(0.5 * (Math.PI - fov)),
        range = near - far;

    matrix[0] = f / aspect;
    matrix[1] = 0;
    matrix[2] = 0;
    matrix[3] = 0;
    matrix[4] = 0;
    matrix[5] = f;
    matrix[6] = 0;
    matrix[7] = 0;
    matrix[8] = 0;
    matrix[9] = 0;
    matrix[10] = far / range;
    matrix[11] = -1;
    matrix[12] = 0;
    matrix[13] = 0;
    matrix[14] = (near * far) / range;
    matrix[15] = 0.0;

    return matrix;
};

var clamp = function (x, min, max) {
    return Math.min(Math.max(x, min), max);
};

var log2 = function (number) {
    return Math.log(number) / Math.log(2);
};

var hexToRgb = function(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16) / 255.0,
        parseInt(result[2], 16) / 255.0,
        parseInt(result[3], 16) / 255.0
    ] : null;
}
  

var buildProgramWrapper = function (gl, vertexShader, fragmentShader, attributeLocations) {
    var programWrapper = {};

    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    for (var attributeName in attributeLocations) {
        gl.bindAttribLocation(program, attributeLocations[attributeName], attributeName);
    }
    gl.linkProgram(program);
    var uniformLocations = {};
    var numberOfUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (var i = 0; i < numberOfUniforms; i += 1) {
        var activeUniform = gl.getActiveUniform(program, i),
            uniformLocation = gl.getUniformLocation(program, activeUniform.name);
        uniformLocations[activeUniform.name] = uniformLocation;
    }

    programWrapper.program = program;
    programWrapper.uniformLocations = uniformLocations;

    return programWrapper;
};

var buildShader = function (gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
};

var buildTexture = function (gl, unit, format, type, width, height, data, wrapS, wrapT, minFilter, magFilter) {
    var texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, format, width, height, 0, format, type, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);
    return texture;
};

var buildFramebuffer = function (gl, attachment) {
    var framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, attachment, 0);
    return framebuffer;
};

var epsilon = function (x) {
    return Math.abs(x) < 0.000001 ? 0 : x;
};

var toCSSMatrix = function (m) { //flip y to make css and webgl coordinates consistent
    return 'matrix3d(' +
        epsilon(m[0]) + ',' +
        -epsilon(m[1]) + ',' +
        epsilon(m[2]) + ',' +
        epsilon(m[3]) + ',' +
        epsilon(m[4]) + ',' +
        -epsilon(m[5]) + ',' +
        epsilon(m[6]) + ',' +
        epsilon(m[7]) + ',' +
        epsilon(m[8]) + ',' +
        -epsilon(m[9]) + ',' +
        epsilon(m[10]) + ',' +
        epsilon(m[11]) + ',' +
        epsilon(m[12]) + ',' +
        -epsilon(m[13]) + ',' +
        epsilon(m[14]) + ',' +
        epsilon(m[15]) +
    ')';
};

var setPerspective = function (element, value) {
    element.style.WebkitPerspective = value;
    element.style.perspective = value;
};

var setTransformOrigin = function (element, value) {
    element.style.WebkitTransformOrigin = value;
    element.style.transformOrigin = value;
};

var setTransform = function (element, value) {
    element.style.WebkitTransform = value;
    element.style.transform = value;
};

var setText = function (element, value, decimalPlaces) {
    element.textContent = value.toFixed(decimalPlaces);
};

var getMousePosition = function (event, element) {
    var boundingRect = element.getBoundingClientRect();
    return {
        x: event.clientX - boundingRect.left,
        y: event.clientY - boundingRect.top
    };
};

var hasWebGLSupportWithExtensions = function (extensions) {
    var canvas = document.createElement('canvas');
    var gl = null;
    try {
        gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    } catch (e) {
        return false;
    }
    if (gl === null) {
        return false;
    }

    for (var i = 0; i < extensions.length; ++i) {
        if (gl.getExtension(extensions[i]) === null) {
            return false
        }
    }

    return true;
};

var requestAnimationFrame = window.requestAnimationFrame || 
    window.webkitRequestAnimationFrame || 
    window.mozRequestAnimationFrame || window.msRequestAnimationFrame;
    

var Camera = function (guiData) {
    var guiData = guiData;
    var viewMatrix = makeIdentityMatrix(new Float32Array(16));
    var position = new Float32Array(3);

    this.changeAzimuth = function (deltaAzimuth) {
        guiData.camAzimuth += deltaAzimuth;
    };

    this.changeElevation = function (deltaElevation) {
        guiData.camElevation += deltaElevation;
    };

    var orbitTranslationMatrix = makeIdentityMatrix(new Float32Array(16)),
        xRotationMatrix = new Float32Array(16),
        yRotationMatrix = new Float32Array(16),
        distanceTranslationMatrix = makeIdentityMatrix(new Float32Array(16));

    this.getViewMatrix = function () {
    
        makeIdentityMatrix(viewMatrix);

        makeXRotationMatrix(xRotationMatrix, guiData.camElevation);
        makeYRotationMatrix(yRotationMatrix, guiData.camAzimuth);
        distanceTranslationMatrix[14] = -guiData.camDistance;
        orbitTranslationMatrix[12] = guiData.camOffsetX;
        orbitTranslationMatrix[13] = guiData.camOffsetY;
        orbitTranslationMatrix[14] = guiData.camOffsetZ;

        premultiplyMatrix(viewMatrix, viewMatrix, orbitTranslationMatrix);
        premultiplyMatrix(viewMatrix, viewMatrix, yRotationMatrix);
        premultiplyMatrix(viewMatrix, viewMatrix, xRotationMatrix);
        premultiplyMatrix(viewMatrix, viewMatrix, distanceTranslationMatrix);

        position[0] = guiData.camDistance * Math.sin(Math.PI / 2 - guiData.camElevation) * Math.sin(-guiData.camAzimuth);
        position[1] = guiData.camDistance * Math.cos(Math.PI / 2 - guiData.camElevation);
        position[2] = guiData.camDistance * Math.sin(Math.PI / 2 - guiData.camElevation) * Math.cos(-guiData.camAzimuth);

        return viewMatrix;
    };
};

var OCEAN_VERTEX_SOURCE = [
    'precision highp float;',

    'attribute vec3 a_position;',
    'attribute vec2 a_texcoord;',
    'attribute vec2 a_oceancoord;',

    'varying vec3 v_position;',
    'varying vec2 v_texcoord;',
    'varying vec2 v_oceancoord;',
    'varying vec3 v_displacement;',

    'uniform mat4 u_projectionMatrix;',
    'uniform mat4 u_viewMatrix;',

    'uniform float u_time;',
    'uniform float u_size;',
    'uniform float u_geometrySize;',
    'uniform float u_wave_size;',
    'uniform vec3 u_wave_scale;',

    'uniform vec3 u_color_bot;',
    'uniform vec3 u_color_top;',

    'uniform float u_wave_0_direction;',
    'uniform float u_wave_0_frequency;',
    'uniform float u_wave_0_amplitude;',
    'uniform float u_wave_0_steepness;',
    'uniform float u_wave_0_speed;',

    'uniform float u_wave_1_direction;',
    'uniform float u_wave_1_frequency;',
    'uniform float u_wave_1_amplitude;',
    'uniform float u_wave_1_steepness;',
    'uniform float u_wave_1_speed;',

    'uniform float u_wave_2_direction;',
    'uniform float u_wave_2_frequency;',
    'uniform float u_wave_2_amplitude;',
    'uniform float u_wave_2_steepness;',
    'uniform float u_wave_2_speed;',

    'uniform float u_wave_3_direction;',
    'uniform float u_wave_3_frequency;',
    'uniform float u_wave_3_amplitude;',
    'uniform float u_wave_3_steepness;',
    'uniform float u_wave_3_speed;',

    'const float frequencyScale = 0.02;',
    'const float amplitudeScale = 100.0;',
    'const float steepnessScale = 1.0;',

    `vec3 gerstner_wave(vec2 position, vec2 direction, float frequency, float amplitude, float steepness, float speed) {`,

        `float proj = dot(position, direction);`,
        `float theta = proj * frequency + speed;`,
        `float height = amplitude * sin(theta);`,
    
        `float maximum_width = steepness * amplitude;`,
        `float width = maximum_width * cos(theta);`,
    
        `vec3 displacement = vec3(0.0);`,
        `displacement.x = direction.x * width;`,
        `displacement.y = height;`,
        `displacement.z = direction.y * width;`,
    
        `return displacement;`,
    `}`,

    `vec3 wave(vec2 position, float direction, float frequency, float amplitude, float steepness, float speed) {`,
        
        'float angle = direction * 3.14159265359 * 2.0;',
        'vec2 dir = vec2(sin(angle), cos(angle));',
        'frequency *= frequencyScale;',
        'amplitude *= amplitudeScale;',
        'steepness *= steepnessScale;',
        'speed *= u_time;',

        'return gerstner_wave(position, dir, frequency, amplitude, steepness, speed);',
    '}',

    'void main (void) {',

        'vec3 displacement = vec3(0.0);',
        'displacement += wave(a_position.xz, u_wave_0_direction, u_wave_0_frequency, u_wave_0_amplitude, u_wave_0_steepness, u_wave_0_speed);',
        'displacement += wave(a_position.xz, u_wave_1_direction, u_wave_1_frequency, u_wave_1_amplitude, u_wave_1_steepness, u_wave_1_speed);',
        'displacement += wave(a_position.xz, u_wave_2_direction, u_wave_2_frequency, u_wave_2_amplitude, u_wave_2_steepness, u_wave_2_speed);',
        'displacement += wave(a_position.xz, u_wave_3_direction, u_wave_3_frequency, u_wave_3_amplitude, u_wave_3_steepness, u_wave_3_speed);',
        
        'vec3 position = a_position + displacement * u_wave_scale * vec3(u_wave_size);',

        'v_position = position;',
        'v_texcoord = a_texcoord;',
        'v_oceancoord = a_oceancoord;',
        'v_displacement = displacement / vec3((u_wave_0_amplitude + u_wave_1_amplitude + u_wave_2_amplitude + u_wave_3_amplitude) * amplitudeScale);',

        'gl_Position = u_projectionMatrix * u_viewMatrix * vec4(position, 1.0);',
    '}'
].join('\n');

var OCEAN_FRAGMENT_SOURCE = [
    'precision highp float;',

    'varying vec3 v_position;',
    'varying vec2 v_texcoord;',
    'varying vec2 v_oceancoord;',
    'varying vec3 v_displacement;',

    'uniform float u_color_mark;',
    'uniform float u_color_shadow;',
    'uniform vec3 u_color_bot;',
    'uniform vec3 u_color_top;',

    'float map(float value, float inputMin, float inputMax, float outputMin, float outputMax) {',
        'float mapValue = ((value - inputMin) / (inputMax - inputMin) * (outputMax - outputMin) + outputMin);',
        'return clamp(mapValue, 0.0, 1.0);',
    '}',

    'void main (void) {',
        'float colorStop = map(v_texcoord.y, u_color_mark, 1.0, 0.0, 1.0);',
        'vec3 color = u_color_bot + (u_color_top - u_color_bot) * colorStop;',

        'float shadowMin = 1.0 - u_color_shadow;',
        'float shadowMax = 1.0;',
        'float shadow = map(v_displacement.y, 0.0, 1.0, shadowMin, shadowMax);',
        'color *= vec3(shadow);',

        'gl_FragColor = vec4(color, 1.0);',
    '}'
].join('\n');

var NOISE_VERTEX_SOURCE = [
    'attribute vec2 a_position;',
    'varying vec2 v_coordinates;',

    'void main (void) {',
        'v_coordinates = a_position * 0.5 + 0.5;',
        'gl_Position = vec4(a_position, 0.0, 1.0);',
    '}',
].join('\n');

var NOISE_FRAGMENT_SOURCE = [
    'precision highp float;',

    'uniform float u_width;',
    'uniform float u_height;',
    'uniform float u_time;',
    'uniform float u_grain_size;',

    'varying vec2 v_coordinates;',

    'const float permTexUnit = 1.0/256.0;',
    'const float permTexUnitHalf = 0.5/256.0;',

    'vec4 rnm(vec2 tc)',
    '{',
        'float noise =  sin(dot(tc + vec2(u_time,u_time),vec2(12.9898,78.233))) * 43758.5453;',
        'float noiseR =  fract(noise)*2.0-1.0;',
        'float noiseG =  fract(noise*1.2154)*2.0-1.0;',
        'float noiseB =  fract(noise*1.3453)*2.0-1.0;',
        'float noiseA =  fract(noise*1.3647)*2.0-1.0;',
        'return vec4(noiseR,noiseG,noiseB,noiseA);',
    '}',
    
    'float fade(in float t) {',
        'return t*t*t*(t*(t*6.0-15.0)+10.0);',
    '}',

    'float pnoise3D(in vec3 p)',
    '{',
        'vec3 pi = permTexUnit*floor(p)+permTexUnitHalf;', // Integer part, scaled so +1 moves permTexUnit texel
        // and offset 1/2 texel to sample texel centers
        'vec3 pf = fract(p);',     // Fractional part for interpolation
    
        // Noise contributions from (x=0, y=0), z=0 and z=1
        'float perm00 = rnm(pi.xy).a;',
        'vec3  grad000 = rnm(vec2(perm00, pi.z)).rgb * 4.0 - 1.0;',
        'float n000 = dot(grad000, pf);',
        'vec3  grad001 = rnm(vec2(perm00, pi.z + permTexUnit)).rgb * 4.0 - 1.0;',
        'float n001 = dot(grad001, pf - vec3(0.0, 0.0, 1.0));',
    
        // Noise contributions from (x=0, y=1), z=0 and z=1
        'float perm01 = rnm(pi.xy + vec2(0.0, permTexUnit)).a;',
        'vec3  grad010 = rnm(vec2(perm01, pi.z)).rgb * 4.0 - 1.0;',
        'float n010 = dot(grad010, pf - vec3(0.0, 1.0, 0.0));',
        'vec3  grad011 = rnm(vec2(perm01, pi.z + permTexUnit)).rgb * 4.0 - 1.0;',
        'float n011 = dot(grad011, pf - vec3(0.0, 1.0, 1.0));',
    
        // Noise contributions from (x=1, y=0), z=0 and z=1
        'float perm10 = rnm(pi.xy + vec2(permTexUnit, 0.0)).a;',
        'vec3  grad100 = rnm(vec2(perm10, pi.z)).rgb * 4.0 - 1.0;',
        'float n100 = dot(grad100, pf - vec3(1.0, 0.0, 0.0));',
        'vec3  grad101 = rnm(vec2(perm10, pi.z + permTexUnit)).rgb * 4.0 - 1.0;',
        'float n101 = dot(grad101, pf - vec3(1.0, 0.0, 1.0));',
    
        // Noise contributions from (x=1, y=1), z=0 and z=1
        'float perm11 = rnm(pi.xy + vec2(permTexUnit, permTexUnit)).a;',
        'vec3  grad110 = rnm(vec2(perm11, pi.z)).rgb * 4.0 - 1.0;',
        'float n110 = dot(grad110, pf - vec3(1.0, 1.0, 0.0));',
        'vec3  grad111 = rnm(vec2(perm11, pi.z + permTexUnit)).rgb * 4.0 - 1.0;',
        'float n111 = dot(grad111, pf - vec3(1.0, 1.0, 1.0));',
    
        // Blend contributions along x
        'vec4 n_x = mix(vec4(n000, n001, n010, n011), vec4(n100, n101, n110, n111), fade(pf.x));',
    
        // Blend contributions along y
        'vec2 n_xy = mix(n_x.xy, n_x.zw, fade(pf.y));',
    
        // Blend contributions along z
        'float n_xyz = mix(n_xy.x, n_xy.y, fade(pf.z));',
    
        // We're done, return the final noise value.
        'return n_xyz;',
    '}',

    //2d coordinate orientation thing
    'vec2 coordRot(in vec2 tc, in float angle)',
    '{',
        'float aspect = u_width/u_height;',
        'float rotX = ((tc.x*2.0-1.0)*aspect*cos(angle)) - ((tc.y*2.0-1.0)*sin(angle));',
        'float rotY = ((tc.y*2.0-1.0)*cos(angle)) + ((tc.x*2.0-1.0)*aspect*sin(angle));',
        'rotX = ((rotX/aspect)*0.5+0.5);',
        'rotY = rotY*0.5+0.5;',
        'return vec2(rotX,rotY);',
    '}',

    'void main (void) {',
        'vec3 rotOffset = vec3(1.425,3.892,5.835);', //rotation offset values	
        'vec2 rotCoordsR = coordRot(v_coordinates, u_time + rotOffset.x);',
        'vec3 noise = vec3( pnoise3D(vec3(rotCoordsR * vec2(u_width / u_grain_size, u_height / u_grain_size), 0.0)));',
    
        'gl_FragColor = vec4(noise, 1.0);',
    '}'
].join('\n');

var FULLSCREEN_VERTEX_SOURCE = [
    'attribute vec2 a_position;',
    'varying vec2 v_coordinates;',

    'void main (void) {',
        'v_coordinates = a_position * 0.5 + 0.5;',
        'gl_Position = vec4(a_position, 0.0, 1.0);',
    '}'
].join('\n');

var FULLSCREEN_FRAGMENT_SOURCE = [
    'precision highp float;',

    'uniform sampler2D u_texture;',
    'uniform sampler2D u_noise;',

    'uniform float u_grain_amount;',
    'uniform float u_grain_luminance;',

    'varying vec2 v_coordinates;',

    'void main (void) {',
        'vec3 color = texture2D(u_texture, v_coordinates).rgb;',
        'vec3 noise = texture2D(u_noise, v_coordinates).rgb;',

        //noisiness response curve based on scene luminance
        'vec3 lumcoeff = vec3(0.299,0.587,0.114);',
        'float luminance = mix(0.0,dot(color, lumcoeff), u_grain_luminance);',
        'float lum = smoothstep(0.2,0.0,luminance);',
        'lum += luminance;',
        
        'noise = mix(noise,vec3(0.0),pow(lum,4.0));',
        
        'color = color + (noise * u_grain_amount);',

        'gl_FragColor = vec4(color, 1.0);',
    '}'
].join('\n');

var Simulator = function (canvas, width, height, guiData) {
    var canvas = canvas;
    canvas.width = width;
    canvas.height = height;

    var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    var bResize = true;
    var guiData = guiData;
    var timeNow = 0.0;

    var bGrainUpdate = true;

    var oceanData = [];
    var oceanIndices = [];
    var oceanBuffer = null;
    var oceanIndexBuffer = null;
    var slicesTotal = Math.floor(guiData.slicesTotal);
    var sliceSegments = Math.floor(guiData.sliceSegments);
    var sliceLengthScale = guiData.sliceLengthScale;
    var sliceSpaceScale = guiData.sliceSpaceScale;

    this.initGeometry = function () {

        oceanData = [];
        oceanIndices = [];

        var sliceSizeX = GEOMETRY_SIZE * sliceLengthScale;
        var sliceSizeZ = GEOMETRY_SIZE * sliceSpaceScale;
        var sliceHeight = GEOMETRY_SIZE * 0.4;
        var sliceY = -sliceHeight;
        var sliceDistance = sliceSizeZ / (slicesTotal-1);
        var xi, yi, zi;
        var px, py, pz, tx, ty, tz;
        var i0, i1, i2, i3, i4;
        
        for(zi=0; zi<slicesTotal; zi++) {
            tz = zi / (slicesTotal - 1);
            pz = zi * sliceDistance - (sliceSizeZ * 0.5);
            i0 = zi * (sliceSegments + 1) * 2;
    
            for(xi=0; xi<sliceSegments+1; xi++) {
                tx = xi / sliceSegments;
                px = tx * sliceSizeX - (sliceSizeX * 0.5);
    
                for(yi=0; yi<2; yi++) {
                    ty = yi;
                    py = sliceY + (ty * sliceHeight);
                    
                    oceanData.push(px);
                    oceanData.push(py);
                    oceanData.push(pz);
                    
                    oceanData.push(tx);
                    oceanData.push(ty);
    
                    oceanData.push(tx);
                    oceanData.push(tz);
                }
            }
    
            for(xi=0; xi<sliceSegments; xi++) {
                i1 = i0 + ((xi + 0) * 2) + 0; // left top.
                i2 = i0 + ((xi + 0) * 2) + 1; // left bottom.
                i3 = i0 + ((xi + 1) * 2) + 0; // right top.
                i4 = i0 + ((xi + 1) * 2) + 1; // right buttom.
    
                oceanIndices.push(i1); // left top.
                oceanIndices.push(i2); // left bottom.
                oceanIndices.push(i4); // right buttom.
                oceanIndices.push(i4); // right buttom.
                oceanIndices.push(i3); // right top.
                oceanIndices.push(i1); // left top.
            }
        }

        if(oceanBuffer != null) {
            gl.deleteBuffer(oceanBuffer);
            oceanBuffer = null;
        }
        if(oceanIndexBuffer != null) {
            gl.deleteBuffer(oceanIndexBuffer);
            oceanIndexBuffer = null;
        }

        oceanBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, oceanBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(oceanData), gl.STATIC_DRAW);
        gl.vertexAttribPointer(TEXTURE_COORDINATES_UNIT, 2, gl.FLOAT, false, VERT_STRIDE * SIZE_OF_FLOAT, TEXCOORD_OFFSET * SIZE_OF_FLOAT);
        gl.vertexAttribPointer(OCEAN_COORDINATES_UNIT, 2, gl.FLOAT, false, VERT_STRIDE * SIZE_OF_FLOAT, OCEANCOORD_OFFSET * SIZE_OF_FLOAT);
    
        oceanIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, oceanIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(oceanIndices), gl.STATIC_DRAW);
    };
    this.initGeometry();

    //---------- fullscreen.

    var fullscreenVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, fullscreenVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0]), gl.STATIC_DRAW);

    //---------- noise grain.

    var noiseTexture = null;
    var noiseFbo = null;

    this.initNoiseFbo = function () {
        if(noiseTexture != null) {
            gl.deleteTexture(noiseTexture);
            noiseTexture = null;
        }
        if(noiseFbo != null) {
            gl.deleteFramebuffer(noiseFbo);
            noiseFbo = null;
        }
        var noiseScale = 1.0;
        var noiseW = Math.floor( canvas.width * noiseScale );
        var noiseH = Math.floor( canvas.height * noiseScale );
        noiseTexture = buildTexture(gl, NOISE_TEXTURE_UNIT, gl.RGBA, gl.UNSIGNED_BYTE, noiseW, noiseH, null, gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE, gl.NEAREST, gl.NEAREST);
        noiseFbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, noiseFbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, noiseTexture, 0);
    }
    this.initNoiseFbo();

    var noiseProgram = buildProgramWrapper(gl,
        buildShader(gl, gl.VERTEX_SHADER, NOISE_VERTEX_SOURCE),
        buildShader(gl, gl.FRAGMENT_SHADER, NOISE_FRAGMENT_SOURCE), {
            'a_position': 0
    });
    gl.useProgram(noiseProgram.program);

    //---------- slices fbo.

    var slicesTexture = null;
    var slicesFbo = null;

    this.initSlicesFbo = function () {
        if(slicesTexture != null) {
            gl.deleteTexture(slicesTexture);
            slicesTexture = null;
        }
        if(slicesFbo != null) {
            gl.deleteFramebuffer(slicesFbo);
            slicesFbo = null;
        }
        slicesTexture = buildTexture(gl, SLICES_TEXTURE_UNIT, gl.RGBA, gl.UNSIGNED_BYTE, canvas.width, canvas.height, null, gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE, gl.NEAREST, gl.NEAREST);    
        slicesFbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, slicesFbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, slicesTexture, 0);
    }
    this.initSlicesFbo();

    var fullscreenProgram = buildProgramWrapper(gl,
        buildShader(gl, gl.VERTEX_SHADER, FULLSCREEN_VERTEX_SOURCE),
        buildShader(gl, gl.FRAGMENT_SHADER, FULLSCREEN_FRAGMENT_SOURCE), {
            'a_position': 0
    });
    gl.useProgram(fullscreenProgram.program);
    gl.uniform1i(fullscreenProgram.uniformLocations['u_texture'], SLICES_TEXTURE_UNIT);
    gl.uniform1i(fullscreenProgram.uniformLocations['u_noise'], NOISE_TEXTURE_UNIT);

    //---------- ocean.

    var oceanProgram = buildProgramWrapper(gl,
        buildShader(gl, gl.VERTEX_SHADER, OCEAN_VERTEX_SOURCE),
        buildShader(gl, gl.FRAGMENT_SHADER, OCEAN_FRAGMENT_SOURCE), {
            'a_position': 0,
            'a_texcoord': TEXTURE_COORDINATES_UNIT,
            'a_oceancoord': OCEAN_COORDINATES_UNIT
    });
    gl.useProgram(oceanProgram.program);
    gl.uniform1f(oceanProgram.uniformLocations['u_geometrySize'], GEOMETRY_SIZE);

    gl.enableVertexAttribArray(0);

    this.resize = function (width, height) {
        canvas.width = width;
        canvas.height = height;
        bResize = true;
    };

    this.render = function (deltaTime, projectionMatrix, viewMatrix) {

        deltaTime *= guiData.timeScale;
        timeNow += deltaTime;

        var slicesTotalInt = Math.floor( guiData.slicesTotal );
        var sliceSegmentsInt = Math.floor( guiData.sliceSegments );
        var bSlicesChanged = false;
        bSlicesChanged = bSlicesChanged || (slicesTotal != slicesTotalInt);
        bSlicesChanged = bSlicesChanged || (sliceSegments != sliceSegmentsInt);
        bSlicesChanged = bSlicesChanged || (sliceLengthScale != guiData.sliceLengthScale);
        bSlicesChanged = bSlicesChanged || (sliceSpaceScale != guiData.sliceSpaceScale);
        if(bSlicesChanged) {
            slicesTotal = slicesTotalInt;
            sliceSegments = sliceSegmentsInt;
            sliceLengthScale = guiData.sliceLengthScale;
            sliceSpaceScale = guiData.sliceSpaceScale;
            this.initGeometry();
        }

        if(bResize) {
            bResize = false;
            this.initNoiseFbo();
            this.initSlicesFbo();
        }

        if(guiData.waveRandomise) {
            guiData.waveRandomise = false;

            guiData.wave_0_direction = Math.random();
            guiData.wave_0_frequency = Math.random();
            guiData.wave_0_amplitude = Math.random();
            guiData.wave_0_steepness = Math.random();
            guiData.wave_0_speed = Math.random();
            guiData.wave_1_direction = Math.random();
            guiData.wave_1_frequency = Math.random();
            guiData.wave_1_amplitude = Math.random();
            guiData.wave_1_steepness = Math.random();
            guiData.wave_1_speed = Math.random();
            guiData.wave_2_direction = Math.random();
            guiData.wave_2_frequency = Math.random();
            guiData.wave_2_amplitude = Math.random();
            guiData.wave_2_steepness = Math.random();
            guiData.wave_2_speed = Math.random();
            guiData.wave_3_direction = Math.random();
            guiData.wave_3_frequency = Math.random();
            guiData.wave_3_amplitude = Math.random();
            guiData.wave_3_steepness = Math.random();
            guiData.wave_3_speed = Math.random();
        }

        //---------------- bind FBO.
        gl.bindFramebuffer(gl.FRAMEBUFFER, slicesFbo);
        gl.bindTexture(gl.TEXTURE_2D, slicesTexture);
        gl.viewport(0, 0, canvas.width, canvas.height);

        var colorBackground = hexToRgb( guiData.colorBackground );
        gl.clearColor(colorBackground[0], colorBackground[1], colorBackground[2], 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        //---------------- draw scene.

        gl.enable(gl.DEPTH_TEST);

        gl.enableVertexAttribArray(TEXTURE_COORDINATES_UNIT);
        gl.enableVertexAttribArray(OCEAN_COORDINATES_UNIT);

        gl.bindBuffer(gl.ARRAY_BUFFER, oceanBuffer);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, VERT_STRIDE * SIZE_OF_FLOAT, 0);

        gl.useProgram(oceanProgram.program);
        gl.uniform1f(oceanProgram.uniformLocations['u_time'], timeNow);
        gl.uniform1f(oceanProgram.uniformLocations['u_wave_size'], guiData.waveSize);
        gl.uniform3f(oceanProgram.uniformLocations['u_wave_scale'], guiData.waveScaleX, guiData.waveScaleY, guiData.waveScaleZ);

        gl.uniform1f(oceanProgram.uniformLocations['u_wave_0_direction'], guiData.wave_0_direction);
        gl.uniform1f(oceanProgram.uniformLocations['u_wave_0_frequency'], guiData.wave_0_frequency);
        gl.uniform1f(oceanProgram.uniformLocations['u_wave_0_amplitude'], guiData.wave_0_amplitude);
        gl.uniform1f(oceanProgram.uniformLocations['u_wave_0_steepness'], guiData.wave_0_steepness);
        gl.uniform1f(oceanProgram.uniformLocations['u_wave_0_speed'], guiData.wave_0_speed);

        gl.uniform1f(oceanProgram.uniformLocations['u_wave_1_direction'], guiData.wave_1_direction);
        gl.uniform1f(oceanProgram.uniformLocations['u_wave_1_frequency'], guiData.wave_1_frequency);
        gl.uniform1f(oceanProgram.uniformLocations['u_wave_1_amplitude'], guiData.wave_1_amplitude);
        gl.uniform1f(oceanProgram.uniformLocations['u_wave_1_steepness'], guiData.wave_1_steepness);
        gl.uniform1f(oceanProgram.uniformLocations['u_wave_1_speed'], guiData.wave_1_speed);

        gl.uniform1f(oceanProgram.uniformLocations['u_wave_2_direction'], guiData.wave_2_direction);
        gl.uniform1f(oceanProgram.uniformLocations['u_wave_2_frequency'], guiData.wave_2_frequency);
        gl.uniform1f(oceanProgram.uniformLocations['u_wave_2_amplitude'], guiData.wave_2_amplitude);
        gl.uniform1f(oceanProgram.uniformLocations['u_wave_2_steepness'], guiData.wave_2_steepness);
        gl.uniform1f(oceanProgram.uniformLocations['u_wave_2_speed'], guiData.wave_2_speed);

        gl.uniform1f(oceanProgram.uniformLocations['u_wave_3_direction'], guiData.wave_3_direction);
        gl.uniform1f(oceanProgram.uniformLocations['u_wave_3_frequency'], guiData.wave_3_frequency);
        gl.uniform1f(oceanProgram.uniformLocations['u_wave_3_amplitude'], guiData.wave_3_amplitude);
        gl.uniform1f(oceanProgram.uniformLocations['u_wave_3_steepness'], guiData.wave_3_steepness);
        gl.uniform1f(oceanProgram.uniformLocations['u_wave_3_speed'], guiData.wave_3_speed);

        var colorSliceBot = hexToRgb( guiData.colorSliceBot );
        var colorSliceTop = hexToRgb( guiData.colorSliceTop );

        gl.uniform3f(oceanProgram.uniformLocations['u_color_bot'], colorSliceBot[0], colorSliceBot[1], colorSliceBot[2]);
        gl.uniform3f(oceanProgram.uniformLocations['u_color_top'], colorSliceTop[0], colorSliceTop[1], colorSliceTop[2]);
        gl.uniform1f(oceanProgram.uniformLocations['u_color_mark'], guiData.colorMark);
        gl.uniform1f(oceanProgram.uniformLocations['u_color_shadow'], guiData.colorShadow);

        gl.uniformMatrix4fv(oceanProgram.uniformLocations['u_projectionMatrix'], false, projectionMatrix);
        gl.uniformMatrix4fv(oceanProgram.uniformLocations['u_viewMatrix'], false, viewMatrix);

        gl.drawElements(gl.TRIANGLES, oceanIndices.length, gl.UNSIGNED_SHORT, 0);

        gl.disableVertexAttribArray(TEXTURE_COORDINATES_UNIT);
        gl.disableVertexAttribArray(OCEAN_COORDINATES_UNIT);

        //---------- draw noise.
        if(bGrainUpdate) {
            bGrainUpdate = false;

            gl.bindFramebuffer(gl.FRAMEBUFFER, noiseFbo);
        
            gl.bindTexture(gl.TEXTURE_2D, noiseTexture);
            
            gl.viewport(0, 0, canvas.width, canvas.height);
    
            gl.clearColor(0, 0, 0, 1);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
            gl.bindBuffer(gl.ARRAY_BUFFER, fullscreenVertexBuffer);
            gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    
            gl.useProgram(noiseProgram.program);
            gl.uniform1f(noiseProgram.uniformLocations['u_width'], canvas.width);
            gl.uniform1f(noiseProgram.uniformLocations['u_height'], canvas.height);
            gl.uniform1f(noiseProgram.uniformLocations['u_time'], timeNow);
            gl.uniform1f(noiseProgram.uniformLocations['u_grain_size'], guiData.grainSize);
            
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }
        if(guiData.grainAnimate) {
            bGrainUpdate = true;
        }

        //---------- draw fbo to screen.

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        gl.activeTexture(gl.TEXTURE0 + 0);
        gl.bindTexture(gl.TEXTURE_2D, slicesTexture);
        
        gl.activeTexture(gl.TEXTURE0 + 1);
        gl.bindTexture(gl.TEXTURE_2D, noiseTexture);

        gl.viewport(0, 0, canvas.width, canvas.height);

        gl.clearColor(1, 1, 1, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.bindBuffer(gl.ARRAY_BUFFER, fullscreenVertexBuffer);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

        gl.useProgram(fullscreenProgram.program);
        gl.uniform1f(fullscreenProgram.uniformLocations['u_grain_amount'], guiData.grainAmount);
        gl.uniform1f(fullscreenProgram.uniformLocations['u_grain_luminance'], guiData.grainLuminance);
        
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        gl.activeTexture(gl.TEXTURE0 + 0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        
        gl.activeTexture(gl.TEXTURE0 + 1);
        gl.bindTexture(gl.TEXTURE_2D, null);
    };

};

var main = function () {

    var bRecord = false;
    var recordFrame = 0;

    var simulatorCanvas = document.getElementById( 'simulator' );

    var bProd = true;

    var stats = null;
    var bStats = !bProd;
    if(bStats) {
        stats = new Stats();
        stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild( stats.dom );
    }

    var guiData = {
        bRecord : bRecord,
        timeScale : 1.223922114047288,
        // slices
        slicesTotal : 44,
        sliceSegments: 256,
        sliceLengthScale: 5,
        sliceSpaceScale: 1.3,
        // color.
        colorBackground : "#111113",
        colorSliceBot : "#3C5EE8",
        colorSliceTop : "#3C5EE8",
        colorMark : 0.94,
        colorShadow : 0.37,
        // wave
        waveScaleX : 1.0,
        waveScaleY : 1.0,
        waveScaleZ : 1.0,
        waveSize : 1.0,
        waveRandomise : false,

        wave_0_direction: 0.5775967219687211,
        wave_0_frequency: 0.22650851841910633,
        wave_0_amplitude: 0.4190407590753467,
        wave_0_steepness: 0.8602444638305798,
        wave_0_speed: 0.3970359063833446,
        wave_1_direction: 0.5322950182848999,
        wave_1_frequency: 0.20385766657719567,
        wave_1_amplitude: 0.39678270484701983,
        wave_1_steepness: 0.23783394434006164,
        wave_1_speed: 0.23251986333942098,
        wave_2_direction: 0.39638990723343603,
        wave_2_frequency: 0.10192883328859784,
        wave_2_amplitude: 0.04530170368382126,
        wave_2_steepness: 0.679525555257319,
        wave_2_speed: 0.5436204442058552,
        wave_3_direction: 0.5096441664429893,
        wave_3_frequency: 0.41483469336523715,
        wave_3_amplitude: 0.18120681473528505,
        wave_3_steepness: 0.6908509811782743,
        wave_3_speed: 0.5436204442058552,

        // camera.
        camDistance: 656.8747034154084,
        camOffsetX: -686.2505931691833,
        camOffsetY: 0,
        camOffsetZ: 0,
        camAzimuth: 0.241828828556226,
        camElevation: 0.4557310861293477,

        // grain.
        grainAnimate: false,
        grainSize: 1.5889221478896765,
        grainAmount: 0.4190407590753467,
        grainLuminance: 0
    };

    var bDatGui = !bProd;
    if(bDatGui) {
        var gui = new dat.GUI( );
        gui.add(guiData, 'bRecord');
        gui.add(guiData, 'timeScale', 0.0, 10.0);
    
        var guiSlices = gui.addFolder('slices');
        guiSlices.add(guiData, 'slicesTotal', 1, 50);
        guiSlices.add(guiData, 'sliceSegments', 1, 1024);
        guiSlices.add(guiData, 'sliceLengthScale', 1, 10);
        guiSlices.add(guiData, 'sliceSpaceScale', 1.0, 10.0);
    
        var guiColor = gui.addFolder('color');
        guiColor.addColor(guiData, 'colorBackground');
        guiColor.addColor(guiData, 'colorSliceBot');
        guiColor.addColor(guiData, 'colorSliceTop');
        guiColor.add(guiData, 'colorMark', 0.0, 1.0);
        guiColor.add(guiData, 'colorShadow', 0.0, 1.0);
        
        var guiOcean = gui.addFolder('ocean');
        guiOcean.add(guiData, 'waveScaleX', 0.0, 1.0);
        guiOcean.add(guiData, 'waveScaleY', 0.0, 1.0);
        guiOcean.add(guiData, 'waveScaleZ', 0.0, 1.0);
        guiOcean.add(guiData, 'waveSize', 1.0, 10.0);
        guiOcean.add(guiData, 'waveRandomise');
    
        var guiWave0 = gui.addFolder('wave_0');
        guiWave0.add(guiData, 'wave_0_direction', 0.0, 1.0);
        guiWave0.add(guiData, 'wave_0_frequency', 0.0, 1.0);
        guiWave0.add(guiData, 'wave_0_amplitude', 0.0, 1.0);
        guiWave0.add(guiData, 'wave_0_steepness', 0.0, 1.0);
        guiWave0.add(guiData, 'wave_0_speed', 0.0, 1.0);
    
        var guiWave1 = gui.addFolder('wave_1');
        guiWave1.add(guiData, 'wave_1_direction', 0.0, 1.0);
        guiWave1.add(guiData, 'wave_1_frequency', 0.0, 1.0);
        guiWave1.add(guiData, 'wave_1_amplitude', 0.0, 1.0);
        guiWave1.add(guiData, 'wave_1_steepness', 0.0, 1.0);
        guiWave1.add(guiData, 'wave_1_speed', 0.0, 1.0);
    
        var guiWave2 = gui.addFolder('wave_2');
        guiWave2.add(guiData, 'wave_2_direction', 0.0, 1.0);
        guiWave2.add(guiData, 'wave_2_frequency', 0.0, 1.0);
        guiWave2.add(guiData, 'wave_2_amplitude', 0.0, 1.0);
        guiWave2.add(guiData, 'wave_2_steepness', 0.0, 1.0);
        guiWave2.add(guiData, 'wave_2_speed', 0.0, 1.0);
    
        var guiWave3 = gui.addFolder('wave_3');
        guiWave3.add(guiData, 'wave_3_direction', 0.0, 1.0);
        guiWave3.add(guiData, 'wave_3_frequency', 0.0, 1.0);
        guiWave3.add(guiData, 'wave_3_amplitude', 0.0, 1.0);
        guiWave3.add(guiData, 'wave_3_steepness', 0.0, 1.0);
        guiWave3.add(guiData, 'wave_3_speed', 0.0, 1.0);
    
        var guiCam = gui.addFolder('camera');
        guiCam.add(guiData, 'camDistance', 0.0, 2000.0);
        guiCam.add(guiData, 'camOffsetX', -2000, 2000);
        guiCam.add(guiData, 'camOffsetY', -2000, 2000);
        guiCam.add(guiData, 'camOffsetZ', -2000, 2000);
        guiCam.add(guiData, 'camAzimuth').listen();
        guiCam.add(guiData, 'camElevation').listen();

        var guiGrain = gui.addFolder('grain');
        guiGrain.add(guiData, 'grainAnimate');
        guiGrain.add(guiData, 'grainSize', 1.0, 5.0);
        guiGrain.add(guiData, 'grainAmount', 0.0, 1.0);
        guiGrain.add(guiData, 'grainLuminance', 0.0, 2.0);

        gui.remember(guiData);
    }

    var camera = new Camera(guiData);
    var projectionMatrix = makePerspectiveMatrix(new Float32Array(16), FOV, MIN_ASPECT, NEAR, FAR);
    
    var simulator = new Simulator(simulatorCanvas, window.innerWidth, window.innerHeight, guiData);

    var width = window.innerWidth,
        height = window.innerHeight;

    var lastMouseX = 0;
    var lastMouseY = 0;
    var mode = NONE;

    var inverseProjectionViewMatrix = [],
        nearPoint = [],
        farPoint = [];
    var unproject = function (viewMatrix, x, y, width, height) {
        premultiplyMatrix(inverseProjectionViewMatrix, viewMatrix, projectionMatrix);
        invertMatrix(inverseProjectionViewMatrix, inverseProjectionViewMatrix);

        setVector4(nearPoint, (x / width) * 2.0 - 1.0, ((height - y) / height) * 2.0 - 1.0, 1.0, 1.0);
        transformVectorByMatrix(nearPoint, nearPoint, inverseProjectionViewMatrix);

        setVector4(farPoint, (x / width) * 2.0 - 1.0, ((height - y) / height) * 2.0 - 1.0, -1.0, 1.0);
        transformVectorByMatrix(farPoint, farPoint, inverseProjectionViewMatrix);

        projectVector4(nearPoint, nearPoint);
        projectVector4(farPoint, farPoint);

        var t = -nearPoint[1] / (farPoint[1] - nearPoint[1]);
        var point = [
            nearPoint[0] + t * (farPoint[0] - nearPoint[0]),
            nearPoint[1] + t * (farPoint[1] - nearPoint[1]),
            nearPoint[2] + t * (farPoint[2] - nearPoint[2]),
        ];

        return point;
    };

    var onMouseDown = function (event) {
        event.preventDefault();

        var mousePosition = getMousePosition(event, simulatorCanvas);
        var mouseX = mousePosition.x,
            mouseY = mousePosition.y;

            mode = ORBITING;
            lastMouseX = mouseX;
            lastMouseY = mouseY;
    };
    simulatorCanvas.addEventListener('mousedown', onMouseDown, false);

    simulatorCanvas.addEventListener('mousemove', function (event) {
        event.preventDefault();

        var mousePosition = getMousePosition(event, simulatorCanvas),
            mouseX = mousePosition.x,
            mouseY = mousePosition.y;

            if (mode === ORBITING) {
                camera.changeAzimuth((mouseX - lastMouseX) / width);
                camera.changeElevation((mouseY - lastMouseY) / height);
                lastMouseX = mouseX;
                lastMouseY = mouseY;
            }
    });

    simulatorCanvas.addEventListener('mouseup', function (event) {
        event.preventDefault();
        mode = NONE;
    });

    window.addEventListener('mouseout', function (event) {
        var from = event.relatedTarget || event.toElement;
        if (!from || from.nodeName === 'HTML') {
            mode = NONE;
        }
    });

    var onresize = function () {
        var windowWidth = window.innerWidth,
        windowHeight = window.innerHeight;

        if (windowWidth / windowHeight > MIN_ASPECT) {
            makePerspectiveMatrix(projectionMatrix, FOV, windowWidth / windowHeight, NEAR, FAR);
            simulator.resize(windowWidth, windowHeight);
            simulatorCanvas.style.top = '0px';
            width = windowWidth;
            height = windowHeight;
        } else {
            var newHeight = windowWidth / MIN_ASPECT;
            newHeight = windowHeight;
            makePerspectiveMatrix(projectionMatrix, FOV, windowWidth / newHeight, NEAR, FAR);
            simulator.resize(windowWidth, newHeight);
            simulatorCanvas.style.top = (windowHeight - newHeight) * 0.5 + 'px';
            width = windowWidth;
            height = newHeight;
        }
    };

    window.addEventListener('resize', onresize);
    onresize();

    var lastTime = (new Date()).getTime();
    var render = function render (currentTime) {

        if(stats != null) {
            stats.begin();
        }

        var bRecordChanged = bRecord != guiData.bRecord;
        bRecord = guiData.bRecord;
        var bRecordStarted = bRecord && bRecordChanged;
        if(bRecordStarted == true) {
            recordFrame = 0;
        }

        var deltaTime = 1.0 / 60.0;
        if(bRecord == false) {
            deltaTime = (currentTime - lastTime) / 1000 || 0.0;
        }
        lastTime = currentTime;

        simulator.render(deltaTime, projectionMatrix, camera.getViewMatrix());

        if(bRecord == true) {
            var request = new XMLHttpRequest();
            request.open('POST', 'http://localhost:3999/' + recordFrame++, false);
            request.send( dataURItoBlob(simulatorCanvas.toDataURL()) );
        }

        if(stats != null) {
            stats.end();
        }

        requestAnimationFrame(render);
    };
    render();

    // Utility function to convert dataURIs to Blobs.
    // Thanks go to SO: http://stackoverflow.com/a/15754051
    function dataURItoBlob(dataURI) {
        var mimetype = dataURI.split(",")[0].split(':')[1].split(';')[0];
        var byteString = atob(dataURI.split(',')[1]);
        var u8a = new Uint8Array(byteString.length);
        for (var i = 0; i < byteString.length; i++) {
            u8a[i] = byteString.charCodeAt(i);
        }
        return new Blob([u8a.buffer], { type: mimetype });
    };    
};

if (hasWebGLSupportWithExtensions([])) {
    main();
} else {
    document.getElementById('error').style.display = 'block';
    document.getElementById('footer').style.display = 'none';
}