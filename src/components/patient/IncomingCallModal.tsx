import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { motion } from 'framer-motion';

interface IncomingCallModalProps {
    open: boolean;
    callerName: string;
    onAccept: () => void;
    onDecline: () => void;
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
    open,
    callerName,
    onAccept,
    onDecline,
}) => {
    const [ringing, setRinging] = useState(true);

    useEffect(() => {
        if (open) {
            setRinging(true);
            // Auto-decline after 30 seconds
            const timeout = setTimeout(() => {
                onDecline();
            }, 30000);

            return () => clearTimeout(timeout);
        }
    }, [open, onDecline]);

    return (
        <Dialog open={open} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="text-center text-2xl">Incoming Video Call</DialogTitle>
                    <DialogDescription className="text-center">
                        {callerName} is calling you
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center py-8">
                    {/* Animated Video Icon */}
                    <motion.div
                        animate={{
                            scale: ringing ? [1, 1.1, 1] : 1,
                        }}
                        transition={{
                            duration: 1,
                            repeat: ringing ? Infinity : 0,
                            ease: "easeInOut",
                        }}
                        className="mb-8"
                    >
                        <div className="bg-healthcare-100 rounded-full p-6">
                            <Video className="h-16 w-16 text-healthcare-600" />
                        </div>
                    </motion.div>

                    {/* Caller Name */}
                    <h3 className="text-xl font-semibold mb-2">{callerName}</h3>
                    <p className="text-gray-500 mb-8">wants to start a video call</p>

                    {/* Action Buttons */}
                    <div className="flex gap-6">
                        {/* Decline Button */}
                        <Button
                            size="lg"
                            variant="outline"
                            className="rounded-full h-16 w-16 border-red-500 text-red-500 hover:bg-red-50"
                            onClick={onDecline}
                        >
                            <PhoneOff className="h-6 w-6" />
                        </Button>

                        {/* Accept Button */}
                        <Button
                            size="lg"
                            className="rounded-full h-16 w-16 bg-green-500 hover:bg-green-600"
                            onClick={onAccept}
                        >
                            <Phone className="h-6 w-6" />
                        </Button>
                    </div>

                    <p className="text-xs text-gray-400 mt-4">Call will auto-decline in 30 seconds</p>
                </div>
            </DialogContent>
        </Dialog>
    );
};
