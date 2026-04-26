import React from 'react';
import { useCartContext } from '../context/CartContext';

/**
 * A fixed-position cart FAB that overlays the top-right corner of the viewport,
 * sitting alongside the shared Layout header. Only mounted within CartProvider
 * (i.e. customer routes), so it's safe to read cart context here.
 */
export const NavCartButton: React.FC = () => {
  const { itemCount, cartTotal, openDrawer } = useCartContext();

  return (
    <button
      id="nav-cart-btn"
      onClick={openDrawer}
      aria-label={`Open cart${itemCount > 0 ? `, ${itemCount} items` : ''}`}
      style={{
        position: 'fixed',
        top: 16,
        right: 90,           // sits left of the user-bar in the header
        zIndex: 900,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: itemCount > 0
          ? 'linear-gradient(135deg,rgba(165,180,252,0.18),rgba(236,72,153,0.14))'
          : 'rgba(31,41,55,0.85)',
        border: itemCount > 0
          ? '1px solid rgba(165,180,252,0.35)'
          : '1px solid rgba(255,255,255,0.08)',
        borderRadius: 999,
        padding: itemCount > 0 ? '7px 14px 7px 10px' : '7px 12px',
        cursor: 'pointer',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.25s ease',
        color: '#f1f5f9',
        fontSize: 14,
        fontWeight: 600,
        boxShadow: itemCount > 0 ? '0 4px 20px rgba(165,180,252,0.2)' : 'none',
      }}
    >
      {/* Cart icon */}
      <span style={{ fontSize: 18, lineHeight: 1, position: 'relative' }}>
        🛒
        {itemCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -6,
              right: -6,
              background: 'linear-gradient(135deg,#a5b4fc,#ec4899)',
              color: '#fff',
              borderRadius: 999,
              fontSize: 9,
              fontWeight: 800,
              minWidth: 16,
              height: 16,
              display: 'grid',
              placeItems: 'center',
              padding: '0 3px',
              lineHeight: 1,
            }}
          >
            {itemCount > 9 ? '9+' : itemCount}
          </span>
        )}
      </span>

      {/* Show total only when there are items */}
      {itemCount > 0 && (
        <span style={{ color: '#a5b4fc', fontWeight: 700, fontSize: 13 }}>
          LKR {cartTotal.toFixed(2)}
        </span>
      )}
    </button>
  );
};
