
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, X, Bot, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ConversationContext {
  userPreferences: {
    location?: string;
    priceRange?: { min: number; max: number };
    serviceCategory?: string;
  };
  conversationHistory: string[];
  searchQueries: string[];
}

const EldoVibesAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm EldoVibes Assistant, your intelligent companion finder. I can help you discover the perfect companion based on your preferences, answer questions about our services, and provide personalized recommendations. How can I assist you today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState<ConversationContext>({
    userPreferences: {},
    conversationHistory: [],
    searchQueries: []
  });
  const { toast } = useToast();

  // Enhanced AI response generation with learning capabilities
  const generateIntelligentResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    // Update conversation context
    setContext(prev => ({
      ...prev,
      conversationHistory: [...prev.conversationHistory, message].slice(-10), // Keep last 10 messages
      searchQueries: message.includes('find') || message.includes('looking') || message.includes('search') 
        ? [...prev.searchQueries, message].slice(-5) 
        : prev.searchQueries
    }));

    // Extract preferences from conversation
    const extractedPrefs: any = {};
    
    // Location preferences
    const locationKeywords = ['eldoret', 'cbd', 'langas', 'huruma', 'pioneer', 'kapsoya', 'marura', 'chepkoilel', 'kokwas', 'kossin', 'chepkanga'];
    const foundLocation = locationKeywords.find(loc => message.includes(loc));
    if (foundLocation) {
      extractedPrefs.location = foundLocation;
    }

    // Price preferences
    const priceMatch = message.match(/(\d+)\s*(?:to|-)?\s*(\d+)?\s*(?:kes|ksh|shillings?)/i);
    if (priceMatch) {
      const min = parseInt(priceMatch[1]);
      const max = priceMatch[2] ? parseInt(priceMatch[2]) : min;
      extractedPrefs.priceRange = { min: Math.max(500, min), max: Math.min(10000, max) };
    }

    // Update user preferences
    if (Object.keys(extractedPrefs).length > 0) {
      setContext(prev => ({
        ...prev,
        userPreferences: { ...prev.userPreferences, ...extractedPrefs }
      }));
    }

    // Contextual responses based on conversation history
    const hasAskedAboutPricing = context.conversationHistory.some(msg => 
      msg.includes('price') || msg.includes('cost') || msg.includes('rate') || msg.includes('kes')
    );

    const hasAskedAboutLocation = context.conversationHistory.some(msg =>
      msg.includes('location') || msg.includes('area') || msg.includes('where')
    );

    // Greeting responses
    if (message.includes('hello') || message.includes('hi') || message.includes('hey') || message.includes('good')) {
      const greetings = [
        "Hello! Welcome back to EldoVibes. Based on our previous conversations, I'm here to help you find the perfect companion.",
        "Hi there! I'm your personal EldoVibes assistant. I remember our chat and I'm ready to help you discover amazing companions.",
        "Hey! Great to see you again. I've learned from our conversations and can provide even better recommendations now."
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }

    // Enhanced pricing responses with KES
    if (message.includes('price') || message.includes('cost') || message.includes('rate') || message.includes('kes')) {
      let response = "Our companions offer competitive rates ranging from KES 500 to KES 10,000 per hour. ";
      
      if (context.userPreferences.priceRange) {
        const { min, max } = context.userPreferences.priceRange;
        response += `Based on your previous interest in the KES ${min.toLocaleString()}-${max.toLocaleString()} range, I can recommend companions within your budget. `;
      }
      
      response += "Each companion sets their own rates based on their experience and services offered. Would you like me to show you companions within a specific price range?";
      return response;
    }

    // Location-aware responses
    if (message.includes('location') || message.includes('area') || message.includes('where')) {
      let response = "We serve all areas in Eldoret including CBD, Langas, Huruma, Pioneer, Kapsoya, and newly added areas like Marura, Chepkoilel Junction, Kokwas, Kossin, and Chepkanga. ";
      
      if (context.userPreferences.location) {
        response += `I noticed you mentioned ${context.userPreferences.location} before. We have several companions available in that area. `;
      }
      
      response += "Would you like me to show you companions in a specific location?";
      return response;
    }

    // Booking and appointment responses
    if (message.includes('book') || message.includes('appointment') || message.includes('schedule') || message.includes('meet')) {
      let response = "I can help you book an appointment! The process is simple: browse profiles, select a companion you're interested in, and use our secure booking system. ";
      
      if (context.userPreferences.location || context.userPreferences.priceRange) {
        response += "Based on your preferences, I can recommend specific companions that match what you're looking for. ";
      }
      
      response += "All bookings are confidential and secure. Would you like me to guide you through the booking process?";
      return response;
    }

    // Safety and verification
    if (message.includes('safe') || message.includes('security') || message.includes('verify') || message.includes('trust')) {
      return "Safety is our absolute priority at EldoVibes. All companions undergo thorough verification, we use secure encrypted messaging, and all payments are processed safely. We also have 24/7 support and safety guidelines. Your privacy and security are guaranteed with every interaction.";
    }

    // Services and categories
    if (message.includes('service') || message.includes('what') || message.includes('offer')) {
      return "Our companions offer a wide range of professional services including companionship for social events, dinner dates, business functions, travel companionship, and personal companionship. Each companion specifies their available services on their profile. All interactions are consensual and professional.";
    }

    // Payment methods with KES focus
    if (message.includes('payment') || message.includes('pay') || message.includes('mpesa')) {
      return "We accept multiple payment methods including M-Pesa (most popular), bank transfers, and mobile money. All payments are in Kenyan Shillings (KES) and processed securely. M-Pesa is the fastest and most convenient option for Kenyan users.";
    }

    // Recommendation requests
    if (message.includes('recommend') || message.includes('suggest') || message.includes('best') || message.includes('find')) {
      let response = "I'd be happy to recommend the perfect companion for you! ";
      
      const prefs = context.userPreferences;
      if (prefs.location || prefs.priceRange || prefs.serviceCategory) {
        response += "Based on your preferences: ";
        if (prefs.location) response += `location in ${prefs.location}, `;
        if (prefs.priceRange) response += `budget of KES ${prefs.priceRange.min.toLocaleString()}-${prefs.priceRange.max.toLocaleString()}, `;
        response += "I can find companions that perfectly match your needs. ";
      }
      
      response += "Browse our verified profiles to see ratings, reviews, and available services. What specific qualities are you looking for in a companion?";
      return response;
    }

    // Learning from user behavior
    if (context.searchQueries.length > 2) {
      return "I've noticed you've been searching for companions. Based on your search patterns, I'm learning your preferences and can provide more personalized recommendations. Feel free to tell me exactly what you're looking for, and I'll help you find the perfect match!";
    }

    // Default intelligent response
    const defaultResponses = [
      "I'm here to help you navigate EldoVibes and find the perfect companion. Feel free to ask about our services, pricing in KES, safety measures, or let me recommend companions based on your preferences.",
      "As your personal EldoVibes assistant, I can help with profile recommendations, booking guidance, or answer any questions about our platform. What would you like to know?",
      "I'm continuously learning to serve you better. Whether you need help finding companions, understanding our pricing in KES, or booking services, I'm here to assist!"
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate AI thinking time with more realistic delay
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: generateIntelligentResponse(inputMessage),
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Save conversation context to localStorage
  useEffect(() => {
    if (context.conversationHistory.length > 0) {
      localStorage.setItem('eldovibes_assistant_context', JSON.stringify(context));
    }
  }, [context]);

  // Load conversation context from localStorage
  useEffect(() => {
    const savedContext = localStorage.getItem('eldovibes_assistant_context');
    if (savedContext) {
      try {
        setContext(JSON.parse(savedContext));
      } catch (e) {
        console.log('Could not load saved context');
      }
    }
  }, []);

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg z-50 animate-pulse"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-xl z-50 flex flex-col">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            EldoVibes AI Assistant
            {context.conversationHistory.length > 0 && (
              <span className="text-xs bg-white/20 px-2 py-1 rounded">Learning</span>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 flex flex-col">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-3 ${
                    message.isUser
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'bg-gray-100 text-gray-900 border'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!message.isUser && <Bot className="h-4 w-4 mt-1 flex-shrink-0 text-purple-600" />}
                    {message.isUser && <User className="h-4 w-4 mt-1 flex-shrink-0" />}
                    <div className="text-sm leading-relaxed">{message.content}</div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3 max-w-[85%] border">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-purple-600" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-gray-500">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t bg-gray-50">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about companions, pricing, locations..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              size="icon"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {context.userPreferences.location && (
            <div className="mt-2 text-xs text-gray-500">
              💡 I remember you're interested in {context.userPreferences.location}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EldoVibesAssistant;
