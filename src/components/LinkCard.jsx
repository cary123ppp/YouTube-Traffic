import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { localize } from '../lib/i18n';

const LinkCard = ({ link }) => {
  const [isLoading, setIsLoading] = useState(false);

  // 判断是否为自定义上传的图标
  const isUrl = link.icon && (link.icon.startsWith('http') || link.icon.startsWith('data:') || link.icon.startsWith('/'));
  const IconComponent = !isUrl ? (Icons[link.icon] || Icons.Link) : null;

  // 处理点击事件
  const handleLinkClick = async (e) => {
    // 检查链接是否以 'random:' 开头 (例如: random:WX_001)
    if (link.url && link.url.startsWith('random:')) {
      e.preventDefault(); // 阻止默认的新窗口跳转
      
      if (isLoading) return; // 防止连点
      setIsLoading(true);
      
      // 提取出 groupCode，例如 "WX_001"
      const groupCode = link.url.replace('random:', '');
      
      try {
        // 请求我们刚才写的 CRM 接口
        const apiUrl = import.meta.env.VITE_CRM_API_URL || '';
        const response = await fetch(`${apiUrl}/api/random-link/get-url?groupCode=${groupCode}`);
        const result = await response.json();
        
        if (result.success && result.data && result.data.targetUrl) {
          // 拿到真实的后端链接后，打开新窗口跳转
          window.open(result.data.targetUrl, '_blank', 'noopener,noreferrer');
        } else {
          console.error("获取引流链接失败:", result.errMessage);
          alert("链接暂时不可用，请稍后再试");
        }
      } catch (error) {
        console.error("请求 CRM 接口异常:", error);
      } finally {
        setIsLoading(false);
      }
    }
    // 如果不是 random: 开头，则走 a 标签默认的 target="_blank" 行为，不需要干预
  };

  return (
    <a
      href={link.url.startsWith('random:') ? '#' : link.url}
      onClick={handleLinkClick}
      target={link.url.startsWith('random:') ? undefined : "_blank"}
      rel="noopener noreferrer"
      className={`
        group relative flex items-center p-4 mb-4 rounded-2xl transition-all duration-300
        bg-white/90 backdrop-blur-sm border border-white/50
        shadow-lg shadow-black/5
        hover:scale-[1.02] hover:bg-white hover:shadow-xl hover:shadow-black/10
        active:scale-[0.98]
        ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
      `}
    >
      {/* Icon Container (保持不变) */}
      <div className="p-3 rounded-xl mr-4 transition-colors duration-300 bg-black/5 text-black group-hover:bg-black group-hover:text-white flex items-center justify-center w-12 h-12">
        {isUrl ? (
          <img src={link.icon} alt="" className="w-full h-full object-contain" />
        ) : (
          <IconComponent size={24} strokeWidth={2} />
        )}
      </div>
      
      {/* Text Content (保持不变) */}
      <div className="flex-1">
        <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-black transition-colors">
          {localize(link.title)}
        </h3>
        {link.subtitle && (
          <p className="text-gray-500 text-sm mt-0.5 font-medium group-hover:text-gray-700 transition-colors">
            {localize(link.subtitle)}
          </p>
        )}
      </div>

      {/* Arrow Button (新增 Loading 动画) */}
      <div className="p-2 rounded-full opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out">
        {isLoading ? (
          <Icons.Loader2 className="text-black animate-spin" size={20} strokeWidth={2.5} />
        ) : (
          <Icons.ArrowRight className="text-black" size={20} strokeWidth={2.5} />
        )}
      </div>
    </a>
  );
};

export default LinkCard;