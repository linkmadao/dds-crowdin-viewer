const canvas = document.getElementById("ddsCanvas");
const gl = canvas.getContext("webgl");

if (!gl) {
    alert("Seu navegador não suporta WebGL.");
}

// Carrega o arquivo DDS
function loadDDS(url) {
    fetch(url)
        .then((response) => response.arrayBuffer())
        .then((buffer) => {
            const dds = DDSParser.parse(buffer);
            renderDDS(gl, dds);
        })
        .catch((err) => console.error("Erro ao carregar DDS:", err));
}

// Renderiza a textura no canvas
function renderDDS(gl, dds) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

    const format = dds.format === 0x31545844 ? gl.COMPRESSED_RGBA_S3TC_DXT1_EXT :
                   dds.format === 0x33545844 ? gl.COMPRESSED_RGBA_S3TC_DXT3_EXT :
                   dds.format === 0x35545844 ? gl.COMPRESSED_RGBA_S3TC_DXT5_EXT : null;

    if (!format) {
        console.error("Formato não suportado:", dds.format);
        return;
    }

    const ext = gl.getExtension("WEBGL_compressed_texture_s3tc");
    if (!ext) {
        alert("Seu navegador não suporta texturas DXT.");
        return;
    }

    gl.compressedTexImage2D(
        gl.TEXTURE_2D,
        0,
        format,
        dds.width,
        dds.height,
        0,
        dds.data
    );

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    drawScene(gl);
}

// Configura e desenha o canvas
function drawScene(gl) {
    const vertices = new Float32Array([
        -1, -1, 0.0,
         1, -1, 0.0,
        -1,  1, 0.0,
         1,  1, 0.0,
    ]);

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const vertexShaderSource = `
        attribute vec3 coordinates;
        varying vec2 uv;
        void main(void) {
            uv = (coordinates.xy + 1.0) / 2.0;
            gl_Position = vec4(coordinates, 1.0);
        }
    `;

    const fragmentShaderSource = `
        precision mediump float;
        varying vec2 uv;
        uniform sampler2D texture;
        void main(void) {
            gl_FragColor = texture2D(texture, uv);
        }
    `;

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    const coord = gl.getAttribLocation(shaderProgram, "coordinates");
    gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coord);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

// Teste inicial
const ddsFileUrl = 'https://linkmadao.github.io/dds-crowdin-viewer/public/teste/2d_cf_action_asc_deru.dds';
loadDDS(ddsFileUrl);