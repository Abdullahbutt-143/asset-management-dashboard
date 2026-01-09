import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { UserContext } from "../UserContext";
import PageHeader from "../components/PageHeader";
import Sidebar from "../components/Sidebar";
import { useSupabase } from "../supabase/hooks/useSupabase";

const MyRequests = () => {
  const navigate = useNavigate();
  const { profile, user } = useContext(UserContext);
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("my-requests");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  /* ---------------- FETCH REQUESTS SERVICE ---------------- */
  const fetchMyRequestsService = async () => {
    if (!user?.id) {
      throw new Error("User ID not available");
    }

    const { data, error } = await supabase
      .from("asset_requests")
      .select(
        `
        id,
        reason,
        quantity,
        status,
        admin_note,
        created_at,
        assets (
          id,
          name,
          tag,
          serial
        )
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  };

  const { isLoading: loading, error, onRequest: fetchMyRequests } = useSupabase({
    onRequestService: fetchMyRequestsService,
    onSuccess: (data) => setRequests(data),
    onError: (error) => {
      console.error("Error fetching requests:", error);
    }
  });

  useEffect(() => {
    if (user?.id) {
      fetchMyRequests();
    }
  }, [user]);

  const getStatusBadge = (status) => {
    const styles = {
      requested: "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/20",
      approved: "bg-green-50 text-green-700 ring-1 ring-green-600/20",
      denied: "bg-red-50 text-red-700 ring-1 ring-red-600/20",
    };
    return `${styles[status] || styles.requested} inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium`;
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading) {
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
          <PageHeader title="My Requests" subtitle="View your asset requests" />
          <div className="p-6 max-w-7xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 flex items-center justify-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-gray-600 font-medium">Loading requests...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
        <PageHeader title="My Requests" subtitle="View your asset requests and their status" />

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-linear-to-r from-gray-50 to-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Your Requests</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {requests.length} request{requests.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <button
                  onClick={fetchMyRequests}
                  className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  Refresh
                </button>
              </div>
            </div>

            {/* Table */}
            {requests.length === 0 ? (
              <div className="text-center py-12 px-6">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c1.125 0 2-.875 2-1.5V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No requests</h3>
                <p className="mt-1 text-sm text-gray-500">You haven't submitted any asset requests yet.</p>
                <button
                  onClick={() => navigate("/assets-request")}
                  className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                  Create Request
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Request Details
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Admin Note
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {requests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="max-w-xs">
                            <p className="text-sm font-medium text-gray-900 truncate" title={request.reason}>
                              {request.reason}
                            </p>
                            <p className="text-xs text-gray-500">
                              Asset: {request.assets ? `${request.assets.name}${request.assets.tag ? ` (${request.assets.tag})` : ""}` : "Not assigned"}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {request.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={getStatusBadge(request.status)}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            {request.admin_note ? (
                              <p className="text-sm text-gray-700">{request.admin_note}</p>
                            ) : (
                              <p className="text-sm text-gray-400 italic">No notes yet</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(request.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <div>
                  Showing <span className="font-medium">{requests.length}</span> requests
                </div>
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <span className="h-2 w-2 rounded-full bg-yellow-400 mr-1"></span>
                    Pending
                  </span>
                  <span className="flex items-center">
                    <span className="h-2 w-2 rounded-full bg-green-400 mr-1"></span>
                    Approved
                  </span>
                  <span className="flex items-center">
                    <span className="h-2 w-2 rounded-full bg-red-400 mr-1"></span>
                    Denied
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MyRequests;
