import { useState, useEffect } from 'react';
import { secureRequest } from '../config';

export const useRequests = () => {
  const [activeRequests, setActiveRequests] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchActiveRequests = async () => {
    try {
      setLoading(true);
      const response = await secureRequest('/requests/');
      const requests = response.data || response || [];
      
      // Count active requests (status 'requested' or 'pending')
      const activeCount = requests.filter(request => 
        request.status?.toLowerCase() === 'requested' || 
        request.status?.toLowerCase() === 'pending'
      ).length;
      
      setActiveRequests(activeCount);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('Failed to load active requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveRequests();
  }, []);

  return {
    activeRequests,
    loading,
    error,
    refetch: fetchActiveRequests
  };
};
