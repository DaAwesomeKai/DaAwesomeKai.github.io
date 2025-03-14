// script.js

// Global variables
let audioContext;
let analyser;
let dataArray;
let source;
let bufferLength;
let animationId;
let useMicrophone = false;
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const pngImage = new Image();
pngImage.src = 'talk.png'; // Path to your PNG image
let currentScale = 1;
const minScale = 0.5;
const maxScale = 2;
let sensitivity = 1.5; // Adjust sensitivity factor

// Set up canvas size to match viewport
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Initialize audio context and analyser based on an audio stream
function setupAudioContext(stream) {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (source) {
    source.disconnect();
  }
  source = audioContext.createMediaStreamSource(stream);
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;
  bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);
  source.connect(analyser);
}

// Event listener for using the microphone as input
document.getElementById('micBtn').addEventListener('click', async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    setupAudioContext(stream);
    useMicrophone = true;
    cancelAnimationFrame(animationId);
    animate();
  } catch (err) {
    console.error('Error accessing microphone:', err);
  }
});

// Event listener for preloaded audio file input
document.getElementById('audioFileInput').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  useMicrophone = false;
  // Stop any current audio stream
  if (audioContext && audioContext.state !== 'closed') {
    audioContext.close();
  }
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    audioContext.decodeAudioData(e.target.result, (buffer) => {
      if (source) {
        source.disconnect();
      }
      source = audioContext.createBufferSource();
      source.buffer = buffer;
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      bufferLength = analyser.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      source.start(0);
      cancelAnimationFrame(animationId);
      animate();
    }, (err) => console.error('Error decoding audio file', err));
  };
  fileReader.readAsArrayBuffer(file);
});

// The animation loop which scales the image according to the audio volume
function animate() {
  animationId = requestAnimationFrame(animate);
  
  if (analyser) {
    // Get audio data from the time domain
    analyser.getByteTimeDomainData(dataArray);
    
    // Calculate RMS (Root Mean Square) of the audio signal
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      const sample = (dataArray[i] - 128) / 128;
      sum += sample * sample;
    }
    const rms = Math.sqrt(sum / bufferLength);
    
    // Determine the target scale based on the volume and sensitivity
    // Scale will vary between minScale and maxScale
    const targetScale = Math.min(maxScale, Math.max(minScale, 1 + rms * sensitivity));
    // Apply easing for a smooth transition
    currentScale += (targetScale - currentScale) * 0.1;
    
    drawImage();
  }
}

// Draw the PNG on the canvas with the current scaling factor
function drawImage() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!pngImage.complete) return;
  const imgWidth = pngImage.width;
  const imgHeight = pngImage.height;
  const scaledWidth = imgWidth * currentScale;
  const scaledHeight = imgHeight * currentScale;
  
  // Center the image on the canvas
  ctx.drawImage(pngImage, 
    canvas.width / 2 - scaledWidth / 2, 
    canvas.height / 2 - scaledHeight / 2, 
    scaledWidth, scaledHeight);
}