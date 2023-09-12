const cameraFeed = document.getElementById('camera-feed');
const wrapCamera = document.getElementById('wrapCamera');
const CameraPreview = document.getElementById('CameraPreview');
const toggleCameraButton = document.getElementById('toggle-camera');
const captureButton = document.getElementById('capture');
const flipImageButton = document.getElementById('flip-image');
const retakeButton = document.getElementById('retake');
const shareButton = document.getElementById('share');
const downloadButton = document.getElementById('download');
const canvas = document.getElementById('canvas');

let isFrontCamera = true;
let imageFlipped = false;


let imageHieght = "1200";
let imageWidth = "1200";

function getImageDetails(cameraFeed) {
    console.log(cameraFeed.controller);
    let renderImageWidth = imageWidth;
    let renderImageHeight = (renderImageWidth*cameraFeed.videoHeight)/cameraFeed.videoWidth;
    let SpaceFromTop = (imageHieght - renderImageHeight)/2;
    return { renderImageWidth, renderImageHeight, SpaceFromTop };
}

let backgroundImage = new Image(); // Create an image object for the background image
backgroundImage.src = './assets/img/Photo_Filter.png';

// Function to initialize the camera feed
async function initializeCamera() {
    try {
        console.log(cameraFeed);
        if(cameraFeed.srcObject !== null && cameraFeed.srcObject.getTracks().length > 0) {
            cameraFeed.srcObject.getTracks().forEach((track) => {
                track.stop()
            })
        }
        const stream = await navigator.mediaDevices?.getUserMedia({ video: { facingMode: isFrontCamera ? 'user' : 'environment' } });
        cameraFeed.srcObject = stream;
        console.log(stream, navigator.mediaDevices);
        
        cameraFeed.onloadedmetadata = function(e) {
            cameraFeed.play();
         };
    } catch (error) {
        console.error('Error accessing camera:', error);
    }
}

// Toggle between front and back camera
toggleCameraButton.addEventListener('click', () => {
    isFrontCamera = !isFrontCamera;
    initializeCamera();
});

function drawBackgroundImage() {
    const ctx = canvas.getContext('2d');
    ctx.drawImage(backgroundImage, 0, 0, imageWidth, imageHieght);
}


// Capture an image
captureButton.addEventListener('click', () => {
    const video = cameraFeed;

    // video.addEventListener('canplay', () => {
        // Stop the video feed and release the camera

        wrapCamera.style.display= 'none';

        
        canvas.width = imageWidth;
        canvas.height = imageHieght;
        const { renderImageWidth, renderImageHeight, SpaceFromTop } = getImageDetails(video);
        console.log(renderImageHeight, renderImageWidth, SpaceFromTop);
        
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // ctx.scale(-1, 1);
        ctx.drawImage(video, 0, SpaceFromTop, renderImageWidth, renderImageHeight);
        // ctx.drawImage(video, 0, 0, renderImageWidth, imageHieght);
        drawBackgroundImage();
        canvas.style.display = 'block';

        captureButton.classList.remove('alignBtnTextIcon');
        toggleCameraButton.classList.remove('alignBtnTextIcon');
        flipImageButton.classList.add('alignBtnTextIcon');
        retakeButton.classList.add('alignBtnTextIcon');
        shareButton.classList.add('alignBtnTextIcon');
        downloadButton.classList.add('alignBtnTextIcon');

        setTimeout(() => {
            const tracks = video.srcObject.getTracks();
            tracks.forEach(track => track.stop())
        }, 1000);
    // });

    // if (video.readyState >= 3) {
    //     video.dispatchEvent(new Event('canplay'));
    // }
});

// Flip the captured image
flipImageButton.addEventListener('click', () => {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    console.log(imageFlipped, ctx);
    const { renderImageWidth, renderImageHeight, SpaceFromTop } = getImageDetails(cameraFeed);
    if(!imageFlipped) {
        console.log(1);
        ctx.scale(-1, 1);
        drawBackgroundImage();
        ctx.drawImage(cameraFeed, 50, SpaceFromTop, -renderImageWidth, renderImageHeight);
        imageFlipped = true;
    } else {
        console.log(2);
        ctx.scale(1, -1);
        drawBackgroundImage();
        ctx.drawImage(cameraFeed, 50, SpaceFromTop, renderImageWidth, renderImageHeight);
        imageFlipped = false;
    }
});

// Retake a photo
retakeButton.addEventListener('click', () => {
    wrapCamera.style.display= 'block';
    captureButton.classList.add('alignBtnTextIcon');
    toggleCameraButton.classList.add('alignBtnTextIcon');
    flipImageButton.classList.remove('alignBtnTextIcon');
    retakeButton.classList.remove('alignBtnTextIcon');
    shareButton.classList.remove('alignBtnTextIcon');
    downloadButton.classList.remove('alignBtnTextIcon');
    canvas.style.display = 'none';
    initializeCamera();
});

// Share button (add your sharing logic here)
shareButton.addEventListener('click', () => {
    canvas.toBlob(async function (blob) {
        // Create a File object
        const file = new File([blob], 'image.png', { type: blob.type });

        // Check if the 'share' API is available in the browser
        if (navigator.share) {
            try {
                // Define the data to be shared
                const shareData = {
                    // text: 'Rashi Peripherals at Electronica Expo 2023',
                    // title: 'Rashi Peripherals at Electronica Expo 2023',
                    files: [file]
                };

                // Use the 'share' API to trigger the share dialog
                await navigator.share(shareData);
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            // Sharing not supported in this browser
            console.warn('Sharing not supported');
        }
    });
});

// Download button
downloadButton.addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'captured_image.png';
    link.click();
});

// Initialize the camera
initializeCamera();
