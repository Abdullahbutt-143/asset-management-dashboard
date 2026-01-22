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
  try {
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    console.log("=== CREATE USER DEBUG ===");
    console.log("Session exists:", !!session);
    console.log("Session error:", sessionError);
    console.log("Access token exists:", !!session?.access_token);
    
    if (sessionError || !session?.access_token) {
      throw new Error("You must be logged in to create users. Please refresh the page and try again.");
    }

    console.log("Access token preview:", session.access_token.substring(0, 50) + "...");

    // Get supabase URL for the function call
    const supabaseUrl = supabase.supabaseUrl || import.meta.env.VITE_SUPABASE_URL;
    const functionUrl = `${supabaseUrl}/functions/v1/admin-create-user`;

    console.log("Function URL:", functionUrl);
    console.log("Request body:", {
      email,
      firstName: first_name,
      lastName: last_name,
      hasPassword: !!password
    });

    // Make direct fetch call with proper headers
    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        email,
        password,
        firstName: first_name,
        lastName: last_name,
      }),
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log("Response text:", responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse response:", e);
      throw new Error(`Invalid response from server: ${responseText}`);
    }

    if (!response.ok) {
      console.error("Error response:", data);
      throw new Error(data.error || data.message || "Failed to create user");
    }

    console.log("Success:", data);
    return data;

  } catch (err) {
    console.error("=== CREATE USER ERROR ===");
    console.error("Error:", err);
    throw err;
  }
};


/**
 * Delete a user profile (and optionally auth account)
 * @param {string} userId - User ID to delete
 * @returns {Promise<void>}
 */
export const deleteUser = async (userId) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error("Not logged in");

    const functionUrl = `${supabase.supabaseUrl}/functions/v1/admin-delete-user`;

    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ userId }),
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.error || "Failed to delete user");

    console.log("User deleted:", data);
    return data;

  } catch (err) {
    console.error("=== DELETE USER ERROR ===", err);
    throw err;
  }
};
