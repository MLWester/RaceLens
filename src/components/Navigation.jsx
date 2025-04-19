import { Link, useLocation } from 'react-router-dom';
import { ChartBarIcon, HomeIcon, CloudUploadIcon, ChartPieIcon } from '@heroicons/react/24/outline';

const Navigation = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Upload', href: '/', icon: CloudUploadIcon },
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Telemetry', href: '/telemetry', icon: ChartBarIcon },
    { name: 'Analysis', href: '/analysis', icon: ChartPieIcon },
  ];

  return (
    <nav className="bg-white shadow-lg dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                RaceLens
              </span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      isActive
                        ? 'border-indigo-500 text-gray-900 dark:text-white'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    <item.icon className="h-5 w-5 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 