import * as cornerstone from 'cornerstone-core';
import * as cornerstoneTools from 'cornerstone-tools';
import dicomParser from 'dicom-parser';
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';



// Enable Cornerstone on the element
const element = document.getElementById('dicomImage');
cornerstone.enable(element);
cornerstoneTools.external.cornerstone = cornerstone;
cornerstoneTools.init();
// Configure WADO Image Loader
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
cornerstoneWADOImageLoader.configure({ useWebWorkers: false });


cornerstoneTools.addToolForElement(element, cornerstoneTools.WwwcTool);
cornerstoneTools.setToolActiveForElement(element, 'Wwwc', { mouseButtonMask: 1 });

cornerstoneTools.addToolForElement(element, cornerstoneTools.ZoomTool);
cornerstoneTools.setToolActiveForElement(element, 'Zoom', { mouseButtonMask: 2 });

cornerstoneTools.addToolForElement(element, cornerstoneTools.PanTool);
cornerstoneTools.setToolActiveForElement(element, 'Pan', { mouseButtonMask: 4 });

// Button and file input
const fileInput = document.getElementById('fileInput');
const loadButton = document.getElementById('loadButton');
const brightnessSlider = document.getElementById('brightnessSlider');
const contrastSlider = document.getElementById('contrastSlider');
const zoomIn = document.getElementById('zoomIn');
const zoomOut = document.getElementById('zoomOut');
const rotateLeft = document.getElementById('rotateLeft');
const rotateRight = document.getElementById('rotateRight');
const invertBtn = document.getElementById('invert');
const metadataList = document.getElementById('dicomData');
const mirrorBtn = document.getElementById('mirror');

// Variables to track transformations
let currentRotation = 0;
let currentInvert = false;
let imageScale = 1;
let currentImage = null;
let currentMirror = false;


loadButton.addEventListener('click', () => {
  const file = fileInput.files[0];
  if (!file) {
    alert('Please select a DICOM file first.');
    return;
  }

  // Create an imageId from the file
  const imageId = cornerstoneWADOImageLoader.wadouri.fileManager ? 
                  cornerstoneWADOImageLoader.wadouri.fileManager.add(file) :
                  cornerstoneWADOImageLoader.createImageIdFromFile(file);


              // Reset transforms
    currentRotation = 0;
    currentInvert = false;
    imageScale = 1;
    brightnessSlider.value = 0;
    contrastSlider.value = 0;        

  cornerstone.loadImage(imageId).then((image) => {
    cornerstone.displayImage(element, image);
    currentImage = image;
  // Reset transforms
    currentRotation = 0;
    currentInvert = false;
    imageScale = 1;
  // Get default viewport from Cornerstone
    const viewport = cornerstone.getDefaultViewportForImage(element, image);

    // Initialize sliders using the VOI values
    brightnessSlider.min = viewport.voi.windowCenter - 100;
    brightnessSlider.max = viewport.voi.windowCenter + 100;
    brightnessSlider.value = viewport.voi.windowCenter;

    contrastSlider.min = 1;
    contrastSlider.max = viewport.voi.windowWidth * 3;
    contrastSlider.value = viewport.voi.windowWidth;

    cornerstone.setViewport(element, viewport);


    // Display metadata
    metadataList.innerHTML = '';
    const dataset = image.data ? image.data : {};
    for (const tag in dataset.elements) {
      const element = dataset.elements[tag];
      const value = dataset.string(tag);
      if (value) {
        const li = document.createElement('li');
        li.textContent = `${tag}: ${value}`;
        metadataList.appendChild(li);
      }
    }


  }).catch((err) => {
    console.error('Error loading DICOM:', err);
  });
});

// Brightness / contrast using viewport
function updateViewport() {
  if (!currentImage) return;


element.style.width = currentImage.width * imageScale + 'px';
element.style.height = currentImage.height * imageScale + 'px';

// Tell Cornerstone to resize its internal canvas
cornerstone.resize(element);


  const viewport = cornerstone.getViewport(element);
  viewport.voi.windowWidth = parseInt(contrastSlider.value);
  viewport.voi.windowCenter = parseInt(brightnessSlider.value);
  viewport.invert = currentInvert;
  viewport.rotation = currentRotation;
  viewport.scale = imageScale;
    viewport.hflip = currentMirror; // <--- Mirror image horizontally
  cornerstone.setViewport(element, viewport);




}

mirrorBtn.addEventListener('click', () => {
  currentMirror = !currentMirror;
  updateViewport();
});
brightnessSlider.addEventListener('input', updateViewport);
contrastSlider.addEventListener('input', updateViewport);

// Zoom
zoomIn.addEventListener('click', () => { imageScale *= 1.2; updateViewport(); });
zoomOut.addEventListener('click', () => { imageScale /= 1.2; updateViewport(); });

// Rotate
rotateLeft.addEventListener('click', () => { currentRotation -= 90; updateViewport(); });
rotateRight.addEventListener('click', () => { currentRotation += 90; updateViewport(); });

// Invert
invertBtn.addEventListener('click', () => { currentInvert = !currentInvert; updateViewport(); });

