import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function Callback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');

      if (!code) {
        alert('Authentication failed - no code received');
        navigate('/');
        return;
      }

      try {
        // Call backend callback endpoint
        const response = await fetch(
          `http://localhost:8000/auth/callback?code=${code}&state=${state}`
        );

        if (!response.ok) {
          throw new Error('Authentication failed');
        }

        const data = await response.json();

        // Store auth data in localStorage
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user_name', data.user.name);
        localStorage.setItem('user_email', data.user.email);
        localStorage.setItem('profile_image', data.user.profile_image);
        localStorage.setItem('profile_completed', data.user.profile_completed);

        // Redirect based on profile completion
        if (data.user.profile_completed) {
          navigate('/dashboard');
        } else {
          navigate('/profile-setup');
        }
      } catch (error) {
        console.error('Callback error:', error);
        alert('Authentication failed. Please try again.');
        navigate('/');
      }
    };

    handleCallback();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">⏳</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Completing sign in...</h2>
        <p className="text-gray-600">Please wait while we set up your account</p>
      </div>
    </div>
  );
}
