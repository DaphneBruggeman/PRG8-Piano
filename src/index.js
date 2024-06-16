let model;
let videoWidth, videoHeight;
let ctx, canvas;
const log = document.querySelector("#array");
const VIDEO_WIDTH = 720;
const VIDEO_HEIGHT = 405;
let predictionsArray;

// Video fallback
navigator.getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;

// Array posities van de vingerkootjes
let fingerLookupIndices = {
  thumb: [0, 1, 2, 3, 4],
  indexFinger: [0, 5, 6, 7, 8],
  middleFinger: [0, 9, 10, 11, 12],
  ringFinger: [0, 13, 14, 15, 16],
  pinky: [0, 17, 18, 19, 20],
};

// Definieer de noten van de piano en hun corresponderende frequenties
const pianoKeys = {
  G: "G4",
  A: "A4",
  B: "B4",
};

const audioContext = new AudioContext();

// Start de applicatie
async function main() {
  model = await handpose.load();
  const video = await setupCamera();
  video.play();
  startLandmarkDetection(video);
}

// Setup van de webcam
async function setupCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error("Webcam not available");
  }

  const video = document.getElementById("video");
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facingMode: "user",
      width: VIDEO_WIDTH,
      height: VIDEO_HEIGHT,
    },
  });
  video.srcObject = stream;

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}

// Start de landmark-detectie
async function startLandmarkDetection(video) {
  videoWidth = video.videoWidth;
  videoHeight = video.videoHeight;

  canvas = document.getElementById("output");

  canvas.width = videoWidth;
  canvas.height = videoHeight;

  ctx = canvas.getContext("2d");

  video.width = videoWidth;
  video.height = videoHeight;

  ctx.clearRect(0, 0, videoWidth, videoHeight);
  ctx.strokeStyle = "red";
  ctx.fillStyle = "red";

  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1); // Flip video horizontally

  predictLandmarks();
}

// Voorspel de locatie van de vingers in de videostream
async function predictLandmarks() {
  ctx.drawImage(
    video,
    0,
    0,
    videoWidth,
    videoHeight,
    0,
    0,
    canvas.width,
    canvas.height
  );
  const predictions = await model.estimateHands(video);
  if (predictions.length > 0) {
    const result = predictions[0].landmarks;
    drawKeypoints(ctx, result, predictions[0].annotations);
    logData(predictions);
    checkNotePlayed(predictions);
  }

  requestAnimationFrame(predictLandmarks);
}

let notePlayed = false;

function checkNotePlayed(predictions) {
  const prediction = machine.classify(predictionsArray);

  let noteToPlay = null;
  switch (prediction) {
    case "G_note":
      noteToPlay = pianoKeys["G"];
      break;
    case "A_note":
      noteToPlay = pianoKeys["A"];
      break;
    case "B_note":
      noteToPlay = pianoKeys["B"];
      break;
    default:
      console.log(`Unknown hand position: ${prediction}`);
      return;
  }

  if (!notePlayed) {
    playSound(noteToPlay);
    notePlayed = true;
    setTimeout(() => {
      notePlayed = false;
    }, 1000);
  }
}

const NoteToFrequency = {
  G4: 392.0,
  B4: 493.88,
  A4: 440.0,
};

function playSound(note) {
  const frequency = NoteToFrequency[note];

  if (!frequency || isNaN(frequency)) {
    console.error(`Invalid frequency for note ${note}: ${frequency}`);
    return;
  }

  console.log(`Playing note ${note} with frequency ${frequency}`);

  const oscillator = audioContext.createOscillator();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(
    frequency,
    audioContext.currentTime
  );

  const gainNode = audioContext.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start();
  gainNode.gain.exponentialRampToValueAtTime(
    0.001,
    audioContext.currentTime + 1
  );
  oscillator.stop(audioContext.currentTime + 1);
}

const k = 3;
const machine = new kNear(k);

// Event listener voor de piano keys
document
  .querySelectorAll(".key")
  .forEach((key) => {
    key.addEventListener("click", () => {
      const note = key.getAttribute("data-note");
      playSound(pianoKeys[note]);
    });
  });

// Event handler voor het leren van gebaren
document
  .getElementById("G_note")
  .addEventListener("click", (e) =>
    buttonGNoteHandler(e, predictionsArray)
  );
document
  .getElementById("A_note")
  .addEventListener("click", (e) =>
    buttonANoteHandler(e, predictionsArray)
  );
document
  .getElementById("B_note")
  .addEventListener("click", (e) =>
    buttonBNoteHandler(e, predictionsArray)
  );

function buttonGNoteHandler(e, predictions) {
  e.preventDefault();
  console.log("G note");
  machine.learn(predictionsArray, "G_note");
}

function buttonANoteHandler(e, predictions) {
  e.preventDefault();
  console.log("A note");
  machine.learn(predictionsArray, "A_note");
}

function buttonBNoteHandler(e, predictions) {
  e.preventDefault();
  console.log("B note");
  machine.learn(predictionsArray, "B_note");
}

// Toon de eerste 20 waarden in een log - elk punt heeft een X, Y, Z waarde
function logData(predictions) {
  predictionsArray = predictions[0].landmarks.reduce(
    (accumulator, currentValue) => {
      accumulator.push(currentValue[0]);
      accumulator.push(currentValue[1]);
      return accumulator;
    },
    []
  );

  // Predicting
  let prediction = machine.classify(predictionsArray);
  log.innerText = `I think it's a ${prediction}`;
}

// Teken hand en vingers
function drawKeypoints(ctx, keypoints) {
  const keypointsArray = keypoints;

  for (let i = 0; i < keypointsArray.length; i++) {
    const y = keypointsArray[i][0];
    const x = keypointsArray[i][1];
    drawPoint(ctx, x - 2, y - 2, 3);
  }

  const fingers = Object.keys(fingerLookupIndices);
  for (let i = 0; i < fingers.length; i++) {
    const finger = fingers[i];
    const points = fingerLookupIndices[finger].map((idx) => keypoints[idx]);
    drawPath(ctx, points, false);
  }
}

// Teken een punt
function drawPoint(ctx, y, x, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fill();
}

// Teken een lijn
function drawPath(ctx, points, closePath) {
  const region = new Path2D();
  region.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    const point = points[i];
    region.lineTo(point[0], point[1]);
  }

  if (closePath) {
    region.closePath();
  }
  ctx.stroke(region);
}

function saveData() {
  const dataStr = JSON.stringify(machine.getTrainingData()); // Adjust this based on where your data resides in kNear
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const linkElement = document.createElement("a");
  linkElement.setAttribute("href", url);
  linkElement.setAttribute("download", "training_data.json");
  linkElement.style.display = "none";
  document.body.appendChild(linkElement);

  linkElement.click();

  document.body.removeChild(linkElement);
  URL.revokeObjectURL(url);
}

document.getElementById("save_button").addEventListener("click", saveData);

// Inlezen van data
function loadData(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = function (event) {
    let data = JSON.parse(event.target.result);
    data = cleanData(data);
    machine.setTrainingData(data);
  };
  reader.readAsText(file);
}

document
  .getElementById("load_button")
  .addEventListener("change", loadData);

// Opschonen van data
function cleanData(data) {
    return data.filter((item) => {
      // Controleer of predictionsArray aanwezig is en minimaal 20 items bevat
      if (item.v && item.v.length >= 20 && isValidPose(item.lab)) {
        // Voeg hier eventuele andere opschoningslogica toe, indien nodig
        // Bijvoorbeeld, controleer op andere criteria of valideer de data
        return true;
      } else {
        // Log eventuele ongeldige data
        console.warn(`Invalid data for item: ${JSON.stringify(item)}`);
        return false;
      }
    });
  }
  
  // Functie om te controleren of de pose geldig is
  function isValidPose(poseLabel) {
    // Definieer hier je criteria voor geldige poses
    // Bijvoorbeeld, alleen bepaalde pose labels toestaan
    const validPoses = ["G_note", "A_note", "B_note"];
    return validPoses.includes(poseLabel);
}
    
main()