class AudioProcessor extends AudioWorkletProcessor {
    process(inputs, outputs) {
      const input = inputs[0]; // Access the first input channel
      if (input && input.length > 0) {
        const channelData = input[0];
        this.port.postMessage(channelData); // Send the audio data to the main thread
      }
      return true; // Keep the processor alive
    }
  }
  
  // Register the processor with the name "audio-processor"
  registerProcessor("audio-processor", AudioProcessor);
  