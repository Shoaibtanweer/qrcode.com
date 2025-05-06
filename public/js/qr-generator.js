// --- QR Generator Script ---
// Handles QR code generation, customization, downloads (PNG, SVG, JPG), and clearing.

document.addEventListener('DOMContentLoaded', () => {
    // --- Get Common UI Elements ---
    const qrForm = document.getElementById('qr-form');
    const qrCodeResultImg = document.getElementById('qr-code-result');
    const qrCodePlaceholder = document.getElementById('qr-code-placeholder');
    const loadingIndicator = document.getElementById('loading');
    const errorMessageDiv = document.getElementById('error-msg');
    const downloadArea = document.getElementById('download-area');
    const generateBtn = document.getElementById('generate-btn');
    const clearBtn = document.getElementById('clear-btn');

    // --- Get Download Buttons ---
    const downloadPngBtn = document.getElementById('download-png');
    const downloadSvgBtn = document.getElementById('download-svg');
    const downloadJpgBtn = document.getElementById('download-jpg'); // Get JPG button

    // --- Get Customization Inputs ---
    const colorDarkInput = document.getElementById('qr-color-dark');
    const colorLightInput = document.getElementById('qr-color-light');

    // --- Exit if not on a tool page ---
    if (!qrForm) { return; }

    // --- Determine Tool Type and API Endpoint ---
    let qrType = 'text', apiUrl = '/api/qr/text', inputElement = null, isFileType = false;
    // ... (same tool detection logic) ...
    if (document.getElementById('number-input')) { qrType = 'number'; apiUrl = '/api/qr/number'; inputElement = document.getElementById('number-input'); }
    else if (document.getElementById('text-input')) { qrType = 'text'; apiUrl = '/api/qr/text'; inputElement = document.getElementById('text-input'); }
    else if (document.getElementById('link-input')) { qrType = 'link'; apiUrl = '/api/qr/link'; inputElement = document.getElementById('link-input'); }
    else if (document.getElementById('pdf-input')) { qrType = 'pdf'; apiUrl = '/api/qr/pdf'; inputElement = document.getElementById('pdf-input'); isFileType = true; }
    else if (document.getElementById('image-input')) { qrType = 'image'; apiUrl = '/api/qr/image'; inputElement = document.getElementById('image-input'); isFileType = true; }
    else { console.error("Could not determine QR tool type."); return; }
    // console.log(`QR Tool Initialized: Type=${qrType}, API=${apiUrl}, FileType=${isFileType}`);


    // --- Initial State for Download Buttons ---
    if (downloadPngBtn) downloadPngBtn.disabled = true;
    if (downloadSvgBtn) downloadSvgBtn.disabled = true;
    if (downloadJpgBtn) downloadJpgBtn.disabled = true; // JPG initially disabled

    // --- Form Submit Event Listener ---
    qrForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        // --- 1. Reset UI State --- (Keep existing reset logic)
        if (qrCodeResultImg) { qrCodeResultImg.style.display = 'none'; qrCodeResultImg.src = ''; }
        if (qrCodePlaceholder) qrCodePlaceholder.style.display = 'flex';
        if (downloadArea) downloadArea.style.display = 'none';
        if (errorMessageDiv) { errorMessageDiv.style.display = 'none'; errorMessageDiv.textContent = ''; }
        if (loadingIndicator) loadingIndicator.style.display = 'block';
        if (generateBtn) generateBtn.disabled = true;
        if (downloadPngBtn) downloadPngBtn.disabled = true;
        if (downloadSvgBtn) downloadSvgBtn.disabled = true;
        if (downloadJpgBtn) downloadJpgBtn.disabled = true; // <-- JPG: Disable on reset
        if (clearBtn) clearBtn.style.display = 'none';

        // --- 2. Collect Customization Options --- (Keep existing logic)
        const qrOptions = { color: { dark: colorDarkInput?.value || '#000000', light: colorLightInput?.value || '#FFFFFF' } };

        // --- 3. Prepare Request Body and Options --- (Keep existing logic)
        let requestBody, fetchOptions = { method: 'POST', headers: {} };
        try {
            if (isFileType) { /* ... FormData logic ... */
                if (!inputElement?.files?.length) { throw new Error('Please select a file.'); }
                const file = inputElement.files[0];
                const formData = new FormData();
                formData.append('file', file);
                formData.append('options', JSON.stringify(qrOptions));
                requestBody = formData;
            } else { /* ... JSON body logic ... */
                 if (!inputElement) throw new Error('Input element not found.');
                 const data = inputElement.value;
                 if (!data?.trim() && !(qrType === 'number' && data === '0')) { throw new Error('Input cannot be empty.'); }
                 requestBody = JSON.stringify({ data: data, options: qrOptions });
                 fetchOptions.headers['Content-Type'] = 'application/json';
            }
            fetchOptions.body = requestBody;

            // --- 4. Make API Request --- (Keep existing logic)
            const response = await fetch(apiUrl, fetchOptions);

            // --- 5. Handle API Response --- (Keep existing logic)
            const result = await response.json();
            if (!response.ok) { throw new Error(result.message || `Server Error: ${response.status}`); }
            // console.log("API Success Response:", result);
            // console.log("SVG String Received:", result.qrCodeSvgString);

            // --- 6. Update UI with successful result ---
            if (result.qrCodeDataUrl && result.qrCodeSvgString) {
                // Display PNG Preview
                if (qrCodeResultImg) {
                     qrCodeResultImg.src = result.qrCodeDataUrl; // Use PNG Data URL for preview
                     qrCodeResultImg.style.display = 'block';
                     if (qrCodePlaceholder) qrCodePlaceholder.style.display = 'none';
                 }
                // Prepare Downloads
                if (downloadArea) downloadArea.style.display = 'block';
                if (downloadPngBtn) { downloadPngBtn.dataset.qrData = result.qrCodeDataUrl; downloadPngBtn.disabled = false; }
                if (downloadSvgBtn) { downloadSvgBtn.dataset.qrData = result.qrCodeSvgString; downloadSvgBtn.disabled = false; }
                if (downloadJpgBtn) {
                    downloadJpgBtn.dataset.qrPngData = result.qrCodeDataUrl; // <-- JPG: Store PNG data for JPG conversion
                    downloadJpgBtn.disabled = false; // <-- JPG: Enable button
                }

                // Show Clear button
                if (clearBtn) { clearBtn.style.display = 'inline-block'; }
                else { console.warn("Clear button element not found.");}

            } else {
                throw new Error('Received incomplete data (Missing PNG or SVG).');
            }

        } catch (error) { // --- 7. Handle Errors --- (Keep existing logic)
            console.error('Error during QR generation process:', error);
            if (errorMessageDiv) { errorMessageDiv.textContent = `Error: ${error.message}`; errorMessageDiv.style.display = 'block'; }
            if (qrCodeResultImg) qrCodeResultImg.style.display = 'none';
            if (qrCodePlaceholder) qrCodePlaceholder.style.display = 'flex';
            if (downloadArea) downloadArea.style.display = 'none';
            if (clearBtn) clearBtn.style.display = 'none';
             if (downloadPngBtn) downloadPngBtn.disabled = true;
             if (downloadSvgBtn) downloadSvgBtn.disabled = true;
             if (downloadJpgBtn) downloadJpgBtn.disabled = true; // <-- JPG: Disable on error

        } finally { // --- 8. Final UI Cleanup --- (Keep existing logic)
            if (loadingIndicator) loadingIndicator.style.display = 'none';
            if (generateBtn) generateBtn.disabled = false;
        }
    }); // --- End form submit listener ---


    // --- Clear Button Event Listener --- (Keep existing logic)
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (inputElement) { inputElement.value = ''; if (isFileType) { try { inputElement.value = null; } catch(e) {} } }
            if (qrCodeResultImg) { qrCodeResultImg.style.display = 'none'; qrCodeResultImg.src = ''; }
            if (qrCodePlaceholder) qrCodePlaceholder.style.display = 'flex';
            if (downloadArea) downloadArea.style.display = 'none';
            if (downloadPngBtn) downloadPngBtn.disabled = true;
            if (downloadSvgBtn) downloadSvgBtn.disabled = true;
            if (downloadJpgBtn) downloadJpgBtn.disabled = true; // <-- JPG: Disable on clear
            if (errorMessageDiv) errorMessageDiv.style.display = 'none';
            clearBtn.style.display = 'none';
            if (inputElement) { inputElement.focus(); }
        });
    } else { console.warn("Clear button element not found."); }


    // --- Download Button Event Listeners ---

    // PNG Download Handler (Keep existing logic)
    if (downloadPngBtn) {
         downloadPngBtn.addEventListener('click', () => {
             const qrDataUrl = downloadPngBtn.dataset.qrData;
             if (qrDataUrl) { triggerDownload(qrDataUrl, `qr-code-${qrType}.png`); }
             else { console.error("No PNG data for download."); }
         });
     }
    // SVG Download Handler (Keep existing logic)
    if (downloadSvgBtn) {
         downloadSvgBtn.addEventListener('click', () => {
             const svgString = downloadSvgBtn.dataset.qrData;
             if (svgString && typeof svgString === 'string' && svgString.trim().startsWith('<svg')) {
                 const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
                 const url = URL.createObjectURL(blob);
                 triggerDownload(url, `qr-code-${qrType}.svg`);
                 setTimeout(() => URL.revokeObjectURL(url), 100);
             } else { console.error("Invalid or missing SVG data. Data:", svgString); alert("Could not download SVG: Invalid data received."); }
         });
     }

    // --- NEW: JPG Download Handler ---
    if (downloadJpgBtn) {
        downloadJpgBtn.addEventListener('click', () => {
            const pngDataUrl = downloadJpgBtn.dataset.qrPngData; // Get the stored PNG data URL
            if (!pngDataUrl) {
                console.error("No base PNG data available for JPG conversion.");
                alert("Cannot download JPG. Please generate QR code first.");
                return;
            }

            console.log("Starting JPG conversion from PNG data...");

            // 1. Create an Image element to load the PNG data
            const image = new Image();
            image.onload = () => {
                 console.log("PNG image loaded for JPG conversion. Dimensions:", image.width, "x", image.height);
                // 2. Create an invisible canvas
                const canvas = document.createElement('canvas');
                canvas.width = image.width;   // Set canvas size to match image
                canvas.height = image.height;

                // 3. Get 2D drawing context
                const ctx = canvas.getContext('2d');

                // 4. IMPORTANT: Draw white background (JPG doesn't support transparency)
                ctx.fillStyle = '#FFFFFF'; // Use white or the 'light' color used for QR
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // 5. Draw the loaded PNG image onto the canvas
                ctx.drawImage(image, 0, 0);
                 console.log("Image drawn onto canvas.");

                // 6. Export canvas content as JPG Data URL
                // toDataURL('image/jpeg', quality) - quality is 0.0 to 1.0
                try {
                     const jpgDataUrl = canvas.toDataURL('image/jpeg', 0.9); // 0.9 = 90% quality
                     console.log("Canvas converted to JPG Data URL (length):", jpgDataUrl.length);

                    // 7. Trigger the download
                    triggerDownload(jpgDataUrl, `qr-code-${qrType}.jpg`);

                } catch (e) {
                     console.error("Error converting canvas to JPG:", e);
                     alert("Failed to convert QR code to JPG format.");
                }
            };
            image.onerror = () => {
                console.error("Failed to load the base PNG image for JPG conversion.");
                alert("Could not load QR code image for JPG download.");
            };

            // Set the source of the image element to start loading
            image.src = pngDataUrl;
        });
    }
    // --- End JPG Download Handler ---


}); // --- End DOMContentLoaded ---

// --- Helper Function for Triggering Downloads --- (Keep existing function)
function triggerDownload(url, filename) {
     const link = document.createElement('a');
     link.href = url;
     link.download = filename;
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
     // console.log(`Download triggered for: ${filename}`); // Optional log
 }
