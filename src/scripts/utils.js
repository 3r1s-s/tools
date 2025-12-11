export const icon = {
    "check": `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="m10 15.586-3.293-3.293-1.414 1.414L10 18.414l9.707-9.707-1.414-1.414z"></path></svg>`,
    "home": `<svg width="22" height="21" viewBox="0 0 22 21" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.5258 0.204649C11.2291 -0.0682165 10.7709 -0.0682161 10.4742 0.204649L0.249923 9.68588C-0.266994 10.1612 0.0714693 11.0197 0.775759 11.0197L3.48971 11.0197V18.6923C3.48971 19.542 4.18295 20.2308 5.03811 20.2308H16.9619C17.8171 20.2308 18.5103 19.542 18.5103 18.6923V11.0197L21.2242 11.0197C21.9285 11.0197 22.267 10.1612 21.7501 9.68588L11.5258 0.204649Z" fill="currentColor"/></svg> `,
};

export function sanitize(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/`/g, '&#96;')
        .replace(/'/g, '&#39;');
}

export function tooltip(data) {
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
        ${data.title ? `<span>${sanitize(data.title)}</span>` : ``}
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

export function copy(text) {
    navigator.clipboard.writeText(text);
}

export function saveAs(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
}

export function saveUrlAs(url, filename) {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
        document.body.removeChild(a);
    }, 0);
}
