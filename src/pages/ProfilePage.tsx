import { useEffect, useState } from "react";
import { UserIcon, ChevronRightIcon, LogOutIcon, EditIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export function ProfilePage() {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [authMethod, setAuthMethod] = useState("email");

  const { profile, signOut } = useAuth();

  useEffect(() => {
    if (profile) {
      setUserName(profile.full_name || "");
      setUserEmail(profile.email || "");
      setAvatarUrl(profile.avatar_url || "");
      setAuthMethod(profile.auth_method || "email");
    }
  }, [profile]);

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-20">
      <header className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
      </header>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 flex items-center">
          <div className="relative w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={userName || "avatar"}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <UserIcon size={32} className="text-blue-600" />
            )}
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">
              {userName || "User"}
            </h2>
            <p className="text-gray-500">{userEmail || "user@example.com"}</p>
          </div>

          <Link to="/profile/edit" className="ml-auto text-blue-600">
            <EditIcon size={18} />
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Account Settings
          </h3>
          <div className="divide-y divide-gray-100">
            <Link
              to="/settings"
              className="flex items-center justify-between py-3"
            >
              <span className="text-gray-700">Preferences</span>
              <ChevronRightIcon size={20} className="text-gray-400" />
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Security</h3>
          <div className="py-3">
            {authMethod === "email" ? (
              <Link
                to="/profile/edit"
                className="flex items-center justify-between py-3"
              >
                <span className="text-gray-700 text-sm">Change Password</span>
                <ChevronRightIcon size={20} className="text-gray-400" />
              </Link>
            ) : (
              <p className="text-gray-400 text-sm italic">
                Password managed by {authMethod}
              </p>
            )}
          </div>
        </div>
      </div>

      <button
        className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 rounded-lg"
        onClick={signOut}
      >
        <LogOutIcon size={18} />
        <span>Log Out</span>
      </button>
    </div>
  );
}
