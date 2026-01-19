import React from 'react';
import { localize } from '../lib/i18n';

const Profile = ({ data }) => {
  const themeGradient = data.theme?.background || 'from-purple-500 via-rose-500 to-orange-500';
  const avatarLink = data.theme?.avatar_link;

  const AvatarContent = () => (
    <div className={`mb-6 relative p-1 rounded-full bg-gradient-to-tr ${themeGradient} ${avatarLink ? 'hover:scale-105 transition-transform cursor-pointer' : ''}`}>
      <div className="bg-background rounded-full p-1">
        <img 
          src={data.avatar_url || data.avatar} 
          alt={data.name}
          className="w-32 h-32 rounded-full object-cover"
        />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center text-center mb-10 pt-10">
      {avatarLink ? (
        <a href={avatarLink} target="_blank" rel="noopener noreferrer">
          <AvatarContent />
        </a>
      ) : (
        <AvatarContent />
      )}
      
      <h1 className="text-4xl font-bold text-white mb-2 tracking-tight drop-shadow-sm">
        {localize(data.name)}
      </h1>
      
      <p className="text-white/90 font-medium text-lg max-w-xs leading-relaxed">
        {localize(data.bio)}
      </p>
    </div>
  );
};

export default Profile;
