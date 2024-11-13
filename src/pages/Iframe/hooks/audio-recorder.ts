/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import RecordRTC, { StereoAudioRecorder, State } from 'recordrtc';
import OpenAI from "openai";

const useAudioRecorder = () => {
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingStatus, setRecordingStatus] = useState<State>();

  const intervalRef = useRef<any>(null);
  const recorderRef = useRef<any>(null);

  const startRecording = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((microphone) => {
        recorderRef.current = new RecordRTC(microphone, {
          type: 'audio',
          recorderType: StereoAudioRecorder,
          desiredSampRate: 16000,
          disableLogs: true,
        });

        recorderRef.current.startRecording();
        recorderRef.current.microphone = microphone;
        setRecordingStatus('recording');
      })
      .catch((error) => {
        alert('Unable to access your microphone.');
        console.error(error);
      });
  };
  
  const getFromCacheOrDownload = async (url: string) => {
    const response = await fetch(url);
    console.log('getFromCacheOrDownload', response)
    if (response.status === 429) {
      console.log('too many requests');
    }
    const blobToBase64 = (blob: Blob) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      return new Promise(resolve => {
        reader.onloadend = () => {
          resolve(reader.result);
        };
      });
    };
    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);
    blobToBase64(blob).then(res => {
      // res is base64 now
      if (typeof res === 'string') {
        const file = new File([blob], 'audio.wav', {type: 'audio/wav'});
        console.log('FILE:', file);
        console.log('blob:', blob);
        chrome.storage.local.get(['abc', 'access'], async (data) => {
          console.log('chrome.storage.get data:', data);
          if (data.access) {
            const openai = new OpenAI({
              apiKey: data.abc,
              dangerouslyAllowBrowser: true
            })
            await openai.audio.transcriptions.create({
              file: file,
              model: "whisper-1",
            }).then((result) => {
              console.log('RESULT:', result)
              chrome.runtime.sendMessage({
                action: 'transcribe',
                message: result.text
              }).then(r => {
                window.close()
              })
            });
          }
        })
      } else {
        throw Error('Unable to save audio file');
      }
    }).catch(error => {console.log(error)});

    return imageUrl;
  };
  const stopRecording = (
    callBack?: (blob?: Blob, blobURL?: string) => void
  ) => {
    recorderRef.current?.stopRecording((blobURL: string) => {
      recorderRef.current.microphone.stop();
      setRecordingStatus('stopped');
      setRecordingTime(0);
      callBack?.(recorderRef.current?.getBlob(), blobURL);
      // ToDo: Transform audio to text and send the text to OpenAI below:
      console.log('before getFromCacheOrDownload', blobURL, recorderRef.current?.getBlob());
      getFromCacheOrDownload(blobURL).then(r => {});
      // chrome.storage.local.set({audioFile: })
      // const openai = new OpenAI();
      //
      // const transcription = openai.audio.transcriptions.create({
      //   file: fs.createReadStream("/path/to/file/audio.mp3"),
      //   model: "whisper-1",
      //   prompt:
      // });
    });
  };

  const saveRecording = (fileName?: string) => {
    recorderRef.current?.save(fileName);
  };

  const getBlob = (): Blob => {
    return recorderRef.current?.getBlob();
  };

  useEffect(() => {
    if (recordingStatus == 'recording') {
      intervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }

    if (!recordingStatus || recordingStatus == 'stopped') {
      clearInterval(intervalRef.current!);
    }

    return () => clearInterval(intervalRef.current!);
  }, [recordingStatus]);

  return {
    recordingStatus,
    recordingTime,
    startRecording,
    stopRecording,
    saveRecording,
    getBlob,
  };
};

export { useAudioRecorder };