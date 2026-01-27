import { useEffect, useState, useContext } from "react";
import { supabase } from "../supabaseClient";
import { UserContext } from "../UserContext";

export const useAssets = () => {
  const { authLoading } = useContext(UserContext);

  const [assets, setAssets] = useState([]);
  const [totalAssets, setTotalAssets] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchAssets = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("assets")
        .select(`
          id,
          name,
          tag,
          is_active,
          created_at,
          assigned_to:profiles (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setAssets(data || []);
      setTotalAssets(data?.length || 0);
    } catch (err) {
      console.error("useAssets error:", err);
      setAssets([]);
      setTotalAssets(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchAssets();
    }
  }, [authLoading]);

  return {
    assets,
    totalAssets,
    loading,
    refetchAssets: fetchAssets,
  };
};
