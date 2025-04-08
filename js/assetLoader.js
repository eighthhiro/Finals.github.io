// assetLoader.js - Image asset loading
export let images = {};

export function loadImages() {
    const imageList = {
        background: "assets/bg.png",
        sova: "assets/Sova-Standing.png",
        arrow: "assets/Arrow.png",
        spike: "assets/Spike.png",
        sage: "assets/Sage.png",
        box: "assets/Box.png"
    };
    
    let loadedCount = 0;
    const totalImages = Object.keys(imageList).length;
    
    return new Promise((resolve) => {
        for (const [name, src] of Object.entries(imageList)) {
            const img = new Image();
            img.src = src;
            img.onload = () => {
                loadedCount++;
                if (loadedCount === totalImages) {
                    resolve();
                }
            };
            img.onerror = () => {
                console.warn(`Failed to load image: ${src}`);
                loadedCount++;
                if (loadedCount === totalImages) {
                    resolve();
                }
            };
            images[name] = img;
        }
    });
}