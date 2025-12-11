const icon = {
    "check": `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="m10 15.586-3.293-3.293-1.414 1.414L10 18.414l9.707-9.707-1.414-1.414z"></path></svg>`,
    "home": `<svg width="22" height="21" viewBox="0 0 22 21" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.5258 0.204649C11.2291 -0.0682165 10.7709 -0.0682161 10.4742 0.204649L0.249923 9.68588C-0.266994 10.1612 0.0714693 11.0197 0.775759 11.0197L3.48971 11.0197V18.6923C3.48971 19.542 4.18295 20.2308 5.03811 20.2308H16.9619C17.8171 20.2308 18.5103 19.542 18.5103 18.6923V11.0197L21.2242 11.0197C21.9285 11.0197 22.267 10.1612 21.7501 9.68588L11.5258 0.204649Z" fill="currentColor"/></svg> `,
}

String.prototype.sanitize = function() { 
    return this.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;').replace(/`/g, '&#96;').replace(/'/g, '&#39;');
};

document.getElementById('imagein').addEventListener('change', function (e) {
    const ogimage = document.getElementById('ogimage');
    const compressedimage = document.getElementById('compressedimage');
    ogimage.src = URL.createObjectURL(e.target.files[0]);
    ogimage.style.display = 'block';
    compressedimage.style.display = 'block';

    tooltip({'title':`File Uploaded!`,'icon':icon.check});

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
        tooltip({'title':`Image Pasted!`,'icon':icon.check});
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

function tooltip(data) {
    document.querySelectorAll('.tooltip').forEach(tooltip => {
        tooltip.classList.remove('visible');
        setTimeout(() => {
            tooltip.remove();
        }, 1000);
    });

    const tooltip = document.createElement("div");
    tooltip.classList.add("tooltip");

    tooltip.innerHTML = `
        ${data.icon ? `<div>${data.icon}</div>` : ``}
        ${data.title ? `<span>${data.title.sanitize()}</span>` : ``}
    `;
    
    document.body.appendChild(tooltip);

    setTimeout(() => {
        tooltip.style = `visibility: visible;`;
        tooltip.classList.add('visible');
    }, 10);

    setTimeout(() => {
        tooltip.classList.remove('visible');
        setTimeout(() => {
            tooltip.remove();
        }, 1000);
    }, 3000);
}

function saveImage() {
    const compressedimage = document.getElementById('compressedimage');
    const a = document.createElement("a");
    a.href = compressedimage.src;
    a.download = "compressed_image.jpg";
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
        document.body.removeChild(a);
    }, 0);
}
