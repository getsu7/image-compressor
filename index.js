document.getElementById('upload').addEventListener('change', function(event) {
    const files = event.target.files;
    const imagesContainer = document.getElementById('imagesContainer');
    const downloadAllBtn = document.getElementById('downloadAllBtn');
    imagesContainer.innerHTML = ''; // Clear the container
    downloadAllBtn.style.display = 'none'; // Hide the download button initially

    const zip = new JSZip(); // Initialize a new JSZip instance
    let processedImages = 0;

    Array.from(files).forEach(file => {
        const reader = new FileReader();

        reader.onload = function(e) {
            const img = new Image();
            img.src = e.target.result;

            img.onload = function() {
                const imageContainer = document.createElement('div');
                imageContainer.classList.add('image-container');

                // Show original image
                const originalImage = document.createElement('img');
                originalImage.src = img.src;
                imageContainer.appendChild(originalImage);

                // Compression logic
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                const maxWidth = 800; // Max width of the compressed image
                const maxHeight = 600; // Max height of the compressed image
                let width = img.width;
                let height = img.height;

                // Calculate the new dimensions while maintaining the aspect ratio
                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                // Set canvas size and draw the compressed image
                canvas.width = width;
                canvas.height = height;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, width, height);

                // Convert canvas to base64 image format with reduced quality
                const compressedImage = canvas.toDataURL('image/jpeg', 0.7); // Compression quality 0.7

                // Add canvas for preview
                const compressedPreview = document.createElement('canvas');
                compressedPreview.width = width;
                compressedPreview.height = height;
                compressedPreview.getContext('2d').drawImage(canvas, 0, 0);
                imageContainer.appendChild(compressedPreview);

                // Append the image container to the main container
                imagesContainer.appendChild(imageContainer);

                // Add compressed image to the ZIP
                zip.file(`${file.name}`, compressedImage.split(',')[1], {base64: true});

                // Check if all images are processed
                processedImages++;
                if (processedImages === files.length) {
                    // Show download all button when all images are processed
                    downloadAllBtn.style.display = 'block';

                    downloadAllBtn.onclick = function() {
                        // Generate the ZIP and trigger download
                        zip.generateAsync({type: 'blob'}).then(function(content) {
                            const link = document.createElement('a');
                            link.href = URL.createObjectURL(content);
                            link.download = 'images_compressées.zip';
                            link.click();
                        });
                    };
                }
            };
        };

        reader.readAsDataURL(file);
    });
});
