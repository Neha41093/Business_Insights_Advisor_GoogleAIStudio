
import React, { useState, useCallback } from 'react';
import type { CsvData, ChatMessage, ChartData } from './types';
import { getChatbotResponseStream } from './services/geminiService';
import FileUpload from './components/FileUpload';
import DataTable from './components/DataTable';
import ChatInterface from './components/ChatInterface';
import { LogoIcon, ResetIcon } from './constants';

const App: React.FC = () => {
  const [csvData, setCsvData] = useState<CsvData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleDataParsed = useCallback((data: CsvData) => {
    setCsvData(data);
    setError(null);
    setMessages([
      {
        id: 'initial-bot-message',
        sender: 'bot',
        text: `Successfully loaded your data with ${data.rows.length} rows. I am the Business Insights Advisor. What would you like to know? You can ask for calculations, insights, or even charts (e.g., "show me a bar chart of sales by product").`,
      },
    ]);
  }, []);
  
  const handleError = useCallback((message: string) => {
      setError(message);
      setTimeout(() => setError(null), 5000);
  }, []);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!csvData) return;

    const userMessage: ChatMessage = { id: Date.now().toString(), sender: 'user', text };
    const botMessageId = `${Date.now().toString()}-loading`;
    const botLoadingMessage: ChatMessage = { id: botMessageId, sender: 'bot', text: '', isLoading: true };

    setMessages(prev => [...prev, userMessage, botLoadingMessage]);
    setIsLoading(true);

    const responseStream = await getChatbotResponseStream(text, csvData);

    if ('error' in responseStream) {
        setMessages(prev => prev.map(msg => msg.id === botMessageId ? { ...msg, isLoading: false, text: responseStream.error } : msg));
        setIsLoading(false);
        return;
    }

    setMessages(prev => prev.map(msg => msg.id === botMessageId ? { ...msg, isLoading: false } : msg));

    let accumulatedText = "";
    let chartJsonStr = "";
    const separator = '||CHART_DATA||';
    let isParsingChart = false;

    for await (const chunk of responseStream) {
        const chunkText = chunk.text;
        if (isParsingChart) {
            chartJsonStr += chunkText;
        } else {
            if (chunkText.includes(separator)) {
                isParsingChart = true;
                const parts = chunkText.split(separator);
                accumulatedText += parts[0];
                chartJsonStr += parts[1] || '';
            } else {
                accumulatedText += chunkText;
            }
        }
        
        setMessages(prev => prev.map(msg =>
            msg.id === botMessageId ? { ...msg, text: accumulatedText } : msg
        ));
    }
    
    let finalChartData: ChartData | undefined = undefined;
    if (chartJsonStr) {
        try {
            finalChartData = JSON.parse(chartJsonStr);
        } catch (e) {
            console.error("Failed to parse chart JSON:", e, "\nJSON string:", chartJsonStr);
            accumulatedText += "\n\n(There was an error displaying the chart.)";
        }
    }

    const finalBotMessage: ChatMessage = { 
        id: botMessageId, 
        sender: 'bot', 
        text: accumulatedText.trim(), 
        chart: finalChartData 
    };
    
    setMessages(prev => prev.map(msg => msg.id === botMessageId ? finalBotMessage : msg));

    setIsLoading(false);
  }, [csvData]);
  
  const handleReset = () => {
      setCsvData(null);
      setMessages([]);
      setIsLoading(false);
      setError(null);
  }

  return (
    <div className="min-h-screen font-sans bg-gray-50 flex flex-col">
       <header className="w-full bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="w-full max-w-7xl mx-auto flex justify-between items-center p-4">
            <div className="flex items-center gap-3">
                <LogoIcon />
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                  Business Insights Advisor
                </h1>
            </div>
            {csvData && (
                <button
                    onClick={handleReset}
                    className="flex items-center justify-center bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors text-sm font-medium border border-gray-200"
                >
                    <ResetIcon />
                    Reset
                </button>
            )}
        </div>
      </header>
        
      <div className="w-full max-w-7xl mx-auto flex-grow flex flex-col p-4 sm:p-6 lg:p-8">
        {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded-lg mb-4 text-center">
                {error}
            </div>
        )}

        <main className="flex-grow flex flex-col">
            {!csvData ? (
            <div className="flex-grow flex items-center justify-center">
                <FileUpload onDataParsed={handleDataParsed} onError={handleError} />
            </div>
            ) : (
            <div className="w-full h-full flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <ChatInterface messages={messages} onSendMessage={handleSendMessage} isLoading={isLoading} />
                </div>
                <DataTable data={csvData} />
            </div>
            )}
        </main>
      </div>
    </div>
  );
};

export default App;
