import React, { useState, useRef, useEffect } from 'react';
import { useConfig } from '../../context/ConfigContext';

const KNOWLEDGE_BASE = [
  {
    id: 'receipt',
    keywords: ['पावती', 'वर्गणी', 'देणगी', 'receipt', 'vargani', 'donation', 'pavti', 'pavati', 'paoti', 'vargani kashi', 'kashi ghyaychi', 'banva', 'receipt kashi', 'whatsapp', 'print', 'प्रिंट', 'व्हाट्सॲप', 'पैसे जमा', 'वर्गणी नोंद', 'पावती कशी', 'देणगी पावती'],
    question: '🧾 नवीन वर्गणी / डिजिटल पावती कशी तयार करायची?',
    answer: `🚩 **नवीन वर्गणी पावती तयार करण्याची सोपी पद्धत:**
1. डॅशबोर्डवर **'➕ नवीन वर्गणी / पावती'** बटणावर क्लिक करा.
2. **देणगीदाराचे पूर्ण नाव**, मोबाईल नंबर, पत्ता आणि **रक्कम (₹)** प्रविष्ट करा.
3. भरणा प्रकार निवडा (रोख / UPI / बँक ट्रान्सफर).
4. **'पावती तयार करा'** वर क्लिक करा.
5. पावती तयार होताच **🖨️ प्रिंट पावती** करू शकता किंवा **📲 WhatsApp वर थेट अधिकृत PDF** पाठवू शकता!`
  },
  {
    id: 'expense',
    keywords: ['खर्च', 'expense', 'bill', 'बिल', 'खर्चाची', 'vendor', 'kharch', 'kharcha', 'kharch kasa', 'bill kase', 'dukan', 'bille', 'पैसे खर्च', 'खर्च नोंद', 'खर्च कसा', 'नवीन खर्च'],
    question: '💸 नवीन खर्च कसा नोंदवायचा?',
    answer: `💸 **नवीन खर्च नोंदवण्याची पद्धत:**
1. डॅशबोर्डवर **'💸 नवीन खर्च नोंदवा'** बटणावर क्लिक करा (किंवा डाव्या मेनूमधील **'खर्च व्यवस्थापन'** मध्ये जा).
2. खर्चाचा **प्रवर्ग (Category)** निवडा (उदा. मूर्ती व सजावट, रोषणाई, प्रसाद, मंडप, ध्वनीव्यवस्था इत्यादी).
3. **खर्चाची रक्कम (₹)**, बिल नंबर आणि दुकानदाराचे नाव (Vendor) टाका.
4. **'खर्च जतन करा'** वर क्लिक करा. हा खर्च लगेच तुमच्या एकूण हिशोबात वजा होईल!`
  },
  {
    id: 'ledger',
    keywords: ['लेजर', 'ledger', 'हिशोब', 'शिल्लक', 'ताळेबंद', 'balance', 'hishob', 'hisob', 'shillak', 'silakh', 'kiti hishob', 'khatawani', 'खतावणी', 'नोंदवही', 'किती शिल्लक', 'baki', 'हिशोब कसा', 'शिल्लक किती'],
    question: '📜 हिशोब नोंदवही व खतावणी (General Ledger) कशी पाहायची?',
    answer: `📜 **नोंदवही व खतावणी (General Ledger):**
1. डाव्या मेनूमधील **'नोंदवही (General Ledger)'** वर क्लिक करा.
2. येथे सर्व जमा व खर्च नोंदींची अधिकृत खतावणी तारखेनुसार दिसेल.
3. तळाशी **एकूण जमा (Credit), एकूण खर्च (Debit) व निव्वळ शिल्लक** स्पष्ट दिसेल.
4. तसेच **[ 📥 सर्व PDF ]**, **[ 💵 रोख PDF ]** आणि **[ 📱 ऑनलाइन PDF ]** स्वतंत्र डाऊनलोड करू शकता!`
  },
  {
    id: 'gallery',
    keywords: ['फोटो', 'गॅलरी', 'photo', 'gallery', 'image', 'picture', 'bappa photo', 'upload', 'फोटो कसा', 'gallery madhe', 'fotu', 'ganpati photo', 'hero photo', 'फोटो अपलोड', 'प्रतिमा'],
    question: '🖼️ फोटो गॅलरीत फोटो कसे जोडायचे व बाप्पाचा फोटो कसा बदलायचा?',
    answer: `🖼️ **फोटो गॅलरी व मुख्य गणपती फोटो व्यवस्थापन:**
1. **गॅलरीत फोटो जोडण्यासाठी:** डाव्या मेनूमधील **'फोटो गॅलरी (Gallery)'** मध्ये जा आणि **'+ नवीन फोटो जोडा'** वरून शीर्षक व फोटो अपलोड करा.
2. **मुख्यपृष्ठावरील बाप्पाचा फोटो बदलण्यासाठी:** Super Admin खात्यातून **'मंडळ सेटिंग्ज (/admin/settings)'** मध्ये विभाग १ मधील **'श्री गणपती बाप्पा फोटो'** वरून नवीन फोटो अपलोड करा!`
  },
  {
    id: 'documents',
    keywords: ['कागदपत्र', 'कागदपत्रे', 'परवानगी', 'पोलीस', 'noc', 'document', 'permission', 'police', 'kagadpatra', 'parvangi', 'patra', 'pmc', 'mseb', 'कागदपत्र कसे', 'परवानगी कशी', 'प्रमाणपत्र'],
    question: '📁 कागदपत्रं व पोलीस परवानगी पत्र कसे पाहायचे व जोडायचे?',
    answer: `📁 **कागदपत्रं व शासकीय परवानग्या (Documents & Proofs):**
1. डाव्या मेनूमधील **'कागदपत्रं (Documents)'** पृष्ठावर जा.
2. येथे पोलीस ठाणे परवानगी, महापालिका NOC, वीज परवानगी पत्र उपलब्ध आहेत.
3. **'👁️ पहा / 📥'** वर क्लिक केल्यावर स्क्रीनवरच अधिकृत दस्तऐवज/प्रमाणपत्र दिसेल आणि तेथूनच PDF डाऊनलोड करता येईल.
4. **'+ नवीन कागदपत्र जोडा'** वरून तुमचे स्वतःचे दस्तऐवज किंवा बिल अपलोड करू शकता!`
  },
  {
    id: 'qr',
    keywords: ['qr', 'क्यूआर', 'बँक', 'bank', 'upi', 'gpay', 'phonepe', 'account', 'qr code', 'payment', 'khata', 'बँक तपशील', 'स्कॅन', 'क्यूआर कोड बदला', 'बँक खातं'],
    question: '📱 मंडळाचा बँक UPI QR कोड कसा बदलायचा?',
    answer: `📱 **बँक व QR कोड अपडेट करण्याची पद्धत:**
1. Super Admin खात्यातून **'मंडळ सेटिंग्ज (/admin/settings)'** मध्ये जा.
2. खाली स्क्रोल करून **'५. बँक तपशील व QR कोड'** विभागात जा.
3. बँकेचे नाव, खाते क्रमांक, IFSC कोड आणि **मोबाईलमधून QR कोडचा फोटो अपलोड करा**.
4. **'💾 सर्व बदल जतन करा'** वर क्लिक करताच मुख्य वेबसाइटवर व पावत्यांवर तुमचा नवीन QR कोड सक्रिय होईल!`
  },
  {
    id: 'festival',
    keywords: ['उत्सव', 'festival', 'नवीन उत्सव', 'बदलायचा', 'switch', 'year', 'हिशोब नवीन', 'clean', 'utsav', 'navin utsav', 'वर्ष', 'उत्सव कसा', 'दुसरा उत्सव', 'नवीन वर्ष'],
    question: '🎪 नवीन उत्सव कसा सुरू करायचा व स्वच्छ ₹० हिशोब कसा ठेवायचा?',
    answer: `🎪 **नवीन उत्सव व स्वच्छ ₹० हिशोब (Clean Slate):**
1. वरच्या हेडरमधील **'🚩 गणेशोत्सव २०२६ ▼'** या बटणावर क्लिक करा.
2. **'+ नवीन उत्सव जोडा'** निवडून उत्सवाचे नाव (उदा. *माघी गणेशोत्सव २०२७, नवरात्रौत्सव*) व वर्ष टाका.
3. नवीन उत्सव निवडताच जुना डेटा न दिसता **एकदम स्वच्छ ₹० शिल्लक** सुरू होते!
4. जुन्या उत्सवावर पुन्हा क्लिक केल्यास त्याचे जुने सर्व रेकॉर्ड्स व पावत्या सुरक्षित दिसतात.`
  },
  {
    id: 'reports',
    keywords: ['रिपोर्ट', 'अहवाल', 'report', 'pdf', 'csv', 'excel', 'download', 'अहवाल कसा', 'डाऊनलोड', 'file', 'export', 'तक्ता', 'csv export', 'excel table'],
    question: '📊 आर्थिक अहवाल, Excel टेबल व CSV कसे डाऊनलोड करायचे?',
    answer: `📊 **आर्थिक अहवाल व डाऊनलोड पद्धत:**
1. डाव्या मेनूमधील **'आर्थिक अहवाल (Reports)'** मध्ये जा.
2. **[ 📥 PDF अहवाल (Table) ]** : संपूर्ण ताळेबंद, जमा-खर्च वर्गीकरण आणि अध्यक्ष-खजिनदार स्वाक्षरीसह अधिकृत PDF.
3. **[ 📑 Excel (.xls) टेबल ]** : मायक्रोसॉफ्ट एक्सेलमध्ये थेट उघडणारा रंगीत व सुबक ताळेबंद तक्ता.
4. **[ 📊 CSV तक्ता ]** : डेटा अ‍ॅनालिसिससाठी पूर्ण CSV डेटा.`
  },
  {
    id: 'volunteers',
    keywords: ['कार्यकर्ते', 'सभासद', 'member', 'volunteer', 'user', 'वापरकर्ता', 'जोडणे', 'add', 'role', 'karyakarte', 'sabhasad', 'role kase', 'treasurer', 'खजिनदार', 'अध्यक्ष', 'कार्यकर्ता कसा जोडायचा'],
    question: '👥 कार्यकर्ते कसे जोडायचे व भूमिका (Role) कशी द्यायची?',
    answer: `👥 **कार्यकर्ते व वापरकर्ते व्यवस्थापन:**
1. Super Admin खात्यातून डाव्या मेनूमधील **'वापरकर्ते व परवानग्या (Users)'** मध्ये जा.
2. **'+ नवीन वापरकर्ता जोडा'** वर क्लिक करा.
3. नाव, मोबाईल नंबर, पासवर्ड प्रविष्ट करा आणि योग्य भूमिका निवडा:
   - **खजिनदार (Treasurer)** : जमा-खर्च व अहवाल व्यवस्थापन.
   - **पावती प्रमुख (Receipt Manager)** : वर्गणी पावती व संकलन.
   - **कार्यकर्ता (Volunteer)** : पावती तयार करणे व कामे पाहणे.`
  },
  {
    id: 'login',
    keywords: ['लॉगिन', 'पासवर्ड', 'login', 'password', 'forgot', 'otp', 'पासवर्ड कसा', 'विसरलात', 'sign in', 'account', 'पासवर्ड विसरलो', 'लॉगिन कसे'],
    question: '🔐 समिती लॉगिन कसे करायचे व पासवर्ड कसा रिसेट करायचा?',
    answer: `🔐 **समिती लॉगिन व पासवर्ड रिसेट:**
1. मुख्य वेबसाइटवरील **'समिती Login'** बटणावर क्लिक करा.
2. आपला मोबाईल नंबर / वापरकर्तानाव आणि पासवर्ड टाकून लॉगिन व्हा.
3. **पासवर्ड विसरल्यास:** **'🔑 पासवर्ड विसरलात?'** वर क्लिक करा, मोबाईल नंबर टाका, OTP पडताळा आणि जागेवर नवीन पासवर्ड सेट करा!`
  },
  {
    id: 'settings',
    keywords: ['लोगो', 'logo', 'नाव', 'settings', 'पत्ता', 'संपर्क', 'instagram', 'facebook', 'नाव बदलायचे', 'नाव कसे', 'लोगो कसा', 'बदलायचे', 'माहिती बदला'],
    question: '⚙️ मंडळाचे नाव, लोगो, पत्ता व सोशल मीडिया कसे बदलायचे?',
    answer: `⚙️ **मंडळ सेटिंग्ज व्यवस्थापन:**
1. डाव्या मेनूमधील **'मंडळ सेटिंग्ज (/admin/settings)'** मध्ये जा.
2. **१. मंडळाची माहिती:** नाव, ब्रीदवाक्य, स्थापना वर्ष व अधिकृत लोगो बदला.
3. **३. पत्ता व संपर्क:** मंडपाचा पूर्ण पत्ता, मोबाईल नंबर व इन्स्टाग्राम/फेसबुक लिंक टाका.
4. **💾 सर्व बदल जतन करा** वर क्लिक करा. सर्व माहिती वेबसाइटवर लगेच अपडेट होईल!`
  },
  {
    id: 'greetings',
    keywords: ['hi', 'hello', 'hey', 'namaskar', 'नमस्कार', 'राम राम', 'जय गणेश', 'गणपती बाप्पा', 'bappa', 'help', 'मदत', 'kasa ahes', 'kaay chalalay'],
    question: '🙏 नमस्कार! गणपती बाप्पा मोरया!',
    answer: `🚩 **नमस्कार! 🙏 गणपती बाप्पा मोरया!**
मी **मंडळ AI सहाय्यक** आहे. मी तुम्हाला खालील कामांमध्ये मदत करू शकतो:
• 🧾 नवीन वर्गणी पावती तयार करणे व WhatsApp वर पाठवणे
• 💸 नवीन खर्चाची नोंद बिलासह करणे
• 📜 नोंदवही व खतावणी (Ledger) पाहणे
• 📁 शासकीय कागदपत्रे व परवानग्या तपासणे
• 📊 Excel / PDF अहवाल डाऊनलोड करणे
• ⚙️ मंडळाचे नाव, लोगो व बँक QR कोड बदलणे

तुम्हाला नेमकी काय मदत हवी आहे ते सांगा!`
  }
];

const AIChatBot = () => {
  const { config } = useConfig();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: `नमस्कार! 🙏 मी **${config.mandalName || 'मंडळ'} AI सहाय्यक** आहे. मंडळाची नवीन पावती कशी तयार करायची, खर्च कसा नोंदवायचा, फोटो किंवा माहिती कशी बदलायची याविषयी मी तुम्हाला मदत करू शकेन. खालीलपैकी कोणताही प्रश्न निवडा किंवा तुमचा प्रश्न मराठीत किंवा इंग्रजीत टाईप करा!`
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
      
      // Smart Multi-Token & Stem Scoring Engine
      let bestItem = null;
      let maxScore = 0;

      for (const item of KNOWLEDGE_BASE) {
        let score = 0;
        
        // Exact title/question match
        if (lowerQuery.includes(item.question.toLowerCase())) {
          score += 25;
        }

        for (const kw of item.keywords) {
          const k = kw.toLowerCase();
          if (lowerQuery === k) {
            score += 20;
          } else if (lowerQuery.includes(k)) {
            score += 6 + Math.min(k.length, 6);
          } else {
            // Check word-by-word token overlap
            const queryWords = lowerQuery.split(/[\s,./?!-]+/);
            for (const qw of queryWords) {
              if (qw.length >= 3 && k.includes(qw)) {
                score += 3;
              }
            }
          }
        }

        if (score > maxScore) {
          maxScore = score;
          bestItem = item;
        }
      }

      let botResponse = '';
      if (bestItem && maxScore >= 4) {
        botResponse = bestItem.answer;
      } else {
        // Context-aware dynamic fallback
        botResponse = `🚩 **${config.mandalName} डिजिटल सहाय्यक:**
तुम्ही विचारलेल्या *"${query}"* या प्रश्नासाठी खालील मुख्य विषयांची मदत उपलब्ध आहे:

• **🧾 वर्गणी पावती:** '+ नवीन वर्गणी / पावती' वरून तयार करा व WhatsApp वर पाठवा.
• **💸 खर्च नोंद:** '+ नवीन खर्च नोंदवा' वरून बिलासह नोंदवा.
• **📜 नोंदवही (Ledger):** 'नोंदवही व खतावणी' मधून रोख/ऑनलाइन हिशोब पहा.
• **📁 कागदपत्रे:** 'कागदपत्रं व परवानग्या' मधून पोलीस परवानगी पत्र पहा.
• **🖼️ फोटो:** 'फोटो गॅलरी' मधून उत्सव फोटो जोडा.
• **⚙️ लोगो व बँक QR:** 'मंडळ सेटिंग्ज' मधून अपडेट करा.

कृपया खालील विषयांपैकी एखादा पर्याय निवडा किंवा अधिक स्पष्ट शब्दात टाईप करा!`;
      }

      setMessages((prev) => [...prev, { sender: 'bot', text: botResponse }]);
      setIsTyping(false);
    }, 350);
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
