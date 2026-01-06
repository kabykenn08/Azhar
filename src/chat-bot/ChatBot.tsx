import { useState, useEffect, useRef } from 'react';
import { supabase } from '../cms/supabaseClient';
import './ChatBot.css';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = import.meta.env.VITE_GROQ_API_URL;

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface KnowledgeItem {
  category: string;
  question_ru: string;
  answer_ru: string;
  question_kz: string;
  answer_kz: string;
  keywords: string[];
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentLang, setCurrentLang] = useState<'ru' | 'kz'>('ru');
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeItem[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Загрузка базы знаний из Supabase
  useEffect(() => {
    loadKnowledge();
  }, []);

  const loadKnowledge = async () => {
    try {
      const { data, error } = await supabase
        .from('azhar_knowledge')
        .select('*');

      if (error) {
        console.error('Ошибка загрузки базы знаний:', error);
        return;
      }

      if (data) {
        console.log('База знаний загружена:', data.length, 'записей');
        setKnowledgeBase(data);
      }
    } catch (err) {
      console.error('Непредвиденная ошибка:', err);
    }
  };

  // Синхронизация языка с Header
  useEffect(() => {
    const savedLang = localStorage.getItem('language') as 'ru' | 'kz';
    if (savedLang) {
      setCurrentLang(savedLang);
    }

    const handleLanguageChange = () => {
      const newLang = localStorage.getItem('language') as 'ru' | 'kz';
      if (newLang) {
        setCurrentLang(newLang);
      }
    };

    window.addEventListener('languageChanged', handleLanguageChange);
    return () => window.removeEventListener('languageChanged', handleLanguageChange);
  }, []);

  // Автоскролл к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Приветственное сообщение при открытии
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = currentLang === 'kz' 
        ? 'Сәлеметсіз бе! Мен -ЖИ-көмекшісі, мен сізге орталық туралы сұрақтарға жауап беруге көмектесемін.'
        : 'Здравствуйте! Я - ИИ-помощник, я помогу ответить на вопросы о центре реабилитации.';
      
      setMessages([{
        id: Date.now().toString(),
        text: greeting,
        sender: 'bot',
        timestamp: new Date()
      }]);
    }
  }, [isOpen, currentLang]);

  // Поиск ответа в базе знаний
  const findAnswer = (userMessage: string): string | null => {
    if (knowledgeBase.length === 0) {
      console.log('База знаний пуста');
      return null;
    }

    const messageLower = userMessage.toLowerCase();
    const words = messageLower.split(/\s+/).filter(w => w.length > 2);
    
    console.log('Поиск по словам:', words);

    let bestMatch: KnowledgeItem | null = null;
    let maxScore = 0;

    for (const item of knowledgeBase) {
      let score = 0;
      
      // Проверяем каждое слово из сообщения пользователя
      for (const word of words) {
        // Проверяем совпадение с ключевыми словами
        for (const keyword of item.keywords) {
          if (keyword.toLowerCase().includes(word) || word.includes(keyword.toLowerCase())) {
            score += 2; // Больший вес за совпадение ключевого слова
          }
        }
        
        // Проверяем совпадение с вопросом
        const question = currentLang === 'kz' ? item.question_kz.toLowerCase() : item.question_ru.toLowerCase();
        if (question.includes(word)) {
          score += 1;
        }
      }

      if (score > maxScore) {
        maxScore = score;
        bestMatch = item;
      }
    }

    console.log('Лучшее совпадение:', bestMatch?.question_ru, 'Оценка:', maxScore);

    if (bestMatch && maxScore >= 2) {
      return currentLang === 'kz' ? bestMatch.answer_kz : bestMatch.answer_ru;
    }

    return null;
  };

  // Запрос к Groq API
  const askGroq = async (userMessage: string, context: string): Promise<string> => {
    const systemPrompt = currentLang === 'kz' 
      ? `Сіз "Ажар" балалар реабилитация орталығының көмекші чат-ботысыз. 
Сіздің міндетіңіз - орталық туралы сұрақтарға жауап беру.

Мына ақпаратты пайдаланыңыз:
${context}

МАҢЫЗДЫ ЕРЕЖЕЛЕР:
- Тек орталық туралы сұрақтарға жауап беріңіз
- Қысқа және нақты жауаптар беріңіз (1-2 абзац)
- Егер сұрақ орталыққа қатысты болмаса, достық түрде бас тартыңыз
- Барлық байланыс деректерін нақты көрсетіңіз: 8 (7182) 55 52 10
- Әрқашан сыпайы және кәсіби болыңыз`
      : `Вы чат-бот помощник центра реабилитации детей "Ажар".
Ваша задача - отвечать на вопросы о центре.

Используйте следующую информацию:
${context}

ВАЖНЫЕ ПРАВИЛА:
- Отвечайте только на вопросы о центре
- Давайте краткие и точные ответы (1-2 абзаца)
- Если вопрос не связан с центром, вежливо откажите
- Всегда указывайте контактные данные точно: 8 (7182) 55 52 10
- Всегда будьте вежливы и профессиональны`;

    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error('Ошибка API');
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Ошибка Groq API:', error);
      return currentLang === 'kz'
        ? 'Кешіріңіз, қазір жауап бере алмаймын. Тікелей байланысыңыз: 8 (7182) 55 52 10'
        : 'Извините, сейчас не могу ответить. Свяжитесь напрямую: 8 (7182) 55 52 10';
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Сначала ищем в базе знаний
      const directAnswer = findAnswer(input);
      
      let botResponse: string;
      
      if (directAnswer) {
        console.log('Найден прямой ответ из БД');
        // Если нашли точный ответ, используем его как контекст для Groq
        botResponse = await askGroq(input, directAnswer);
      } else {
        console.log('Прямой ответ не найден, используем общий контекст');
        // Если не нашли, формируем общий контекст из первых 10 записей
        const generalContext = knowledgeBase
          .slice(0, 10)
          .map(item => {
            const q = currentLang === 'kz' ? item.question_kz : item.question_ru;
            const a = currentLang === 'kz' ? item.answer_kz : item.answer_ru;
            return `Q: ${q}\nA: ${a}`;
          })
          .join('\n\n');
        
        botResponse = await askGroq(input, generalContext);
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Ошибка обработки сообщения:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: currentLang === 'kz'
          ? 'Қате орын алды. Қайталап көріңіз немесе байланысыңыз: 8 (7182) 55 52 10'
          : 'Произошла ошибка. Попробуйте снова или свяжитесь: 8 (7182) 55 52 10',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const getText = (key: string) => {
    const texts: Record<string, Record<string, string>> = {
      title: {
        ru: 'Чат-помощник',
        kz: 'Чат-көмекші'
      },
      placeholder: {
        ru: 'Задайте вопрос...',
        kz: 'Сұрақ қойыңыз...'
      },
      typing: {
        ru: 'Печатает...',
        kz: 'Жазуда...'
      }
    };
    return texts[key]?.[currentLang] || '';
  };

  return (
  <>
    {/* Кнопка открытия чата */}
    {!isOpen && (
      <button
        onClick={toggleChat}
        className="chatbot-button"
        aria-label="Открыть чат"
      >
        💬
      </button>
    )}

    {/* Окно чата */}
    {isOpen && (
      <div className="chatbot-window">
        {/* Заголовок */}
        <div className="chatbot-header">
          <h3>{getText('title')}</h3>
          <button 
            onClick={toggleChat}
            className="chatbot-close"
            aria-label="Закрыть чат"
          >
            ✕
          </button>
        </div>

        {/* Сообщения */}
        <div className="chatbot-messages">
        {messages.map(msg => (
            <div 
            key={msg.id} 
            className={`chatbot-message ${msg.sender === 'user' ? 'user' : 'bot'}`}
            >
            <div className="message-content">
                {msg.text}
                {/* Добавляем время сообщения */}
                <span className="message-time">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
            </div>
        ))}
        {/* ... isLoading ... */}
        <div ref={messagesEndRef} />
        </div>
        
        {/* Поле ввода */}
        <div className="chatbot-input-wrapper">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={getText('placeholder')}
            disabled={isLoading}
            className="chatbot-input"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="chatbot-send"
            aria-label="Отправить"
          >
            {/* Обновленный самолетик: крупнее и отцентрован */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9L22 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <div className="chatbot-footer">
            Made by NexorDevs
        </div>
      </div>
    )}
  </>
);
}