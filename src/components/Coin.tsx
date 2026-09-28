/** Moneda del juego (icono propio): disco dorado con un rayo */
export default function Coin({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`coin ${className}`} aria-hidden>
      <defs>
        <linearGradient id="coin-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe98a" />
          <stop offset="1" stopColor="#d99a0b" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10.5" fill="url(#coin-g)" stroke="#8a5a00" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="7.6" fill="none" stroke="#fff3c2" strokeOpacity=".7" strokeWidth="1" />
      <path d="M13.2 5.8 8.6 12.6h3l-.9 5.6 4.7-6.9h-3.1z" fill="#8a4a00" />
    </svg>
  )
}
