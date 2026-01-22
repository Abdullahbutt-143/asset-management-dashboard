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
/**
 * Create a new user (Admin version)
 * @param {Object} userData - User details (email, password, first_name, last_name)
 * @returns {Promise<Object>} Created user profile
 */
export const createUser = async ({ email, password, first_name, last_name }) => {
  const { data, error } = await supabase.functions.invoke("admin-create-user", {
    body: {
      email,
      password,
      firstName: first_name,
      lastName: last_name,
    },
  });

  if (error) {
    throw new Error(error.message || "Failed to create user via admin function");
  }

  return data;
};


/**
 * Delete a user profile (and optionally auth account)
 * @param {string} userId - User ID to delete
 * @returns {Promise<void>}
 */
export const deleteUser = async (userId) => {
  const { error } = await supabase
    .from("profiles")
    .delete()
    .eq("id", userId);

  if (error) {
    throw new Error(error.message);
  }
};
