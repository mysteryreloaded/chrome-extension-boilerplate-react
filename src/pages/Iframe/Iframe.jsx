import React from 'react';
import { useEffect } from 'react';
import { useAudioRecorder } from './hooks/audio-recorder';
import "./Iframe.css";

export default function Iframe({ onStop }) {
  const {
    recordingStatus,
    recordingTime,
    startRecording,
    stopRecording,
    getBlob,
  } = useAudioRecorder();

  useEffect(() => {
    if (recordingStatus === 'stopped') {
      onStop?.(getBlob());
    }
  }, [getBlob, onStop, recordingStatus]);

  useEffect(() => {
    startRecording()
  }, [])
  return (
    <div className="audio-recorder">
      <div
        className="recording-status"
        style={
          recordingStatus === 'recording' || recordingStatus === 'paused'
            ? { opacity: 1 }
            : { opacity: 0 }
        }
      >
        <span>Recording {`${recordingTime} s`}</span>
      </div>

      <button
        className="stop-button"
        onClick={() => stopRecording()}
        disabled={!recordingStatus || recordingStatus === 'stopped'}
      >
        Stop
      </button>
    </div>
  );
}