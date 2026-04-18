"use client"; // Директива Next.js для работы хуков (useState) на стороне клиента

import React, { useState, useRef, useEffect } from 'react';

// 1. Описываем интерфейс сообщения для TypeScript
interface Message {
  id: number;
  text: string;
  sender: 'me' | 'other';
  time: string;
}

export default function ChatComponent() {
  // 2. Состояние для списка сообщений с явным указанием типа Message[]
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Привет! Как продвигается проект?", sender: "other", time: "10:00" },
    { id: 2, text: "Привет! Почти закончил верстку на Tailwind.", sender: "me", time: "10:05" },
  ]);

  // 3. Состояние для текста в поле ввода
  const [inputValue, setInputValue] = useState('');

  // 4. Реф для автоматической прокрутки чата вниз при новых сообщениях
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // 5. Функция отправки сообщения
  const handleSend = () => {
    if (!inputValue.trim()) return; // Игнорируем пустые сообщения

    const newMessage: Message = {
      id: Date.now(),
      text: inputValue,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, newMessage]);
    setInputValue('');
  };

  return (
    // 6. Главный контейнер: h-screen (высота экрана), flex-col (вертикальный стек)
    <div className="flex flex-col h-screen bg-gray-100 font-sans">
      
      {/* 7. Шапка чата (AppBar) */}
      <header className="bg-blue-600 text-white p-4 shadow-lg flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center">
          👤
        </div>
        <h1 className="text-xl font-semibold">Support Chat</h1>
      </header>

      {/* 8. Область сообщений: overflow-y-auto (скролл), flex-1 (занимает всё место) */}
      <main 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
      >
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            // 9. Динамическое выравнивание: если "я" - вправо, если "другой" - влево
            className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[75%] flex gap-2 ${msg.sender === 'me' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              {/* Аватарка в стиле Material */}
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs text-white shadow-sm
                ${msg.sender === 'me' ? 'bg-blue-500' : 'bg-purple-500'}`}>
                {msg.sender === 'me' ? 'Я' : 'Б'}
              </div>

              {/* 10. Пузырь сообщения (Bubble) */}
              <div className={`
                p-3 shadow-sm text-sm relative
                ${msg.sender === 'me' 
                  ? 'bg-blue-600 text-white rounded-l-2xl rounded-tr-2xl' // Скругления для "меня"
                  : 'bg-white text-gray-800 rounded-r-2xl rounded-tl-2xl' // Скругления для "собеседника"
                }
              `}>
                <p>{msg.text}</p>
                {/* Время сообщения */}
                <span className={`text-[10px] block mt-1 opacity-70 text-right`}>
                  {msg.time}
                </span>
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* 11. Панель ввода (Footer) */}
      <footer className="p-4 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Введите сообщение..."
            // 12. Стилизация инпута в стиле Material: focus:ring (фокусное кольцо)
            className="flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          {/* 13. Кнопка отправки с эффектом наведения (hover) и активного клика (active) */}
          <button
            onClick={handleSend}
            className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 active:scale-95 transition-all shadow-md"
          >
            ✉️
          </button>
        </div>
      </footer>
    </div>
  );
}

