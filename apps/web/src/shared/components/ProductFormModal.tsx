// src/shared/components/ProductFormModal.tsx

import { useState } from "react";
import api from "../api/api";

type Role = "admin" | "merchant";

type Props = {
  role: Role;
  onClose: () => void;
  onSuccess?: () => void;
};

type ProductForm = {
  name: string;
  description: string;
  price: string;
  category: string;
  stock: string;
};

export const ProductFormModal = ({
  role,
  onClose,
  onSuccess,
}: Props) => {
  const [form, setForm] = useState<ProductForm>({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const validate = () => {
    if (!form.name.trim()) return "Product name is required";
    if (!form.price) return "Price is required";
    if (Number(form.price) <= 0) return "Price must be greater than 0";
    if (!form.stock) return "Stock is required";
    if (Number(form.stock) < 0) return "Stock cannot be negative";

    return "";
  };

  const handleSubmit = async () => {
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError("");

      await api.post("/products", {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        category: form.category,
        stock: Number(form.stock),
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
          "Failed to add product"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <h2 style={{ margin: 0 }}>
            {role === "admin"
              ? "Admin Add Product"
              : "Add New Product"}
          </h2>

          <button
            onClick={onClose}
            style={closeBtnStyle}
          >
            ✕
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={errorStyle}>
            {error}
          </div>
        )}

        {/* Form */}
        <div style={{ display: "grid", gap: 12 }}>
          <input
            name="name"
            placeholder="Product Name"
            value={form.name}
            onChange={handleChange}
            style={inputStyle}
          />

          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            style={textareaStyle}
          />

          <input
            name="price"
            placeholder="Price"
            type="number"
            value={form.price}
            onChange={handleChange}
            style={inputStyle}
          />

          <input
            name="category"
            placeholder="Category"
            value={form.category}
            onChange={handleChange}
            style={inputStyle}
          />

          <input
            name="stock"
            placeholder="Stock Quantity"
            type="number"
            value={form.stock}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        {/* Footer */}
        <div style={footerStyle}>
          <button
            onClick={onClose}
            style={cancelBtnStyle}
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={saveBtnStyle}
          >
            {loading
              ? "Saving..."
              : "Save Product"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------- Styles ---------- */

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.65)",
  display: "grid",
  placeItems: "center",
  zIndex: 999,
};

const modalStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 520,
  background: "#111827",
  borderRadius: 16,
  padding: 24,
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 18,
};

const closeBtnStyle: React.CSSProperties = {
  border: "none",
  background: "transparent",
  color: "#fff",
  fontSize: 20,
  cursor: "pointer",
};

const inputStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "#1f2937",
  color: "#fff",
  outline: "none",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: "none",
};

const footerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
  marginTop: 20,
};

const cancelBtnStyle: React.CSSProperties = {
  padding: "10px 16px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "#1f2937",
  color: "#fff",
  cursor: "pointer",
};

const saveBtnStyle: React.CSSProperties = {
  padding: "10px 18px",
  borderRadius: 10,
  border: "none",
  background:
    "linear-gradient(135deg,#fde68a,#fb923c)",
  color: "#111",
  fontWeight: 700,
  cursor: "pointer",
};

const errorStyle: React.CSSProperties = {
  background: "rgba(239,68,68,0.15)",
  border: "1px solid rgba(239,68,68,0.3)",
  color: "#fca5a5",
  padding: "10px 12px",
  borderRadius: 10,
  marginBottom: 14,
  fontSize: 14,
};