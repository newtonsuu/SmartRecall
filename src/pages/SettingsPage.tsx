import React, { useState } from 'react';
import { ArrowLeftIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
interface SettingsPageProps {
  onLogout: () => void;
}
export function SettingsPage({
  onLogout
}: SettingsPageProps) {
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  const handleLogout = () => {
    // Clear user data
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    // Call the onLogout prop
    onLogout();
    // Navigate to login page
    navigate('/login');
  };
  return <div className="max-w-md mx-auto px-4 py-6 pb-20">
      <header className="flex items-center mb-8">
        <Link to="/profile" className="mr-4">
          <ArrowLeftIcon size={24} className="text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </header>
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Preferences
          </h3>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-700">Dark Mode</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Account</h3>
          <div className="mb-4">
            <span className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </span>
            <div className="text-gray-900">
              {localStorage.getItem('userEmail') || 'user@example.com'}
            </div>
          </div>
          <div className="space-y-3">
            <button className="text-blue-600 font-medium">
              Change Password
            </button>
            <button className="text-red-600 font-medium" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>;
}