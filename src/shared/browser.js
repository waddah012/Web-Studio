export function find(selector) {
  const element = document.querySelector(selector);
  if (!element) throw new Error(`Required interface element missing: ${selector}`);
  return element;
}

export function downloadFile(filename, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function createNotifier(element) {
  let timer;
  return message => {
    element.textContent = message;
    element.hidden = false;
    clearTimeout(timer);
    timer = setTimeout(() => { element.hidden = true; }, 6000);
  };
}
