window.SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.interimResults = true;
recognition.lang = "en-US";
let p = document.createElement("p");
const words = document.querySelector(".words");
words.appendChild(p);

let audioContext;
let audioStream;

// Function to start the audio context after user interaction
function startAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  captureDeviceAudio();
}

// Function to capture audio from the device
async function captureDeviceAudio() {
  try {
    // Get audio stream from the system or microphone
    audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const source = audioContext.createMediaStreamSource(audioStream);

    // Use an AudioWorklet for processing the audio
    await audioContext.audioWorklet.addModule("audio-processor.js");
    const audioWorkletNode = new AudioWorkletNode(audioContext, "audio-processor");

    source.connect(audioWorkletNode);
    audioWorkletNode.connect(audioContext.destination);

    // Handle audio processing (optional: send processed data to SpeechRecognition)
    audioWorkletNode.port.onmessage = (event) => {
      const audioData = event.data;
      console.log("Audio data processed:", audioData);
    };
  } catch (err) {
    console.error("Error capturing device audio:", err);
  }
}

// Event listener for user gesture
document.addEventListener("click", startAudioContext);


async function setupAudioProcessing() {
  try {
    // Create an audio context
    const audioContext = new AudioContext();

    // Add the AudioWorklet module
    await audioContext.audioWorklet.addModule("./audio_processor.js");

    // Create a worklet node using the "audio-processor"
    const audioProcessorNode = new AudioWorkletNode(audioContext, "audio-processor");

    // Connect the node to the destination (speakers)
    audioProcessorNode.connect(audioContext.destination);

    // Log audio data received from the processor
    audioProcessorNode.port.onmessage = (event) => {
      console.log("Audio data received:", event.data);
    };

    // Get user media (microphone input)
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const source = audioContext.createMediaStreamSource(stream);

    // Connect the microphone input to the processor
    source.connect(audioProcessorNode);

    console.log("Audio processing is set up.");
  } catch (err) {
    console.error("Error setting up audio processing:", err);
  }
}

// Start the audio processing after a user gesture
document.querySelector("button").addEventListener("click", () => {
  setupAudioProcessing();
});

// SpeechRecognition event listeners
recognition.addEventListener("result", (e) => {
  const transcript = Array.from(e.results)
    .map((result) => result[0])
    .map((result) => result.transcript)
    .join("");
  p.textContent = transcript;
  if (e.results[0].isFinal) {
    p = document.createElement("p");
    words.appendChild(p);
  }
});

recognition.addEventListener("end", recognition.start);

// Add event listener for saving content as text file
document.addEventListener("keydown", function (event) {
  // Check if Ctrl + S is pressed
  if (event.ctrlKey && event.key === "s") {
    saveAsTextFile();
    event.preventDefault(); // Prevent default browser behavior
  }
});

function saveAsTextFile() {
  const textToSave = document.querySelector(".words").innerText;
  const fileName = `SpeechRecognizer-${getTimeStamp()}.txt`; // Filename with prefix and timestamp

  // Create a blob with the text content
  const blob = new Blob([textToSave], { type: "text/plain" });

  // Create a temporary anchor element to trigger the download
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = fileName;

  // Append the anchor element to the body and trigger the download
  document.body.appendChild(a);
  a.click();

  // Clean up
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}

function getTimeStamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");
  return `${year}-${month}-${day}--${hours}-${minutes}-${seconds}`;
}

function updateClock() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");
  const meridiem = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; // Convert to 12-hour format

  const timeString = `${hours}:${minutes}:${seconds} ${meridiem}`;
  document.querySelector(".clock").textContent = timeString;
}

// Update clock every second
setInterval(updateClock, 1000);
