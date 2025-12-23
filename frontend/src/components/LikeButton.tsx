import React, { useState } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

interface LikeButtonProps {
  isLiked: boolean;
  likeCount: number;
  onClick: () => void;
}

const LikeButton: React.FC<LikeButtonProps> = ({ isLiked, likeCount, onClick }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    // Solo animamos si vamos a dar Like (no al quitarlo), estilo YouTube
    if (!isLiked) {
      setIsAnimating(true);
    }
    onClick();
  };

  return (
    <>
      <button
        className="flex items-center gap-2 cursor-pointer group focus:outline-none"
        onClick={handleClick}
        // Al terminar la animación, reseteamos el estado para poder animar de nuevo en el futuro
        onAnimationEnd={() => setIsAnimating(false)}
      >
        <div className="relative w-5 h-5 flex items-center justify-center">
          {/* Corazón Vacío (Estado normal) */}
          <FaRegHeart
            className={`absolute w-full h-full text-gray-500 dark:text-[#979797] transition-all duration-300 ease-out
                        ${isLiked ? 'opacity-0 scale-0' : 'opacity-100 scale-100 group-hover:text-indigo-500'}`}
          />

          {/* Corazón Lleno (Estado Liked) */}
          <FaHeart
            className={`absolute w-full h-full text-indigo-600 dark:text-indigo-400 transition-all duration-300 ease-out
                        ${isLiked ? 'opacity-100 scale-100' : 'opacity-0 scale-0'} 
                        ${isAnimating ? 'pop-animation' : ''}`}
          />

          {/* Destello opcional (Ring effect) detrás del corazón al dar click */}
          <span
            className={`absolute inset-0 rounded-full border-2 border-indigo-500 opacity-0
                        ${isAnimating ? 'animate-ping' : ''}`}
          ></span>
        </div>

        <span className={`text-sm transition-colors duration-300 ${isLiked ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-gray-500 dark:text-[#979797]'}`}>
          {likeCount > 0 && likeCount}
        </span>
      </button>
    </>
  );
};

export default LikeButton;