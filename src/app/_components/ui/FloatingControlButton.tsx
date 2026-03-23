import { motion } from 'framer-motion';

interface FloatingControlButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export const FloatingControlButton = ({
  onClick,
  isOpen,
}: FloatingControlButtonProps) => {
  return (
    <motion.button
      onClick={onClick}
      className="fixed bottom-8 right-8 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-[#1A1613] text-[#C28464] border-2 border-[#3A2E26] shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-colors hover:text-[#E8E1D5] hover:bg-[#2A201A] hover:border-[#5A3D31] active:scale-95"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="h-8 w-8"
      >
        {isOpen ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
          />
        )}
      </svg>
    </motion.button>
  );
};
