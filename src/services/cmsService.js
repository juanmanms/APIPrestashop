const fs = require('fs');
const path = require('path');

const pat = path.join(__dirname, '../../../botiga.mercattorreblanca.cat/img/horarios');

//const pat = '/var/www/vhosts/system/botiga.' + process.env.Server + '/img/horarios'; // Ajusta la ruta según tu servidor 
//const pat = 'C:/Users/Juanma/Documents/Lightshot'
//const pat = 'https://botiga.mercattorreblanca.cat/img/horarios' // Ruta local para desarrollo


// Añadir imagen
function addImage(file, filename, directory = pat) {
    const destPath = path.join(directory, filename);
    return new Promise((resolve, reject) => {
        fs.copyFile(file.path, destPath, (err) => {
            if (err) return reject(err);
            resolve({ success: true, filename });
        });
    });
}

// Obtener lista de imágenes
function getImages(directory = pat) {
    console.log(pat)
    return new Promise((resolve, reject) => {
        fs.readdir(directory, (err, files) => {
            if (err) return reject(err);
            // Filtra solo imágenes (puedes ajustar la expresión regular)
            const images = files.filter(f => /\.(jpg|jpeg|png|gif)$/i.test(f));
            resolve(images);
        });
    });
}

// Modificar imagen (sobrescribir)
function updateImage(file, filename, directory = pat
) {
    const destPath = path.join(directory, filename);
    return new Promise((resolve, reject) => {
        fs.copyFile(file.path, destPath, (err) => {
            if (err) return reject(err);
            resolve({ success: true, filename });
        });
    });
}

// Quitar imagen
function deleteImage(filename, directory = pat) {
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