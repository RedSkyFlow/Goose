import React, { useState } from 'react';
import { ChatIcon, CloseIcon, SendIcon } from '../icons';

interface CollaborationSidebarProps {
    clientName: string;
}

export const CollaborationSidebar: React.FC<CollaborationSidebarProps> = ({ clientName }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [comments, setComments] = useState([
        { id: 1, author: 'Goose AI', text: 'I have generated this proposal based on your recent meetings. Feel free to ask any questions!', time: '2 days ago', isUser: false },
        { id: 2, author: clientName, text: 'Can we look at increasing the quantity of Access Points for the lobby area?', time: '1 day ago', isUser: true },
        { id: 3, author: 'System', text: 'Proposal updated: Added 2x U6-Pro APs.', time: '1 day ago', isUser: false },
    ]);
    const [input, setInput] = useState('');

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        setComments([...comments, {
            id: Date.now(),
            author: 'You',
            text: input,
            time: 'Just now',
            isUser: true 
        }]);
        setInput('');
    };

    return (
        <>
            {/* Trigger Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-24 z-40 p-4 bg-primary text-background font-bold rounded-full shadow-lg hover:scale-105 transition-transform print:hidden"
                    title="Comments & Questions"
                >
                    <ChatIcon className="w-6 h-6" />
                </button>
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 right-0 w-80 bg-background-light border-l border-primary/30 shadow-2xl transform transition-transform duration-300 z-50 flex flex-col print:hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-4 border-b border-primary/30 flex justify-between items-center bg-[#1c203c]">
                    <h3 className="font-bold text-white flex items-center">
                        <ChatIcon className="w-5 h-5 mr-2 text-secondary" />
                        Discussion
                    </h3>
                    <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                    {comments.map(comment => (
                        <div key={comment.id} className={`flex flex-col ${comment.author === 'You' ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-[85%] rounded-lg p-3 text-sm ${comment.author === 'You' ? 'bg-secondary text-white rounded-br-none' : 'bg-[#1c203c] text-gray-200 border border-gray-700 rounded-bl-none'}`}>
                                <p>{comment.text}</p>
                            </div>
                            <div className="flex items-center mt-1 space-x-2">
                                <span className="text-xs text-gray-500 font-semibold">{comment.author}</span>
                                <span className="text-[10px] text-gray-600">{comment.time}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSend} className="p-4 border-t border-primary/30 bg-[#1c203c]">
                    <div className="relative">
                        <input 
                            type="text" 
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Type a comment..."
                            className="w-full bg-background-light text-white rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-secondary border border-gray-700"
                        />
                        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-secondary hover:text-white">
                            <SendIcon className="w-4 h-4" />
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};