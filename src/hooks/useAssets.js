import { useState, useEffect } from 'react';
import { secureRequest } from '../config';

export const useAssets = () => {
  const [assets, setAssets] = useState([]);
  const [totalAssets, setTotalAssets] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const data = await secureRequest('/assets/');
      
      if (data.results && Array.isArray(data.results)) {
        setAssets(data.results);
        setTotalAssets(data.total_assets || data.results.length);
      } else {
        setAssets(data);
        setTotalAssets(data.length);
      }
    } catch (err) {
      setError('Failed to fetch assets');
      console.error('Error fetching assets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  return {
    assets,
    totalAssets,
    loading,
    error,
    refetch: fetchAssets
  };
};