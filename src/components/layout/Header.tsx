import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center mb-10 text-white">
      <div className="w-20 h-20 bg-white rounded-full mx-auto mb-5 flex items-center justify-center text-3xl text-harmony-primary font-bold shadow-lg">
        🎵
      </div>
      <h1 className="text-4xl md:text-5xl font-bold mb-3 text-shadow">
        Harmony Notes
      </h1>
      <p className="text-xl opacity-90">
        Digital Meeting Minutes for Lobethal Harmony Club
      </p>
    </header>
  );
};

export default Header;