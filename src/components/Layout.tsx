import React from 'react';
import { NavigationBar } from './NavigationBar';
interface LayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}
export function Layout({
  children,
  onLogout
}: LayoutProps) {
  return <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1">{children}</main>
      <NavigationBar onLogout={onLogout} />
    </div>;
}