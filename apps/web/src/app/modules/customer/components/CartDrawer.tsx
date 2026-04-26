import React, { useState, useEffect } from 'react';
import { useCart } from '../hooks/useCart';

// ─── Styles (inline, matching existing dark theme) ───────────────────────────

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.55)',
  backdropFilter: 'blur(3px)',
  zIndex: 1000,
  display: 'flex',
  justifyContent: 'flex-end',
};

const drawerStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 440,
  height: '100%',
  background: 'var(--card-bg, #111827)',
  borderLeft: '1px solid rgba(165,180,252,0.15)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
};

// ─── Replace-merchant Dialog ─────────────────────────────────────────────────

const ReplaceMerchantDialog: React.FC<{
  currentMerchant: string | null;
  newMerchant: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ currentMerchant, newMerchant, onConfirm, onCancel }) => (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}
  >
    <div
      style={{
        background: '#1e293b',
        border: '1px solid rgba(165,180,252,0.2)',
        borderRadius: 16,
        padding: 32,
        maxWidth: 380,
        width: '100%',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
      }}
    >
      <div style={{ fontSize: 36, marginBottom: 16, textAlign: 'center' }}>🛒</div>
      <h3 style={{ margin: '0 0 10px', textAlign: 'center' }}>Start a new cart?</h3>
      <p style={{ color: 'var(--text-dim, #6b7280)', textAlign: 'center', fontSize: 14, lineHeight: 1.6, margin: '0 0 24px' }}>
        Your cart has items from <strong style={{ color: '#a5b4fc' }}>{currentMerchant}</strong>.
        Adding from <strong style={{ color: '#a5b4fc' }}>{newMerchant}</strong> will clear your current cart.
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={onCancel}
          style={{
            flex: 1,
            padding: '12px 0',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'transparent',
            color: '#cbd5e1',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Keep Current
        </button>
        <button
          onClick={onConfirm}
          style={{
            flex: 1,
            padding: '12px 0',
            borderRadius: 10,
            border: 'none',
            background: 'linear-gradient(135deg, #a5b4fc, #ec4899)',
            color: '#fff',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          Start New Cart
        </button>
      </div>
    </div>
  </div>
);

// ─── CartDrawer ───────────────────────────────────────────────────────────────

export const CartDrawer: React.FC = () => {
  const {
    state,
    isDrawerOpen,
    closeDrawer,
    removeFromCart,
    updateQty,
    cartTotal,
    itemCount,
    placeOrder,
    placing,
    placeError,
    clearPlaceError,
    pendingAdd,
    confirmReplace,
    cancelReplace,
  } = useCart();

  const [dropAddress, setDropAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [addressError, setAddressError] = useState('');
  const [visible, setVisible] = useState(false);

  // Animate in/out
  useEffect(() => {
    if (isDrawerOpen) {
      setTimeout(() => setVisible(true), 10);
    } else {
      setVisible(false);
    }
  }, [isDrawerOpen]);

  if (!isDrawerOpen && !visible) return null;

  const handlePlaceOrder = async () => {
    if (!dropAddress.trim()) {
      setAddressError('Please enter a delivery address.');
      return;
    }

    // Check for multiple merchants
    const merchantIds = new Set(state.items.map(i => i.merchantId));
    if (merchantIds.size > 1) {
      setAddressError('Your cart contains items from multiple merchants. This is not allowed.');
      return;
    }

    setAddressError('');
    clearPlaceError();
    await placeOrder(dropAddress.trim(), notes.trim() || undefined);
  };

  const isEmpty = state.items.length === 0;

  return (
    <>
      {/* Cross-merchant dialog rendered outside drawer */}
      {pendingAdd && (
        <ReplaceMerchantDialog
          currentMerchant={state.merchantName}
          newMerchant={pendingAdd.item.merchantName}
          onConfirm={confirmReplace}
          onCancel={cancelReplace}
        />
      )}

      {/* Backdrop */}
      <div
        style={{
          ...overlayStyle,
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.25s ease',
        }}
        onClick={closeDrawer}
      >
        {/* Drawer panel — stop propagation so clicks inside don't close it */}
        <div
          style={{
            ...drawerStyle,
            transform: visible ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            style={{
              padding: '20px 24px',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: 20 }}>
                Your Cart
                {itemCount > 0 && (
                  <span
                    style={{
                      marginLeft: 10,
                      background: 'linear-gradient(135deg, #a5b4fc, #ec4899)',
                      color: '#fff',
                      borderRadius: 999,
                      padding: '2px 10px',
                      fontSize: 12,
                      fontWeight: 700,
                      verticalAlign: 'middle',
                    }}
                  >
                    {itemCount}
                  </span>
                )}
              </h2>
              {state.merchantName && (
                <div style={{ fontSize: 12, color: 'var(--text-dim, #6b7280)', marginTop: 2 }}>
                  from {state.merchantName}
                </div>
              )}
            </div>
            <button
              onClick={closeDrawer}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: 'none',
                borderRadius: 8,
                color: '#cbd5e1',
                width: 36,
                height: 36,
                cursor: 'pointer',
                fontSize: 18,
                display: 'grid',
                placeItems: 'center',
              }}
              aria-label="Close cart"
            >
              ✕
            </button>
          </div>

          {/* Scrollable body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
            {isEmpty ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  gap: 16,
                  paddingTop: 80,
                  color: 'var(--text-dim, #6b7280)',
                }}
              >
                <div style={{ fontSize: 64 }}>🛒</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: '#cbd5e1' }}>Your cart is empty</div>
                <div style={{ fontSize: 14, textAlign: 'center' }}>
                  Browse products and add items to start your order.
                </div>
                <button
                  className="btn btn-primary"
                  style={{ marginTop: 8 }}
                  onClick={closeDrawer}
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                {state.items.map((item) => (
                  <div
                    key={item.productId}
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 12,
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                    }}
                  >
                    {/* Icon */}
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        background: '#1f2937',
                        borderRadius: 10,
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: 24,
                        flexShrink: 0,
                      }}
                    >
                      {item.icon || '🍽️'}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.productName}
                      </div>
                      <div style={{ fontSize: 13, color: '#a5b4fc', fontWeight: 700, marginTop: 2 }}>
                        LKR {(item.unitPrice * item.quantity).toFixed(2)}
                      </div>
                    </div>

                    {/* Qty stepper */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        flexShrink: 0,
                      }}
                    >
                      <button
                        onClick={() => updateQty(item.productId, item.quantity - 1)}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          border: '1px solid rgba(255,255,255,0.15)',
                          background: 'transparent',
                          color: '#cbd5e1',
                          cursor: 'pointer',
                          fontSize: 16,
                          display: 'grid',
                          placeItems: 'center',
                          lineHeight: 1,
                        }}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span style={{ fontSize: 14, fontWeight: 700, minWidth: 20, textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(item.productId, item.quantity + 1)}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          border: '1px solid rgba(165,180,252,0.4)',
                          background: 'rgba(165,180,252,0.1)',
                          color: '#a5b4fc',
                          cursor: 'pointer',
                          fontSize: 16,
                          display: 'grid',
                          placeItems: 'center',
                          lineHeight: 1,
                        }}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          border: '1px solid rgba(239,68,68,0.3)',
                          background: 'rgba(239,68,68,0.08)',
                          color: '#fca5a5',
                          cursor: 'pointer',
                          fontSize: 13,
                          display: 'grid',
                          placeItems: 'center',
                          marginLeft: 4,
                        }}
                        aria-label="Remove item"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                ))}

                {/* Subtotal */}
                <div
                  style={{
                    background: 'rgba(165,180,252,0.07)',
                    border: '1px solid rgba(165,180,252,0.15)',
                    borderRadius: 12,
                    padding: '14px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 4,
                  }}
                >
                  <span style={{ fontSize: 14, color: 'var(--text-dim, #6b7280)' }}>
                    Subtotal ({itemCount} item{itemCount > 1 ? 's' : ''})
                  </span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: '#a5b4fc' }}>
                    LKR {cartTotal.toFixed(2)}
                  </span>
                </div>

                {/* Delivery note */}
                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--text-dim, #6b7280)',
                    textAlign: 'center',
                    padding: '4px 0',
                  }}
                >
                  + delivery fee to be added by rider offer
                </div>
              </div>
            )}
          </div>

          {/* Footer — order form, only when cart has items */}
          {!isEmpty && (
            <div
              style={{
                borderTop: '1px solid rgba(255,255,255,0.07)',
                padding: '20px 24px',
                display: 'grid',
                gap: 12,
                flexShrink: 0,
                background: 'rgba(0,0,0,0.2)',
              }}
            >
              {/* Drop address */}
              <div>
                <label
                  style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim, #6b7280)', display: 'block', marginBottom: 6 }}
                >
                  DELIVERY ADDRESS *
                </label>
                <input
                  value={dropAddress}
                  onChange={(e) => {
                    setDropAddress(e.target.value);
                    if (addressError) setAddressError('');
                  }}
                  placeholder="Enter your delivery address"
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${addressError ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 10,
                    padding: '10px 14px',
                    color: '#f1f5f9',
                    fontSize: 14,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                {addressError && (
                  <div style={{ fontSize: 12, color: '#fca5a5', marginTop: 4 }}>{addressError}</div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label
                  style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim, #6b7280)', display: 'block', marginBottom: 6 }}
                >
                  ORDER NOTES (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions..."
                  rows={2}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10,
                    padding: '10px 14px',
                    color: '#f1f5f9',
                    fontSize: 14,
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {/* API error */}
              {placeError && (
                <div
                  style={{
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: 10,
                    padding: '10px 14px',
                    fontSize: 13,
                    color: '#fca5a5',
                  }}
                >
                  {placeError}
                </div>
              )}

              {/* Place Order CTA */}
              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                style={{
                  width: '100%',
                  padding: '14px 0',
                  borderRadius: 12,
                  border: 'none',
                  background: placing
                    ? 'rgba(165,180,252,0.3)'
                    : 'linear-gradient(135deg, #a5b4fc, #ec4899)',
                  color: '#fff',
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: placing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'opacity 0.2s',
                  opacity: placing ? 0.8 : 1,
                  letterSpacing: '0.3px',
                }}
              >
                {placing ? (
                  <>
                    <span style={{ fontSize: 18, animation: 'spin 1s linear infinite' }}>⟳</span>
                    Placing Order…
                  </>
                ) : (
                  <>
                    Place Order · LKR {cartTotal.toFixed(2)}
                  </>
                )}
              </button>

              <div style={{ fontSize: 11, color: 'var(--text-dim, #6b7280)', textAlign: 'center' }}>
                Cash on delivery · Rider offers will be sent to you
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
};
