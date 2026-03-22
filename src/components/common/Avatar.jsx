import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

/**
 * Avatar component that handles fetching from Supabase Storage.
 * If the path is an external URL (e.g. Google OAuth), it uses it directly.
 * Otherwise, it downloads the blob from the 'avatars' bucket.
 */
export function Avatar({ path, size = 30, fallback = '?', className = '' }) {
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!path) {
      setAvatarUrl(null);
      return;
    }

    // If it's already an HTTP URL, use it
    if (path.startsWith('http')) {
      setAvatarUrl(path);
      return;
    }

    // Otherwise, fetch from Supabase Storage
    let isMounted = true;
    async function downloadImage(imagePath) {
      try {
        setLoading(true);
        const { data, error } = await supabase.storage.from('avatars').download(imagePath);
        if (error) throw error;
        
        if (isMounted) {
          const url = URL.createObjectURL(data);
          setAvatarUrl(url);
        }
      } catch (error) {
        console.error('Error downloading avatar: ', error.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    downloadImage(path);

    return () => {
      isMounted = false;
    };
  }, [path]);

  return (
    <div 
      className={`avatar-wrapper ${className}`} 
      style={{ 
        width: size, 
        height: size, 
        minWidth: size,
        minHeight: size,
        borderRadius: '50%', 
        overflow: 'hidden', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'var(--color-primary)',
        color: '#fff',
        fontWeight: 'bold',
        position: 'relative'
      }}
    >
      {avatarUrl ? (
        <img 
          src={avatarUrl} 
          alt="Avatar" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
      ) : (
        <span>{fallback}</span>
      )}
      
      {/* Optional loading spinner overlay */}
      {loading && !avatarUrl && (
        <div style={{
          position: 'absolute', inset: 0, 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.2)'
        }}>
          <div style={{
            width: 14, height: 14, 
            border: '2px solid rgba(255,255,255,0.4)',
            borderTopColor: '#fff', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
        </div>
      )}
    </div>
  );
}
