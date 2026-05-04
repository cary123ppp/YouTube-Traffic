import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // 修复：必须定义状态
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password) return;
    
    setIsLoading(true);
    setError('');

    try {
      // 1. 生成输入密码的 SHA-256 Hash
      const msgBuffer = new TextEncoder().encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // 2. 获取环境变量中的 Hash
      const correctHash = import.meta.env.VITE_ADMIN_PASSWORD_HASH;

      if (hashHex === correctHash) {
        localStorage.setItem('isAuthenticated', 'true');
        // 使用 replace 防止用户点“返回”又回到登录页
        navigate('/admin', { replace: true });
      } else {
        setError('密码不正确');
      }
    } catch (err) {
      setError('加密校验失败，请更换浏览器');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
        <h1 className="text-2xl font-bold text-center mb-8 text-gray-900">管理后台登录</h1>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">管理员密码</label>
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              // 修复：显式设置 text-black 和 bg-white，确保文字可见
              className="w-full px-4 py-3 bg-white text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="请输入密码..."
            />
          </div>
          
          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 py-2 rounded-lg border border-red-100">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-xl font-bold text-white transition-all ${
              isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
            }`}
          >
            {isLoading ? '正在验证...' : '立即登录'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;