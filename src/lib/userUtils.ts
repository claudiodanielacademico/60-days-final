import { supabase } from "@/integrations/supabase/client";

/**
 * Validates username format (alphanumeric and underscore only, 3-30 chars)
 */
export const validateUsername = (username: string): boolean => {
  const usernameRegex = /^[a-z0-9_]{3,30}$/;
  return usernameRegex.test(username);
};

/**
 * Check if username is available (not taken)
 */
export const checkUsernameAvailability = async (
  username: string,
  currentUserId?: string
): Promise<boolean> => {
  const { data, error } = await (supabase.from as any)("profiles")
    .select("user_id")
    .eq("username", username.toLowerCase())
    .maybeSingle();

  if (error) return false;

  // If no user found, username is available
  if (!data) return true;

  // If found user is the current user, it's available for them
  if (currentUserId && data.user_id === currentUserId) return true;

  return false;
};

/**
 * Format user code for display (add space in middle)
 * Example: A1B2C3D4E5 -> A1B2C 3D4E5
 */
export const formatUserCode = (code: string): string => {
  if (code.length !== 10) return code;
  return `${code.slice(0, 5)} ${code.slice(5)}`;
};

/**
 * Copy text to clipboard with optional toast notification
 */
export const copyToClipboard = async (
  text: string,
  successMessage?: string
): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Failed to copy to clipboard:", err);
    return false;
  }
};

/**
 * Get user profile by username
 */
export const getUserByUsername = async (username: string) => {
  const { data, error } = await (supabase.from as any)("profiles")
    .select("*")
    .eq("username", username.toLowerCase())
    .maybeSingle();

  return { data, error };
};

/**
 * Get user profile by user code
 */
export const getUserByCode = async (userCode: string) => {
  const { data, error } = await (supabase.from as any)("profiles")
    .select("*")
    .eq("user_code", userCode.toUpperCase())
    .maybeSingle();

  return { data, error };
};

/**
 * Search users by username or user code
 */
export const searchUsers = async (query: string, limit: number = 20) => {
  const cleanQuery = query.trim().toLowerCase().replace("@", "");

  const { data, error } = await (supabase.from as any)("profiles")
    .select("user_id, username, user_code, display_name, avatar_url, bio")
    .or(`username.ilike.%${cleanQuery}%,user_code.ilike.%${cleanQuery.toUpperCase()}%,display_name.ilike.%${cleanQuery}%`)
    .limit(limit);

  return { data, error };
};
