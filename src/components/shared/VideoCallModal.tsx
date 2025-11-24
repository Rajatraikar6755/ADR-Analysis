import React, { useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface VideoCallModalProps {
    open: boolean;
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    isAudioMuted: boolean;
    isVideoOff: boolean;
    connectionState: 'connecting' | 'connected' | 'disconnected';
    remoteName: string;
    onToggleAudio: () => void;
    onToggleVideo: () => void;
    onEndCall: () => void;
}

export const VideoCallModal: React.FC<VideoCallModalProps> = ({
    open,
    localStream,
    remoteStream,
    isAudioMuted,
    isVideoOff,
    connectionState,
    remoteName,
    onToggleAudio,
    onToggleVideo,
    onEndCall,
}) => {
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    // Set local video stream
    // Callback ref for local video to ensure it's handled immediately on mount
    const setLocalVideoRef = (element: HTMLVideoElement | null) => {
        localVideoRef.current = element;
        if (element && localStream) {
            console.log('[VideoCallModal] Setting local video stream via callback ref', localStream.id);
            element.srcObject = localStream;
            element.muted = true; // Force muted property
            element.play().catch(e => console.error('[VideoCallModal] Error playing local video:', e));
        }
    };

    // Effect to update stream if it changes while ref is already set
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            console.log('[VideoCallModal] Updating local video stream', localStream.id);
            localVideoRef.current.srcObject = localStream;
            localVideoRef.current.muted = true;
            localVideoRef.current.play().catch(e => console.error('[VideoCallModal] Error playing local video:', e));
        }
    }, [localStream]);

    // Set remote video stream
    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    return (
        <Dialog open={open} onOpenChange={() => { }}>
            <DialogContent className="max-w-5xl h-[90vh] p-0" onInteractOutside={(e) => e.preventDefault()}>
                <div className="flex flex-col h-full bg-gray-900">
                    {/* Header */}
                    <DialogHeader className="px-6 py-4 bg-gray-800 border-b border-gray-700">
                        <DialogTitle className="text-white flex items-center justify-between">
                            <div>
                                <span>Video Call with {remoteName}</span>
                                {connectionState === 'connecting' && (
                                    <span className="ml-3 text-sm text-gray-400 flex items-center">
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Connecting...
                                    </span>
                                )}
                                {connectionState === 'connected' && (
                                    <span className="ml-3 text-sm text-green-400">● Connected</span>
                                )}
                            </div>
                        </DialogTitle>
                    </DialogHeader>

                    {/* Video Area */}
                    <div className="flex-1 relative bg-black">
                        {/* Remote Video (Main) */}
                        <div className="w-full h-full flex items-center justify-center">
                            {remoteStream ? (
                                <video
                                    ref={remoteVideoRef}
                                    autoPlay
                                    playsInline
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center text-gray-400">
                                    <Video className="h-24 w-24 mb-4 opacity-50" />
                                    <p className="text-lg">Waiting for {remoteName} to join...</p>
                                </div>
                            )}
                        </div>

                        {/* Local Video (Picture-in-Picture) */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute bottom-4 right-4 w-64 h-48 bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-600 shadow-2xl"
                        >
                            {localStream && !isVideoOff ? (
                                <video
                                    ref={setLocalVideoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    onLoadedMetadata={() => console.log('[VideoCallModal] Local video metadata loaded')}
                                    style={{ transform: 'scaleX(-1)' }}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-700">
                                    <VideoOff className="h-12 w-12 text-gray-400" />
                                </div>
                            )}
                            <div className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
                                You
                            </div>
                        </motion.div>
                    </div>

                    {/* Controls */}
                    <div className="px-6 py-4 bg-gray-800 border-t border-gray-700">
                        <div className="flex items-center justify-center gap-4">
                            {/* Mute/Unmute */}
                            <Button
                                size="lg"
                                variant={isAudioMuted ? 'destructive' : 'secondary'}
                                className="rounded-full h-14 w-14"
                                onClick={onToggleAudio}
                            >
                                {isAudioMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                            </Button>

                            {/* Video On/Off */}
                            <Button
                                size="lg"
                                variant={isVideoOff ? 'destructive' : 'secondary'}
                                className="rounded-full h-14 w-14"
                                onClick={onToggleVideo}
                            >
                                {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
                            </Button>

                            {/* End Call */}
                            <Button
                                size="lg"
                                variant="destructive"
                                className="rounded-full h-14 w-14 bg-red-600 hover:bg-red-700"
                                onClick={onEndCall}
                            >
                                <PhoneOff className="h-6 w-6" />
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
