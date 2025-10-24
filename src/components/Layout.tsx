import React from 'react';
import { NavigationBar } from './NavigationBar';
interface LayoutProps {
  children: React.ReactNode;
}
export function Layout({
  children,
}: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-[#071124]">
      <main className="flex-1">{children}</main>
      <NavigationBar />
    </div>
  );
}