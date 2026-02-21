(() => {
  const textInput = document.getElementById("qr-text");
  const sizeSelect = document.getElementById("qr-size");
  const qrImage = document.getElementById("qr-image");
  const placeholder = document.getElementById("qr-placeholder");
  const statusMessage = document.getElementById("status-message");
  const generateBtn = document.getElementById("generate-btn");
  const downloadBtn = document.getElementById("download-btn");

  if (
    !textInput ||
    !sizeSelect ||
    !qrImage ||
    !placeholder ||
    !statusMessage ||
    !generateBtn ||
    !downloadBtn
  ) {
    return;
  }

  let currentQrUrl = "";

  function setStatus(message, isError = false) {
    statusMessage.textContent = message;
    statusMessage.classList.toggle("error", isError);
  }

  function buildQrUrl(text, size) {
    const encodedText = encodeURIComponent(text);
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedText}&margin=0`;
  }

  function clearPreview() {
    currentQrUrl = "";
    qrImage.hidden = true;
    qrImage.removeAttribute("src");
    placeholder.hidden = false;
    downloadBtn.disabled = true;
  }

  function generateQrCode() {
    const text = textInput.value.trim();
    const size = sizeSelect.value;

    if (!text) {
      setStatus("Please enter text or a URL first.", true);
      clearPreview();
      textInput.focus();
      return;
    }

    const url = `${buildQrUrl(text, size)}&_t=${Date.now()}`;
    currentQrUrl = url;
    setStatus("Generating QR code...", false);
    generateBtn.disabled = true;
    downloadBtn.disabled = true;

    qrImage.onload = () => {
      placeholder.hidden = true;
      qrImage.hidden = false;
      setStatus("QR code generated successfully.");
      generateBtn.disabled = false;
      downloadBtn.disabled = false;
    };

    qrImage.onerror = () => {
      setStatus("Could not generate QR code. Check your connection.", true);
      generateBtn.disabled = false;
      clearPreview();
    };

    qrImage.src = url;
  }

  async function downloadQrCode() {
    if (!currentQrUrl) {
      return;
    }

    const filename = `qrcode-${Date.now()}.png`;

    try {
      const response = await fetch(currentQrUrl);
      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
      setStatus("QR code downloaded.");
    } catch (error) {
      const fallbackLink = document.createElement("a");
      fallbackLink.href = currentQrUrl;
      fallbackLink.download = filename;
      document.body.appendChild(fallbackLink);
      fallbackLink.click();
      fallbackLink.remove();
      setStatus("Download started.");
    }
  }

  generateBtn.addEventListener("click", generateQrCode);
  downloadBtn.addEventListener("click", downloadQrCode);

  textInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      generateQrCode();
    }
  });

  sizeSelect.addEventListener("change", () => {
    if (qrImage.hidden) {
      return;
    }
    generateQrCode();
  });
})();
