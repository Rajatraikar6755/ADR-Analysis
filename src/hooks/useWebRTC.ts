import { useEffect, useRef, useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import SimplePeer from 'simple-peer';

interface UseWebRTCProps {
    socket: Socket | null;
    isInitiator: boolean;
    remotePeerId: string;
    onCallEnded?: () => void;
}

export const useWebRTC = ({ socket, isInitiator, remotePeerId, onCallEnded }: UseWebRTCProps) => {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

    const peerRef = useRef<SimplePeer.Instance | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const isDestroyingRef = useRef(false);

    const onCallEndedRef = useRef(onCallEnded);

    useEffect(() => {
        onCallEndedRef.current = onCallEnded;
    }, [onCallEnded]);

    // Initialize media stream
    useEffect(() => {
        const initializeMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                    },
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                    },
                });

                setLocalStream(stream);
                localStreamRef.current = stream;
                console.log('[WebRTC] Local stream initialized');
            } catch (error) {
                console.error('[WebRTC] Error accessing media devices:', error);
                alert('Could not access camera/microphone. Please check permissions.');
            }
        };

        initializeMedia();

        return () => {
            // Cleanup media stream
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Initialize peer connection
    useEffect(() => {
        isDestroyingRef.current = false;
        if (!socket || !localStream) return;

        console.log('[WebRTC] Initializing peer connection, isInitiator:', isInitiator);

        const peer = new SimplePeer({
            initiator: isInitiator,
            stream: localStream,
            trickle: true,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' },
                ],
            },
        });

        console.log('[WebRTC] Peer created, initiator:', isInitiator);
        peerRef.current = peer;

        // Send signal (offer/answer) to remote peer
        peer.on('signal', (data) => {
            console.log('[WebRTC] Sending signal to', remotePeerId);

            if (data.type === 'offer') {
                socket.emit('webrtc-offer', { to: remotePeerId, offer: data });
            } else if (data.type === 'answer') {
                socket.emit('webrtc-answer', { to: remotePeerId, answer: data });
            } else {
                // ICE candidate
                socket.emit('ice-candidate', { to: remotePeerId, candidate: data });
            }
        });

        // Receive remote stream
        peer.on('stream', (stream) => {
            console.log('[WebRTC] Received remote stream');
            setRemoteStream(stream);
            setConnectionState('connected');
        });

        // Handle connection state
        peer.on('connect', () => {
            console.log('[WebRTC] Peer connected');
            setConnectionState('connected');
        });

        peer.on('close', () => {
            console.log('[WebRTC] Peer connection closed');
            // Only handle close if this is the current peer
            // This prevents old peers from triggering end call during re-renders
            if (peer === peerRef.current && !isDestroyingRef.current) {
                setConnectionState('disconnected');
                onCallEndedRef.current?.();
            }
        });

        peer.on('error', (err) => {
            console.error('[WebRTC] Peer error:', err);
            setConnectionState('disconnected');
        });

        // Listen for signals from remote peer
        const handleOffer = ({ from, offer }: { from: string; offer: SimplePeer.SignalData }) => {
            if (from === remotePeerId) {
                console.log('[WebRTC] Received offer from', from);
                peer.signal(offer);
            }
        };

        const handleAnswer = ({ from, answer }: { from: string; answer: SimplePeer.SignalData }) => {
            if (from === remotePeerId) {
                console.log('[WebRTC] Received answer from', from);
                peer.signal(answer);
            }
        };

        const handleIceCandidate = ({ from, candidate }: { from: string; candidate: SimplePeer.SignalData }) => {
            if (from === remotePeerId) {
                console.log('[WebRTC] Received ICE candidate from', from);
                peer.signal(candidate);
            }
        };

        socket.on('webrtc-offer', handleOffer);
        socket.on('webrtc-answer', handleAnswer);
        socket.on('ice-candidate', handleIceCandidate);

        return () => {
            isDestroyingRef.current = true;
            socket.off('webrtc-offer', handleOffer);
            socket.off('webrtc-answer', handleAnswer);
            socket.off('ice-candidate', handleIceCandidate);

            if (peer) {
                peer.destroy();
            }
        };
    }, [socket, localStream, isInitiator, remotePeerId]);

    // Toggle audio
    const toggleAudio = useCallback(() => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsAudioMuted(!audioTrack.enabled);
            }
        }
    }, [localStream]);

    // Toggle video
    const toggleVideo = useCallback(() => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOff(!videoTrack.enabled);
            }
        }
    }, [localStream]);

    // End call
    const endCall = useCallback(() => {
        if (peerRef.current) {
            peerRef.current.destroy();
        }
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
        }
        setConnectionState('disconnected');
        onCallEnded?.();
    }, [onCallEnded]);

    return {
        localStream,
        remoteStream,
        isAudioMuted,
        isVideoOff,
        connectionState,
        toggleAudio,
        toggleVideo,
        endCall,
    };
};
