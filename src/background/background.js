// background.js
import browser from 'webextension-polyfill';

console.log("GGEZGGGAEZZ")


browser.runtime.onMessage.addListener((request, sender) => {
  if (request.action === "openFileChooser") {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.epub';

      input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve({ content: event.target.result });
        };
        reader.readAsArrayBuffer(file);
      };
      window.open("https://youtube.com", "_blank");
      input.click();
    });
  }
});
