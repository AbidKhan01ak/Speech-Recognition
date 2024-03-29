// JavaScript code with save functionality
window.SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.interimResults = true;
recognition.lang = "en-US";
let p = document.createElement("p");
const words = document.querySelector(".words");
words.appendChild(p);

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

recognition.start();

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
