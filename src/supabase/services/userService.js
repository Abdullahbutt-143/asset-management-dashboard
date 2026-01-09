import { supabase } from "../../supabaseClient";

/**
 * Fetch all profiles/users
 * @param {string} orderBy - Field to order by (default: "first_name")
 * @returns {Promise<Array>} Array of user profiles
 */
export const fetchAllUsers = async (orderBy = "first_name") => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, first_name, last_name, is_active")
    .order(orderBy, { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

/**
 * Fetch user profile by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User profile
 */
export const fetchUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, email, is_staff, is_active")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

/**
 * Fetch all profiles with optional filters
 * @param {Array<string>} ids - Optional array of user IDs to filter by
 * @returns {Promise<Array>} Array of user profiles
 */
export const fetchProfilesByIds = async (ids = []) => {
  let query = supabase
    .from("profiles")
    .select("id, first_name, last_name, email, is_staff, is_active");

  if (ids.length > 0) {
    query = query.in("id", ids);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

/**
 * Fetch users for assignment (with specific fields)
 * @returns {Promise<Array>} Array of active users
 */
export const fetchUsersForAssignment = async () => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, first_name, last_name, is_active")
    .order("first_name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};
