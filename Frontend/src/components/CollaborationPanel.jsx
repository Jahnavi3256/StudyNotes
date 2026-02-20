import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, Mic, MicOff, CheckSquare, Phone, PhoneOff, Trash2 } from 'lucide-react';
import { io } from 'socket.io-client';

const CollaborationPanel = ({ notebookId, currentUser, isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('voice');
    const [isConnected, setIsConnected] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [peers, setPeers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');

    const socketRef = useRef();
    const localStreamRef = useRef();
    const peersRef = useRef({}); // Store RTCPeerConnection objects
    const audioElementsRef = useRef({}); // Store audio elements

    // ── PREPARE SOCKET CONNECTION ─────────────────────────────────────────────
    useEffect(() => {
        socketRef.current = io('http://localhost:4000');

        socketRef.current.on('user-connected', (userId, socketId) => {
            console.log('User connected:', userId);
            // Initiate call to new user
            if (isConnected) {
                createPeer(socketId, userId, localStreamRef.current);
            }
        });

        socketRef.current.on('user-disconnected', (socketId) => {
            console.log('User disconnected:', socketId);
            if (peersRef.current[socketId]) {
                peersRef.current[socketId].close();
                delete peersRef.current[socketId];
                setPeers(prev => prev.filter(p => p.socketId !== socketId));

                // Remove audio element
                if (audioElementsRef.current[socketId]) {
                    audioElementsRef.current[socketId].remove();
                    delete audioElementsRef.current[socketId];
                }
            }
        });

        socketRef.current.on('signal', async (data) => {
            const peerId = data.callerId;

            if (!peersRef.current[peerId]) {
                // Incoming call - we are answering
                addPeer(peerId, data.userId, data.signal, localStreamRef.current);
            } else {
                // We initiated, this is the answer
                const peer = peersRef.current[peerId];
                if (data.signal.sdp) {
                    await peer.setRemoteDescription(new RTCSessionDescription(data.signal));
                } else if (data.signal.candidate) {
                    await peer.addIceCandidate(new RTCIceCandidate(data.signal));
                }
            }
        });

        socketRef.current.on('checklist-updated', (updatedTasks) => {
            setTasks(updatedTasks);
        });

        return () => {
            socketRef.current.disconnect();
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [notebookId]); // Re-connect if notebook changes? Maybe better to stay unless explicitly left.

    // ── WEBRTC LOGIC ──────────────────────────────────────────────────────────
    const joinVoice = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            localStreamRef.current = stream;
            setIsConnected(true);

            socketRef.current.emit('join-room', notebookId, currentUser?.id || 'anon');
        } catch (err) {
            console.error("Failed to access microphone", err);
            alert("Failed to access microphone");
        }
    };

    const leaveVoice = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }

        // Close all peer connections
        Object.values(peersRef.current).forEach(peer => peer.close());
        peersRef.current = {};

        // Cleanup audio elements
        Object.values(audioElementsRef.current).forEach(el => el.remove());
        audioElementsRef.current = {};

        setPeers([]);
        setIsConnected(false);
        // Ideally emit a specific leave room event or just disconnect socket?
        // For now, rely on disconnect or just stop sending audio. 
        // Re-joining might require socket rejoin logic if designed that way.
        // Simpler: reload page or just keep socket open but stop stream.
        // To be robust: emit 'leave-room'
        window.location.reload(); // Quick reset for prototype stability
    };

    const createPeer = async (targetSocketId, userId, stream) => {
        const peer = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        peersRef.current[targetSocketId] = peer;
        setPeers(prev => [...prev, { socketId: targetSocketId, userId }]);

        stream.getTracks().forEach(track => peer.addTrack(track, stream));

        peer.onicecandidate = (event) => {
            if (event.candidate) {
                socketRef.current.emit('signal', {
                    target: targetSocketId,
                    signal: event.candidate,
                    userId: currentUser?.id
                });
            }
        };

        peer.ontrack = (event) => {
            handleRemoteStream(event.streams[0], targetSocketId);
        };

        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);

        socketRef.current.emit('signal', {
            target: targetSocketId,
            signal: offer,
            userId: currentUser?.id
        });
    };

    const addPeer = async (incomingSocketId, userId, incomingSignal, stream) => {
        const peer = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        peersRef.current[incomingSocketId] = peer;
        setPeers(prev => [...prev, { socketId: incomingSocketId, userId }]);

        // If we are already connected (stream exists), add it. 
        // If logic allows joining active room, stream might be null if we haven't clicked 'Join' yet but someone else is there.
        // But 'addPeer' is only called if we receive a signal? 
        // Signal only sent to room members. So we must have joined.
        if (stream) {
            stream.getTracks().forEach(track => peer.addTrack(track, stream));
        }

        peer.onicecandidate = (event) => {
            if (event.candidate) {
                socketRef.current.emit('signal', {
                    target: incomingSocketId,
                    signal: event.candidate,
                    userId: currentUser?.id
                });
            }
        };

        peer.ontrack = (event) => {
            handleRemoteStream(event.streams[0], incomingSocketId);
        };

        if (incomingSignal.sdp) {
            await peer.setRemoteDescription(new RTCSessionDescription(incomingSignal));
            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);

            socketRef.current.emit('signal', {
                target: incomingSocketId,
                signal: answer,
                userId: currentUser?.id
            });
        } else if (incomingSignal.candidate) {
            await peer.addIceCandidate(new RTCIceCandidate(incomingSignal));
        }
    };

    const handleRemoteStream = (stream, id) => {
        if (audioElementsRef.current[id]) return;

        const audio = document.createElement('audio');
        audio.srcObject = stream;
        audio.autoplay = true;
        audioElementsRef.current[id] = audio;
        // Ideally append to DOM hidden or managing volume
    };

    const toggleMute = () => {
        if (localStreamRef.current) {
            const track = localStreamRef.current.getAudioTracks()[0];
            track.enabled = !track.enabled;
            setIsMuted(!track.enabled);
        }
    };

    // ── CHECKLIST LOGIC ───────────────────────────────────────────────────────
    const addTask = () => {
        if (!newTask.trim()) return;
        const updated = [...tasks, { id: Date.now(), text: newTask, completed: false }];
        setTasks(updated);
        setNewTask('');
        socketRef.current.emit('update-checklist', notebookId, updated);
    };

    const toggleTask = (taskId) => {
        const updated = tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
        setTasks(updated);
        socketRef.current.emit('update-checklist', notebookId, updated);
    };

    const deleteTask = (taskId) => {
        const updated = tasks.filter(t => t.id !== taskId);
        setTasks(updated);
        socketRef.current.emit('update-checklist', notebookId, updated);
    };


    return (
        <div className={`fixed right-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-40 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

            {/* TOGGLE BUTTON (Outside) */}
            <button
                onClick={onClose}
                className="absolute -left-8 top-1/2 bg-white p-1 rounded-l-lg shadow-md border border-r-0 border-gray-200 text-gray-500 hover:text-indigo-600"
            >
                <ChevronRight />
            </button>

            {/* HEADER */}
            <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-gray-50">
                <h2 className="font-semibold text-gray-800">Collaboration</h2>
                <div className="flex bg-gray-200 rounded-lg p-1">
                    <button
                        onClick={() => setActiveTab('voice')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${activeTab === 'voice' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
                    >
                        Voice
                    </button>
                    <button
                        onClick={() => setActiveTab('tasks')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${activeTab === 'tasks' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
                    >
                        Tasks
                    </button>
                </div>
            </div>

            {/* CONTENT */}
            <div className="p-6 h-[calc(100%-64px)] overflow-y-auto">

                {activeTab === 'voice' ? (
                    <div className="space-y-6">
                        <div className="bg-indigo-50 rounded-xl p-6 flex flex-col items-center justify-center space-y-4 border border-indigo-100">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isConnected ? 'bg-emerald-100 text-emerald-600 ring-4 ring-emerald-50' : 'bg-gray-100 text-gray-400'}`}>
                                <Mic size={32} />
                            </div>

                            {!isConnected ? (
                                <button
                                    onClick={joinVoice}
                                    className="w-full py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Phone size={16} /> Join Voice Channel
                                </button>
                            ) : (
                                <div className="flex gap-3 w-full">
                                    <button
                                        onClick={toggleMute}
                                        className={`flex-1 py-2 rounded-lg font-medium border transition-colors flex items-center justify-center gap-2 ${isMuted ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
                                        {isMuted ? 'Unmute' : 'Mute'}
                                    </button>
                                    <button
                                        onClick={leaveVoice}
                                        className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                                    >
                                        <PhoneOff size={20} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* PARTICIPANTS LIST */}
                        {isConnected && (
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Participants ({peers.length + 1})</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                            ME
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">You</span>
                                        {isMuted && <MicOff size={14} className="ml-auto text-red-400" />}
                                    </div>
                                    {peers.map(peer => (
                                        <div key={peer.socketId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">
                                                U
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">User {peer.userId}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <input
                                value={newTask}
                                onChange={(e) => setNewTask(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addTask()}
                                placeholder="Add a new task..."
                                className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
                            />
                            <button
                                onClick={addTask}
                                className="bg-indigo-600 text-white rounded-lg px-3 hover:bg-indigo-700"
                            >
                                +
                            </button>
                        </div>

                        <div className="space-y-2">
                            {tasks.length === 0 && <p className="text-center text-gray-400 text-xs py-4">No tasks yet</p>}
                            {tasks.map(task => (
                                <div key={task.id} className="flex items-start gap-3 group">
                                    <button
                                        onClick={() => toggleTask(task.id)}
                                        className={`mt-0.5 flex-shrink-0 `}
                                    >
                                        {task.completed ? <CheckSquare size={18} className="text-emerald-500" /> : <div className="w-[18px] h-[18px] border-2 border-gray-300 rounded flex-shrink-0 hover:border-indigo-400" />}
                                    </button>
                                    <span className={`text-sm flex-1 break-words ${task.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                        {task.text}
                                    </span>
                                    <button
                                        onClick={() => deleteTask(task.id)}
                                        className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default CollaborationPanel;
