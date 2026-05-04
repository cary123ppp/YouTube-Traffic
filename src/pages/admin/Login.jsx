import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); 
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const msgBuffer = new TextEncoder().encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const correctHash = import.meta.env.VITE_ADMIN_PASSWORD_HASH;

      if (hashHex === correctHash) {

        localStorage.setItem('isAuthenticated', 'true');
        navigate('/admin');
      } else {
        setError('密码错误，请重试');
      }
    } catch (err) {
      setError('加密验证失败，请检查浏览器兼容性');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Admin Login</h1>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-gray-900"
              placeholder="Enter admin password"
            />
          </div>
          
          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 py-2 rounded">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              isLoading ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;