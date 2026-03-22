/**
 * @fileoverview SupabaseAuthRepository — Implements IAuthRepository for Supabase.
 */

import { IAuthRepository } from '../IAuthRepository';
import { supabase } from '../../lib/supabaseClient';


export class SupabaseAuthRepository extends IAuthRepository {
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw new Error(error.message);
    return this._mapUser(data.user);
  }

  async register(email, password, displayName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });
    if (error) throw new Error(error.message);
    return this._mapUser(data.user);
  }

  /**
   * Specific to Supabase: Authenticate with Google OAuth.
   * @returns {Promise<void>} Redirects the user to the provider.
   */
  async signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) throw new Error(error.message);
  }

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  }

  async getCurrentUser() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw new Error(error.message);
    if (!session || !session.user) return null;
    return this._mapUser(session.user);
  }

  async uploadAvatar(file, userId) {
    if (!file) throw new Error('No file provided');

    // Generate a secure unique path using timestamp to force cache busting
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`;

    // Upload to 'avatars' storage bucket
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Update the user metadata in auth.users
    const { error: updateError } = await supabase.auth.updateUser({
      data: { avatar_url: publicUrl },
    });

    if (updateError) throw new Error(`Metadata update failed: ${updateError.message}`);

    return publicUrl;
  }

  /**
   * Maps a Supabase user object to our domain User model.
   * @private
   */
  _mapUser(supabaseUser) {
    if (!supabaseUser) return null;
    
    // Supabase can store OAuth display names in full_name, name, or our custom display_name
    const meta = supabaseUser.user_metadata || {};
    const fallbackName = meta.full_name || meta.name || supabaseUser.email.split('@')[0];

    return {
      id: supabaseUser.id,
      email: supabaseUser.email,
      displayName: meta.display_name || fallbackName,
      username: `@${supabaseUser.email.split('@')[0]}`, // Fallback pseudo-username
      avatarUrl: meta.avatar_url || null, // Capture from metadata
    };
  }
}
