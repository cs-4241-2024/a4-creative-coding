import type { Component } from 'solid-js';
import { createSignal, onCleanup, createEffect } from 'solid-js';
import { startRecording, stopRecording, sendAudioToServer } from './audio';

const Footer: Component = () => {
  const [isRecording, setIsRecording] = createSignal(false);
  const [recordingDuration, setRecordingDuration] = createSignal(0);
  let mediaRecorder: MediaRecorder | null = null;
  let audioChunks: Blob[] = [];
  let interval: NodeJS.Timeout;

  const toggleRecording = async () => {
    if (isRecording()) {
      stopRecording(mediaRecorder);
      setIsRecording(false);
      clearInterval(interval);
      setRecordingDuration(0);
    } else {
      mediaRecorder = await startRecording(audioChunks, setIsRecording);
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 10);
      }, 10);
    }
  };

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    const centiseconds = Math.floor((duration % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${centiseconds.toString().padStart(2, '0')}`;
  };

  onCleanup(() => {
    stopRecording(mediaRecorder);
    clearInterval(interval);
  });

  return (
    <>
      <div
        class={`fixed bottom-20 left-0 right-0 bg-neutral p-2 flex justify-center items-center overflow-hidden transition-all duration-300 ease-in-out ${isRecording() ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
          }`}
      >
        <span class="text-white font-mono">
          {formatDuration(recordingDuration())}
        </span>
      </div>
      <div class="fixed bottom-0 left-0 right-0 bg-neutral p-3 flex justify-center items-center">
        <button
          class="w-14 h-14 rounded-full border-2 border-white p-1 flex items-center justify-center"
          onClick={toggleRecording}
        >
          <div
            class={`
              ${isRecording() ? 'w-5 h-5 rounded-sm' : 'w-10 h-10 rounded-full'}
              bg-red-500 transition-all duration-200
            `}
          ></div>
        </button>
      </div>
    </>
  );
};

export default Footer;
