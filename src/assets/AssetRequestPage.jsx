import { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import PageHeader from "../components/PageHeader";
import Sidebar from "../components/Sidebar";
import { supabase } from "../supabaseClient";
import { UserContext } from "../UserContext";
import { useSupabase } from "../supabase/hooks/useSupabase";

const AssetRequestPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useContext(UserContext);
  const [formData, setFormData] = useState({
    reason: "",
    quantity: 1,
  });

  const [activeTab, setActiveTab] = useState("requests");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Sync activeTab with current route
  useEffect(() => {
    const pathToTabMap = {
      "/": "dashboard",
      "/assets": "assets",
      "/my-requests": "my-requests",
      "/users": "users",
      "/assets-request": "requests",
      "/get-assets": "requested-assets",
      "/add-asset": "add-asset",
    };
    const currentTab = pathToTabMap[location.pathname] || "requests";
    setActiveTab(currentTab);
  }, [location.pathname]);

  /* ---------------- SUBMIT REQUEST SERVICE ---------------- */
  const submitRequestService = async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    const { error } = await supabase.from("asset_requests").insert([
      {
        user_id: user.id,
        reason: formData.reason,
        quantity: formData.quantity,
        status: "requested",
        asset_id: null,
      },
    ]);

    if (error) throw error;
    return { success: true };
  };

  const { isLoading: loading, error, onRequest: submitRequest } = useSupabase({
    onRequestService: submitRequestService,
    onSuccess: () => {
      toast.success("Asset request submitted successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      setFormData({ reason: "", quantity: 1 });
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to submit request.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantity" ? parseInt(value) || 1 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitRequest();
  };

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
      <main className="flex-1 min-w-0">
        <PageHeader
          title="Request an Asset"
          subtitle="Submit a request for company assets you need"
        />

        <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white shadow rounded-lg">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Request *
                </label>
                <textarea
                  name="reason"
                  rows={4}
                  value={formData.reason}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  name="quantity"
                  min="1"
                  max="100"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              {/* Message */}
              {message.text && (
                <div
                  className={`p-4 rounded-md ${
                    message.type === "success"
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {message.text}
                </div>
              )}

              {/* Submit */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading || !formData.reason.trim()}
                  className="px-6 py-3 text-white bg-blue-600 rounded-md disabled:opacity-50"
                >
                  {loading ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              Request Process
            </h3>
            <ul className="list-disc list-inside text-blue-800 space-y-2">
              <li>Your request will be reviewed by the management team</li>
              <li>You will be notified once processed</li>
              <li>Typical response time: 1–2 business days</li>
            </ul>
          </div>
        </div>
      </div>
      </main>
    </div>
  );
};
export default AssetRequestPage;