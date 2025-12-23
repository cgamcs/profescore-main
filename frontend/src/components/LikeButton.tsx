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
            {/* Definimos la animación keyframes localmente o en tu global.css */}
            <style>
                {`
                @keyframes heart-pop {
                    0% { transform: scale(1); }
                    15% { transform: scale(0.9); } /* Se encoge un poco antes del salto */
                    30% { transform: scale(1.5); } /* Explota hacia afuera */
                    45% { transform: scale(1.5); } /* Se mantiene un instante */
                    80% { transform: scale(0.9); } /* Rebote hacia adentro */
                    100% { transform: scale(1); }  /* Vuelve a la normalidad */
                }
                .pop-animation {
                    animation: heart-pop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                `}
            </style>

            <button
                className="flex items-center gap-2 group focus:outline-none"
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
                    Me gusta {likeCount > 0 && `(${likeCount})`}
                </span>
            </button>
        </>
    );
};

export default LikeButton;