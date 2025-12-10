import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { servicioProductos } from '../services/api';

const EditarProducto = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [producto, setProducto] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    categoria: 'Manga',
    stock: '',
    descripcion: '',
    imagen_url: ''
  });

  const categorias = ['Manga', 'Comic', 'Novela', 'Terror', 'Suspenso', 'Acción', 'Otros'];

  useEffect(() => {
    const cargarProducto = async () => {
      try {
        const data = await servicioProductos.obtenerPorId(id);
        if (data) {
          setProducto(data);
          setFormData({
            nombre: data.nombre || '',
            precio: data.precio || '',
            categoria: data.categoria || 'Manga',
            stock: data.stock || '',
            descripcion: data.descripcion || '',
            imagen_url: data.imagen_url || ''
          });
        } else {
          navigate('/productos');
        }
      } catch (error) {
        console.error('Error cargando producto:', error);
        navigate('/productos');
      } finally {
        setLoading(false);
      }
    };

    cargarProducto();
  }, [id, navigate]);

  // cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // guardar cambios
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre.trim() || !formData.precio || !formData.stock) {
      alert('❌ Por favor completa los campos requeridos');
      return;
    }

    try {
      const productoData = {
        ...formData,
        precio: parseFloat(formData.precio),
        stock: parseInt(formData.stock)
      };

      await servicioProductos.actualizar(id, productoData);
      
      navigate('/productos');
    } catch (error) {
      console.error('Error actualizando producto:', error);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-orange-500" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3">Cargando producto...</p>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          <h5>❌ Producto no encontrado</h5>
          <button className="btn btn-primary" onClick={() => navigate('/productos')}>
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold">Editar Producto</h1>
          <p className="text-muted">ID: {id} | {producto.nombre}</p>
        </div>
        <button 
          className="btn btn-outline-secondary"
          onClick={() => navigate('/productos')}
        >
          ← Volver
        </button>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <div className="card shadow-lg border-0">
            <div className="card-header bg-gradient bg-primary text-white">
              <h4 className="mb-0">
                <i className="bi bi-pencil-square me-2"></i>
                Editar Producto
              </h4>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Nombre del Producto *</label>
                    <input
                      type="text"
                      name="nombre"
                      className="form-control"
                      placeholder="Ej: One Piece Vol. 101"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-bold">Precio (Bs) *</label>
                    <input
                      type="number"
                      name="precio"
                      className="form-control"
                      placeholder="150.00"
                      value={formData.precio}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-bold">Categoría *</label>
                    <select
                      name="categoria"
                      className="form-select"
                      value={formData.categoria}
                      onChange={handleChange}
                      required
                    >
                      {categorias.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-bold">Stock *</label>
                    <input
                      type="number"
                      name="stock"
                      className="form-control"
                      placeholder="10"
                      value={formData.stock}
                      onChange={handleChange}
                      min="0"
                      required
                    />
                  </div>
                  <div className="col-md-8">
                    <label className="form-label fw-bold">URL de Imagen</label>
                    <input
                      type="text"
                      name="imagen_url"
                      className="form-control"
                      placeholder="https://ejemplo.com/imagen.jpg"
                      value={formData.imagen_url}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-12">
                    <label className="form-label fw-bold">Descripción</label>
                    <textarea
                      name="descripcion"
                      className="form-control"
                      placeholder="Descripción del producto..."
                      value={formData.descripcion}
                      onChange={handleChange}
                      rows="4"
                    />
                  </div>
                  <div className="col-md-12">
                    <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                      <button
                        type="button"
                        className="btn btn-outline-secondary me-md-2"
                        onClick={() => navigate('/productos')}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary btn-lg px-4"
                      >
                        <i className="bi bi-check-circle me-2"></i>
                        Guardar Cambios en Base de Datos
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Vista previa */}
        <div className="col-lg-4">
          <div className="card shadow-lg border-0 sticky-top" style={{top: '20px'}}>
            <div className="card-header bg-gradient bg-info text-white">
              <h4 className="mb-0">
                <i className="bi bi-eye me-2"></i>
                Vista Previa
              </h4>
            </div>
            <div className="card-body text-center">
              <img
                src={formData.imagen_url || producto.imagen_url || 'https://via.placeholder.com/300x400/FFE5CC/666666?text=Sin+Imagen'}
                alt="Vista previa"
                className="img-fluid rounded mb-3"
                style={{ maxHeight: '250px', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x400/FFE5CC/666666?text=Imagen+No+Disponible';
                }}
              />
              <h5 className="card-title">{formData.nombre || 'Nombre del producto'}</h5>
              <div className="d-flex justify-content-center gap-3 mb-3">
                <span className={`badge ${getBadgeColor(formData.categoria)}`}>
                  {formData.categoria}
                </span>
                <span className="badge bg-warning text-dark">
                  Bs {formData.precio || '0.00'}
                </span>
                <span className={`badge ${formData.stock > 10 ? 'bg-success' : formData.stock > 0 ? 'bg-warning' : 'bg-danger'}`}>
                  {formData.stock || '0'} unidades
                </span>
              </div>
              <p className="card-text text-muted small">
                {formData.descripcion || 'Sin descripción'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Información del producto original */}
      <div className="card mt-4">
        <div className="card-header">
          <h5 className="mb-0">Información Original</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <p><strong>Nombre:</strong> {producto.nombre}</p>
              <p><strong>Precio:</strong> Bs {producto.precio}</p>
              <p><strong>Categoría:</strong> {producto.categoria}</p>
            </div>
            <div className="col-md-6">
              <p><strong>Stock:</strong> {producto.stock} unidades</p>
              <p><strong>Estado:</strong> {producto.is_active ? 'Activo' : 'Inactivo'}</p>
              <p><strong>Creado:</strong> {new Date(producto.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Función para obtener color de badge
const getBadgeColor = (categoria) => {
  switch (categoria) {
    case 'Manga': return 'bg-danger';
    case 'Comic': return 'bg-primary';
    case 'Novela': return 'bg-success';
    case 'Terror': return 'bg-dark';
    case 'Suspenso': return 'bg-secondary';
    case 'Acción': return 'bg-warning text-dark';
    default: return 'bg-info';
  }
};

export default EditarProducto;
