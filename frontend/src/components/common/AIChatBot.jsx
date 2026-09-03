import React, { useState, useRef, useEffect } from 'react';
import { useConfig } from '../../context/ConfigContext';

const KNOWLEDGE_BASE = [
  {
    keywords: ['पावती', 'वर्गणी', 'receipt', 'vargani', 'देणगी', 'donation', 'print', 'whatsapp'],
    question: '🧾 नवीन वर्गणी / डिजिटल पावती कशी तयार करायची?',
    answer: `🚩 **नवीन वर्गणी पावती तयार करण्याची सोपी पद्धत:**
1. डॅशबोर्डवर **'➕ नवीन वर्गणी / पावती'** बटणावर क्लिक करा.
2. **देणगीदाराचे पूर्ण नाव**, मोबाईल नंबर, पत्ता आणि **रक्कम (₹)** प्रविष्ट करा.
3. भरणा प्रकार निवडा (रोख / UPI / बँक ट्रान्सफर).
4. **'पावती तयार करा'** वर क्लिक करा.
5. पावती तयार होताच **🖨️ प्रिंट पावती** करू शकता किंवा **📲 WhatsApp वर थेट अधिकृत PDF** पाठवू शकता!`
  },
  {
    keywords: ['खर्च', 'expense', 'bill', 'बिल', 'खर्चाची', 'vendor'],
    question: '💸 नवीन खर्च कसा नोंदवायचा?',
    answer: `💸 **नवीन खर्च नोंदवण्याची पद्धत:**
1. डॅशबोर्डवर **'💸 नवीन खर्च नोंदवा'** बटणावर क्लिक करा (किंवा डाव्या मेनूमधील **'खर्च व्यवस्थापन'** मध्ये जा).
2. खर्चाचा **प्रवर्ग (Category)** निवडा (उदा. मूर्ती व सजावट, रोषणाई, प्रसाद, मंडप, ध्वनीव्यवस्था इत्यादी).
3. **खर्चाची रक्कम (₹)**, बिल नंबर आणि दुकानदाराचे नाव (Vendor) टाका.
4. **'खर्च जतन करा'** वर क्लिक करा. हा खर्च लगेच तुमच्या एकूण हिशोबात वजा होईल!`
  },
  {
    keywords: ['कार्यकर्ते', 'सभासद', 'member', 'volunteer', 'user', 'वापरकर्ता', 'जोडणे', 'add'],
    question: '👥 कार्यकर्ते व सभासद कसे जोडायचे?',
    answer: `👥 **कार्यकर्ते व सभासद जोडण्याची पद्धत:**
1. **कार्यकर्ते जोडण्यासाठी:** डाव्या मेनूमधील **'वापरकर्ते व्यवस्थापन'** मध्ये जाऊन **'+ नवीन वापरकर्ता जोडा'** वर क्लिक करा. नाव, मोबाईल, पासवर्ड आणि भूमिका (खजिनदार/पावती प्रमुख/कार्यकर्ता) निवडून सेव्ह करा.
2. **सभासद जोडण्यासाठी:** **'मंडळ सभासद (Members)'** पेजवर जाऊन सभासदांची वर्गणी व माहिती नोंदवा.`
  },
  {
    keywords: ['उत्सव', 'festival', 'नवीन उत्सव', 'बदलायचा', 'switch', 'year', 'हिशोब नवीन', 'clean'],
    question: '🎪 नवीन उत्सव कसा जोडायचा व बदलायचा?',
    answer: `🎪 **उत्सव व्यवस्थापन व स्वतंत्र हिशोब:**
1. हेडरमधील **'कोणता उत्सव सुरू आहे?'** किंवा **'🎪 उत्सव'** बटणावर क्लिक करा.
2. **'+ नवीन उत्सव जोडा'** निवडून नवीन उत्सवाचे नाव (उदा. *माघी गणेशोत्सव, नवरात्रौत्सव, शिवजयंती*) व वर्ष टाका.
3. नवीन उत्सव निवडताच त्या उत्सवाचा **स्वच्छ ₹० हिशोब** सुरू होतो!
4. जुना उत्सव निवडल्यास त्याचे जुने सर्व रेकॉर्ड्स व पावत्या सुरक्षित दिसतील.`
  },
  {
    keywords: ['लोगो', 'logo', 'qr', 'क्यूआर', 'नाव', 'settings', 'पत्ता', 'बँक', 'edit'],
    question: '🏷️ मंडळाचे नाव, लोगो व बँक QR कोड कसा बदलायचा?',
    answer: `⚙️ **मंडळाची माहिती व लोगो बदलण्याची पद्धत:**
1. Super Admin खात्यातून डाव्या मेनूमधील **'मंडळ सेटिंग्ज (/admin/settings)'** मध्ये जा.
2. **१. मंडळाची माहिती व लोगो:** मोबाईलमधून मंडळाचा अधिकृत लोगो अपलोड करा.
3. **३. मंडप पत्ता व संपर्क:** पत्ता, संपर्क नंबर व सोशल मीडिया लिंक्स टाका.
4. **५. बँक व QR कोड:** बँक तपशील आणि **बँकेचा UPI QR कोड फोटो** अपलोड करा.
5. शेवटी **'💾 सर्व बदल जतन करा'** वर क्लिक करा.`
  },
  {
    keywords: ['लेजर', 'ledger', 'रिपोर्ट', 'report', 'हिशोब', 'पारदर्शक', 'transparency', 'pdf'],
    question: '📊 हिशोब रिपोर्ट व लेजर कसे पाहायचे?',
    answer: `📊 **हिशोब व रिपोर्ट पाहण्याची पद्धत:**
1. **हिशोब लेजर (Ledger):** दैनंदिन जमा-खर्चाची नोंद पाहण्यासाठी मेनूमधील **'हिशोब लेजर'** उघडा.
2. **रिपोर्ट डाउनलोड:** **'अहवाल (Reports)'** मधून संपूर्ण आर्थिक रिपोर्ट Excel किंवा PDF मध्ये मिळवा.
3. **सार्वजनिक पारदर्शकता:** नागरिक आणि भाविक थेट **'सार्वजनिक हिशोब'** पृष्ठावर मंडळाचा पारदर्शक हिशोब पाहू शकतात.`
  }
];

const AIChatBot = () => {
  const { config } = useConfig();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: `नमस्कार! 🙏 मी **${config.mandalName || 'मंडळ'} AI सहाय्यक** आहे. मंडळाची नवीन पावती कशी तयार करायची, खर्च कसा नोंदवायचा किंवा माहिती कशी बदलायची याविषयी मी तुम्हाला मदत करू शकेन. खालीलपैकी कोणताही प्रश्न निवडा किंवा तुमचा प्रश्न टाईप करा!`
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = (textToSend = null) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    // Add User Message
    const newMessages = [...messages, { sender: 'user', text: query }];
    setMessages(newMessages);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const lowerQuery = query.toLowerCase();
      
      // Find matching knowledge base item
      let matchedItem = null;
      let maxMatches = 0;

      for (const item of KNOWLEDGE_BASE) {
        let matches = 0;
        for (const kw of item.keywords) {
          if (lowerQuery.includes(kw.toLowerCase())) {
            matches++;
          }
        }
        if (matches > maxMatches) {
          maxMatches = matches;
          matchedItem = item;
        }
      }

      let botResponse = '';
      if (matchedItem && maxMatches > 0) {
        botResponse = matchedItem.answer;
      } else {
        botResponse = `🚩 **${config.mandalName} डिजिटल प्रणाली मार्गदर्शक:**
तुमच्या प्रश्नासाठी खालील मुख्य पर्यायांचा वापर करा:
• **🧾 नवीन वर्गणी पावती:** डॅशबोर्डवरील '+ नवीन वर्गणी / पावती' वरून तयार करा.
• **💸 खर्च नोंद:** '+ नवीन खर्च नोंदवा' वरून बिलासह सेव्ह करा.
• **🎪 उत्सव बदलणे:** वरच्या उजव्या बाजूने उत्सव बदला किंवा नवीन जोडा.
• **⚙️ लोगो, QR कोड व माहिती:** 'मंडळ सेटिंग्ज' मधून अपडेट करा.

अधिक मदतीसाठी खाली दिलेल्या सूचना बटणांवर क्लिक करा!`;
      }

      setMessages((prev) => [...prev, { sender: 'bot', text: botResponse }]);
      setIsTyping(false);
    }, 450);
  };

  return (
    <>
      <style>{`
        .ai-chatbot-floating-trigger {
          position: fixed;
          bottom: 82px;
          right: 18px;
          z-index: 999;
        }
        .ai-chatbot-trigger-btn {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.55rem 0.95rem;
          border-radius: 999px;
          background: linear-gradient(135deg, #800000 0%, #991B1B 100%);
          color: #FFFFFF;
          box-shadow: 0 6px 20px rgba(128, 0, 0, 0.35);
          border: 1.5px solid #FDE047;
          font-weight: 800;
          font-size: 0.84rem;
          cursor: pointer;
          transition: all 0.2s ease;
          animation: pulseGlow 2.5s infinite;
        }
        .ai-chatbot-trigger-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(128, 0, 0, 0.45);
        }
        .ai-chatbot-sheet-window {
          position: fixed;
          bottom: 82px;
          right: 18px;
          width: 380px;
          max-width: calc(100vw - 32px);
          height: 520px;
          max-height: 75vh;
          background: #FFFFFF;
          border-radius: 20px;
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(212, 175, 55, 0.3);
          display: flex;
          flex-direction: column;
          z-index: 1000;
          overflow: hidden;
          animation: slideUpSheet 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @media (max-width: 640px) {
          .ai-chatbot-floating-trigger {
            bottom: 78px;
            right: 12px;
          }
          .ai-chatbot-trigger-btn {
            padding: 0.45rem 0.8rem;
            font-size: 0.78rem;
          }
          .ai-chatbot-sheet-window {
            bottom: 72px;
            right: 10px;
            left: 10px;
            width: auto;
            max-width: none;
            height: 480px;
            max-height: 72vh;
            border-radius: 18px;
          }
        }
      `}</style>

      {/* Floating Trigger Button */}
      <div className="ai-chatbot-floating-trigger">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="ai-chatbot-trigger-btn"
          >
            <span style={{ fontSize: '1.15rem' }}>🤖</span>
            <span>AI सहाय्यक</span>
          </button>
        )}
      </div>

      {/* Chat Window Modal / Bottom Sheet */}
      {isOpen && (
        <div className="ai-chatbot-sheet-window">
          
          {/* Chat Header */}
          <div style={{
            background: 'linear-gradient(135deg, #800000 0%, #991B1B 100%)',
            color: '#FFFFFF',
            padding: '0.85rem 1.1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2px solid #FDE047'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: '#FFFBEB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.15rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}>
                🤖
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#FDE047' }}>
                  मंडळ AI सहाय्यक
                </div>
                <div style={{ fontSize: '0.72rem', color: '#FEF08A', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22C55E' }}></span>
                  ऑनलाइन • २४x७ मदत
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: '#FFFFFF',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              &times;
            </button>
          </div>

          {/* Chat Body */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem',
            background: '#FAF8F5',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem'
          }}>
            
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  gap: '0.5rem'
                }}
              >
                {msg.sender === 'bot' && (
                  <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: '#800000',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9rem',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    🤖
                  </div>
                )}
                <div style={{
                  maxWidth: '82%',
                  padding: '0.75rem 1rem',
                  borderRadius: msg.sender === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                  background: msg.sender === 'user' ? '#800000' : '#FFFFFF',
                  color: msg.sender === 'user' ? '#FFFFFF' : '#1C1917',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                  fontSize: '0.88rem',
                  lineHeight: '1.5',
                  border: msg.sender === 'user' ? 'none' : '1px solid #E7E5E4',
                  whiteSpace: 'pre-line'
                }}>
                  {msg.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#800000', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                  🤖
                </div>
                <div style={{ background: '#FFF', padding: '0.5rem 0.85rem', borderRadius: '14px', fontSize: '0.8rem', color: '#78716C', border: '1px solid #E7E5E4' }}>
                  उत्तर तयार करत आहे... ✨
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Suggestion Chips */}
          <div style={{
            background: '#FFFFFF',
            padding: '0.5rem 0.75rem',
            borderTop: '1px solid #E7E5E4',
            display: 'flex',
            gap: '0.4rem',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            scrollbarWidth: 'none'
          }}>
            {KNOWLEDGE_BASE.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(item.question)}
                style={{
                  background: '#FFFBEB',
                  border: '1px solid #FDE047',
                  borderRadius: '999px',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#800000',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                {item.question}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{
              padding: '0.75rem',
              background: '#FFFFFF',
              borderTop: '1px solid #E7E5E4',
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center'
            }}
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="मराठीत प्रश्न विचारा..."
              style={{
                flex: 1,
                padding: '0.65rem 0.85rem',
                border: '1.5px solid #D6D3D1',
                borderRadius: '12px',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="btn btn-primary btn-sm"
              style={{
                padding: '0.65rem 1rem',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              पाठवा ➔
            </button>
          </form>

        </div>
      )}
    </>
  );
};

export default AIChatBot;
