import React from 'react';
import ChatStream from '../ChatStream';

interface ChatTabProps {
    notebookId: string;
}

export const ChatTab: React.FC<ChatTabProps> = ({ notebookId }) => {
    return (
        <div className="h-full p-1 sm:p-4">
            <ChatStream notebookId={notebookId} />
        </div>
    );
};

export default ChatTab;
