'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    ChevronLeft,
    Search,
    Send,
    MoreVertical,
    Paperclip,
    Image as ImageIcon,
    Smile,
    Check,
    CheckCheck,
    CircleDashed,
    Users,
    FileText
} from 'lucide-react';

// Mock Data
const CONTACTS = [
    { id: 1, name: 'Jessica Miller', avatar: 'JM', lastMessage: 'Thanks, I will try the new PR today!', time: '10:42 AM', unread: 2, isOnline: true },
    { id: 2, name: 'Alex Thompson', avatar: 'AT', lastMessage: 'My knee is feeling much better.', time: 'Yesterday', unread: 0, isOnline: false },
    { id: 3, name: 'David Garcia', avatar: 'DG', lastMessage: 'Can we reschedule our Friday session?', time: 'Yesterday', unread: 1, isOnline: true },
    { id: 4, name: 'Lisa Anderson', avatar: 'LA', lastMessage: 'The meal plan is perfect, thank you.', time: 'Tuesday', unread: 0, isOnline: false },
    { id: 5, name: 'Michael Chen', avatar: 'MC', lastMessage: 'Completed the leg day routine!', time: 'Monday', unread: 0, isOnline: true },
    { id: 6, name: 'Sarah Johnson', avatar: 'SJ', lastMessage: 'What replacement do you suggest for squats?', time: 'Sunday', unread: 0, isOnline: false },
];

const INITIAL_MESSAGES = [
    { id: 1, senderId: 1, text: 'Hi coach! I reviewed the new Powerbuilding V2 plan.', time: '10:15 AM', isMe: false, status: 'read' },
    { id: 2, senderId: 'me', text: 'Hey Jessica! Awesome, what do you think of the new deadlift progression?', time: '10:18 AM', isMe: true, status: 'read' },
    { id: 3, senderId: 1, text: 'It looks intense but I\'m excited for it. One question though...', time: '10:25 AM', isMe: false, status: 'read' },
    { id: 4, senderId: 1, text: 'Should I still use my lifting belt for the 8-10 rep sets?', time: '10:26 AM', isMe: false, status: 'read' },
    { id: 5, senderId: 'me', text: 'Great question. Try to go beltless for the 8-10 rep sets to build core stability. Save the belt for your heavy 3-5 rep sets.', time: '10:30 AM', isMe: true, status: 'read' },
    { id: 6, senderId: 1, text: 'Okay that makes sense.', time: '10:41 AM', isMe: false, status: 'read' },
    { id: 7, senderId: 1, text: 'Thanks, I will try the new PR today!', time: '10:42 AM', isMe: false, status: 'delivered' },
];

export default function MessagingPanel() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeContact, setActiveContact] = useState(CONTACTS[0]);
    const [messages, setMessages] = useState(INITIAL_MESSAGES);
    const [inputValue, setInputValue] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isLoading && (!isAuthenticated || (user?.role !== 'TRAINER' && user?.role !== 'ADMIN'))) {
            router.push('/login');
        }
    }, [isAuthenticated, user, router, isLoading]);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, activeContact]);

    if (isLoading || !isAuthenticated || (user?.role !== 'TRAINER' && user?.role !== 'ADMIN')) {
        return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading Messages...</div>;
    }

    const filteredContacts = CONTACTS.filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSendMessage = () => {
        if (!inputValue.trim()) return;

        const newMessage = {
            id: messages.length + 1,
            senderId: 'me',
            text: inputValue,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: true,
            status: 'sent'
        };

        setMessages([...messages, newMessage]);
        setInputValue('');

        // Simulate reading the message after 2 seconds
        setTimeout(() => {
            setMessages(prev => prev.map(m => m.id === newMessage.id ? { ...m, status: 'read' } : m));
        }, 2000);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    const StatusIcon = ({ status }: { status: string }) => {
        if (status === 'sent') return <Check className="w-3.5 h-3.5 text-slate-400" />;
        if (status === 'delivered') return <CheckCheck className="w-3.5 h-3.5 text-slate-400" />;
        if (status === 'read') return <CheckCheck className="w-3.5 h-3.5 text-blue-400" />;
        return <CircleDashed className="w-3.5 h-3.5 text-slate-500" />;
    };

    return (
        <div className="min-h-[calc(100vh-2rem)] md:min-h-screen bg-slate-950 text-slate-50 p-2 md:p-6 lg:p-8 flex flex-col">

            {/* Context Header */}
            <div className="flex flex-col gap-2 mb-6">
                <Button variant="ghost" className="w-fit text-slate-400 hover:text-white hover:bg-slate-900 -ml-2 p-2" asChild>
                    <Link href="/trainer">
                        <ChevronLeft className="w-5 h-5 mr-1" />
                        Back to Dashboard
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent pb-1">
                        Client Messages
                    </h1>
                </div>
            </div>

            {/* Main Chat Interface */}
            <Card className="flex-1 bg-slate-900/40 backdrop-blur-xl border-slate-800/60 flex flex-col md:flex-row overflow-hidden rounded-2xl h-[calc(100vh-180px)] min-h-[500px]">

                {/* Sidebar - Contact List */}
                <div className="w-full md:w-80 lg:w-96 border-r border-slate-800/50 flex flex-col bg-slate-950/30">
                    <div className="p-4 border-b border-slate-800/50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <Input
                                placeholder="Search clients..."
                                className="pl-9 h-10 bg-slate-900/60 border-slate-800 text-slate-200 placeholder:text-slate-500 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 rounded-lg"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="divide-y divide-slate-800/30">
                            {filteredContacts.map(contact => (
                                <div
                                    key={contact.id}
                                    onClick={() => setActiveContact(contact)}
                                    className={`p-4 flex gap-3 cursor-pointer transition-colors hover:bg-slate-800/40 ${activeContact.id === contact.id ? 'bg-indigo-500/10 border-l-2 border-indigo-500' : 'border-l-2 border-transparent'}`}
                                >
                                    <div className="relative">
                                        <Avatar className="h-12 w-12 border border-slate-700 bg-slate-950">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${contact.name.replace(' ', '')}&backgroundColor=1e293b&textColor=cbd5e1`} />
                                            <AvatarFallback className="text-slate-400">{contact.avatar}</AvatarFallback>
                                        </Avatar>
                                        {contact.isOnline && (
                                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full"></div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h4 className="font-semibold text-slate-200 truncate pr-2">{contact.name}</h4>
                                            <span className={`text-xs whitespace-nowrap ${contact.unread > 0 ? 'text-indigo-400 font-medium' : 'text-slate-500'}`}>
                                                {contact.time}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center gap-2">
                                            <p className={`text-sm truncate ${contact.unread > 0 ? 'text-slate-300 font-medium' : 'text-slate-400'}`}>
                                                {contact.lastMessage}
                                            </p>
                                            {contact.unread > 0 && (
                                                <Badge className="h-5 min-w-5 px-1.5 flex items-center justify-center bg-indigo-600 hover:bg-indigo-600 rounded-full text-[10px] font-bold">
                                                    {contact.unread}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col min-w-0 bg-slate-900/10">

                    {/* Chat Header */}
                    <div className="h-20 px-6 border-b border-slate-800/50 flex items-center justify-between bg-slate-950/40 backdrop-blur-md z-10">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-10 w-10 border border-slate-700">
                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${activeContact.name.replace(' ', '')}&backgroundColor=1e293b&textColor=cbd5e1`} />
                                <AvatarFallback>{activeContact.avatar}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="font-bold text-white text-lg leading-tight">{activeContact.name}</h3>
                                <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Online
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 md:gap-2">
                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-full hidden md:flex">
                                <FileText className="w-5 h-5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-full">
                                <MoreVertical className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Chat Messages */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth"
                    >
                        <div className="text-center pb-4">
                            <span className="text-xs font-medium text-slate-500 bg-slate-900/50 px-3 py-1 rounded-full border border-slate-800">
                                Today
                            </span>
                        </div>

                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${msg.isMe ? 'flex-row-reverse' : 'flex-row'}`}>

                                    {!msg.isMe && (
                                        <Avatar className="h-8 w-8 shrink-0 mt-auto hidden sm:block">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${activeContact.name.replace(' ', '')}&backgroundColor=1e293b&textColor=cbd5e1`} />
                                            <AvatarFallback>{activeContact.avatar}</AvatarFallback>
                                        </Avatar>
                                    )}

                                    <div className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                                        <div
                                            className={`p-3.5 rounded-2xl shadow-sm ${msg.isMe
                                                ? 'bg-indigo-600 text-white rounded-br-sm'
                                                : 'bg-slate-800/80 text-slate-100 rounded-bl-sm border border-slate-700/50'
                                                }`}
                                        >
                                            <p className="text-[15px] leading-relaxed break-words">{msg.text}</p>
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-1 mx-1 text-[11px] text-slate-500 font-medium">
                                            {msg.time}
                                            {msg.isMe && <StatusIcon status={msg.status} />}
                                        </div>
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Chat Input */}
                    <div className="p-4 bg-slate-950/60 border-t border-slate-800/50 backdrop-blur-md">
                        <div className="flex items-end gap-2 bg-slate-900 p-2 rounded-2xl border border-slate-800 shadow-inner focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all">

                            <div className="flex gap-1 pb-1 px-1">
                                <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl shrink-0">
                                    <Paperclip className="w-5 h-5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl shrink-0 hidden sm:flex">
                                    <ImageIcon className="w-5 h-5" />
                                </Button>
                            </div>

                            <Input
                                placeholder="Type a message..."
                                className="bg-transparent border-0 focus-visible:ring-0 shadow-none px-2 min-h-12 text-[15px] text-slate-200"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyPress}
                            />

                            <div className="flex gap-1 pb-1 pr-1">
                                <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-xl shrink-0 hidden sm:flex">
                                    <Smile className="w-5 h-5" />
                                </Button>
                                <Button
                                    onClick={handleSendMessage}
                                    disabled={!inputValue.trim()}
                                    className="h-10 w-10 bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-900/20 rounded-xl shrink-0 disabled:opacity-50 disabled:bg-slate-800 disabled:text-slate-500 transition-colors"
                                >
                                    <Send className="w-5 h-5 ml-0.5" />
                                </Button>
                            </div>
                        </div>
                    </div>

                </div>
            </Card>
        </div>
    );
}
