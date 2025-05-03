'use client'

import Sidebar from "@/components/Sidebar";
import { usePathname } from 'next/navigation';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showSidebar = !pathname?.startsWith('/auth');

  return (
    <div className="flex min-h-screen bg-[#F1DAC4]">
      {showSidebar && <Sidebar />}
      <main className={`flex-1 ${showSidebar ? 'ml-16 lg:ml-64' : ''}`}>
        {children}
      </main>
    </div>
  );
} 