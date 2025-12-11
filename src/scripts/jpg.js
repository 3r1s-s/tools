import { icon, tooltip, saveUrlAs } from './utils.js';

document.getElementById('imagein').addEventListener('change', function (e) {
    const ogimage = document.getElementById('ogimage');
    const compressedimage = document.getElementById('compressedimage');
    ogimage.src = URL.createObjectURL(e.target.files[0]);
    ogimage.style.display = 'block';
    compressedimage.style.display = 'block';

    tooltip({ 'title': `File Uploaded!`, 'icon': icon.check });

    setTimeout(() => {
        cmprsimg();
    }, 50);
});

document.addEventListener('paste', function (e) {
    const items = e.clipboardData.files;
    if (items.length > 0 && items[0].type.startsWith('image/')) {
        const file = items[0];
        const ogimage = document.getElementById('ogimage');
        const compressedimage = document.getElementById('compressedimage');
        ogimage.src = URL.createObjectURL(file);
        ogimage.style.display = 'block';
        compressedimage.style.display = 'block';
        tooltip({ 'title': `Image Pasted!`, 'icon': icon.check });
        setTimeout(() => {
            cmprsimg();
        }, 50);
    }
});

document.getElementById('compressionslider').addEventListener('input', function () {
    const compressionval = document.getElementById('compressionval');
    compressionval.textContent = this.value + '%';

    cmprsimg();
});

document.getElementById('webpcheck').addEventListener('change', function () {
    cmprsimg();
});

function cmprsimg() {
    const ogimage = document.getElementById('ogimage');
    const compressionval = document.getElementById('compressionslider').value;
    const usewebp = document.getElementById('webpcheck').checked;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = ogimage.width;
    canvas.height = ogimage.height;

    ctx.drawImage(ogimage, 0, 0, canvas.width, canvas.height);

    const mimeType = usewebp ? 'image/webp' : 'image/jpeg';
    const quality = usewebp ? 1 : compressionval / 100;

    const compressedimageData = canvas.toDataURL(mimeType, quality);

    const compressedimage = document.getElementById('compressedimage');
    compressedimage.src = compressedimageData;
}

const saveButton = document.getElementById('saveButton');
if (saveButton) {
    saveButton.addEventListener('click', saveImage);
    saveButton.removeAttribute('onclick');
}

function saveImage() {
    const compressedimage = document.getElementById('compressedimage');
    const dataUrl = compressedimage.src;

    const mimeTypeMatch = dataUrl.match(/^data:(.*?);base64,/);
    let ext = 'jpg';

    if (mimeTypeMatch && mimeTypeMatch[1]) {
        const mimeType = mimeTypeMatch[1];
        if (mimeType.includes('image/webp')) {
            ext = 'webp';
        } else if (mimeType.includes('image/png')) {
            ext = 'png';
        } else if (mimeType.includes('image/jpeg')) {
            ext = 'jpg';
        }
    }
    saveUrlAs(dataUrl, `compressed_image.${ext}`);
}
