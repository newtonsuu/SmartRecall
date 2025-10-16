import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MailIcon, Lock, LogIn } from 'lucide-react';
interface LoginPageProps {
  onLogin: () => void;
}
export function LoginPage({
  onLogin
}: LoginPageProps) {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple authentication check
    if (email === 'test@gmail.com' && password === 'admin123') {
      // Store user info in localStorage for profile page
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userName', 'Test User');
      onLogin();
    } else {
      setError('Invalid email or password');
    }
  };
  const handleSocialLogin = (provider: string) => {
    // Mock social login
    localStorage.setItem('userEmail', 'test@gmail.com');
    localStorage.setItem('userName', 'Test User');
    onLogin();
  };
  return <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SmartRecall</h1>
          <p className="text-lg text-gray-600">
            Master knowledge with AI-powered active recall.
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          {!showEmailForm ? <div>
              <div className="mb-6">
                <button type="button" onClick={() => setShowEmailForm(true)} className="w-full flex justify-center items-center gap-3 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition">
                  <MailIcon size={18} />
                  Sign in with Email
                </button>
              </div>
              <div className="relative flex items-center justify-center mb-6">
                <div className="border-t border-gray-300 w-full"></div>
                <span className="bg-white px-3 text-sm text-gray-500 absolute">
                  or
                </span>
              </div>
              <div className="space-y-4">
                <button type="button" onClick={() => handleSocialLogin('google')} className="w-full flex justify-center items-center gap-3 border border-gray-300 py-3 rounded-md hover:bg-gray-50 transition">
                  <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                  </svg>
                  Sign in with Google
                </button>
                <button type="button" onClick={() => handleSocialLogin('facebook')} className="w-full flex justify-center items-center gap-3 border border-gray-300 py-3 rounded-md hover:bg-gray-50 transition">
                  <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                    <path fill="#3F51B5" d="M42,37c0,2.762-2.238,5-5,5H11c-2.761,0-5-2.238-5-5V11c0-2.762,2.239-5,5-5h26c2.762,0,5,2.238,5,5V37z"></path>
                    <path fill="#FFF" d="M34.368,25H31v13h-5V25h-3v-4h3v-2.41c0.002-3.508,1.459-5.59,5.592-5.59H35v4h-2.287C31.104,17,31,17.6,31,18.723V21h4L34.368,25z"></path>
                  </svg>
                  Sign in with Facebook
                </button>
              </div>
            </div> : <form onSubmit={handleEmailLogin}>
              <h2 className="text-xl font-semibold mb-4 text-center">
                Sign in with Email
              </h2>
              {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>}
              <div className="space-y-4 mb-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MailIcon size={18} className="text-gray-400" />
                    </div>
                    <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="Your email" required />
                  </div>
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock size={18} className="text-gray-400" />
                    </div>
                    <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="Your password" required />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <input id="remember-me" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <a href="#" className="text-blue-600 hover:underline">
                    Forgot password?
                  </a>
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Sign in
              </button>
              <button type="button" onClick={() => setShowEmailForm(false)} className="w-full mt-4 text-gray-600 py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50">
                Back to options
              </button>
            </form>}
        </div>
        <div className="text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>;
}