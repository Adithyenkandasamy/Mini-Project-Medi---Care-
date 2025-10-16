import re
from config import get_settings

settings = get_settings()

class AIService:
    def __init__(self):
        self.gemini_available = bool(settings.GEMINI_API_KEY)
        self.openai_available = bool(settings.OPENAI_API_KEY)
        
        if self.gemini_available:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.gemini_model = genai.GenerativeModel('gemini-pro')
        
        if self.openai_available:
            from openai import OpenAI
            self.openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)
    
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
            if self.gemini_available:
                response = self.gemini_model.generate_content(prompt)
                score_text = response.text.strip()
            elif self.openai_available:
                response = self.openai_client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=10
                )
                score_text = response.choices[0].message.content.strip()
            else:
                return 50.0  # Default moderate score
            
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
        """Get medical advice including remedies and hospital suggestions"""
        user_context = ""
        if user_profile:
            user_context = f"""
            User Profile:
            - Age: {user_profile.get('age', 'Not specified')}
            - Gender: {user_profile.get('gender', 'Not specified')}
            - Location: {user_profile.get('location_preference', 'Not specified')}
            """
        
        prompt = f"""
        You are a medical advisory AI assistant. Provide helpful medical guidance based on the symptoms described.
        
        {user_context}
        
        Symptoms: {symptoms}
        
        Please provide:
        1. Possible conditions (disclaimer: not a diagnosis)
        2. Home remedies and self-care tips
        3. When to seek medical attention
        4. Type of medical specialist to consult if needed
        
        Keep the response clear, concise, and helpful. Always remind the user that this is not a substitute for professional medical advice.
        """
        
        try:
            if self.gemini_available:
                response = self.gemini_model.generate_content(prompt)
                return response.text
            elif self.openai_available:
                response = self.openai_client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=500
                )
                return response.choices[0].message.content
            else:
                return "AI service not configured. Please add GEMINI_API_KEY or OPENAI_API_KEY to your .env file."
        except Exception as e:
            print(f"Error getting medical advice: {e}")
            return f"Error generating medical advice: {str(e)}"

# Singleton instance
ai_service = AIService()
