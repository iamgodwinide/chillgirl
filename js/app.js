// Style boxes based on image map coordinates
const styleBoxes = () => {
    Array(34).fill(0).forEach((_, i) => {
        const box = document.getElementsByClassName("box")[i];
        const area = document.getElementsByTagName("area")[i];

        if (area) {
            const [x1, y1, x2, y2] = area.coords.split(",").map(Number);
            box.style.width = Math.abs(x1 - x2) + "px";
            box.style.height = Math.abs(y1 - y2) + "px";
            box.style.left = x1 + "px";
            box.style.top = y1 + "px";
        }
    });
};

// Update box positions periodically
setInterval(styleBoxes, 1000);

// Canvas setup
const canvas = document.getElementById('canvas30');
const ctx = canvas.getContext('2d');

// Character state management
const characterState = {
    frame: 'frame',  // Initial frame
    background: 'bg1',
    body: 'body1',
    acessory: 'acessory1',
    glasses: 'glasses1',
    hat: 'hat1'
};

// Canvas utility functions
const clearCanvas = () => ctx.clearRect(0, 0, canvas.width, canvas.height);

const drawImage = (imagePath) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            // If it's the frame, draw it at full canvas size
            if (imagePath.includes('frame')) {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            } else {
                // For other images, draw them slightly smaller to fit within the frame
                const padding = canvas.width * 0.1; // 10% padding
                ctx.drawImage(img, 
                    padding, padding, 
                    canvas.width - (padding * 2), 
                    canvas.height - (padding * 2)
                );
            }
            resolve();
        };
        img.onerror = (error) => {
            console.error('Error loading image:', imagePath, error);
            reject(error);
        };
        img.src = imagePath;
    });
};

// Update selected item visual indicator
const updateSelectedItems = () => {
    // Remove selected class from all images
    document.querySelectorAll('.grid-item img').forEach(img => {
        img.classList.remove('selected');
    });

    // Add selected class to currently selected items
    Object.entries(characterState).forEach(([key, value]) => {
        if (value && key !== 'frame') {
            const selectedImg = document.querySelector(`.grid-item img[src$="${value}.png"]`);
            if (selectedImg) {
                selectedImg.classList.add('selected');
            }
        }
    });
};

// Character customization functions
const updateCharacterPart = async (type, imageName) => {
    try {
        characterState[type] = imageName;
        clearCanvas();
        
        // Draw frame first
        await drawImage('/images/templates/frame.png');
        
        // Then draw other parts in order
        const parts = ['background', 'body', 'acessory', 'glasses', 'hat'];
        for (const part of parts) {
            if (characterState[part]) {
                await drawImage(`/images/assets/${characterState[part]}.png`);
            }
        }
        updateSelectedItems();
    } catch (error) {
        console.error('Error updating character:', error);
    }
};

const getImageType = (imageSrc) => {
    if (imageSrc.includes('bg')) return 'background';
    if (imageSrc.includes('body')) return 'body';
    if (imageSrc.includes('acessory')) return 'acessory';
    if (imageSrc.includes('glasses')) return 'glasses';
    if (imageSrc.includes('hat')) return 'hat';
    return null;
};

// Event listeners
document.querySelectorAll('.grid-item img').forEach((img) => {
    img.addEventListener('click', () => {
        const imageSrc = img.src;
        const fileName = imageSrc.split('/').pop().replace('.png', '');
        const imageType = getImageType(fileName);
        
        if (imageType) {
            updateCharacterPart(imageType, fileName);
        }
    });
});

// Canvas responsiveness
const resizeCanvas = () => {
    const canvasContainer = canvas.parentElement;
    const size = Math.min(canvasContainer.clientWidth, canvasContainer.clientHeight);
    canvas.width = size;
    canvas.height = size;
    
    // Redraw all parts after resize
    updateCharacterPart('background', characterState.background);
};

// Initialize canvas size and draw default character
resizeCanvas();
updateSelectedItems();

// Add resize listener
window.addEventListener('resize', resizeCanvas);

// Download functionality
document.getElementById('downloadBtn').addEventListener('click', () => {
    // Create a temporary link element
    const link = document.createElement('a');
    
    // Get the canvas data as PNG
    const image = canvas.toDataURL('image/png');
    
    // Set up the download
    link.href = image;
    link.download = 'my-chillgirl.png';
    
    // Trigger the download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});
