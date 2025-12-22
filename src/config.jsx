const API_BASE_URL = 'http://localhost:8000/api'; 
export const secureRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken'); 
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Secure request failed:', error);
    throw error;
  }
};
export const unsecureRequest = async (endpoint, options = {}) => {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Unsecure request failed:', error);
    throw error;
  }
};

export const handleApiError = (error) => {
  if (error.message.includes('401')) {
    console.error('Unauthorized access');
    return 'Unauthorized access. Please login again.';
  }
  if (error.message.includes('404')) {
    return 'Resource not found.';
  }
  if (error.message.includes('500')) {
    return 'Server error. Please try again later.';
  }
  return error.message || 'An unexpected error occurred.';
};