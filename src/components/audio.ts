
export const startRecording = async (
  audioChunks: Blob[],
  setIsRecording: (value: boolean) => void
): Promise<MediaRecorder | null> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      sendAudioToServer(audioBlob);
      audioChunks.length = 0;
    };

    mediaRecorder.start();
    setIsRecording(true);
    return mediaRecorder;
  } catch (error) {
    console.error('Error accessing microphone:', error);
    return null;
  }
};

export const stopRecording = (mediaRecorder: MediaRecorder | null) => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
};

export const sendAudioToServer = async (audioBlob: Blob) => {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');

    const response = await fetch('/api/save-recording', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      console.log('Recording saved successfully!!');
    } else {
      console.error('Failed to save recording :(');
    }
  } catch (error) {
    console.error('Error sending audio to server:', error);
  }
};
