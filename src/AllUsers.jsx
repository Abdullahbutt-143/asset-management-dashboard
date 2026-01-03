import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import PageHeader from "./components/PageHeader";
import Sidebar from "./components/Sidebar";
import { UserContext } from "./UserContext";
import { isAdmin } from "./utils/adminUtils";

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("users");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const { authLoading, profile } = useContext(UserContext);
  const navigate = useNavigate();

  /* ---------------- FETCH USERS ---------------- */
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, first_name, last_name, is_active");

    if (error) {
      setError(error.message);
    } else {
      setUsers(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading) {
      fetchUsers();
    }
  }, [authLoading]);

  /* ---------------- FILTER USERS ---------------- */
  const filteredUsers = users.filter(
    (user) =>
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* ---------------- UI STATES ---------------- */
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <div className="text-red-600">⚠️</div>
          <div className="ml-3">
            <h3 className="text-red-800 font-medium">Error</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
          <button
            onClick={fetchUsers}
            className="ml-auto bg-red-100 text-red-800 px-3 py-1 rounded text-sm font-medium hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  /* ---------------- MAIN UI ---------------- */
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        navigate={navigate}
        userProfile={profile}
      />
      <main className="flex-1">
        <PageHeader title="All Users" subtitle="View all employees in the system" />
        <div className="p-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Users</h2>

              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-4 sm:mt-0 pl-4 pr-4 py-2 border border-gray-300 rounded-lg w-64"
              />
            </div>

            <div className="mb-4 text-sm text-gray-600">
              Total users: <strong>{users.length}</strong>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    {isAdmin(profile) && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Action
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={isAdmin(profile) ? "4" : "3"}
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-900">
                          {user.email}
                        </td>

                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          {isAdmin(profile) && (
                            <button
                              onClick={() =>
                                navigate(`/assets?userId=${user.id}`)
                              }
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                            >
                              View Assets
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
export default AllUsers;