import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import PageHeader from "./components/PageHeader";
import Sidebar from "./components/Sidebar";
import { UserContext } from "./UserContext";
import { isAdmin } from "./utils/adminUtils";
import { useSupabase } from "./supabase/hooks/useSupabase";
import { fetchAllUsers, createUser, deleteUser } from "./supabase/services/userService";
import CreateUserModal from "./components/CreateUserModal";
import { toast } from "react-toastify";
import { Trash2 } from "lucide-react";

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("users");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateLoading, setIsCreateLoading] = useState(false);
  const { authLoading, profile } = useContext(UserContext);
  const navigate = useNavigate();

  /* ---------------- FETCH USERS SERVICE ---------------- */
  const fetchUsersService = async () => {
    return await fetchAllUsers();
  };

  const { data, isLoading: loading, error, onRequest: fetchUsers } = useSupabase({
    onRequestService: fetchUsersService,
    onSuccess: (data) => setUsers(data),
    onError: (error) => {
      console.error("Error fetching users:", error);
    }
  });

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

  /* ---------------- HANDLERS ---------------- */
  const handleCreateUser = async (userData) => {
    setIsCreateLoading(true);
    try {
      await createUser(userData);
      toast.success("User created successfully!");
      setIsModalOpen(false);
      fetchUsers(); // Refresh list
    } catch (error) {
      toast.error(error.message || "Error creating user");
    } finally {
      setIsCreateLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await deleteUser(userId);
      toast.success("User deleted successfully!");
      fetchUsers(); // Refresh list
    } catch (error) {
      toast.error(error.message || "Error deleting user");
    }
  };

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

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg w-64"
                />
                {isAdmin(profile) && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
                  >
                    Create User
                  </button>
                )}
              </div>
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
                          <div className="flex gap-2">
                            {isAdmin(profile) && (
                              <>
                                <button
                                  onClick={() =>
                                    navigate(`/assets?userId=${user.id}`)
                                  }
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                                >
                                  View Assets
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                  title="Delete User"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </>
                            )}
                          </div>
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

      <CreateUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleCreateUser}
        loading={isCreateLoading}
      />
    </div>
  );
};
export default AllUsers;