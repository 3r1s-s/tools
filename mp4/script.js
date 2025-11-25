const icon = {
    "check": `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="m10 15.586-3.293-3.293-1.414 1.414L10 18.414l9.707-9.707-1.414-1.414z"></path></svg>`,
    "home": `<svg width="22" height="21" viewBox="0 0 22 21" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.5258 0.204649C11.2291 -0.0682165 10.7709 -0.0682161 10.4742 0.204649L0.249923 9.68588C-0.266994 10.1612 0.0714693 11.0197 0.775759 11.0197L3.48971 11.0197V18.6923C3.48971 19.542 4.18295 20.2308 5.03811 20.2308H16.9619C17.8171 20.2308 18.5103 19.542 18.5103 18.6923V11.0197L21.2242 11.0197C21.9285 11.0197 22.267 10.1612 21.7501 9.68588L11.5258 0.204649Z" fill="currentColor"/></svg> `,
}

String.prototype.sanitize = function() { 
    return this.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;').replace(/`/g, '&#96;').replace(/'/g, '&#39;');
};

// special thanks to 52525rr for a lot of the code
const video = document.getElementById("video");
const input = document.getElementById("input");
const i1 = document.getElementById("canvas1");
const i2 = document.getElementById("canvas2");

let conversion = false;

power2Square = 256;
width = power2Square;
height = power2Square;

W = power2Square;
H = W;
i1.width = W;
i1.height = H;
i2.width = W;
i2.height = H;
START = 0;

FPS = 15;
bits = 4;
threshold = 128;

document.getElementById("threshhold").value = threshold;
document.getElementById("demo").innerText = `Threshold: ${threshold}`;

document.getElementById("fps").value = FPS;
document.getElementById("demo3").innerText = `Framerate: ${FPS}`;

document.getElementById("text").value = "";

bitmask = 0b11110000;

size = 0;
b = 8 - bits;
OP = [];

var threshSlider = document.getElementById("threshhold");
var output = document.getElementById("demo");
threshSlider.oninput = function () {
    if (START == 0) {
        threshold = this.value;
        output.innerHTML = `Threshold: ${this.value}`;
    }
};

var fpsSlider = document.getElementById("fps");
var output3 = document.getElementById("demo3");
fpsSlider.oninput = function () {
    if (START == 0) {
        FPS = this.value;
        output3.innerHTML = `Framerate: ${this.value}`;
    }
};

input.addEventListener("change", function () {
    if (input.files.length > 0 && input.files[0].type.startsWith('video/')) {
        tooltip({'title':`File Uploaded!`,'icon':icon.check});
    }
})

goButton.addEventListener("click", async function () {
// thanks chatgpt you were TERRIBLE
    started = false;
    if (conversion) {
        console.log("Conversion is already in progress. Please wait.");
        return;
    }

    if (input.files.length > 0 && input.files[0].type.startsWith('video/')) {

        disableInputs(true);

        conversion = true;
        if (video.src) {
            URL.revokeObjectURL(video.src);
        }

        try {
            let videoObjectUrl = URL.createObjectURL(input.files[0]);
            video.src = videoObjectUrl;
            video.load();
        } catch (error) {
            console.error("Error creating object URL:", error);
            console.log("Conversion failed.");
        } finally {
            conversion = false;
        }
    }
});

function disableInputs(disabled) {
    document.getElementById("input").disabled = disabled;
    document.getElementById("goButton").disabled = disabled;

    document.getElementById("threshhold").disabled = disabled;
    document.getElementById("fps").disabled = disabled;
}

let seekResolve = null;
let seekComplete = false;

video.addEventListener("seeked", async function () {
    if (seekResolve) {
        seekComplete = true;
        seekResolve();
        seekResolve = null;
    }
});

function get(x, y, frame) {
    let i = (y * width + x) * 4
    return ([frame[i++], frame[i++], frame[i++], frame[i++]])
}

function bin(x, b) {
    return (String(x.toString(2).padStart(b, '0')))
}

function roundFrame(data) {
    out = []
    for (let i = 0; i < data.length; i++) {
        out.push(data[i] & bitmask)
    }
    return out
}

function coldist(c1, c2) {
    return Math.sqrt(
        (c2[0] - c1[0]) ** 2 +
        (c2[1] - c1[1]) ** 2 +
        (c2[2] - c1[2]) ** 2
    )
}

function average(x, y, s, frame = frameNow) {
    let sum = [0, 0, 0]
    let ss = 0
    for (let j = y; j < y + s; j++) {
        for (let i = x; i < x + s; i++) {
            let col = get(i, j, frame)
            sum[0] += col[0]
            sum[1] += col[1]
            sum[2] += col[2]
            ss++
        }
    }
    return [sum[0] / ss, sum[1] / ss, sum[2] / ss]
}

function vector(x, y, s, frame = frameNow) {
    let colComp = average(x, y, s, frame)
    let sum = 0
    for (let j = y; j < y + s; j++) {
        for (let i = x; i < x + s; i++) {
            sum += coldist(get(i, j, frame), colComp)
        }
    }
    return sum
}

function delta(x, y, s, frame1, frame2) {
    let sum = 0
    let dt = 16
    let temp = [0, 0, 0, 0]
    for (let j = y; j < y + s; j++) {
        for (let i = x; i < x + s; i++) {
            let c = get(i, j, frame1)
            let l = get(i, j, frame2)
            temp[0] = (Math.abs(c[0] - l[0])) / dt
            temp[1] = (Math.abs(c[1] - l[1])) / dt
            temp[2] = (Math.abs(c[2] - l[2])) / dt
            let t = Math.floor(temp[0]) + Math.floor(temp[1]) + Math.floor(temp[2])
            sum += t
        }
    }
    return sum / s / Math.sqrt(s)
}

function quadtree2(x, y, s) {
    if (s <= 1 || vector(x, y, s) / s < threshold) {
        return ({
            'x': x,
            'y': y,
            'size': s,
            'color': average(x, y, s),
        })
    }
    let z = s / 2
    return ({
        'z1': quadtree2(x, y, z),
        'z2': quadtree2(x + z, y, z),
        'z3': quadtree2(x, y + z, z),
        'z4': quadtree2(x + z, y + z, z),
    })
}

function quadtree(x, y, s) {
    if (delta(x, y, s, frameNow, frameLast) < 1) {
        return ({
            'x': x,
            'y': y,
            'size': s,
            'color': null,
        })
    }

    if (s <= 1 || vector(x, y, s, frameNow) / s < threshold) {
        return ({
            'x': x,
            'y': y,
            'size': s,
            'color': average(x, y, s),
        })
    }
    let z = s / 2
    return ({
        'z1': quadtree(x, y, z),
        'z2': quadtree(x + z, y, z),
        'z3': quadtree(x, y + z, z),
        'z4': quadtree(x + z, y + z, z),
    })
}

function draw(obj, target = ctx2) {
    if (!obj.hasOwnProperty('z1')) {
        if (obj.color != null) {
            a = obj.color
            target.fillStyle = `rgb(${a[0]},${a[1]},${a[2]})`
            target.fillRect(obj.x, obj.y, obj.size, obj.size)
        }
    } else {
        draw(obj.z1)
        draw(obj.z2)
        draw(obj.z3)
        draw(obj.z4)
    }
}

function setpixel(x, y, val, target = treeBuf) {

    let i = (y * width + x) * 4
    target[i++] = val[0]
    target[i++] = val[1]
    target[i++] = val[2]
}

function findDiffs(a1, a2) {
    let o = {}
    for (let i = 0; i < Math.max(a1.length, a2.length); i++) {
        if (Math.abs(a1[i] - a2[i]) >= 16) {
            o[i + []] = [] + [a1[i], a2[i]]
        }
    }
    return (o)
}

function setsquare(x, y, s, val, target = treeBuf) {
    if (val + [] == [253.00390625, 253.091796875, 251.671875] + []) {
        console.log(x, y, s)
    }

    for (let j = y; j < y + s; j++) {
        for (let i = x; i < x + s; i++) {
            setpixel(i, j, val, target)
        }
    }
}

function draw2(obj, target = treeBuf) {
    if (!obj.hasOwnProperty('z1')) {
        if (obj.color != null) {
            setsquare(obj.x, obj.y, obj.size, obj.color, target)
        }
    } else {
        draw2(obj.z1, target)
        draw2(obj.z2, target)
        draw2(obj.z3, target)
        draw2(obj.z4, target)
    }
}

function encode(obj) {
    if (!obj.hasOwnProperty('z1')) {
        if (obj.color != null) {
            let a = obj.color
            return `01${bin(a[0] >> 4, 4)}${bin(a[1] >> 4, 4)}${bin(a[2] >> 4, 4)}`
        } else {
            return `00`
        }
    } else {
        return `1${encode(obj.z1)}${encode(obj.z2)}${encode(obj.z3)}${encode(obj.z4)}`
    }
}

function reset() {
  input.value = '';
  START = 0;
  video.pause();
  video.currentTime = 0;
  ctx1.clearRect(0, 0, width, height);
  ctx2.clearRect(0, 0, width, height);

  document.getElementById("goButton").disabled = false;
};

function encodeb64(str) {
    str2 = ""
    chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
    for (let i = 0; i < str.length; i += 6) {
        str2 += chars[Math.floor("0b" + (str.slice(i, i + 6)))]
    }
    return str2
}

let started = false;

video.addEventListener("canplaythrough", async function() {
    console.log("Video can play through. Starting processing...");

    if (started) {
        console.log("Processing already started. Returning.");
        return;
    }

    started = true;
    video.height = 0;
    video.width = 0;
    video.currentTime = 0;
    const FRAMES = Math.ceil(video.duration * FPS);

    ctx2.fillRect(0, 0, power2Square, power2Square);
    START = 1;
    let i = 0;
    bitstream = '';
    frameLast = ctx2.getImageData(0, 0, width, height).data;
    treeBuf = new Array(4 * width * height).fill(0);
    treeBuf2 = new Array(4 * width * height).fill(0);

    const progress = document.getElementById("progress");

    while (i < FRAMES) {
        i++;

        video.currentTime = i / FPS;
        seekComplete = false;

        await new Promise((resolve, reject) => {
            seekResolve = resolve;
        });

        while (!seekComplete) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }

        console.log("Processing frame", i);
        progress.style.width = `${(i / FRAMES) * 100}%`;

        ctx1.drawImage(video, 0, 0, width, height);
        frameNow = ctx1.getImageData(0, 0, width, height).data;
        frameOut = quadtree2(0, 0, 256);

        draw2(frameOut, treeBuf);
        frameNow = treeBuf.slice();
        frameLast = treeBuf2.slice();
        frameOut = quadtree(0, 0, 256);

        draw(frameOut);
        draw2(frameOut, treeBuf2);

        bitstream += encode(frameOut);
        size = bitstream.length;
        
        document.getElementById("F").innerText = `Frame ${i} / ${FRAMES}`;
        document.getElementById("S").innerText = `Total size: ${Math.ceil(size / 6 / 1024)} KB`;
        document.getElementById("P").innerText = `Estimated size: ${Math.ceil((size / 6 * FRAMES / i) / 1024)} KB`;
        document.getElementById("R").innerText = Math.floor((i / FRAMES) * 100) + `% Complete`;
    }

    conversion = false;
    console.log("Conversion completed. Bitstream length:", size);

    document.getElementById("text").value = encodeb64(bitstream);
    disableInputs(false);
    openOutput();
    reset();

    progress.classList.add("animate-out");
    setTimeout(() => {
        progress.style.width = "0%";
        setTimeout(() => {
            progress.classList.remove("animate-out");
        }, 500);
    }, 1000);
    document.getElementById("F").innerText = `Frame ${i} / ${FRAMES}`;
    document.getElementById("S").innerText = `Total size: ${Math.ceil(size / 6 / 1024)} KB`;
    document.getElementById("P").innerText = `Estimated size: ${Math.ceil((size / 6 * FRAMES / i) / 1024)} KB`;
    document.getElementById("R").innerText = `100% Complete`;
});

function copyButton() {
    copy(document.getElementById("text").value);
    tooltip({'title':"Text Copied!",'icon':icon.check})
}

function copy(text) {
    navigator.clipboard.writeText(text);
}

function saveButton() {
    const blob = new Blob([document.getElementById("text").value], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "output.txt");

    tooltip({'title':"File Saved!",'icon':icon.check})
}

function saveAs(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
}

function openOutput() {
    document.querySelector('.output-outer').classList.add('visible');
    document.querySelector('.output-outer').classList.remove('animate-out');
}

function closeOutput() {
    document.querySelector('.output-outer').classList.add('animate-out');
    setTimeout(() => {
        document.querySelector('.output-outer').classList.remove('visible');
        document.querySelector('.output-outer').classList.remove('animate-out');
    }, 200);
}

document.querySelector('.output-outer').addEventListener("click", function(event) {
    if (!event.target.closest(".output-inner")) {
        closeOutput();
    }
});

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

// tooltip({'title':"Copied!",'icon':icon.copy})