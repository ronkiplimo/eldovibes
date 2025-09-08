
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageCircle, Search, Send } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ConversationWithProfile {
  userId: string;
  userName: string;
  messages: any[];
  lastMessage: any;
  unreadCount: number;
}

interface MessageWithProfiles {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  sender_name?: string;
  receiver_name?: string;
}

const Messages = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Get all messages for the user
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Enrich with profile data and group by conversation
      const conversationsMap: Record<string, ConversationWithProfile> = {};
      
      for (const message of messagesData) {
        const otherUserId = message.sender_id === user.id ? message.receiver_id : message.sender_id;
        
        if (!conversationsMap[otherUserId]) {
          // Get the other user's profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', otherUserId)
            .single();
          
          conversationsMap[otherUserId] = {
            userId: otherUserId,
            userName: profileData?.full_name || 'Unknown User',
            messages: [],
            lastMessage: message,
            unreadCount: 0
          };
        }
        
        conversationsMap[otherUserId].messages.push(message);
        
        if (message.receiver_id === user.id && !message.is_read) {
          conversationsMap[otherUserId].unreadCount++;
        }
      }

      return Object.values(conversationsMap);
    },
    enabled: !!user
  });

  const { data: currentMessages = [] } = useQuery({
    queryKey: ['messages', selectedConversation],
    queryFn: async () => {
      if (!selectedConversation || !user) return [];
      
      // Get messages for this conversation
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedConversation}),and(sender_id.eq.${selectedConversation},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Enrich with profile data
      const enrichedMessages: MessageWithProfiles[] = [];
      
      for (const message of messagesData) {
        let senderName = 'Unknown';
        let receiverName = 'Unknown';

        // Get sender profile
        if (message.sender_id) {
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', message.sender_id)
            .single();
          
          if (senderProfile) {
            senderName = senderProfile.full_name || 'Unknown';
          }
        }

        // Get receiver profile
        if (message.receiver_id) {
          const { data: receiverProfile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', message.receiver_id)
            .single();
          
          if (receiverProfile) {
            receiverName = receiverProfile.full_name || 'Unknown';
          }
        }

        enrichedMessages.push({
          ...message,
          sender_name: senderName,
          receiver_name: receiverName
        });
      }
      
      return enrichedMessages;
    },
    enabled: !!selectedConversation && !!user
  });

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: selectedConversation,
          content: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversation] });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const markAsRead = async (messageId: string) => {
    if (!user) return;
    
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('id', messageId)
      .eq('receiver_id', user.id);
  };

  useEffect(() => {
    if (currentMessages.length > 0) {
      const unreadMessages = currentMessages.filter(
        msg => msg.receiver_id === user?.id && !msg.is_read
      );
      
      unreadMessages.forEach(msg => markAsRead(msg.id));
    }
  }, [currentMessages, user]);

  const filteredConversations = conversations.filter(conv =>
    conv.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-600">Please sign in to access messages</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex h-[600px] bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Conversations List */}
          <div className="w-1/3 border-r">
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Messages
              </h2>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="overflow-y-auto">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.userId}
                  onClick={() => setSelectedConversation(conversation.userId)}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                    selectedConversation === conversation.userId ? 'bg-red-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium">{conversation.userName}</h3>
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.lastMessage.content}
                      </p>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <span className="bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              
              {filteredConversations.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  {conversations.length === 0 ? 'No conversations yet' : 'No matching conversations'}
                </div>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Messages List */}
                <div className="flex-1 p-4 overflow-y-auto">
                  {currentMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`mb-4 flex ${
                        message.sender_id === user.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          message.sender_id === user.id
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        <p>{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender_id === user.id ? 'text-red-200' : 'text-gray-500'
                        }`}>
                          {new Date(message.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <form onSubmit={sendMessage} className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={!newMessage.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Select a conversation to start messaging
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
