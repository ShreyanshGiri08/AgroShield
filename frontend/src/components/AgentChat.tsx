import React, { useState, useRef, useEffect } from 'react';
import { FarmarianMascot } from './FarmarianMascot';
import { runAdvisoryQuery } from '../services/api';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Clock,
  BookOpen,
} from 'lucide-react';

interface AgentChatProps {
  userId: string;
  language: string;
  cropName?: string;
}

export const AgentChat: React.FC<AgentChatProps> = ({ userId, language, cropName: _cropName }) => {
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([
    {
      role: 'assistant',
      advisory: {
        title: 'नमस्ते! मैं फार्मरियन हूँ, आपका खेत रक्षक।',
        summary:
          language === 'hi'
            ? 'आपके कपास के खेत और अकोला के मौसम का विश्लेषण तैयार है। आप फसल, कीट, या आने वाली बारिश से जुड़े कोई भी सवाल पूछ सकते हैं।'
            : "I am Farmarian, your AI farm guardian. I'm actively monitoring your crop and live weather. What would you like to ask?",
        actionable_steps: [],
        farmarian_note: language === 'hi' ? 'आप बोलकर या लिखकर सवाल पूछ सकते हैं।' : 'Feel free to speak or type your question.',
      },
      execution_trace: [],
      citations: [],
    },
  ]);
  const [isListening, setIsListening] = useState(false);
  const [expandedTraceIdx, setExpandedTraceIdx] = useState<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // WebSpeech Speech-to-Text
  const handleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(language === 'hi' ? 'आपका ब्राउज़र वॉयस इनपुट का समर्थन नहीं करता।' : 'Your browser does not support Web Speech Recognition.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputQuery(transcript);
      handleSend(transcript);
    };

    recognition.start();
  };

  // WebSpeech Text-to-Speech
  const handleSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (queryToSubmit?: string) => {
    const q = queryToSubmit || inputQuery;
    if (!q.trim() || isLoading) return;

    setInputQuery('');
    // Append user query
    setMessages((prev) => [...prev, { role: 'user', text: q }]);
    setIsLoading(true);

    try {
      const result = await runAdvisoryQuery(userId, q, language);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          advisory: result.advisory,
          execution_trace: result.execution_trace || [],
          citations: result.citations || [],
          risk: result.risk_assessment,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          advisory: {
            title: language === 'hi' ? 'सलाह उपलब्ध नहीं हो सकी' : 'Advisory Unavailable',
            summary: language === 'hi' ? 'नेटवर्क या सर्वर से जुड़ने में समस्या हुई। कृपया पुनः प्रयास करें।' : 'Could not complete advisory request. Please retry.',
            actionable_steps: [],
          },
          execution_trace: [],
          citations: [],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick farmer prompts
  const quickPrompts = [
    'कपास में फूल आ रहे हैं और बारिश की संभावना है, क्या करूं?',
    'पत्तियों पर कीड़े और रस चूसक कीटों से बचाव के उपाय बताएं',
    'अकोला मंडी में आज कपास का क्या भाव चल रहा है?',
  ];

  return (
    <div className="bg-sand-light/50 border border-sand/80 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col h-[750px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-sand/60">
        <div className="flex items-center space-x-3">
          <FarmarianMascot state={isLoading ? 'thinking' : 'welcoming'} size={44} />
          <div>
            <h3 className="text-base font-black text-coffee flex items-center space-x-2">
              <span>{language === 'hi' ? 'फार्मरियन एआई सलाहकार' : 'Farmarian AI Advisory'}</span>
              <span className="bg-peach/30 text-coffee text-[10px] font-bold px-2 py-0.5 rounded-full">
                ICAR Verified
              </span>
            </h3>
            <p className="text-xs text-pitch/60">
              {language === 'hi' ? 'सजीव मौसम, ICAR ज्ञानकोष और डिटर्मिनिस्टिक सुरक्षा' : 'Live weather, ICAR knowledge & deterministic safety'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto my-4 space-y-4 pr-1 scrollbar-thin">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'user' ? (
              <div className="bg-coffee text-cornsilk rounded-2xl rounded-tr-none px-4 py-3 max-w-[85%] sm:max-w-[70%] text-sm font-medium shadow-sm">
                {msg.text}
              </div>
            ) : (
              <div className="bg-cornsilk border border-sand/80 rounded-2xl rounded-tl-none p-4 max-w-[95%] sm:max-w-[85%] shadow-sm space-y-3">
                {/* Advisory Title & Audio Pill */}
                <div className="flex items-start justify-between gap-2 border-b border-sand/40 pb-2">
                  <h4 className="text-sm font-black text-coffee flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-peach-dark flex-shrink-0" />
                    <span>{msg.advisory?.title}</span>
                  </h4>
                  {msg.advisory?.summary && (
                    <button
                      onClick={() => handleSpeak(msg.advisory?.summary)}
                      className="text-pitch/60 hover:text-coffee p-1 rounded-md hover:bg-sand/30"
                      title="आवाज सुनें (Listen)"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Summary */}
                <p className="text-xs sm:text-sm text-pitch/90 leading-relaxed font-medium">
                  {msg.advisory?.summary}
                </p>

                {/* Actionable Steps Grid */}
                {msg.advisory?.actionable_steps && msg.advisory.actionable_steps.length > 0 && (
                  <div className="space-y-2 mt-3 pt-2 border-t border-sand/40">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-coffee/80">
                      {language === 'hi' ? 'अनुशंसित कार्ययोजना' : 'Actionable Agronomic Steps'}
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {msg.advisory.actionable_steps.map((st: any, sIdx: number) => (
                        <div
                          key={sIdx}
                          className="bg-sand/20 border border-sand/50 rounded-xl p-2.5 text-xs flex items-start space-x-2.5"
                        >
                          <CheckCircle className="w-4 h-4 text-agri-safe flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-coffee">{st.category}</span>
                              <span className="text-[10px] text-pitch/50 flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{st.timeline}</span>
                              </span>
                            </div>
                            <p className="text-pitch/80 mt-0.5">{st.action}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Farmarian Note */}
                {msg.advisory?.farmarian_note && (
                  <p className="text-[11px] text-coffee/80 bg-peach/20 border border-peach/40 rounded-lg p-2 italic">
                    🌱 {msg.advisory.farmarian_note}
                  </p>
                )}

                {/* Real-Time Agent Execution Trace Accordion */}
                {msg.execution_trace && msg.execution_trace.length > 0 && (
                  <div className="border-t border-sand/40 pt-2">
                    <button
                      onClick={() =>
                        setExpandedTraceIdx(expandedTraceIdx === idx ? null : idx)
                      }
                      className="flex items-center justify-between w-full text-[11px] font-bold text-coffee/70 hover:text-coffee py-1"
                    >
                      <span className="flex items-center space-x-1">
                        <Sparkles className="w-3 h-3 text-peach-dark" />
                        <span>
                          {language === 'hi'
                            ? `सजीव एजेंट निष्पादन ऑडिट (${msg.execution_trace.length} चरण)`
                            : `Live Agent Execution Trace (${msg.execution_trace.length} steps)`}
                        </span>
                      </span>
                      {expandedTraceIdx === idx ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {expandedTraceIdx === idx && (
                      <div className="mt-2 space-y-1.5 bg-pitch/5 rounded-xl p-2.5 text-[11px] font-mono border border-sand/40">
                        {msg.execution_trace.map((step: any, stIdx: number) => (
                          <div key={stIdx} className="flex items-start space-x-2">
                            <span className="text-peach-dark font-bold">{stIdx + 1}.</span>
                            <div className="flex-1">
                              <span className="font-bold text-coffee">{step.step}: </span>
                              <span className="text-pitch/70">{step.summary}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Verifiable ICAR Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="border-t border-sand/40 pt-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-pitch/50 mb-1.5 flex items-center space-x-1">
                      <BookOpen className="w-3 h-3 text-peach-dark" />
                      <span>{language === 'hi' ? 'सत्यापित ICAR संदर्भ' : 'Verified ICAR Sources'}</span>
                    </p>
                    <div className="space-y-1">
                      {msg.citations.map((c: any, cIdx: number) => (
                        <div
                          key={cIdx}
                          className="text-[10px] bg-sand/30 border border-sand/60 rounded p-1.5 flex items-start justify-between"
                        >
                          <div>
                            <span className="font-bold text-coffee">{c.topic}</span>
                            <span className="text-pitch/60"> — {c.document_title}</span>
                          </div>
                          {c.page_number && (
                            <span className="bg-sand text-coffee font-bold px-1 rounded flex-shrink-0 ml-2">
                              पृष्ठ {c.page_number}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-3 text-xs text-coffee font-medium bg-sand/30 rounded-xl p-3 w-fit">
            <FarmarianMascot state="thinking" size={28} />
            <span className="animate-pulse">
              {language === 'hi'
                ? 'मौसम व ICAR अनुसंधान की जांच कर रहा हूँ...'
                : 'Investigating weather and ICAR agronomic publications...'}
            </span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {quickPrompts.map((p, pIdx) => (
          <button
            key={pIdx}
            onClick={() => handleSend(p)}
            className="text-[11px] whitespace-nowrap bg-sand/40 hover:bg-sand border border-sand/80 text-coffee font-semibold px-3 py-1.5 rounded-full transition"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Bar with Voice & Send */}
      <div className="mt-2 flex items-center space-x-2 pt-2 border-t border-sand/60">
        <button
          onClick={handleVoiceInput}
          className={`p-3 rounded-xl border transition ${
            isListening
              ? 'bg-red-500 text-white animate-pulse border-red-600'
              : 'bg-sand hover:bg-sand-dark text-coffee border-sand-dark'
          }`}
          title={isListening ? 'माइक बंद करें' : 'बोलकर पूछें (Voice Input)'}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={
            language === 'hi'
              ? 'यहाँ पूछें (उदा: बारिश के बाद क्या करें?)...'
              : 'Ask Farmarian about your farm or weather...'
          }
          className="flex-1 bg-cornsilk border border-sand focus:border-peach focus:ring-1 focus:ring-peach rounded-xl px-4 py-3 text-xs sm:text-sm text-pitch placeholder-pitch/40 outline-none"
        />

        <button
          onClick={() => handleSend()}
          disabled={!inputQuery.trim() || isLoading}
          className="bg-peach hover:bg-peach-dark disabled:opacity-40 text-coffee font-bold px-4 py-3 rounded-xl transition flex items-center space-x-1"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
