import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Mic, MicOff, CheckSquare, Phone, PhoneOff, Trash2, Volume2 } from 'lucide-react';
import { io } from 'socket.io-client';

const AVATAR_COLORS = [
    'bg-indigo-500', 'bg-violet-500', 'bg-pink-500', 'bg-orange-500',
    'bg-emerald-500', 'bg-cyan-500', 'bg-amber-500', 'bg-rose-500',
];
const colorFor = (id) => AVATAR_COLORS[(String(id).charCodeAt(0) || 0) % AVATAR_COLORS.length];
const initials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    return parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : name.slice(0, 2).toUpperCase();
};

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ],
};

const CollaborationPanel = ({ notebookId, currentUser, isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('voice');
    const [isConnected, setIsConnected] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [voiceParticipants, setVoiceParticipants] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');

    // Refs — never stale, always current
    const socketRef = useRef(null);
    const localStreamRef = useRef(null);
    const peersRef = useRef({});          // { socketId: RTCPeerConnection }
    const audioElemsRef = useRef({});     // { socketId: HTMLAudioElement }
    const currentUserRef = useRef(currentUser);
    const audioContainerRef = useRef(null);

    // Keep currentUserRef fresh on every render (avoids stale closures)
    useEffect(() => {
        currentUserRef.current = currentUser;
    }, [currentUser]);

    // ── SOCKET + WEBRTC (all in one effect, no stale closures) ───────────────
    useEffect(() => {
        const socket = io('http://localhost:4000');
        socketRef.current = socket;

        // ── helpers (defined inside effect → always fresh) ──────────────────

        const attachAudio = (stream, socketId) => {
            // Remove old element if exists
            if (audioElemsRef.current[socketId]) {
                audioElemsRef.current[socketId].srcObject = null;
                audioElemsRef.current[socketId].remove();
                delete audioElemsRef.current[socketId];
            }
            const audio = document.createElement('audio');
            audio.id = `rtc-audio-${socketId}`;
            audio.srcObject = stream;
            audio.volume = 1;
            // Must append to DOM before play()
            (audioContainerRef.current || document.body).appendChild(audio);
            audioElemsRef.current[socketId] = audio;
            audio.play().catch(err => console.warn('Audio play blocked:', err));
        };

        const cleanupPeer = (socketId) => {
            if (peersRef.current[socketId]) {
                peersRef.current[socketId].close();
                delete peersRef.current[socketId];
            }
            if (audioElemsRef.current[socketId]) {
                audioElemsRef.current[socketId].srcObject = null;
                audioElemsRef.current[socketId].remove();
                delete audioElemsRef.current[socketId];
            }
        };

        const createPeer = async (targetSocketId, stream) => {
            if (peersRef.current[targetSocketId]) return; // already exists
            console.log('📞 Creating peer (offer) to:', targetSocketId);

            const peer = new RTCPeerConnection(ICE_SERVERS);
            peersRef.current[targetSocketId] = peer;

            stream.getTracks().forEach(track => peer.addTrack(track, stream));

            peer.onicecandidate = ({ candidate }) => {
                if (candidate) {
                    socket.emit('signal', {
                        target: targetSocketId,
                        signal: { candidate },
                        userId: currentUserRef.current?.id,
                    });
                }
            };

            peer.ontrack = (event) => {
                console.log('🎵 Got remote track from:', targetSocketId);
                attachAudio(event.streams[0], targetSocketId);
            };

            peer.oniceconnectionstatechange = () => {
                console.log('ICE state:', peer.iceConnectionState, 'peer:', targetSocketId);
                if (['disconnected', 'failed', 'closed'].includes(peer.iceConnectionState)) {
                    cleanupPeer(targetSocketId);
                }
            };

            const offer = await peer.createOffer();
            await peer.setLocalDescription(offer);

            socket.emit('signal', {
                target: targetSocketId,
                signal: { sdp: offer },
                userId: currentUserRef.current?.id,
            });
        };

        const answerPeer = async (callerSocketId, incomingSignal, stream) => {
            if (peersRef.current[callerSocketId]) return;
            console.log('📲 Answering peer:', callerSocketId);

            const peer = new RTCPeerConnection(ICE_SERVERS);
            peersRef.current[callerSocketId] = peer;

            stream.getTracks().forEach(track => peer.addTrack(track, stream));

            peer.onicecandidate = ({ candidate }) => {
                if (candidate) {
                    socket.emit('signal', {
                        target: callerSocketId,
                        signal: { candidate },
                        userId: currentUserRef.current?.id,
                    });
                }
            };

            peer.ontrack = (event) => {
                console.log('🎵 Got remote track from:', callerSocketId);
                attachAudio(event.streams[0], callerSocketId);
            };

            peer.oniceconnectionstatechange = () => {
                if (['disconnected', 'failed', 'closed'].includes(peer.iceConnectionState)) {
                    cleanupPeer(callerSocketId);
                }
            };

            await peer.setRemoteDescription(new RTCSessionDescription(incomingSignal.sdp));
            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);

            socket.emit('signal', {
                target: callerSocketId,
                signal: { sdp: answer },
                userId: currentUserRef.current?.id,
            });
        };

        // ── socket events ────────────────────────────────────────────────────

        socket.on('connect', () => {
            console.log('✅ Socket connected:', socket.id);
            socket.emit('join-room', notebookId, currentUserRef.current?.id || 'anon');
        });

        socket.on('voice-participants', (participants) => {
            setVoiceParticipants(participants);
        });

        // Server tells existing voice members: a new person joined → we offer
        socket.on('voice-user-joined', ({ socketId }) => {
            console.log('🔔 voice-user-joined:', socketId, 'my stream?', !!localStreamRef.current);
            if (localStreamRef.current) {
                createPeer(socketId, localStreamRef.current);
            }
        });

        socket.on('user-disconnected', (socketId) => {
            console.log('User disconnected:', socketId);
            cleanupPeer(socketId);
        });

        socket.on('signal', async (data) => {
            const { callerId, signal } = data;
            console.log('📡 Signal received from:', callerId, 'type:', signal.sdp?.type || 'candidate');

            if (signal.sdp) {
                if (signal.sdp.type === 'offer') {
                    // Incoming offer — answer it (only if we're in voice)
                    if (localStreamRef.current) {
                        await answerPeer(callerId, signal, localStreamRef.current);
                    }
                } else if (signal.sdp.type === 'answer') {
                    // Answer to our offer
                    const peer = peersRef.current[callerId];
                    if (peer) {
                        await peer.setRemoteDescription(new RTCSessionDescription(signal.sdp));
                    }
                }
            } else if (signal.candidate) {
                const peer = peersRef.current[callerId];
                if (peer) {
                    try {
                        await peer.addIceCandidate(new RTCIceCandidate(signal.candidate));
                    } catch (e) {
                        console.warn('ICE candidate error:', e);
                    }
                }
            }
        });

        socket.on('checklist-updated', (updatedTasks) => {
            setTasks(updatedTasks);
        });

        return () => {
            socket.disconnect();
            localStreamRef.current?.getTracks().forEach(t => t.stop());
            Object.keys(peersRef.current).forEach(cleanupPeer);
        };
    }, [notebookId]); // only notebookId — all WebRTC helpers are defined inside, no stale closures

    // ── VOICE JOIN / LEAVE ────────────────────────────────────────────────────
    const joinVoice = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            localStreamRef.current = stream;
            setIsConnected(true);

            socketRef.current?.emit('join-voice', {
                roomId: notebookId,
                userId: currentUser?.id,
                userName: currentUser?.name || 'User',
            });
        } catch (err) {
            console.error('Mic error:', err);
            alert('Could not access your microphone. Check browser permissions.');
        }
    };

    const leaveVoice = () => {
        localStreamRef.current?.getTracks().forEach(t => t.stop());
        localStreamRef.current = null;

        Object.keys(peersRef.current).forEach(socketId => {
            peersRef.current[socketId]?.close();
            delete peersRef.current[socketId];
            if (audioElemsRef.current[socketId]) {
                audioElemsRef.current[socketId].srcObject = null;
                audioElemsRef.current[socketId].remove();
                delete audioElemsRef.current[socketId];
            }
        });

        setIsConnected(false);
        setIsMuted(false);
        socketRef.current?.emit('leave-voice', { roomId: notebookId });
    };

    const toggleMute = () => {
        const track = localStreamRef.current?.getAudioTracks()[0];
        if (!track) return;
        track.enabled = !track.enabled;
        setIsMuted(!track.enabled);
    };

    // ── CHECKLIST ─────────────────────────────────────────────────────────────
    const addTask = () => {
        if (!newTask.trim()) return;
        const updated = [...tasks, { id: Date.now(), text: newTask, completed: false }];
        setTasks(updated);
        setNewTask('');
        socketRef.current?.emit('update-checklist', notebookId, updated);
    };
    const toggleTask = (id) => {
        const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
        setTasks(updated);
        socketRef.current?.emit('update-checklist', notebookId, updated);
    };
    const deleteTask = (id) => {
        const updated = tasks.filter(t => t.id !== id);
        setTasks(updated);
        socketRef.current?.emit('update-checklist', notebookId, updated);
    };

    // ── RENDER ────────────────────────────────────────────────────────────────
    const mySocketId = socketRef.current?.id;

    return (
        <>
            {/* Hidden audio sink — elements appended here actually play */}
            <div ref={audioContainerRef} aria-hidden="true" style={{ position: 'fixed', width: 0, height: 0, overflow: 'hidden', opacity: 0 }} />

            <div className={`fixed right-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-40 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                {/* TOGGLE */}
                <button onClick={onClose} className="absolute -left-10 top-1/2 rounded-l-lg text-gray-500 hover:text-indigo-600">
                    {isOpen ? <ChevronRight /> : <ChevronLeft />}
                </button>

                {/* HEADER */}
                <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-gray-50">
                    <h2 className="font-semibold text-gray-800">Collaboration</h2>
                    <div className="flex bg-gray-200 rounded-lg p-1">
                        <button onClick={() => setActiveTab('voice')} className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${activeTab === 'voice' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}>Voice</button>
                        <button onClick={() => setActiveTab('tasks')} className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${activeTab === 'tasks' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}>Tasks</button>
                    </div>
                </div>

                {/* CONTENT */}
                <div className="p-6 h-[calc(100%-64px)] overflow-y-auto">
                    {activeTab === 'voice' ? (
                        <div className="space-y-5">

                            {/* CALL CONTROL */}
                            <div className="bg-indigo-50 rounded-xl p-5 flex flex-col items-center space-y-4 border border-indigo-100">
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${isConnected ? 'bg-emerald-100 text-emerald-600 ring-4 ring-emerald-100' : 'bg-gray-100 text-gray-400'}`}>
                                    <Mic size={28} />
                                </div>
                                {!isConnected ? (
                                    <button onClick={joinVoice} className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-200">
                                        <Phone size={16} /> Join Voice Channel
                                    </button>
                                ) : (
                                    <div className="flex gap-3 w-full">
                                        <button onClick={toggleMute} className={`flex-1 py-2 rounded-xl font-medium border transition-all flex items-center justify-center gap-2 ${isMuted ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                                            {isMuted ? <MicOff size={15} /> : <Mic size={15} />}
                                            {isMuted ? 'Unmute' : 'Mute'}
                                        </button>
                                        <button onClick={leaveVoice} className="px-4 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors" title="Leave call">
                                            <PhoneOff size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* IN-CALL PARTICIPANTS — visible to everyone */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">In Call</h3>
                                    {voiceParticipants.length > 0 && (
                                        <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                            <Volume2 size={10} /> {voiceParticipants.length} active
                                        </span>
                                    )}
                                </div>

                                {voiceParticipants.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-100 rounded-xl">
                                        <Phone size={22} className="mb-2 text-gray-300" />
                                        <p className="text-xs text-gray-400">No one is in the call yet</p>
                                        <p className="text-[10px] text-gray-300 mt-0.5">Be the first to join!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {voiceParticipants.map(p => {
                                            const isMe = p.socketId === mySocketId;
                                            const displayName = isMe ? (currentUser?.name || 'You') : (p.userName || `User ${p.userId}`);
                                            return (
                                                <div key={p.socketId} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${isMe ? 'bg-indigo-50 border-indigo-100' : 'bg-white border-gray-100'}`}>
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-[11px] flex-shrink-0 ${colorFor(p.userId)}`}>
                                                        {initials(displayName)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-800 truncate">
                                                            {displayName}
                                                            {isMe && <span className="ml-1 text-[10px] text-indigo-400 font-normal">(you)</span>}
                                                        </p>
                                                    </div>
                                                    {isMe && isMuted
                                                        ? <MicOff size={13} className="text-red-400 flex-shrink-0" />
                                                        : !isMe && <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 animate-pulse" />
                                                    }
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* TASKS TAB */
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-50 transition-all">
                                <input value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTask()} placeholder="Add a new task..." className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder:text-gray-400" />
                                <button onClick={addTask} className="w-6 h-6 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold transition-colors flex-shrink-0">+</button>
                            </div>

                            {tasks.length > 0 && (
                                <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-1">
                                    <span>{tasks.filter(t => t.completed).length}/{tasks.length} completed</span>
                                    <div className="flex-1 mx-3 h-1 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-400 rounded-full transition-all duration-500" style={{ width: `${tasks.length ? (tasks.filter(t => t.completed).length / tasks.length) * 100 : 0}%` }} />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                {tasks.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-8 text-gray-300">
                                        <CheckSquare size={28} className="mb-2" />
                                        <p className="text-xs">No tasks yet. Add one above.</p>
                                    </div>
                                )}
                                {tasks.map(task => (
                                    <div key={task.id} className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${task.completed ? 'bg-gray-50 border-gray-100' : 'bg-white border-gray-200 hover:border-indigo-200 hover:shadow-sm'}`}>
                                        <button onClick={() => toggleTask(task.id)} className="flex-shrink-0">
                                            {task.completed ? <CheckSquare size={16} className="text-emerald-500" /> : <div className="w-4 h-4 border-2 border-gray-300 rounded hover:border-indigo-400 transition-colors" />}
                                        </button>
                                        <span className={`text-sm flex-1 break-words leading-snug ${task.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{task.text}</span>
                                        <button onClick={() => deleteTask(task.id)} className="flex-shrink-0 text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default CollaborationPanel;
