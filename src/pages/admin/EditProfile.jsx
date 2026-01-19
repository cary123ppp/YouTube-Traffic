import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Save, Plus, Trash2, ChevronDown, ChevronUp, Globe, Camera, GripVertical } from 'lucide-react';
import MultiLangInput from '../../components/MultiLangInput';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'pl', label: 'Polski', flag: '🇵🇱' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
];

const THEMES = [
  { name: 'Sunset', value: 'from-purple-500 via-rose-500 to-orange-500', color: 'bg-gradient-to-br from-purple-500 via-rose-500 to-orange-500' },
  { name: 'Ocean', value: 'from-blue-400 via-blue-500 to-teal-400', color: 'bg-gradient-to-br from-blue-400 via-blue-500 to-teal-400' },
  { name: 'Forest', value: 'from-emerald-500 via-green-500 to-lime-400', color: 'bg-gradient-to-br from-emerald-500 via-green-500 to-lime-400' },
  { name: 'Midnight', value: 'from-slate-900 via-purple-900 to-slate-900', color: 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' },
  { name: 'Cherry', value: 'from-red-500 via-pink-500 to-rose-400', color: 'bg-gradient-to-br from-red-500 via-pink-500 to-rose-400' },
  { name: 'Gold', value: 'from-yellow-400 via-orange-400 to-amber-500', color: 'bg-gradient-to-br from-yellow-400 via-orange-400 to-amber-500' },
];

const EditProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [globalLang, setGlobalLang] = useState('en');
  const [expandedLink, setExpandedLink] = useState(null);
  
  const [profile, setProfile] = useState({
    name: '',
    slug: '',
    bio: '',
    avatar_url: ''
  });
  
  const [links, setLinks] = useState([]);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch Profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
        
      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch Links
      const { data: linksData, error: linksError } = await supabase
        .from('links')
        .select('*')
        .eq('profile_id', id)
        .order('sort_order', { ascending: true });
        
      if (linksError) throw linksError;
      setLinks(linksData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error loading profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleThemeChange = (themeValue) => {
    setProfile(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        background: themeValue
      }
    }));
  };

  const handleAvatarLinkChange = (e) => {
    const value = e.target.value;
    setProfile(prev => ({
      ...prev,
      theme: {
        ...(prev.theme || {}),
        avatar_link: value
      }
    }));
  };

  const handleCustomDomainChange = (e) => {
    const value = e.target.value;
    setProfile(prev => ({
      ...prev,
      theme: {
        ...(prev.theme || {}),
        custom_domain: value
      }
    }));
  };

  const handleLinkChange = (index, field, value) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setLinks(newLinks);
  };

  const addNewLink = () => {
    setLinks([
      ...links,
      {
        title: 'New Link',
        url: 'https://',
        icon: 'Link',
        featured: false,
        sort_order: links.length + 1,
        is_new: true // Mark as new for DB insertion logic if needed, or just insert all
      }
    ]);
  };

  const removeLink = async (index) => {
    const linkToRemove = links[index];
    
    // If it has an ID, delete from DB
    if (linkToRemove.id) {
      const confirm = window.confirm('Are you sure you want to delete this link?');
      if (!confirm) return;

      const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', linkToRemove.id);

      if (error) {
        alert('Error deleting link');
        return;
      }
    }
    
    // Remove from local state
    const newLinks = links.filter((_, i) => i !== index);
    setLinks(newLinks);
  };

  const toggleLinkExpand = (index) => {
    if (expandedLink === index) {
      setExpandedLink(null);
    } else {
      setExpandedLink(index);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('Youtube images') // Update bucket name to match user's bucket
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('Youtube images')
        .getPublicUrl(filePath);

      handleProfileChange({ target: { name: 'avatar_url', value: publicUrl } });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image: ' + (error.message || error.error_description || JSON.stringify(error)));
    }
  };

  const handleLinkIconUpload = async (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `icons/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('Youtube images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('Youtube images')
        .getPublicUrl(filePath);

      handleLinkChange(index, 'icon', publicUrl);
    } catch (error) {
      console.error('Error uploading icon:', error);
      alert('Error uploading icon: ' + (error.message || JSON.stringify(error)));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Validate slug format: only alphanumeric and hyphens
      const slugRegex = /^[a-z0-9-]+$/;
      if (!slugRegex.test(profile.slug)) {
        alert('Invalid Slug! Use only lowercase letters, numbers, and hyphens (e.g., "my-page"). No spaces or slashes.');
        setSaving(false);
        return;
      }
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: profile.name,
          slug: profile.slug,
          bio: profile.bio,
          avatar_url: profile.avatar_url,
          theme: profile.theme // Enable theme saving
        })
        .eq('id', id);

      if (profileError) throw profileError;

      // 2. Upsert Links (Insert new, Update existing)
      // We need to prepare data: remove 'is_new' flag, ensure profile_id is set
      const linksToUpsert = links.map((link, index) => ({
        id: link.id, // If undefined, Supabase will generate UUID? No, for upsert without ID it might be tricky.
                     // Better strategy: Separate Insert and Update, or use Upsert but remove ID if it's new/undefined? 
                     // Supabase upsert needs primary key match to update.
        profile_id: id,
        title: link.title,
        subtitle: link.subtitle,
        url: link.url,
        icon: link.icon,
        featured: link.featured,
        sort_order: index // Update sort order based on current array position
      }));

      // Clean up: Remove undefined IDs so Supabase creates new records
      const cleanedLinks = linksToUpsert.map(link => {
        if (!link.id) delete link.id;
        return link;
      });

      const { error: linksError } = await supabase
        .from('links')
        .upsert(cleanedLinks);

      if (linksError) throw linksError;

      alert('Saved successfully!');
      fetchData(); // Refresh data

    } catch (error) {
      console.error('Error saving:', error);
      alert('Error saving changes: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/admin')} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
                <ArrowLeft size={20} />
              </button>
              
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold text-gray-900 hidden sm:block">Edit Profile</h1>
                
                {/* Global Language Dropdown */}
                <div className="relative flex items-center">
                  <Globe size={16} className="absolute left-3 text-gray-500 pointer-events-none" />
                  <select
                    value={globalLang}
                    onChange={(e) => setGlobalLang(e.target.value)}
                    className="appearance-none bg-gray-100 hover:bg-gray-200 border-0 text-gray-700 py-2 pl-9 pr-8 rounded-full text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all cursor-pointer"
                  >
                    {LANGUAGES.map(lang => (
                      <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>

            <button 
              onClick={handleSave}
              disabled={saving}
              className="flex items-center bg-black text-white px-5 py-2 rounded-full hover:bg-gray-800 disabled:opacity-50 text-sm font-medium transition-all shadow-sm hover:shadow-md active:scale-95"
            >
              <Save size={18} className="mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Profile Settings */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-6 flex items-center text-lg">
              Profile
            </h2>
            
            <div className="space-y-6">
              {/* Avatar Uploader */}
              <div className="flex justify-center mb-6">
                <div className="relative group cursor-pointer w-32 h-32">
                  <div className="w-full h-full rounded-full overflow-hidden ring-4 ring-gray-50 group-hover:ring-blue-50 transition-all shadow-sm">
                    <img 
                      src={profile.avatar_url || 'https://via.placeholder.com/150'} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                      <Camera className="text-white mb-1" size={24} />
                      <span className="text-white text-xs font-medium">Change</span>
                    </div>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    title="Change Avatar"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Display Name</label>
                <MultiLangInput 
                  value={profile.name || ''}
                  onChange={(val) => handleProfileChange({ target: { name: 'name', value: val } })}
                  placeholder="Enter name"
                  currentLang={globalLang}
                  className="bg-gray-50/50 border-gray-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Avatar Click-through URL (e.g. YouTube Channel)</label>
                <input 
                  type="text" 
                  value={profile.theme?.avatar_link || ''}
                  onChange={handleAvatarLinkChange}
                  className="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  placeholder="https://youtube.com/@..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Custom Domain (Optional)</label>
                <input 
                  type="text" 
                  value={profile.theme?.custom_domain || ''}
                  onChange={handleCustomDomainChange}
                  className="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  placeholder="e.g. firestickguidepro.com"
                />
                <p className="text-xs text-gray-400 mt-1 ml-1">
                  Connect your own domain. Don't include "http://" or "https://".
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Slug (Page URL)</label>
                <div className="flex items-center text-gray-500 bg-gray-50/50 border border-gray-200 rounded-lg px-3 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                  <span className="text-sm mr-1 font-medium text-gray-400">/</span>
                  <input 
                    type="text" 
                    name="slug"
                    value={profile.slug || ''}
                    onChange={handleProfileChange}
                    className="w-full py-2 bg-transparent outline-none text-black text-sm font-medium"
                    placeholder="username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Bio</label>
                <MultiLangInput 
                  value={profile.bio || ''}
                  onChange={(val) => handleProfileChange({ target: { name: 'bio', value: val } })}
                  rows={4}
                  placeholder="Enter bio"
                  currentLang={globalLang}
                  className="bg-gray-50/50 border-gray-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-3 ml-1">Theme Color</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {THEMES.map((t) => (
                    <button
                      key={t.name}
                      onClick={() => handleThemeChange(t.value)}
                      className={`
                        group relative w-full aspect-square rounded-xl overflow-hidden shadow-sm transition-all
                        ${profile.theme?.background === t.value ? 'ring-2 ring-blue-600 ring-offset-2 scale-95' : 'hover:scale-105'}
                      `}
                      title={t.name}
                    >
                      <div className={`w-full h-full ${t.color}`} />
                      {profile.theme?.background === t.value && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <div className="w-2 h-2 bg-white rounded-full shadow-lg" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Links Manager */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                Links 
                <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{links.length}</span>
              </h2>
              <button 
                onClick={addNewLink}
                className="flex items-center text-sm bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 font-medium transition-all shadow hover:shadow-lg active:scale-95"
              >
                <Plus size={16} className="mr-1.5" /> Add Link
              </button>
            </div>

            <div className="space-y-3">
              {links.map((link, index) => {
                // Parse title safely to show in collapsed header
                let titlePreview = 'Untitled Link';
                try {
                  const parsed = JSON.parse(link.title || '{}');
                  titlePreview = parsed[globalLang] || parsed['en'] || Object.values(parsed)[0] || 'Untitled Link';
                } catch (e) { titlePreview = link.title || 'Untitled Link'; }

                const isExpanded = expandedLink === index;

                return (
                  <div 
                    key={link.id || index} 
                    className={`
                      border rounded-xl transition-all duration-200 overflow-hidden
                      ${isExpanded ? 'bg-white shadow-lg ring-1 ring-black/5 border-transparent' : 'bg-white hover:border-gray-300 border-gray-200'}
                    `}
                  >
                    {/* Card Header (Always Visible) */}
                    <div 
                      className="flex items-center p-3 cursor-pointer hover:bg-gray-50 select-none"
                      onClick={() => toggleLinkExpand(index)}
                    >
                      <div className="text-gray-300 mr-3 cursor-grab active:cursor-grabbing p-1 hover:text-gray-500">
                        <GripVertical size={20} />
                      </div>
                      
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mr-4 text-gray-500 overflow-hidden border border-gray-100">
                        {link.icon && link.icon.includes('/') ? (
                          <img src={link.icon} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold">ICON</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 truncate text-sm">
                          {titlePreview}
                        </h3>
                        <p className="text-xs text-gray-500 truncate mt-0.5 font-mono">
                          {link.url}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 ml-4">
                        <button 
                          onClick={(e) => { e.stopPropagation(); removeLink(index); }}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Link"
                        >
                          <Trash2 size={18} />
                        </button>
                        <div className={`p-2 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                          <ChevronDown size={20} />
                        </div>
                      </div>
                    </div>
                    
                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="p-5 border-t border-gray-100 bg-gray-50/30 space-y-5 animate-in slide-in-from-top-2 duration-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Title</label>
                            <MultiLangInput 
                              value={link.title || ''}
                              onChange={(val) => handleLinkChange(index, 'title', val)}
                              placeholder="Link Title"
                              currentLang={globalLang}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">URL</label>
                            <input 
                              type="text" 
                              value={link.url || ''}
                              onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-black bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                              placeholder="https://example.com"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Subtitle</label>
                          <MultiLangInput 
                            value={link.subtitle || ''}
                            onChange={(val) => handleLinkChange(index, 'subtitle', val)}
                            placeholder="Optional subtitle description"
                            currentLang={globalLang}
                          />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-5 items-start">
                          <div className="flex-1 w-full">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Icon</label>
                            <div className="flex gap-2">
                              <div className="flex-1">
                                <input 
                                  type="text"
                                  value={link.icon || ''}
                                  onChange={(e) => handleLinkChange(index, 'icon', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-black bg-white focus:ring-2 focus:ring-blue-500/20 outline-none"
                                  placeholder="Icon name (e.g. Github) or Image URL"
                                />
                              </div>
                              <div className="relative">
                                <input 
                                  type="file" 
                                  accept="image/*"
                                  onChange={(e) => handleLinkIconUpload(index, e)}
                                  className="hidden"
                                  id={`icon-upload-${index}`}
                                />
                                <label 
                                  htmlFor={`icon-upload-${index}`}
                                  className="flex items-center justify-center px-4 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 cursor-pointer text-sm font-medium text-gray-700 shadow-sm transition-colors whitespace-nowrap"
                                >
                                  Upload Image
                                </label>
                              </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-1.5 ml-1">Paste a URL or upload a custom image</p>
                          </div>
                          
                          <div className="pt-6">
                             <label className="flex items-center cursor-pointer select-none bg-white px-4 py-2 border border-gray-200 rounded-lg shadow-sm hover:border-blue-300 transition-colors">
                              <input 
                                type="checkbox" 
                                checked={link.featured || false}
                                onChange={(e) => handleLinkChange(index, 'featured', e.target.checked)}
                                className="mr-2.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                              />
                              <span className="text-sm font-medium text-gray-700">Highlight (Featured)</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {links.length === 0 && (
                <div 
                  onClick={addNewLink}
                  className="text-center py-16 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer transition-all group"
                >
                  <Plus size={48} className="mx-auto mb-4 text-gray-300 group-hover:text-blue-400 transition-colors" />
                  <p className="font-bold text-gray-600 text-lg">No links yet</p>
                  <p className="text-sm text-gray-400 mt-1">Click to add your first link</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};


export default EditProfile;
