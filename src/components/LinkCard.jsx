import React from 'react';
import * as Icons from 'lucide-react';
import { localize } from '../lib/i18n';

const LinkCard = ({ link }) => {
  const isUrl = link.icon && (link.icon.startsWith('http') || link.icon.startsWith('data:') || link.icon.startsWith('/'));
  const IconComponent = !isUrl ? (Icons[link.icon] || Icons.Link) : null;

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="
        group relative flex items-center p-4 mb-4 rounded-2xl transition-all duration-300
        bg-white/90 backdrop-blur-sm border border-white/50
        shadow-lg shadow-black/5
        hover:scale-[1.02] hover:bg-white hover:shadow-xl hover:shadow-black/10
        active:scale-[0.98]
      "
    >
      {/* Icon Container */}
      <div className="
        p-3 rounded-xl mr-4 transition-colors duration-300
        bg-black/5 text-black group-hover:bg-black group-hover:text-white
        flex items-center justify-center w-12 h-12
      ">
        {isUrl ? (
          <img src={link.icon} alt="" className="w-full h-full object-contain" />
        ) : (
          <IconComponent size={24} strokeWidth={2} />
        )}
      </div>
      
      {/* Text Content */}
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

      {/* Arrow Button */}
      <div className="
        p-2 rounded-full opacity-0 -translate-x-2 
        group-hover:opacity-100 group-hover:translate-x-0
        transition-all duration-300 ease-out
      ">
        <Icons.ArrowRight className="text-black" size={20} strokeWidth={2.5} />
      </div>
    </a>
  );
};

export default LinkCard;
