import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, BookOpenIcon, PlusCircleIcon, UserIcon, BrainIcon } from 'lucide-react';

export function NavigationBar() {
  const location = useLocation();
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  return <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200">
      <div className="max-w-md px-4 mx-auto">
        <div className="flex justify-between items-center">
          <NavItem to="/" icon={<HomeIcon size={20} />} label="Home" isActive={isActive('/')} />
          <NavItem to="/study" icon={<BookOpenIcon size={20} />} label="Study" isActive={isActive('/study')} />
          <NavItem to="/add" icon={<PlusCircleIcon size={20} />} label="Add" isActive={isActive('/add')} />
          <NavItem to="/ai" icon={<BrainIcon size={20} />} label="AI" isActive={isActive('/ai')} />
          <NavItem to="/profile" icon={<UserIcon size={20} />} label="Profile" isActive={isActive('/profile')} />
        </div>
      </div>
    </nav>;
}
interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}
function NavItem({
  to,
  icon,
  label,
  isActive
}: NavItemProps) {
  return <Link to={to} className={`flex flex-col items-center py-2 px-3 ${isActive ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}>
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </Link>;
}