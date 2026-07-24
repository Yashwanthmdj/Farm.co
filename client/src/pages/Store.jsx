/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  ShoppingCart,
  Package,
  Plus,
  Minus,
  Trash2,
  Store as StoreIcon,
  Pencil,
} from 'lucide-react';
import { Card, Button, Input, EmptyState, Spinner, Badge, Modal, FormField, Textarea, Select } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getProducts } from '../api/products';
import { addToCart, getCart, removeFromCart, updateCartItem } from '../api/cart';
import { createOrder, getUserOrders } from '../api/orders';
import {
  createFarmerProduct,
  deleteFarmerProduct,
  getFarmerProducts,
  updateFarmerProduct,
} from '../api/farmerProducts';
import { resolveAssetUrl } from '../api/client';

const TABS = [
  { id: 'shop', label: 'Shop', icon: ShoppingBag },
  { id: 'orders', label: 'My Orders', icon: Package },
];

const FARMER_TAB = { id: 'mystore', label: 'My Farm Store', icon: StoreIcon };

export default function Store() {
  const { user } = useAuth();
  const isFarmer = user?.role === 'farmer';
  const tabs = isFarmer ? [...TABS, FARMER_TAB] : TABS;
  const [tab, setTab] = useState('shop');

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ fontSize: 22 }}>Store</h2>
        <p style={{ color: 'var(--muted)', fontSize: 13.5 }}>Shop farming supplies, track orders, and manage your own listings.</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid var(--border)' }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 16px',
              background: 'none',
              border: 'none',
              borderBottom: tab === t.id ? '2px solid var(--primary)' : '2px solid transparent',
              color: tab === t.id ? 'var(--primary)' : 'var(--muted)',
              fontWeight: 700,
              fontSize: 13.5,
              cursor: 'pointer',
            }}
          >
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'shop' && <ShopTab />}
      {tab === 'orders' && <OrdersTab />}
      {tab === 'mystore' && isFarmer && <MyStoreTab />}
    </div>
  );
}

function ShopTab() {
  const { user } = useAuth();
  const toast = useToast();
  const userId = user?._id;
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [prods, cartData] = await Promise.all([
        getProducts(),
        userId ? getCart(userId) : Promise.resolve(null),
      ]);
      setProducts(prods || []);
      setCart(cartData);
    } catch (err) {
      toast.error('Failed to load store.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [userId]);

  const cartItems = cart?.items || [];
  const cartTotal = cartItems.reduce((s, it) => s + (it.product?.price || 0) * it.quantity, 0);

  const handleAdd = async (productId) => {
    try {
      const updated = await addToCart({ userId, productId, quantity: 1 });
      setCart(updated);
      toast.success('Added to cart.');
    } catch (err) {
      toast.error('Failed to add to cart.');
    }
  };

  const handleQuantity = async (productId, quantity) => {
    try {
      const updated = await updateCartItem({ userId, productId, quantity });
      setCart(updated);
    } catch (err) {
      toast.error('Failed to update cart.');
    }
  };

  const handleRemove = async (productId) => {
    try {
      const updated = await removeFromCart({ userId, productId });
      setCart(updated);
    } catch (err) {
      toast.error('Failed to remove item.');
    }
  };

  const handleCheckout = async () => {
    try {
      await createOrder(userId);
      toast.success('Order placed successfully!');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Checkout failed.');
    }
  };

  if (loading) return <Spinner label="Loading store..." />;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }} className="two-col-grid">
      {products.length === 0 ? (
        <EmptyState icon={Package} title="No products available" description="Check back soon for new supplies." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, alignContent: 'start' }}>
          {products.map((p) => (
            <Card key={p._id} padding={14}>
              <div style={{ height: 110, background: 'var(--surface)', borderRadius: 'var(--radius-sm)', marginBottom: 10, overflow: 'hidden' }}>
                {p.image && (
                  <img src={resolveAssetUrl(p.image)} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                )}
              </div>
              <strong style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>{p.name}</strong>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>{p.category}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, color: 'var(--primary)' }}>₹{p.price}</span>
                <Button size="sm" icon={Plus} onClick={() => handleAdd(p._id)} disabled={!userId}>
                  Add
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card style={{ alignSelf: 'start' }}>
        <h3 style={{ fontSize: 15, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
          <ShoppingCart size={15} style={{ color: 'var(--primary)' }} /> Your Cart
        </h3>
        {cartItems.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>Your cart is empty.</p>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {cartItems.map((it) => (
                <div key={it.product?._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5 }}>
                  <span style={{ flex: 1, marginRight: 8 }}>{it.product?.name || 'Product'}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button aria-label="Decrease quantity" onClick={() => handleQuantity(it.product._id, it.quantity - 1)} style={qtyBtnStyle}>
                      <Minus size={11} />
                    </button>
                    <span>{it.quantity}</span>
                    <button aria-label="Increase quantity" onClick={() => handleQuantity(it.product._id, it.quantity + 1)} style={qtyBtnStyle}>
                      <Plus size={11} />
                    </button>
                    <button aria-label="Remove item" onClick={() => handleRemove(it.product._id)} style={{ ...qtyBtnStyle, color: 'var(--error)' }}>
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginBottom: 14, display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
              <span>Total</span>
              <span style={{ color: 'var(--primary)' }}>₹{cartTotal.toLocaleString()}</span>
            </div>
            <Button fullWidth onClick={handleCheckout}>Checkout</Button>
          </>
        )}
      </Card>
    </div>
  );
}

function OrdersTab() {
  const { user } = useAuth();
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) return;
    getUserOrders(user._id)
      .then(setOrders)
      .catch(() => toast.error('Failed to load orders.'))
      .finally(() => setLoading(false));
  }, [user?._id]);

  if (loading) return <Spinner label="Loading orders..." />;
  if (orders.length === 0) return <EmptyState icon={Package} title="No orders yet" description="Your placed orders will appear here." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {orders.map((o) => (
        <Card key={o._id}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <strong style={{ fontSize: 13.5 }}>Order #{o._id.slice(-6)}</strong>
            <Badge tone={o.status === 'delivered' ? 'success' : o.status === 'cancelled' ? 'error' : 'warning'}>{o.status}</Badge>
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 8 }}>
            {(o.items || []).map((it) => it.product?.name).filter(Boolean).join(', ') || `${o.items?.length || 0} item(s)`}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: 'var(--muted)' }}>{new Date(o.createdAt).toLocaleDateString()}</span>
            <strong style={{ color: 'var(--primary)' }}>₹{o.total?.toLocaleString()}</strong>
          </div>
        </Card>
      ))}
    </div>
  );
}

const CATEGORIES = ['Vegetables', 'Fruits', 'Dairy', 'Grains', 'Handicrafts', 'Other'];
const emptyForm = { name: '', description: '', price: '', unit: 'kg', category: 'Other', stock: '', image: null };

function MyStoreTab() {
  const { user } = useAuth();
  const toast = useToast();
  const farmerId = user?._id;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    if (!farmerId) return;
    setLoading(true);
    getFarmerProducts(farmerId)
      .then((data) => setProducts(data || []))
      .catch(() => toast.error('Failed to load your products.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [farmerId]);

  const openModal = (product = null) => {
    setEditing(product);
    setForm(
      product
        ? { name: product.name, description: product.description, price: product.price, unit: product.unit, category: product.category, stock: product.stock, image: null }
        : emptyForm
    );
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === 'image' && v) fd.append('image', v);
      else if (k !== 'image') fd.append(k, v);
    });
    if (!editing) fd.append('farmerId', farmerId);
    try {
      if (editing) await updateFarmerProduct(editing._id, fd);
      else await createFarmerProduct(fd);
      toast.success(editing ? 'Product updated.' : 'Product added.');
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await deleteFarmerProduct(id);
      toast.success('Product deleted.');
      load();
    } catch (err) {
      toast.error('Failed to delete product.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button icon={Plus} onClick={() => openModal()}>Add Product</Button>
      </div>

      {loading ? (
        <Spinner />
      ) : products.length === 0 ? (
        <EmptyState icon={StoreIcon} title="No products listed" description="Add your first product to start selling." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {products.map((p) => (
            <motion.div key={p._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card padding={0} style={{ overflow: 'hidden' }}>
                <div style={{ height: 140, background: 'var(--surface)' }}>
                  <img src={resolveAssetUrl(p.imageUrl)} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                </div>
                <div style={{ padding: 14 }}>
                  <strong style={{ fontSize: 13.5 }}>{p.name}</strong>
                  <p style={{ fontSize: 12, color: 'var(--muted)', margin: '4px 0 10px' }}>₹{p.price} / {p.unit} · Stock: {p.stock}</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button size="sm" variant="outline" icon={Pencil} onClick={() => openModal(p)} fullWidth>Edit</Button>
                    <Button size="sm" variant="danger" icon={Trash2} onClick={() => handleDelete(p._id)} fullWidth>Delete</Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Product' : 'Add Product'}>
        <form onSubmit={handleSave}>
          <FormField label="Name" required>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          </FormField>
          <FormField label="Description" required>
            <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} required />
          </FormField>
          <div style={{ display: 'flex', gap: 10 }}>
            <FormField label="Price (₹)" required>
              <Input type="number" min="0" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} required />
            </FormField>
            <FormField label="Unit" required>
              <Input value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} placeholder="kg, dozen..." required />
            </FormField>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <FormField label="Category">
              <Select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </FormField>
            <FormField label="Stock" required>
              <Input type="number" min="0" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} required />
            </FormField>
          </div>
          <FormField label="Product image" required={!editing}>
            <Input type="file" accept="image/*" onChange={(e) => setForm((f) => ({ ...f, image: e.target.files?.[0] }))} required={!editing} />
          </FormField>
          <Button type="submit" fullWidth loading={saving}>{editing ? 'Save Changes' : 'Add Product'}</Button>
        </form>
      </Modal>
    </div>
  );
}

const qtyBtnStyle = {
  width: 20,
  height: 20,
  borderRadius: '50%',
  border: '1px solid var(--border)',
  background: 'var(--surface)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  color: 'var(--text)',
};
