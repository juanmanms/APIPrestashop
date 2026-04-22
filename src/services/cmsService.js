const fs = require('fs');
const path = require('path');

const legacyBasePath = path.resolve(__dirname, `../../../botiga.${process.env.Server}/img`);
const devFallbackBasePath = path.resolve(process.cwd(), 'uploads/cms');
const configuredBasePath = (process.env.CMS_IMG_BASE_PATH || '').trim();

const baseImagePath = configuredBasePath
    ? path.resolve(configuredBasePath)
    : (fs.existsSync(legacyBasePath) ? legacyBasePath : devFallbackBasePath);

//const pat = '/var/www/vhosts/system/botiga.' + process.env.Server + '/img/horarios'; // Ajusta la ruta según tu servidor 
//const pat = 'C:/Users/Juanma/Documents/Lightshot'
//const pat = 'https://botiga.mercattorreblanca.cat/img/horarios' // Ruta local para desarrollo

function resolveDirectory(tipo = 'horarios') {
    return path.join(baseImagePath, tipo);
}


// Añadir imagen
function addImage(tipo = "horarios", file, filename) {
    const directory = resolveDirectory(tipo);
    const destPath = path.join(directory, filename);

    return new Promise((resolve, reject) => {
        fs.mkdir(directory, { recursive: true }, (err) => {
            if (err) return reject(err);

            fs.copyFile(file.path, destPath, (err) => {
                if (err) return reject(err);
                resolve({ success: true, filename });
            });
        });
    });
}

// Obtener lista de imágenes
function getImages(tipo = 'horarios') {
    const directory = resolveDirectory(tipo);
    console.log('Directory:', directory);
    return new Promise((resolve, reject) => {
        fs.readdir(directory, (err, files) => {
            if (err) {
                if (err.code === 'ENOENT') return resolve([]);
                return reject(err);
            }
            // Filtra solo imágenes (puedes ajustar la expresión regular)
            const images = files.filter(f => /\.(jpg|jpeg|png|gif)$/i.test(f));
            resolve(images);
        });
    });
}

// Modificar imagen (sobrescribir)
function updateImage(file, filename, tipo = 'horarios') {
    const directory = resolveDirectory(tipo);
    const destPath = path.join(directory, filename);
    return new Promise((resolve, reject) => {
        fs.mkdir(directory, { recursive: true }, (mkdirErr) => {
            if (mkdirErr) return reject(mkdirErr);
            fs.copyFile(file.path, destPath, (err) => {
                if (err) return reject(err);
                resolve({ success: true, filename });
            });
        });
    });
}

// Quitar imagen
function deleteImage(tipo = 'horarios', filename) {
    const directory = resolveDirectory(tipo);
    const filePath = path.join(directory, filename);
    return new Promise((resolve, reject) => {
        fs.unlink(filePath, (err) => {
            if (err) return reject(err);
            resolve({ success: true, filename });
        });
    });
}

module.exports = {
    addImage,
    getImages,
    updateImage,
    deleteImage
};