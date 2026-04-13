import { motion } from 'framer-motion';

interface PendingBadgeProps {
  count: number;
}

export default function PendingBadge({ count }: PendingBadgeProps) {
  if (count === 0) return null;

  return (
    <motion.span
      animate={{ scale: [1, 1.15, 1] }}
      transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '22px',
        height: '22px',
        padding: '0 6px',
        borderRadius: '99px',
        background: 'linear-gradient(135deg, #f87171, #fb923c)',
        color: '#fff',
        fontSize: '11px',
        fontWeight: 800,
        letterSpacing: '-0.02em',
        boxShadow: '0 0 12px rgba(248,113,113,0.6)',
        lineHeight: 1,
      }}
    >
      {count > 99 ? '99+' : count}
    </motion.span>
  );
}
