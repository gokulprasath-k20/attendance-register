import Link from 'next/link';
import Image from 'next/image';

export default function AuthNavbar() {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex-1"></div>
          
          <Link href="/" className="flex justify-center hover:opacity-80 transition-opacity">
            <Image
              src="/logo (1).png"
              alt="Logo"
              width={800}
              height={200}
              className="h-16 w-auto"
              priority
            />
          </Link>
          
          <div className="flex-1 flex justify-end">
            <Link 
              href="/" 
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
