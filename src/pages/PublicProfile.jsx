import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Profile from '../components/Profile';
import LinkCard from '../components/LinkCard';
// Fallback data for dev/demo if DB is empty
import localData from '../data.json';

const PublicProfile = ({ domainSlug }) => {
  const { slug } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      // Priority: 1. Prop passed domain (from App.jsx) 2. URL param slug 3. Fallback
      const targetSlug = domainSlug || slug || 'firestick-guide';
      
      try {
        let query = supabase.from('profiles').select('*');
        
        // Check if we are searching by Custom Domain (passed via prop) or Slug
        if (domainSlug) {
           // Search inside the JSONB 'theme' column for the custom_domain key
           // Syntax for Supabase/PostgREST JSON query: col->>key
           query = query.eq('theme->>custom_domain', domainSlug);
        } else {
           query = query.eq('slug', targetSlug);
        }

        const { data: profile, error: profileError } = await query.single();

        if (profileError) {
          console.warn('Supabase fetch error (Profile), falling back to local:', profileError.message);
          // Fallback logic
          const local = localData[targetSlug];
          if (local) {
            setProfileData(local);
          } else {
            setError('Profile not found');
          }
          setLoading(false);
          return;
        }

        // 2. Fetch Links
        const { data: links, error: linksError } = await supabase
          .from('links')
          .select('*')
          .eq('profile_id', profile.id)
          .order('sort_order', { ascending: true });

        if (linksError) {
           console.error('Error fetching links:', linksError);
        }

        setProfileData({
          profile: profile,
          links: links || []
        });

      } catch (err) {
        console.error('Unexpected error:', err);
        // Fallback
        const local = localData[targetSlug];
        if (local) {
           setProfileData(local);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [slug]);

  useEffect(() => {
    if (profileData?.profile?.name) {
      document.title = profileData.profile.name;
    }
  }, [profileData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error || !profileData) {
    return <div className="text-white text-center mt-20">Profile not found</div>;
  }

  return (
    <div className={`min-h-screen px-4 py-8 flex flex-col items-center bg-gradient-to-br ${profileData.profile.theme?.background || 'from-purple-500 via-rose-500 to-orange-500'}`}>
      <div className="w-full max-w-md">
        {/* Profile Section */}
        <Profile data={profileData.profile} />
        
        {/* Links Section */}
        <div className="space-y-4 mt-4">
          {profileData.links.map((link) => (
            <LinkCard key={link.id} link={link} />
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-white/60 text-sm font-medium">
          <p>© {new Date().getFullYear()} {profileData.profile.name}. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default PublicProfile;
