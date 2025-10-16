import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserIcon, ChevronRightIcon, LogOutIcon } from 'lucide-react';
export function ProfilePage() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  useEffect(() => {
    // Get user info from localStorage
    const storedName = localStorage.getItem('userName');
    const storedEmail = localStorage.getItem('userEmail');
    if (storedName) {
      setUserName(storedName);
    }
    if (storedEmail) {
      setUserEmail(storedEmail);
    }
  }, []);
  const handleLogout = () => {
    // Clear user data
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    // Navigate to login page
    navigate('/login');
  };
  return <div className="max-w-md mx-auto px-4 py-6 pb-20">
      <header className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
      </header>
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 flex items-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
            <UserIcon size={32} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {userName || 'User'}
            </h2>
            <p className="text-gray-500">{userEmail || 'user@example.com'}</p>
          </div>
          <button className="ml-auto text-blue-600">
            <span>edit</span>
          </button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Account Settings
          </h3>
          <div className="divide-y divide-gray-100">
            <Link to="/settings" className="flex items-center justify-between py-3">
              <div className="flex items-center">
                <span className="text-gray-700">Preferences</span>
              </div>
              <ChevronRightIcon size={20} className="text-gray-400" />
            </Link>
            <Link to="/settings" className="flex items-center justify-between py-3">
              <div className="flex items-center">
                <span className="text-gray-700">Notifications</span>
              </div>
              <ChevronRightIcon size={20} className="text-gray-400" />
            </Link>
            <Link to="/settings" className="flex items-center justify-between py-3">
              <div className="flex items-center">
                <span className="text-gray-700">Privacy Settings</span>
              </div>
              <ChevronRightIcon size={20} className="text-gray-400" />
            </Link>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Security</h3>
          <div className="divide-y divide-gray-100">
            <Link to="/settings" className="flex items-center justify-between py-3">
              <div className="flex items-center">
                <span className="text-gray-700">Change Password</span>
              </div>
              <ChevronRightIcon size={20} className="text-gray-400" />
            </Link>
            <Link to="/settings" className="flex items-center justify-between py-3">
              <div className="flex items-center">
                <span className="text-gray-700">Two-Factor Authentication</span>
              </div>
              <ChevronRightIcon size={20} className="text-gray-400" />
            </Link>
          </div>
        </div>
      </div>
      <button className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 rounded-lg" onClick={handleLogout}>
        <LogOutIcon size={18} />
        <span>Log Out</span>
      </button>
    </div>;
}