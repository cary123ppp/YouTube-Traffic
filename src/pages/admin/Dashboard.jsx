import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const Dashboard = () => {
  const navigate = useNavigate();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/admin/login', { replace: true });
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    setLoading(true);
    setError('');
    try {
      // 🎯 核心点：这里只查询并排序，坚决不加 .single()
      const { data, error: linksError } = await supabase
        .from('links')
        .select('*')
        .order('order_index', { ascending: true });

      if (linksError) throw linksError;
      setLinks(data || []);
    } catch (err) {
      setError('数据加载失败: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUrl = async (id, currentUrl) => {
    const newUrl = window.prompt('请输入新的引流链接 (如需走CRM随机分流请填 random:你的分组码)', currentUrl);
    
    if (newUrl === null || newUrl === currentUrl) return; 

    try {
      const { error } = await supabase.from('links').update({ url: newUrl }).eq('id', id);
      if (error) throw error;
      
      setLinks(links.map(l => l.id === id ? { ...l, url: newUrl } : l));
      alert('✅ 链接修改成功！你的前端立马就会生效！');
    } catch (err) {
      alert('❌ 修改失败: ' + err.message);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500 font-bold">正在拉取您的引流链接...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-6">
        
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-800">引流落地页管理后台</h1>
          <button onClick={handleLogout} className="text-red-500 font-bold hover:text-red-700 transition-colors">
            退出登录
          </button>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded mb-6 font-bold">{error}</div>}

        <div className="space-y-4">
          {links.map(link => (
            <div key={link.id} className="border border-gray-200 p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-gray-50 transition-colors">
              <div className="mb-4 md:mb-0">
                <div className="font-bold text-lg text-gray-900">
                  {link.title?.zh || link.title?.en || link.title || '引流按钮'}
                </div>
                <div className="text-sm text-gray-500 mt-1 font-mono break-all">
                  当前指向: <span className="text-blue-600">{link.url}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${link.active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                  {link.active ? '展示中' : '已隐藏'}
                </span>
                <button 
                  onClick={() => handleUpdateUrl(link.id, link.url)}
                  className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  修改引流链接
                </button>
              </div>
            </div>
          ))}
          {links.length === 0 && !error && (
            <div className="text-center text-gray-400 py-8">目前还没有任何跳转按钮</div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;