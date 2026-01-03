/**
 * Check if user is admin (staff)
 * @param {Object} userProfile - User profile object from database
 * @returns {boolean} True if user is admin/staff, false otherwise
 */
export const isAdmin = (userProfile) => {
  return userProfile?.is_staff === true;
};
