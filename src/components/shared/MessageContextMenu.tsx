import React from 'react';
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Trash2, Copy, Download } from 'lucide-react';

interface MessageContextMenuProps {
    children: React.ReactNode;
    message: {
        id: string;
        senderId: string;
        content?: string | null;
        hasAttachment?: boolean;
        fileName?: string | null;
        createdAt: string;
    };
    currentUserId: string;
    onDeleteForMe: () => void;
    onDeleteForEveryone?: () => void;
    onDownload?: () => void;
}

export const MessageContextMenu: React.FC<MessageContextMenuProps> = ({
    children,
    message,
    currentUserId,
    onDeleteForMe,
    onDeleteForEveryone,
    onDownload,
}) => {
    const isOwnMessage = message.senderId === currentUserId;

    // Check if message is within 24 hours for delete for everyone
    const messageAge = Date.now() - new Date(message.createdAt).getTime();
    const canDeleteForEveryone = isOwnMessage && messageAge < 24 * 60 * 60 * 1000;

    const handleCopyText = () => {
        if (message.content) {
            navigator.clipboard.writeText(message.content);
        }
    };

    return (
        <ContextMenu>
            <ContextMenuTrigger>{children}</ContextMenuTrigger>
            <ContextMenuContent className="w-48">
                {message.content && (
                    <ContextMenuItem onClick={handleCopyText} className="cursor-pointer">
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Text
                    </ContextMenuItem>
                )}

                {message.hasAttachment && onDownload && (
                    <ContextMenuItem onClick={onDownload} className="cursor-pointer">
                        <Download className="h-4 w-4 mr-2" />
                        Download {message.fileName}
                    </ContextMenuItem>
                )}

                <ContextMenuItem onClick={onDeleteForMe} className="cursor-pointer text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete for Me
                </ContextMenuItem>

                {canDeleteForEveryone && onDeleteForEveryone && (
                    <ContextMenuItem onClick={onDeleteForEveryone} className="cursor-pointer text-red-700 font-semibold">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete for Everyone
                    </ContextMenuItem>
                )}
            </ContextMenuContent>
        </ContextMenu>
    );
};

export default MessageContextMenu;
