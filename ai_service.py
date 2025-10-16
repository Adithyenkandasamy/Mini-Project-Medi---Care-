import re
from config import get_settings

settings = get_settings()

class AIService:
    def __init__(self):
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.gemini_model = genai.GenerativeModel('gemini-2.0-flash-exp')
    
    def evaluate_seriousness(self, symptoms: str) -> float:
        """Evaluate the seriousness of symptoms and return a percentage score"""
        prompt = f"""
        Analyze the following medical symptoms and provide a seriousness score from 0-100.
        Consider factors like severity, urgency, and potential complications.
        
        Symptoms: {symptoms}
        
        Respond with ONLY a number between 0 and 100, where:
        - 0-30: Minor issues, home remedies sufficient
        - 31-60: Moderate concern, consider doctor consultation
        - 61-85: Serious, medical attention recommended
        - 86-100: Critical, immediate medical attention required
        
        Score:
        """
        
        try:
            response = self.gemini_model.generate_content(prompt)
            score_text = response.text.strip()
            
            # Extract number from response
            numbers = re.findall(r'\d+\.?\d*', score_text)
            if numbers:
                score = float(numbers[0])
                return min(max(score, 0), 100)  # Clamp between 0-100
            return 50.0
        except Exception as e:
            print(f"Error evaluating seriousness: {e}")
            return 50.0
    
    def get_medical_advice(self, symptoms: str, user_profile: dict = None) -> str:
        """Get medical advice as an intelligent agent with context awareness"""
        user_context = ""
        medical_history = ""
        
        if user_profile:
            user_context = f"""
            Patient Information:
            - Age: {user_profile.get('age', 'Not specified')}
            - Gender: {user_profile.get('gender', 'Not specified')}
            - Blood Group: {user_profile.get('blood_group', 'Not specified')}
            - Height: {user_profile.get('height', 'Not specified')} cm
            - Weight: {user_profile.get('weight', 'Not specified')} kg
            - Default Location: {user_profile.get('location_preference', 'Not specified')}
            """
            
            if user_profile.get('allergies') or user_profile.get('chronic_conditions') or user_profile.get('current_medications'):
                medical_history = f"""
            Medical History:
            - Allergies: {user_profile.get('allergies', 'None reported')}
            - Chronic Conditions: {user_profile.get('chronic_conditions', 'None reported')}
            - Current Medications: {user_profile.get('current_medications', 'None reported')}
            """
        
        prompt = f"""
        You are MediGuide AI - an intelligent medical advisory agent, not just a chatbot. Act as a knowledgeable, empathetic healthcare assistant.
        
        {user_context}
        {medical_history}
        
        Patient Query: {symptoms}
        
        As an intelligent agent, you should:
        
        1. **Analyze Context**: Consider the patient's medical history, age, and current conditions
        2. **Provide Personalized Advice**: 
           - Possible conditions (with disclaimer)
           - Home remedies and self-care specific to their profile
           - Warning signs to watch for
           
        3. **Be Proactive About Location**:
           - If symptoms are serious, ASK: "Would you like me to find nearby hospitals? I can use your default location ({user_profile.get('location_preference', 'your saved location') if user_profile else 'your location'}) or you can provide a different location for more accurate results."
           - Offer to use precise/current location for better recommendations
           
        4. **Hospital Recommendations** (when appropriate):
           - If patient needs medical attention, proactively suggest: "Based on your symptoms, I recommend visiting a [specialist type]. Would you like me to find nearby [hospitals/clinics] in your area?"
           - Ask for location preference: "Use default location, provide different location, or use precise current location?"
           
        5. **Handle Uploaded Files**:
           - If medical reports are mentioned, acknowledge them and offer to analyze
           - Ask clarifying questions about the reports if needed
           
        6. **Act as Agent, Not Bot**:
           - Be conversational and empathetic
           - Ask follow-up questions when needed
           - Remember context from the conversation
           - Take initiative to suggest next steps
           
        Always include medical disclaimer: "⚠️ This is AI-generated guidance, not a medical diagnosis. Consult a healthcare professional for proper evaluation."
        
        Respond naturally as an intelligent healthcare agent would.
        """
        
        try:
            response = self.gemini_model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Error getting medical advice: {e}")
            return f"Error generating medical advice: {str(e)}"

# Singleton instance
ai_service = AIService()
