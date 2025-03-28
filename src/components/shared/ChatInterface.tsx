// components/shared/ChatInterface.tsx
import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiUser, FiSettings } from 'react-icons/fi';
import { GenerationPreference } from '../../types/image';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatInterfaceProps {
  onPreferencesUpdated: (preferences: GenerationPreference) => void;
}

const INITIAL_AI_MESSAGE = `Hello! I'm here to help you create the perfect headshot. You can tell me about:

- Background color or style
- Lighting preferences
- Clothing style
- Expression or mood
- Any other specific details for your headshot

What kind of headshot are you looking for?`;

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onPreferencesUpdated }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      content: INITIAL_AI_MESSAGE,
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<GenerationPreference>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages when new ones are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Process the chat to extract preferences
  const processChat = async (messages: Message[]) => {
    try {
      setLoading(true);
      
      // In a real app, you would send the messages to your backend
      // to process with GPT-4 and extract structured preferences
      // For now, we'll simulate this with a delay and some basic extraction

      // This is a simplified example - in a real app you would use NLP/AI to extract preferences
      const userMessages = messages
        .filter(msg => msg.sender === 'user')
        .map(msg => msg.content.toLowerCase());
      
      const newPreferences: GenerationPreference = { ...preferences };
      
      // Very simple preference extraction - just for demonstration
      if (userMessages.some(msg => msg.includes('background'))) {
        // Find the message with background preference
        const bgMsg = userMessages.find(msg => msg.includes('background'));
        if (bgMsg) {
          if (bgMsg.includes('white')) newPreferences.background = 'white';
          else if (bgMsg.includes('blue')) newPreferences.background = 'blue';
          else if (bgMsg.includes('gray') || bgMsg.includes('grey')) newPreferences.background = 'gray';
          else if (bgMsg.includes('gradient')) newPreferences.background = 'gradient';
        }
      }

      if (userMessages.some(msg => msg.includes('lighting'))) {
        const lightingMsg = userMessages.find(msg => msg.includes('lighting'));
        if (lightingMsg) {
          if (lightingMsg.includes('bright')) newPreferences.lighting = 'bright';
          else if (lightingMsg.includes('soft')) newPreferences.lighting = 'soft';
          else if (lightingMsg.includes('dramatic')) newPreferences.lighting = 'dramatic';
        }
      }

      // Add more preference extractors as needed
      
      // Save the last message as custom instructions if it doesn't match any categories
      const lastUserMessage = messages.filter(msg => msg.sender === 'user').pop();
      if (lastUserMessage) {
        newPreferences.customInstructions = lastUserMessage.content;
      }
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPreferences(newPreferences);
      onPreferencesUpdated(newPreferences);
      
      return newPreferences;
    } catch (error) {
      console.error('Error processing chat:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Handle sending a new message
  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    // Process the messages to update preferences
    const updatedPreferences = await processChat([...messages, userMessage]);
    
    // Add AI response
    const aiResponse: Message = {
      id: (Date.now() + 1).toString(),
      content: generateAIResponse(input, updatedPreferences),
      sender: 'ai',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, aiResponse]);
  };

  // Generate a simple AI response based on the user input
  const generateAIResponse = (userInput: string, prefs: GenerationPreference): string => {
    const userInputLower = userInput.toLowerCase();
    
    if (userInputLower.includes('background')) {
      return `I've noted your background preference as "${prefs.background || 'neutral'}". Is there anything else you'd like to specify for your headshot?`;
    } else if (userInputLower.includes('lighting')) {
      return `Great! I've set your lighting preference to "${prefs.lighting || 'standard'}". What about clothing or expression?`;
    } else if (userInputLower.includes('clothing') || userInputLower.includes('outfit')) {
      return `I've noted your clothing preference. Would you like to specify anything about the background or lighting?`;
    } else if (userInputLower.includes('smile') || userInputLower.includes('expression')) {
      return `I've noted your preference for expression. Any other details you'd like to add to your headshot?`;
    } else {
      return `I've added your preferences. Is there anything else you'd like to specify for your headshot?`;
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  // Handle pressing Enter to send
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-96 border rounded-lg overflow-hidden">
      {/* Chat header */}
      <div className="bg-blue-600 text-white px-4 py-3 flex items-center">
        <FiSettings className="h-5 w-5 mr-2" />
        <h3 className="font-medium">Headshot Preferences</h3>
      </div>
      
      {/* Messages container */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`my-2 p-3 rounded-lg max-w-[85%] ${
              message.sender === 'user'
                ? 'ml-auto bg-blue-600 text-white'
                : 'mr-auto bg-white border border-gray-200'
            }`}
          >
            <div className="flex items-center mb-1">
              {message.sender === 'user' ? (
                <FiUser className="h-4 w-4 mr-1" />
              ) : (
                <FiSettings className="h-4 w-4 mr-1" />
              )}
              <span className="text-xs opacity-75">
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <div className="p-3 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your preferences..."
            className="flex-1 py-2 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className={`p-2 rounded-md ${
              !input.trim() || loading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <span className="animate-spin inline-block h-5 w-5 border-t-2 border-white rounded-full"></span>
            ) : (
              <FiSend className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;