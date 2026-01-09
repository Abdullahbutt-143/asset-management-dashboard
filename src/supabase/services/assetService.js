import { supabase } from "../../supabaseClient";

/**
 * Fetch all assets with optional filters
 * @param {string|null} userId - Optional user ID to filter by assigned_to
 * @param {boolean} isAdmin - Whether the user is an admin
 * @param {string|null} adminId - The admin's user ID
 * @returns {Promise<Array>} Array of assets
 */
export const fetchAssets = async (userId = null, isAdmin = false, adminId = null) => {
  let query = supabase
    .from("assets")
    .select(`
      id,
      name,
      tag,
      serial,
      description,
      is_active,
      created_at,
      assigned_to,
      assigned_user:profiles (
        id,
        first_name,
        last_name,
        email
      )
    `)
    .order("created_at", { ascending: false });

  if (userId) {
    query = query.eq("assigned_to", userId);
  } else if (!isAdmin && adminId) {
    query = query.eq("assigned_to", adminId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

/**
 * Assign an asset to a user
 * @param {string} assetId - The asset ID
 * @param {string} userId - The user ID to assign to
 * @returns {Promise<void>}
 */
export const assignAssetToUser = async (assetId, userId) => {
  const { error } = await supabase
    .from("assets")
    .update({ assigned_to: userId })
    .eq("id", assetId);

  if (error) {
    throw new Error(error.message);
  }
};

/**
 * Remove asset assignment (unassign from user)
 * @param {string} assetId - The asset ID
 * @returns {Promise<void>}
 */
export const removeAssetAssignment = async (assetId) => {
  const { error } = await supabase
    .from("assets")
    .update({ assigned_to: null })
    .eq("id", assetId);

  if (error) {
    throw new Error(error.message);
  }
};

/**
 * Delete an asset
 * @param {string} assetId - The asset ID
 * @returns {Promise<void>}
 */
export const deleteAsset = async (assetId) => {
  const { error } = await supabase
    .from("assets")
    .delete()
    .eq("id", assetId);

  if (error) {
    throw new Error(error.message);
  }
};

/**
 * Add a new asset
 * @param {Object} assetData - Asset data object
 * @returns {Promise<Object>} Created asset
 */
export const addAsset = async (assetData) => {
  const { data, error } = await supabase
    .from("assets")
    .insert([assetData])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
