import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="pt-16 min-h-screen">
        <div className="fade-in">
          <Outlet />
        </div>
      </main>
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} RaceLens. All rights reserved.
            </div>
            <div className="flex items-center space-x-6">
              <a
                href="https://github.com/yourusername/racelens"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-500"
              >
                GitHub
              </a>
              <a
                href="#documentation"
                className="text-gray-400 hover:text-gray-500"
              >
                Documentation
              </a>
              <a
                href="#privacy"
                className="text-gray-400 hover:text-gray-500"
              >
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 