let model;
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const glitchCanvas = document.getElementById('glitchCanvas');
const ctx = canvas.getContext('2d');
const glitchCtx = glitchCanvas.getContext('2d');
const startButton = document.getElementById('startButton');

const cont1 = document.getElementById('container1')
const cont2 = document.getElementById('container2')
const header = document.getElementById('heading')
const dec_el = document.getElementById('decorative-element')
console.log(header)

// Variables for person detection alerting.
let lastPersonTime = Date.now();
let personInView = false;
let alarmInterval = null;

// Set up the webcam feed with improved resolution constraints.
async function setupCamera() {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment",
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    });
    video.srcObject = stream;
    return new Promise(resolve => {
      video.onloadedmetadata = () => resolve(video);
    });
  } else {
    alert("Webcam not available.");
  }
}

// Adjust canvas size to fill the window and set the proper drawing scale.
function adjustCanvasSize() {
  const dpr = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;
  // const availableWidth = window.innerWidth;
  // const availableHeight = window.innerHeight;
  // Set the canvas's internal resolution.
  // canvas.width = availableWidth * dpr;
  // canvas.height = availableHeight * dpr;
  // // Set the displayed size via CSS.
  // canvas.style.width = availableWidth + "px";
  // canvas.style.height = availableHeight + "px";
  // ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  [canvas, glitchCanvas].forEach(c => {
    c.width = width * dpr;
    c.height = height * dpr;
    c.style.width = width + "px";
    c.style.height = height + "px";
  });
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  glitchCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

// Draw the video feed using a "cover" crop and draw bounding boxes.
function drawFrame(predictions) {
  if (!video.videoWidth || !video.videoHeight) return;
  const canvasWidth = window.innerWidth;
  const canvasHeight = window.innerHeight;
  const videoAspect = video.videoWidth / video.videoHeight;
  const canvasAspect = canvasWidth / canvasHeight;
  let sx, sy, sWidth, sHeight;

  // Determine crop region from the video for "cover" style:
  if (canvasAspect > videoAspect) {
    // The canvas is wider than the video:
    sWidth = video.videoWidth;
    sHeight = video.videoWidth / canvasAspect;
    sx = 0;
    sy = (video.videoHeight - sHeight) / 2;
  } else {
    // The canvas is taller than the video:
    sHeight = video.videoHeight;
    sWidth = video.videoHeight * canvasAspect;
    sy = 0;
    sx = (video.videoWidth - sWidth) / 2;
  }
  // Draw the cropped video feed to fill the entire canvas.
  ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, canvasWidth, canvasHeight);

  // Draw bounding boxes:
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'red';
  ctx.font = "18px Arial";
  predictions.forEach(prediction => {
    if (prediction.score < 0.5) return;
    // Get box coordinates relative to the video.
    const [x, y, width, height] = prediction.bbox;
    // Adjust coordinates relative to the crop.
    const adjX = x - sx;
    const adjY = y - sy;
    // Scale factors from video crop to canvas.
    const scaleX = canvasWidth / sWidth;
    const scaleY = canvasHeight / sHeight;
    // Transformed bounding box on the canvas.
    const boxX = adjX * scaleX;
    const boxY = adjY * scaleY;
    const boxWidth = width * scaleX;
    const boxHeight = height * scaleY;
    //ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
    ctx.fillStyle = 'red';
    // ctx.fillText(
    //   `${prediction.class} ${(prediction.score * 100).toFixed(1)}%`,
    //   boxX,
    //   boxY > 10 ? boxY - 5 : 10
    // );
  });
}

let glitchIntensity = 3; // Start with a base intensity
let glitchMax = 25; // Cap the max intensity
let glitchGrowth = 1.02;
let sizeMultiplier = 1; // This will control glitch size scaling

function resetGlitchEffect() {
  glitchIntensity = 3; // Reset when a person is detected
  sizeMultiplier = 1;
}

function drawGlitchEffect() {
  let rect = glitchCanvas.getBoundingClientRect()
  glitchCtx.clearRect(0, 0, rect.width, rect.height);

  let maxGlitches = Math.min(glitchIntensity, glitchMax);
  sizeMultiplier = Math.min(1 + glitchIntensity / 50, 3);
  //console.log(glitchCanvas.width + "|" + glitchCanvas.height)
  for (let i = 0; i < maxGlitches / 4; i++) { // Create 6 glitchy fragments
    let x = Math.random() * rect.width;
    let y = (Math.random() * 20 - 10) * sizeMultiplier; // Only on edges
    let width = Math.random() * 100 + 50 * sizeMultiplier;
    let height = Math.random() * 30 + 10 * sizeMultiplier;
    let distortion = Math.random() * 20 - 10;
    glitchCtx.fillStyle = `rgba(${Math.random() * 255}, 0, ${Math.random() * 255}, 0.6)`;
    glitchCtx.fillRect(x + distortion, y, width, height);
    glitchCtx.fillRect(x + distortion, rect.height - y, width, height);
  }
  for (let i = 0; i < maxGlitches / 4; i++) { // Create 6 glitchy fragments
    let x = Math.random() * rect.width;
    let y = (Math.random() * 20 + rect.height - 20) * sizeMultiplier; // Only on edges
    let width = Math.random() * 100 + 50 * sizeMultiplier;
    let height = Math.random() * 30 + 10 * sizeMultiplier;
    let distortion = Math.random() * 20 - 10;
    glitchCtx.fillStyle = `rgba(${Math.random() * 255}, 0, ${Math.random() * 255}, 0.6)`;
    glitchCtx.fillRect(x + distortion, y, width, height);
    glitchCtx.fillRect(x + distortion, rect.height - y, width, height);
  }
  for (let i = 0; i < maxGlitches / 4; i++) { // Create 6 glitchy fragments
    let x = (Math.random() * 20) * sizeMultiplier;
    let y = Math.random() * rect.height; // Only on edges
    let width = Math.random() * 10 + 5 * sizeMultiplier;
    let height = Math.random() * 100 + 50 * sizeMultiplier;
    let distortion = Math.random() * 20 - 10;
    glitchCtx.fillStyle = `rgba(${Math.random() * 255}, 0, ${Math.random() * 255}, 0.6)`;
    glitchCtx.fillRect(x + distortion, y, width, height);
    glitchCtx.fillRect(x + distortion, rect.height - y, width, height);
  }
  for (let i = 0; i < maxGlitches / 4; i++) { // Create 6 glitchy fragments
    let x = (Math.random() * 20 + rect.width - 40);
    console.log(x)
    let y = Math.random() * rect.height; // Only on edges
    let width = Math.random() * 10 + 5 * sizeMultiplier;
    let height = Math.random() * 100 + 50 * sizeMultiplier;
    let distortion = Math.random() * 20 - 10;
    glitchCtx.fillStyle = `rgba(${Math.random() * 255}, 0, ${Math.random() * 255}, 0.6)`;
    glitchCtx.fillRect(x + distortion, y, width, height);
    glitchCtx.fillRect(x + distortion, rect.height - y, width, height);
  }

  // **NEW: Add gradual glitches in the center over time**
  if (glitchIntensity > 10) { // Delay center glitches until some time has passed
    for (let i = 0; i < maxGlitches / 2; i++) {
      let x = Math.random() * rect.width;
      let y = Math.random() * rect.height;
      let width = Math.random() * 40 + 10 * sizeMultiplier;
      let height = Math.random() * 20 + 5 * sizeMultiplier;
      let distortion = Math.random() * 10 - 5;
      glitchCtx.fillStyle = `rgba(${Math.random() * 255}, 0, ${Math.random() * 255}, 0.3)`;
      glitchCtx.fillRect(x + distortion, y, width, height);
    }
  }

  // Gradually increase clutter, but slow at first
  glitchIntensity *= glitchGrowth;
}

function startGlitch() {
  if (!personInView) {
    drawGlitchEffect();
    setTimeout(startGlitch, 200);
  } else {
    glitchCtx.clearRect(0, 0, glitchCanvas.width, glitchCanvas.height);
    resetGlitchEffect()
  }
}

// Start continuous vibration alarm.
function startAlarm() {
  if (alarmInterval === null && navigator.vibrate) {
    alarmInterval = setInterval(() => {
      navigator.vibrate([500, 500]); // vibrate 500ms, pause 500ms
    }, 1000);
    console.log("Alarm started: No person detected for 3 seconds!");
  } else if (!navigator.vibrate) {
    console.log("No person detected for 3 seconds!");
  }
  startGlitch();
}

// Stop the vibration alarm.
function stopAlarm() {
  if (alarmInterval !== null) {
    clearInterval(alarmInterval);
    alarmInterval = null;
    navigator.vibrate(0);
    console.log("Person detected: Alarm stopped.");
  }
  glitchCtx.clearRect(0, 0, glitchCanvas.width, glitchCanvas.height);
}

// Check predictions for a person.
function checkPersonDetection(predictions) {
  const personDetected = predictions.some(prediction =>
    prediction.class === 'person' && prediction.score > 0.5
  );
  const now = Date.now();
  if (personDetected) {
    if (!personInView) console.log("Person In view!");
    personInView = true;
    lastPersonTime = now;
    stopAlarm();
  } else {
    personInView = false;
    if (now - lastPersonTime > 1000) {
      startAlarm();
    }
  }
}

// Run object detection and drawing on each frame.
async function detectFrame() {
  const predictions = await model.detect(video);
  drawFrame(predictions);
  checkPersonDetection(predictions);
  requestAnimationFrame(detectFrame);
}

// Main function: set up camera, canvas, load model, and start detection.
async function main() {
  await setupCamera();
  adjustCanvasSize();
  video.play();
  video.onloadedmetadata = () => {
    //adjustCanvasSize();
  };
  window.addEventListener('resize', adjustCanvasSize);
  model = await cocoSsd.load();
  console.log('COCO-SSD model loaded.');
  detectFrame();
}

// Start detection on user click.
startButton.addEventListener('click', () => {
  startButton.style.display = 'none';
  cont1.style.display = 'none';
  cont2.style.display = 'none';
  dec_el.style.display = 'none';
  header.style.display = 'none';
  main();
});