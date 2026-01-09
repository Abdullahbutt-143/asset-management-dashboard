/**
 * Validate asset form data
 * @param {Object} formData - Form data to validate
 * @returns {Object} Object with validation result and error messages
 */
export const validateAssetForm = (formData) => {
  const errors = {};

  if (!formData.name || !formData.name.trim()) {
    errors.name = "Asset name is required";
  }

  if (!formData.tag || !formData.tag.trim()) {
    errors.tag = "Asset tag is required";
  }

  if (!formData.serial || !formData.serial.trim()) {
    errors.serial = "Serial number is required";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate asset request form data
 * @param {Object} formData - Form data to validate
 * @returns {Object} Object with validation result and error messages
 */
export const validateAssetRequestForm = (formData) => {
  const errors = {};

  if (!formData.reason || !formData.reason.trim()) {
    errors.reason = "Reason for request is required";
  }

  if (!formData.quantity || formData.quantity < 1) {
    errors.quantity = "Quantity must be at least 1";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
