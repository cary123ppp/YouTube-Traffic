import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800">
            Logout
          </button>
        </header>

        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile) => (
              <div key={profile.id} className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                <div className="flex items-center mb-4">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.name} className="w-12 h-12 rounded-full object-cover mr-4" />
                  ) : (
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-4">
                      {profile.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-lg truncate">{profile.name}</h3>
                    <p className="text-gray-500 text-xs mt-1">
                      <span className="font-semibold bg-gray-100 px-1.5 py-0.5 rounded border">Slug: {profile.slug}</span>
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2 mt-4">
                  <Link to={`/admin/edit/${profile.id}`} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 font-medium text-center">
                    Edit
                  </Link>
                  <Link to={`/${profile.slug}`} target="_blank" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium text-center">
                    Preview
                  </Link>
                </div>
              </div>
            ))}

            {/* New Profile Button */}
            <button className="flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-6 hover:bg-white hover:border-blue-500 transition-colors group h-full min-h-[160px]">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                <span className="text-2xl text-gray-400 group-hover:text-blue-500">+</span>
              </div>
              <span className="text-gray-500 font-medium group-hover:text-blue-500">Add New Influencer</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
