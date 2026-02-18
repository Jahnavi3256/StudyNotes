import { NodeViewWrapper } from '@tiptap/react';
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FaMicrophone, FaStop, FaPlay, FaPause, FaTrash, FaSpinner } from 'react-icons/fa';

const AudioComponent = (props) => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState(props.node.attrs.src);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const audioRef = useRef(null);

    useEffect(() => {
        if (props.node.attrs.src) {
            setAudioUrl(props.node.attrs.src);
        }
    }, [props.node.attrs.src]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = handleStopRecording;
            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (error) {
            console.error("Error accessing microphone:", error);
            alert("Could not access microphone.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            // Stop all tracks to release microphone
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const handleStopRecording = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        // Create a local URL for immediate preview (optional, but we want to upload first usually)
        // const localUrl = URL.createObjectURL(audioBlob); 

        // Upload to server
        await uploadAudio(audioBlob);
    };

    const uploadAudio = async (audioBlob) => {
        setIsUploading(true);
        const formData = new FormData();
        // File name doesn't matter much for backend Cloudinary upload, but good to have extenson
        formData.append('audio', audioBlob, 'voice-note.webm');

        try {
            const res = await axios.post(
                "http://localhost:4000/upload-note-audio",
                formData,
                { headers: { "Content-Type": "multipart/form-data" }, withCredentials: true }
            );

            const url = res.data.url;
            setAudioUrl(url);
            props.updateAttributes({ src: url });
        } catch (error) {
            console.error("Failed to upload audio:", error);
            alert("Failed to save audio note.");
        } finally {
            setIsUploading(false);
        }
    };

    const togglePlayback = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const onTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const onLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const onEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
    };

    const handleDelete = () => {
        props.deleteNode();
    };

    const formatTime = (time) => {
        if (!time) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <NodeViewWrapper className="my-4">
            <div className="flex items-center gap-3 p-3 bg-[#1e1f23] border border-white/10 rounded-lg w-fit transition-all hover:border-emerald-500/50">

                {/* Cases: 
            1. No Audio URL & Not Recording -> Show Mic
            2. Recording -> Show Stop & Recording Indicator
            3. Uploading -> Show Spinner
            4. Has Audio URL -> Show Player controls
        */}

                {!audioUrl && !isRecording && !isUploading && (
                    <button
                        onClick={startRecording}
                        className="p-3 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500/20 transition-colors group"
                        title="Start Recording"
                    >
                        <FaMicrophone size={16} className="group-hover:scale-110 transition-transform" />
                    </button>
                )}

                {isRecording && (
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-xs text-red-400 font-medium">Recording...</span>
                        <button
                            onClick={stopRecording}
                            className="p-2 bg-white/10 text-white rounded hover:bg-white/20 transition-colors"
                            title="Stop Recording"
                        >
                            <FaStop size={12} />
                        </button>
                    </div>
                )}

                {isUploading && (
                    <div className="flex items-center gap-2 text-emerald-500 px-2">
                        <FaSpinner className="animate-spin" />
                        <span className="text-xs">Saving...</span>
                    </div>
                )}

                {audioUrl && !isUploading && (
                    <>
                        <button
                            onClick={togglePlayback}
                            className="p-2 bg-emerald-500/20 text-emerald-500 rounded-full hover:bg-emerald-500/30 transition-colors"
                        >
                            {isPlaying ? <FaPause size={12} /> : <FaPlay size={12} className="ml-0.5" />}
                        </button>

                        <div className="flex flex-col min-w-[120px]">
                            <div className="h-1 bg-white/10 rounded-full w-full mb-1 overflow-hidden">
                                <div
                                    className="h-full bg-emerald-500 transition-all duration-100 ease-linear"
                                    style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-[10px] text-gray-400">
                                <span>{formatTime(currentTime)}</span>
                                <span>{formatTime(duration)}</span>
                            </div>
                        </div>

                        <audio
                            ref={audioRef}
                            src={audioUrl}
                            onTimeUpdate={onTimeUpdate}
                            onLoadedMetadata={onLoadedMetadata}
                            onEnded={onEnded}
                            className="hidden"
                        />
                    </>
                )}

                {!isRecording && (
                    <button
                        onClick={handleDelete}
                        className="ml-2 p-1.5 text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete Audio Note"
                    >
                        <FaTrash size={12} />
                    </button>
                )}
            </div>
        </NodeViewWrapper>
    );
};

export default AudioComponent;
