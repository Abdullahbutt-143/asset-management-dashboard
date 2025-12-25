import { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader";
import { supabase } from "../supabaseClient";

const GetAssets = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin] = useState(true);

  const fetchRequests = async () => {
    try {
      setLoading(true);

      // 1️⃣ Fetch asset requests
      const { data: requestsData, error: reqError } = await supabase
        .from("asset_requests")
        .select(`
          id,
          reason,
          quantity,
          status,
          created_at,
          user_id,
          assets (
            id,
            name,
            tag,
            serial
          )
        `)
        .order("created_at", { ascending: false });

      if (reqError) throw reqError;

      // 2️⃣ Extract user IDs
      const userIds = [...new Set(requestsData.map(r => r.user_id))];

      // 3️⃣ Fetch profiles
      const { data: profilesData, error: profError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email")
        .in("id", userIds);

      if (profError) throw profError;

      // 4️⃣ Map profiles
      const profileMap = {};
      profilesData.forEach(p => {
        profileMap[p.id] = p;
      });

      // 5️⃣ Merge data
      const formatted = requestsData.map(req => {
        const profile = profileMap[req.user_id];

        return {
          ...req,
          user_full_name: profile
            ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
            : "Unknown User",
          asset: req.assets
            ? `${req.assets.name}${req.assets.tag ? ` (${req.assets.tag})` : ""}`
            : "No asset assigned",
        };
      });

      setRequests(formatted);
    } catch (err) {
      console.error(err);
      setError("Failed to load asset requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      const { error } = await supabase
        .from("asset_requests")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
      fetchRequests();
    } catch {
      alert("Failed to update request.");
    }
  };

  const getStatusBadge = status => ({
    requested: "bg-yellow-100 text-yellow-800 border-yellow-200",
    approved: "bg-green-100 text-green-800 border-green-200",
    denied: "bg-red-100 text-red-800 border-red-200",
  }[status]);

  const formatDate = date =>
    new Date(date).toLocaleString("en-US");

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Asset Requests" subtitle="Manage asset requests" />

      <div className="p-6 bg-white shadow rounded-lg">
        <table className="w-full">
          <thead>
            <tr>
              <th>Reason</th>
              <th>User</th>
              <th>Asset</th>
              <th>Qty</th>
              <th>Status</th>
              <th>Date</th>
              {isAdmin && <th>Actions</th>}
            </tr>
          </thead>

          <tbody>
            {requests.map(r => (
              <tr key={r.id}>
                <td>{r.reason}</td>
                <td>{r.user_full_name}</td>
                <td>{r.asset}</td>
                <td>{r.quantity}</td>
                <td>
                  <span className={getStatusBadge(r.status)}>
                    {r.status}
                  </span>
                </td>
                <td>{formatDate(r.created_at)}</td>

                {isAdmin && r.status === "requested" && (
                  <td>
                    <button onClick={() => handleStatusUpdate(r.id, "approved")}>
                      Approve
                    </button>
                    <button onClick={() => handleStatusUpdate(r.id, "denied")}>
                      Deny
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GetAssets;
