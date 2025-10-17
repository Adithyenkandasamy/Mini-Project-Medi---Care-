import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import ChatContainer from './components/ChatContainer'
import Sidebar from './components/Sidebar'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [chatHistory, setChatHistory] = useState([])
  const [hospitals, setHospitals] = useState([])

  useEffect(() => {
    // Load user data and chat history on app start
    loadUserData()
    loadChatHistory()
  }, [])

  const loadUserData = async () => {
    // Use hardcoded user data directly
    setUser({
      id: 'user123',
      name: 'Adithyen',
      email: 'adithyen@gmail.com'
    })
  }

  const loadChatHistory = async () => {
    // Use hardcoded chat history for demo
    setChatHistory([])
  }

  const sendMessage = async (message) => {
    // Enhanced responses with follow-up questions
    const getHardcodedResponse = (userMessage) => {
      const msg = userMessage.toLowerCase()
      
      // Fever responses with follow-up questions
      if (msg.includes('fever') || msg.includes('temperature')) {
        return {
          id: `msg_${Date.now()}`,
          message: userMessage,
          response: "I understand you're experiencing fever. Let me help assess your condition:\n\n🌡️ **Initial Assessment**:\nTo better understand your fever, I need some details:\n\n❓ **Follow-up Questions**:\n• How many days have you had the fever?\n• What's your current temperature (if measured)?\n• Are you experiencing chills or sweating?\n• Any other symptoms like body aches, headache, or sore throat?\n\n💡 **Immediate Care**:\n- Monitor your temperature regularly\n- Stay hydrated with plenty of fluids\n- Rest and avoid strenuous activities\n- Use fever-reducing medications as needed\n\n🚨 **Seek immediate care if**:\n- Temperature above 103°F (39.4°C)\n- Difficulty breathing\n- Persistent vomiting\n- Signs of dehydration",
          severity_score: 45,
          timestamp: new Date().toISOString(),
          hospitals: [
            {
              id: "1",
              name: "City General Hospital",
              address: "123 Main Street, Downtown",
              phone: "+1-555-0123",
              rating: 4.5,
              distance: "2.3 km",
              specialties: ["Emergency Care", "Internal Medicine"],
              is_open: true
            }
          ]
        }
      }
      
      // Cold and throat pain responses
      if (msg.includes('cold') || msg.includes('throat') || msg.includes('sore throat') || msg.includes('cough')) {
        return {
          id: `msg_${Date.now()}`,
          message: userMessage,
          response: "I see you're experiencing cold/throat symptoms. Let me gather more information:\n\n🤧 **Symptom Assessment**:\n\n❓ **Please tell me more**:\n• How long have you had these symptoms?\n• Is your throat pain severe or mild?\n• Do you have a runny or stuffy nose?\n• Any coughing? (dry or with mucus?)\n• Are you experiencing body aches or fatigue?\n• Any difficulty swallowing?\n\n💊 **Home Care Recommendations**:\n- Gargle with warm salt water\n- Stay hydrated with warm liquids\n- Use throat lozenges or honey\n- Get plenty of rest\n- Consider a humidifier\n\n⚠️ **See a doctor if**:\n- Severe throat pain lasting >3 days\n- High fever (>101°F)\n- Difficulty swallowing or breathing\n- White patches in throat",
          severity_score: 30,
          timestamp: new Date().toISOString(),
          hospitals: null
        }
      }
      
      // Enhanced headache responses
      if (msg.includes('headache') || msg.includes('head pain') || msg.includes('migraine')) {
        return {
          id: `msg_${Date.now()}`,
          message: userMessage,
          response: "I understand you're experiencing headache. Let me help assess the situation:\n\n🧠 **Headache Assessment**:\n\n❓ **Important Questions**:\n• How long have you had this headache?\n• On a scale of 1-10, how severe is the pain?\n• Is it throbbing, sharp, or dull pain?\n• Any nausea or vomiting?\n• Sensitivity to light or sound?\n• Any visual changes or aura?\n• Recent stress, lack of sleep, or dehydration?\n\n💡 **Immediate Relief**:\n- Rest in a dark, quiet room\n- Stay hydrated with water\n- Apply cold or warm compress\n- Gentle neck/shoulder massage\n- Consider over-the-counter pain relievers\n\n🚨 **Seek immediate medical attention if**:\n- Sudden, severe headache (worst ever)\n- Headache with fever, stiff neck, or rash\n- Vision changes or confusion\n- Headache after head injury",
          severity_score: 35,
          timestamp: new Date().toISOString(),
          hospitals: null
        }
      }
      
      // Chest pain - high priority
      if (msg.includes('chest pain') || msg.includes('chest hurt')) {
        return {
          id: `msg_${Date.now()}`,
          message: userMessage,
          response: "⚠️ **URGENT ATTENTION NEEDED**\n\nChest pain requires immediate medical evaluation.\n\n❓ **Critical Questions** (Call 911 if any YES):\n• Is the pain crushing, squeezing, or pressure-like?\n• Does pain radiate to arm, jaw, neck, or back?\n• Are you short of breath?\n• Nausea, sweating, or dizziness?\n• Pain worse with activity?\n\n🚨 **Immediate Actions**:\n- Stop any physical activity\n- Sit down and rest\n- Call emergency services if pain is severe\n- Chew aspirin if not allergic (unless told otherwise)\n\n📞 **Call 911 immediately if experiencing**:\n- Crushing or squeezing chest pain\n- Pain radiating to arm, jaw, or back\n- Shortness of breath\n- Nausea or sweating",
          severity_score: 85,
          timestamp: new Date().toISOString(),
          hospitals: [
            {
              id: "1",
              name: "Emergency Care Center",
              address: "789 Urgent Way, Central Area",
              phone: "+1-555-0911",
              rating: 4.8,
              distance: "1.2 km",
              specialties: ["Emergency Care", "Cardiology"],
              is_open: true
            }
          ]
        }
      }
      
      // Stomach/digestive issues
      if (msg.includes('stomach') || msg.includes('nausea') || msg.includes('vomit') || msg.includes('diarrhea') || msg.includes('abdominal')) {
        return {
          id: `msg_${Date.now()}`,
          message: userMessage,
          response: "I understand you're having stomach/digestive issues. Let me help assess:\n\n🤢 **Digestive Symptom Assessment**:\n\n❓ **Please provide details**:\n• How long have you had these symptoms?\n• Any vomiting? How many times?\n• Diarrhea? (frequency and consistency)\n• Abdominal pain location and severity?\n• Any fever or chills?\n• Recent food consumption or travel?\n• Blood in vomit or stool?\n\n💊 **Home Care**:\n- Stay hydrated (small, frequent sips)\n- BRAT diet (Bananas, Rice, Applesauce, Toast)\n- Avoid dairy, fatty, or spicy foods\n- Rest and avoid solid foods initially\n\n🚨 **Seek medical care if**:\n- Severe dehydration\n- Blood in vomit or stool\n- High fever (>101°F)\n- Severe abdominal pain\n- Signs of dehydration (dizziness, dry mouth)",
          severity_score: 40,
          timestamp: new Date().toISOString(),
          hospitals: null
        }
      }
      
      // Back pain
      if (msg.includes('back pain') || msg.includes('back hurt') || msg.includes('spine')) {
        return {
          id: `msg_${Date.now()}`,
          message: userMessage,
          response: "I see you're experiencing back pain. Let me gather more information:\n\n🦴 **Back Pain Assessment**:\n\n❓ **Key Questions**:\n• Where exactly is the pain? (upper, middle, lower back)\n• How long have you had this pain?\n• What triggered it? (lifting, movement, or gradual onset)\n• Sharp, dull, or burning pain?\n• Does pain radiate to legs or arms?\n• Any numbness or tingling?\n• Pain worse with movement or rest?\n\n💡 **Initial Care**:\n- Apply ice for first 24-48 hours\n- Then alternate with heat therapy\n- Gentle stretching and movement\n- Over-the-counter anti-inflammatory medication\n- Avoid bed rest (stay gently active)\n\n⚠️ **See a doctor if**:\n- Pain radiates down legs\n- Numbness or weakness in legs\n- Loss of bladder/bowel control\n- Severe pain after injury",
          severity_score: 35,
          timestamp: new Date().toISOString(),
          hospitals: null
        }
      }
      
      // Default response for other symptoms
      return {
        id: `msg_${Date.now()}`,
        message: userMessage,
        response: "Thank you for sharing your symptoms with Medi Care. I'd like to help you better:\n\n🔍 **To provide better guidance, please tell me**:\n• What specific symptoms are you experiencing?\n• How long have you had these symptoms?\n• Any pain level (1-10 scale)?\n• Any other accompanying symptoms?\n\n💡 **General Health Tips**:\n- Monitor your symptoms closely\n- Stay hydrated and get adequate rest\n- Maintain a healthy diet\n- Avoid strenuous activities if feeling unwell\n\n🏥 **When to seek care**:\n- If symptoms worsen or persist\n- If you develop new concerning symptoms\n- If you have any doubts about your condition\n\n⚠️ **Disclaimer**: This is AI-generated guidance, not a medical diagnosis. Please consult a healthcare professional for proper evaluation.",
        severity_score: 30,
        timestamp: new Date().toISOString(),
        hospitals: null
      }
    }
    
    const response = getHardcodedResponse(message)
    
    // Update chat history
    setChatHistory(prev => [...prev, response])
    
    // Update hospitals if provided
    if (response.hospitals) {
      setHospitals(response.hospitals)
    }
    
    return response
  }

  return (
    <div className="app">
      <Header user={user} />
      <main className="main-content">
        <div className="chat-layout">
          <ChatContainer 
            user={user}
            chatHistory={chatHistory}
            onSendMessage={sendMessage}
          />
          <Sidebar hospitals={hospitals} />
        </div>
      </main>
    </div>
  )
}

export default App
