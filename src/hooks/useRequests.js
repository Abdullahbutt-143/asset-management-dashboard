import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export const useRequests = () => {
  const [activeRequests, setActiveRequests] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);

        const { count, error } = await supabase
          .from("asset_requests")
          .select("*", { count: "exact", head: true })
          .eq("status", "requested");

        if (error) throw error;

        setActiveRequests(count || 0);
      } catch (err) {
        console.error("useRequests error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  return {
    activeRequests,
    loading,
    error,
  };
};
