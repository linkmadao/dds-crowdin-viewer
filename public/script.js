const canvas = document.getElementById('ddsCanvas');
const context = canvas.getContext('2d');

let currentMode = 'rgb'; // Modo inicial

function loadDDS(filePath) {
    fetch(filePath)
        .then(res => res.arrayBuffer())
        .then(buffer => {
            const loader = new THREE.DDSLoader();
            const texture = loader.parse(buffer);

            const width = texture.image.width;
            const height = texture.image.height;
            canvas.width = width;
            canvas.height = height;

            drawTexture(texture);
        })
        .catch(console.error);
}

function drawTexture(texture) {
    const width = texture.image.width;
    const height = texture.image.height;

    const tempCanvas = document.createElement('canvas');
    const tempContext = tempCanvas.getContext('2d');
    tempCanvas.width = width;
    tempCanvas.height = height;

    const imageData = tempContext.createImageData(width, height);
    const data = texture.image.data;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (currentMode === 'rgb') {
            imageData.data.set([r, g, b, 255], i);
        } else if (currentMode === 'alpha') {
            imageData.data.set([a, a, a, 255], i);
        }
    }

    tempContext.putImageData(imageData, 0, 0);
    context.drawImage(tempCanvas, 0, 0, width, height);
}

document.getElementById('viewRgb').addEventListener('click', () => {
    currentMode = 'rgb';
    loadDDS(currentDDSFile);
});

document.getElementById('viewAlpha').addEventListener('click', () => {
    currentMode = 'alpha';
    loadDDS(currentDDSFile);
});

// Teste inicial
const currentDDSFile = 'https://linkmadao.github.io/dds-crowdin-viewer/public/teste/2d_cf_action_asc_deru.dds';
loadDDS(currentDDSFile);