import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext";
import { BellIcon } from "@heroicons/react/24/outline";

const PageHeader = ({ title, subtitle, showRequestButton = false }) => {
  const { user, profile, logout } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name || ""}`.trim()
    : user?.email?.split("@")[0] || "User";

  const initials = profile?.first_name
    ? profile.first_name[0].toUpperCase()
    : user?.email?.[0]?.toUpperCase() || "U";

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>

        <div className="flex items-center space-x-4">
          {showRequestButton && (
            <button
              onClick={() => navigate("/assets-request")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Request Asset
            </button>
          )}

          <button className="p-2 rounded-full hover:bg-gray-100">
            <BellIcon className="w-6 h-6 text-gray-600" />
          </button>

          {user && (
            <div className="flex items-center space-x-3 border-l pl-4">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {initials}
              </div>
              <span className="text-gray-700">{displayName}</span>
              <button
                onClick={handleLogout}
                className="ml-4 px-3 py-1 text-sm text-red-600 border rounded-md hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default PageHeader;
