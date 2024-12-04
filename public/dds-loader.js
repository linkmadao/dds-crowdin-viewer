class DDSParser {
    static parse(buffer) {
        const headerLengthInt = 31; // Cabeçalho DDS é de 124 bytes, dividido em 31 inteiros de 32 bits.
        const DDS_MAGIC = 0x20534444; // "DDS "
        const DDSD_CAPS = 0x1;
        const DDSD_HEIGHT = 0x2;
        const DDSD_WIDTH = 0x4;
        const DDSD_PIXELFORMAT = 0x1000;

        const DDSCAPS_TEXTURE = 0x1000;

        const PF_DXT1 = 0x31545844; // "DXT1"
        const PF_DXT3 = 0x33545844; // "DXT3"
        const PF_DXT5 = 0x35545844; // "DXT5"

        const header = new Int32Array(buffer, 0, headerLengthInt);

        if (header[0] !== DDS_MAGIC) {
            throw new Error("Não é um arquivo DDS válido.");
        }

        const height = header[3];
        const width = header[4];
        const mipMapCount = Math.max(1, header[7]);
        const fourCC = header[21];

        let blockBytes;
        if (fourCC === PF_DXT1) {
            blockBytes = 8;
        } else if (fourCC === PF_DXT3 || fourCC === PF_DXT5) {
            blockBytes = 16;
        } else {
            throw new Error("Formato de textura não suportado: " + fourCC);
        }

        const dataOffset = header[1] + 4 + 124; // 4 bytes para "DDS ", 124 bytes para cabeçalho
        const dataLength = Math.ceil(width / 4) * Math.ceil(height / 4) * blockBytes;

        return {
            width,
            height,
            mipMapCount,
            blockBytes,
            format: fourCC,
            data: new Uint8Array(buffer, dataOffset, dataLength),
        };
    }
}