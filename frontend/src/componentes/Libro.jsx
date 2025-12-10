import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { servicioProductos } from '../services/api';

const CardVentas = () => {
    const [productos, setProductos] = useState([]);
    const [carrito, setCarrito] = useState([]);
    const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargarProductos = async () => {
            try {
                const data = await servicioProductos.obtenerTodos();
                setProductos(data);
            } catch (error) {
                console.error("Error cargando productos", error);
            } finally {
                setLoading(false);
            }
        };
        cargarProductos();
    }, []);

    // busca producto por categorias
    const productosFiltrados = categoriaFiltro === 'Todas'
        ? productos
        : productos.filter(producto => producto.categoria === categoriaFiltro);

    const agregarAlCarrito = (producto) => {
        setCarrito(prevCarrito => {
            const existe = prevCarrito.find(item => item.id === producto.id);
            if (existe) {
                return prevCarrito.map(item =>
                    item.id === producto.id
                        ? { ...item, cantidad: item.cantidad + 1 }
                        : item
                );
            }
            return [...prevCarrito, { ...producto, cantidad: 1 }];
        });
    };

    const eliminarDelCarrito = (id) => {
        setCarrito(prevCarrito => prevCarrito.filter(item => item.id !== id));
    };

    const totalCarrito = carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);

    const categorias = ['Todas', ...new Set(productos.map(p => p.categoria))];

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-primary"></div>
                <p className="mt-3">Cargando productos...</p>
            </div>
        );
    }

    return (
        <div className="container-fluid py-4">

            {/* Header */}
            <div className="row mb-4">
                <div className="col-12 d-flex justify-content-between align-items-center">
                    <div>
                        <span className="badge bg-danger me-2">
                            Carrito: {carrito.reduce((sum, item) => sum + item.cantidad, 0)}
                        </span>
                        <span className="fw-bold fs-5">Total: Bs {totalCarrito}</span>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">Filtrar por Categoría</h5>
                            <div className="btn-group flex-wrap">
                                {categorias.map(categoria => (
                                    <button
                                        key={categoria}
                                        className={`btn ${categoriaFiltro === categoria ? 'btn-primary' : 'btn-outline-primary'}`}
                                        onClick={() => setCategoriaFiltro(categoria)}
                                    >
                                        {categoria}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid de Productos */}
            <div className="row g-4">
                {productosFiltrados.map(producto => (
                    <div key={producto.id} className="col-xl-3 col-lg-4 col-md-6">
                        <div className="card h-100 shadow-sm hover-shadow">
                            <div className="position-relative">
                                <img
                                    src={producto.imagen_url || producto.imagen}
                                    className="card-img-top"
                                    alt={producto.nombre}
                                    style={{ height: "380px", objectFit: "cover" }}
                                />
                                <span className="position-absolute top-0 end-0 badge bg-danger m-1">
                                    Bs {producto.precio}
                                </span>
                                <span className="position-absolute top-0 start-0 badge bg-info m-2">
                                    {producto.categoria}
                                </span>
                            </div>

                            <div className="card-body d-flex flex-column">
                                <h5 className="card-title">{producto.nombre}</h5>

                                <p className="card-text flex-grow-1 text-muted">
                                    {producto.descripcion}
                                </p>

                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <small className={`badge ${producto.stock > 10 ? 'bg-success' : producto.stock > 0 ? 'bg-warning' : 'bg-danger'}`}>
                                        {producto.stock > 0 ? `Stock: ${producto.stock}` : 'Agotado'}
                                    </small>
                                    <small className="text-muted">ID: {producto.id}</small>
                                </div>

                                <button
                                    className="btn btn-primary w-100"
                                    onClick={() => agregarAlCarrito(producto)}
                                    disabled={producto.stock === 0}
                                >
                                    {producto.stock > 0 ? 'Agregar al Carrito' : 'Agotado'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Carrito */}
            {carrito.length > 0 && (
                <div className="row mt-5">
                    <div className="col-12">
                        <div className="card shadow-lg">
                            <div className="card-header bg-primary text-white">
                                <h4 className="mb-0">Tu Carrito</h4>
                            </div>
                            <div className="card-body">
                                {carrito.map(item => (
                                    <div key={item.id} className="d-flex justify-content-between align-items-center border-bottom py-2">
                                        <div className="d-flex align-items-center">
                                            <img
                                                src={item.imagen_url || item.imagen}
                                                alt={item.nombre}
                                                style={{ width: "60px", height: "60px", objectFit: "cover" }}
                                                className="rounded me-3"
                                            />
                                            <div>
                                                <h6 className="mb-1">{item.nombre}</h6>
                                                <small className="text-muted">Cantidad: {item.cantidad}</small>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <span className="fw-bold me-3">
                                                Bs {item.precio * item.cantidad}
                                            </span>
                                            <button
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={() => eliminarDelCarrito(item.id)}
                                            >
                                                ❌
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <div className="d-flex justify-content-between align-items-center mt-3">
                                    <h5>Total:</h5>
                                    <h4 className="text-success">Bs {totalCarrito}</h4>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default CardVentas;
