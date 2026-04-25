import React, { useEffect, useState } from 'react';
import { ShoppingBag, Search, ShoppingCart, Package, AlertCircle, X, Plus, Minus, Trash2 } from 'lucide-react';
import api from '../../../../shared/api/api';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  imageUrl?: string;
}

interface CartItem extends Product {
  quantity: number;
}

export const CustomerDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Payment State
  const [showPayment, setShowPayment] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<any>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const url = search ? `/products?search=${encodeURIComponent(search)}` : '/products';
        const response = await api.get(url);
        setProducts(response.data.data || []);
      } catch (err: any) {
        setError(err.response?.data?.error?.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchProducts, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, Math.min(item.quantity + delta, item.stock));
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const payload = {
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        pickupAddress: 'Merchant Facility', // Placeholder MVP logic for pickup
        deliveryAddress: "123 Main St", // You can later replace this with a real address input
      };
      // Place the order
      const response = await api.post('/orders', payload);
      setCurrentOrder(response.data.data);
      setShowPayment(true);
      setIsCartOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to place order');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrder) return;
    
    setPaymentProcessing(true);
    try {
      await api.post('/payments', {
        orderId: currentOrder.id,
        amount: currentOrder.totalAmount,
        paymentMethod: 'card'
      });
      
      setCart([]);
      setShowPayment(false);
      setCurrentOrder(null);
      alert('Order and Payment completed successfully!');
      
      // Reload products to get updated stock
      const response = await api.get('/products');
      setProducts(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Payment failed');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div>
      {/* ─── Header ────────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, var(--card-bg) 0%, rgba(16,185,129,0.08) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag size={24} color="var(--accent)" />
            </div>
            <div>
              <h3 style={{ margin: 0 }}>Browse Products</h3>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem', margin: 0 }}>Discover products and place your orders</p>
            </div>
          </div>
          
          <button 
            className="btn btn-primary" 
            onClick={() => setIsCartOpen(true)}
            style={{ position: 'relative' }}
          >
            <ShoppingCart size={18} />
            <span>Cart</span>
            {cartCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                background: 'var(--danger)',
                color: 'white',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                fontWeight: 'bold'
              }}>
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* ─── Search ──────────────────────────────────────────── */}
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem',
              background: 'var(--bg)', border: '1px solid var(--glass-border)',
              borderRadius: '0.5rem', color: 'var(--text)', fontSize: '0.9rem',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {error && (
        <div className="card" style={{ borderColor: 'var(--danger)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertCircle size={20} color="var(--danger)" />
          <span style={{ color: 'var(--danger)' }}>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-dim)' }}>Loading products...</p>
        </div>
      ) : products.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {products.map(product => (
            <div key={product.id} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', borderRadius: '4px', fontWeight: 600, textTransform: 'uppercase' }}>
                  {product.category}
                </span>
                {product.stock <= 5 && product.stock > 0 && (
                  <span style={{ fontSize: '0.7rem', color: '#f59e0b' }}>Only {product.stock} left</span>
                )}
              </div>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>{product.name}</h4>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.825rem', marginBottom: '1rem', flex: 1 }}>{product.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '1.1rem' }}>${product.price.toFixed(2)}</span>
                <button 
                  className="btn btn-primary" 
                  style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }} 
                  disabled={product.stock === 0}
                  onClick={() => addToCart(product)}
                >
                  <ShoppingCart size={14} />
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Package size={40} color="var(--text-dim)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <p style={{ color: 'var(--text-dim)', margin: 0 }}>
            {search ? `No products matching "${search}"` : 'No products available at the moment.'}
          </p>
        </div>
      )}

      {/* ─── Cart Modal ────────────────────────────────────────── */}
      {isCartOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', justifyContent: 'flex-end'
        }}>
          <div style={{
            width: '100%', maxWidth: '400px', background: 'var(--bg)',
            height: '100%', display: 'flex', flexDirection: 'column',
            boxShadow: '-4px 0 15px rgba(0,0,0,0.1)',
            borderLeft: '1px solid var(--glass-border)'
          }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShoppingCart size={20} color="var(--accent)" /> Your Cart
              </h3>
              <button onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-dim)', marginTop: '3rem' }}>
                  <Package size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {cart.map(item => (
                    <div key={item.id} className="card" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <h5 style={{ margin: '0 0 0.25rem 0' }}>{item.name}</h5>
                        <div style={{ color: 'var(--accent)', fontWeight: 'bold' }}>${(item.price * item.quantity).toFixed(2)}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button onClick={() => updateQuantity(item.id, -1)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '4px', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)', cursor: 'pointer' }}>
                          <Minus size={14} />
                        </button>
                        <span style={{ fontSize: '0.9rem', width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} disabled={item.quantity >= item.stock} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '4px', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)', cursor: item.quantity >= item.stock ? 'not-allowed' : 'pointer', opacity: item.quantity >= item.stock ? 0.5 : 1 }}>
                          <Plus size={14} />
                        </button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.25rem' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div style={{ padding: '1.5rem', borderTop: '1px solid var(--glass-border)', background: 'var(--card-bg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 'bold' }}>
                  <span>Total:</span>
                  <span style={{ color: 'var(--accent)' }}>${cartTotal.toFixed(2)}</span>
                </div>
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                >
                  {checkoutLoading ? 'Processing...' : 'Checkout'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {/* ─── Payment Modal ────────────────────────────────────────── */}
      {showPayment && currentOrder && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', zIndex: 1050,
          display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', background: 'var(--bg)', position: 'relative' }}>
            <button 
              onClick={() => { setShowPayment(false); setCurrentOrder(null); }} 
              style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               Secure Payment
            </h3>
            <p style={{ color: 'var(--text-dim)', marginBottom: '1.5rem' }}>
              Complete your payment for Order <strong style={{color: 'var(--text)'}}>#{currentOrder.id.slice(0, 8)}</strong>
            </p>
            
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Total Amount</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--accent)' }}>${currentOrder.totalAmount.toFixed(2)}</span>
            </div>

            <form onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input 
                type="text" 
                placeholder="Card Number" 
                defaultValue="4242 4242 4242 4242"
                required
                style={{ padding: '0.75rem', background: 'var(--bg)', border: '1px solid var(--glass-border)', borderRadius: '0.5rem', color: 'var(--text)', outline: 'none' }}
              />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input 
                  type="text" 
                  placeholder="MM/YY" 
                  defaultValue="12/26"
                  required
                  style={{ flex: 1, padding: '0.75rem', background: 'var(--bg)', border: '1px solid var(--glass-border)', borderRadius: '0.5rem', color: 'var(--text)', outline: 'none' }}
                />
                <input 
                  type="text" 
                  placeholder="CVC" 
                  defaultValue="123"
                  required
                  style={{ width: '80px', padding: '0.75rem', background: 'var(--bg)', border: '1px solid var(--glass-border)', borderRadius: '0.5rem', color: 'var(--text)', outline: 'none' }}
                />
              </div>
              <button 
                className="btn btn-primary" 
                type="submit" 
                disabled={paymentProcessing}
                style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', marginTop: '0.5rem' }}
              >
                {paymentProcessing ? 'Processing Payment...' : `Pay $${currentOrder.totalAmount.toFixed(2)}`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
