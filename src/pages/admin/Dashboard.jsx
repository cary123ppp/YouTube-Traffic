import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { localize } from '../../lib/i18n';
import * as Icons from 'lucide-react';
import MultiLangInput from '../../components/MultiLangInput';

const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. 核心：登出逻辑
  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.clear(); 
    navigate('/admin/login', { replace: true });
  };

  // 2. 初始化：获取数据
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 获取个人资料
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .single();
      
      if (profileError) throw profileError;
      setProfile(profileData);

      // 获取链接列表（按排序权重排序）
      const { data: linksData, error: linksError } = await supabase
        .from('links')
        .select('*')
        .order('order_index', { ascending: true });

      if (linksError) throw linksError;
      setLinks(linksData || []);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('获取数据失败，请刷新重试');
    } finally {
      setLoading(false);
    }
  };

  // 3. 更新主页资料
  const handleProfileUpdate = async (updatedFields) => {
    setSaveLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updatedFields)
        .eq('id', profile.id);

      if (error) throw error;
      setProfile({ ...profile, ...updatedFields });
      alert('资料更新成功');
    } catch (err) {
      alert('更新失败: ' + err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  // 4. 管理跳转链接（新增/修改/删除/切换状态）
  const handleToggleLinkActive = async (linkId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('links')
        .update({ active: !currentStatus })
        .eq('id', linkId);

      if (error) throw error;
      setLinks(links.map(l => l.id === linkId ? { ...l, active: !currentStatus } : l));
    } catch (err) {
      alert('操作失败');
    }
  };

  const handleDeleteLink = async (linkId) => {
    if (!window.confirm('确定要删除这个链接吗？')) return;
    try {
      const { error } = await supabase.from('links').delete().eq('id', linkId);
      if (error) throw error;
      setLinks(links.filter(l => l.id !== linkId));
    } catch (err) {
      alert('删除失败');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <Icons.Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
          <p className="text-gray-500 font-medium">正在加载管理后台...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 顶部导航栏 */}
      <nav className="bg-white border-b sticky top-0 z-10 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Icons.LayoutDashboard className="text-white" size={20} />
          </div>
          <h1 className="text-xl font-bold text-gray-900">引流管理面板</h1>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all font-semibold border border-red-100"
        >
          <Icons.LogOut size={18} />
          安全退出
        </button>
      </nav>

      <main className="max-w-4xl mx-auto mt-8 px-4 space-y-8">
        {/* 个人资料设置 */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Icons.UserCircle className="text-blue-500" size={24} />
            <h2 className="text-lg font-bold">主页基本信息</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">主页名称 (多语言)</label>
              <MultiLangInput 
                value={profile?.name || {}} 
                onChange={(val) => handleProfileUpdate({ name: val })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">主页描述 (多语言)</label>
              <MultiLangInput 
                value={profile?.bio || {}} 
                onChange={(val) => handleProfileUpdate({ bio: val })}
              />
            </div>
          </div>
        </section>

        {/* 链接管理列表 */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Icons.Link2 className="text-green-500" size={24} />
              <h2 className="text-lg font-bold">跳转按钮管理</h2>
            </div>
            <button 
              className="bg-black text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1 hover:bg-gray-800 transition-all"
              onClick={() => alert('此演示版暂不支持在此直接新增，请在 Supabase 修改')}
            >
              <Icons.Plus size={18} /> 新增按钮
            </button>
          </div>

          <div className="space-y-4">
            {links.map((link) => (
              <div key={link.id} className="group border rounded-2xl p-4 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
                      {link.icon && Icons[link.icon] ? React.createElement(Icons[link.icon], { size: 24 }) : <Icons.Link size={24} />}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{localize(link.title)}</h3>
                      <p className="text-xs text-gray-500 font-mono mt-1 bg-white px-2 py-0.5 rounded border inline-block">
                        {link.url}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* 状态切换开关 */}
                    <button 
                      onClick={() => handleToggleLinkActive(link.id, link.active)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                        link.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {link.active ? '展示中' : '已隐藏'}
                    </button>
                    
                    {/* 删除按钮 */}
                    <button 
                      onClick={() => handleDeleteLink(link.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Icons.Trash2 size={18} />
                    </button>
                  </div>
                </div>
                
                {/* 快速提示 */}
                {link.url.startsWith('random:') && (
                  <div className="mt-3 text-[10px] text-blue-600 font-medium flex items-center gap-1">
                    <Icons.Shuffle size={12} />
                    该按钮已启用 CRM 随机分流逻辑，对应分组: {link.url.split(':')[1]}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* 底部操作提示 */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-center">
        <p className="text-xs text-gray-400">
          修改后的内容会实时同步到 Supabase 数据库
        </p>
      </footer>
    </div>
  );
};

export default Dashboard;