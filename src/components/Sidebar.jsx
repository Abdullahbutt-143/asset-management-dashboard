import {
  UserGroupIcon,
  ComputerDesktopIcon,
  ClipboardDocumentCheckIcon,
  CubeIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { isAdmin } from "../utils/adminUtils";

const Sidebar = ({ activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen, navigate, userProfile }) => {
  const allMenuItems = [
    { key: "dashboard", label: "dashboard", icon: CubeIcon, path: "/", adminOnly: false },
    { key: "assets", label: "assets", icon: ComputerDesktopIcon, path: "/assets", adminOnly: false },
    { key: "my-requests", label: "my-requests", icon: ClipboardDocumentCheckIcon, path: "/my-requests", adminOnly: false },
    { key: "users", label: "users", icon: UserGroupIcon, path: "/users", adminOnly: false },
    { key: "requests", label: "requests", icon: ClipboardDocumentCheckIcon, path: "/assets-request", adminOnly: false },
    { key: "requested-assets", label: "requested-assets", icon: ComputerDesktopIcon, path: "/get-assets", adminOnly: true },
    { key: "add-asset", label: "add-asset", icon: PlusIcon, path: "/add-asset", adminOnly: true },
  ];

  // Filter menu items based on admin status
  const menuItems = allMenuItems.filter(item => {
    if (item.adminOnly) {
      return isAdmin(userProfile);
    }
    return true;
  });

  return (
    <div
      className={`${
        isSidebarOpen ? "w-64" : "w-20"
      } bg-white shadow-lg transition-all duration-300`}
    >
      {/* Logo / Header */}
      <div className="p-6 border-b border-gray-200">
        <h1
          className={`text-2xl font-bold text-gray-800 ${
            !isSidebarOpen && "hidden"
          }`}
        >
          Jugrafiya Assets
        </h1>

        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="mt-3 p-2 rounded-lg hover:bg-gray-100"
        >
          <CubeIcon className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-6">
        {menuItems.map(({ key, label, icon: Icon, path }) => (
          <button
            key={key}
            onClick={() => {
              setActiveTab(key);
              navigate(path);
            }}
            className={`w-full flex items-center px-6 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
              activeTab === key
                ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                : ""
            }`}
          >
            <Icon className="w-6 h-6 text-gray-500 mr-3" />
            <span className={`capitalize ${!isSidebarOpen && "hidden"}`}>
              {label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
