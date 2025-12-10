import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      console.log('Sesión expirada, redirigiendo a login...');
    }
    return Promise.reject(error);
  }
);

export const servicioProductos = {

  obtenerTodos: async () => {
    try {
      const response = await api.get('/productos');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo productos:', error);
      return [
        { id: 1, nombre: 'Fairytail Volumen', precio: 150, categoria: 'Manga', stock: 15, imagen_url: 'https://m.media-amazon.com/images/I/81EIdomF4FL._AC_UF1000,1000_QL80_.jpg' },
        { id: 2, nombre: 'Heartstopper', precio: 180, categoria: 'Comic', stock: 25, imagen_url: 'https://encantalibros.com/wp-content/uploads/2020/12/9789877475876.jpg' }
      ];
    }
  },

  obtenerPorCategoria: async (categoria) => {
    try {
      const response = await api.get(`/productos/categoria/${categoria}`);
      return response.data;
    } catch (error) {
      console.error(`Error obteniendo productos de ${categoria}:`, error);
      return [];
    }
  },

  obtenerPorId: async (id) => {
    try {
      const response = await api.get(`/productos/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error obteniendo producto ${id}:`, error);
      return null;
    }
  },

  crear: async (productoData) => {
    try {
      const response = await api.post('/productos', productoData);
      return response.data;
    } catch (error) {
      console.error('Error creando producto:', error);
      throw error;
    }
  },

  actualizar: async (id, productoData) => {
    try {
      const response = await api.put(`/productos/${id}`, productoData);
      return response.data;
    } catch (error) {
      console.error(`Error actualizando producto ${id}:`, error);
      throw error;
    }
  },

  eliminar: async (id) => {
    try {
      const response = await api.delete(`/productos/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error eliminando producto ${id}:`, error);
      throw error;
    }
  }
};

export const servicioAutenticacion = {

  iniciarSesion: async (credenciales) => {
    try {
      const response = await api.post('/auth/login', credenciales);

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  },

  registrarUsuario: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  },

  cerrarSesion: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return Promise.resolve();
  },

  estaAutenticado: () => {
    return !!localStorage.getItem('token');
  },

  obtenerUsuarioActual: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
};
export const servicioCarrito = {

  obtenerCarrito: async () => {
    try {
      const response = await api.get('/carrito');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo carrito:', error);
      return [];
    }
  },

  agregarAlCarrito: async (productoId, cantidad = 1) => {
    try {
      const response = await api.post('/carrito', { productoId, cantidad });
      return response.data;
    } catch (error) {
      console.error('Error agregando al carrito:', error);
      throw error;
    }
  },

  actualizarCantidad: async (itemId, cantidad) => {
    try {
      const response = await api.put(`/carrito/${itemId}`, { cantidad });
      return response.data;
    } catch (error) {
      console.error('Error actualizando cantidad:', error);
      throw error;
    }
  },

  eliminarDelCarrito: async (itemId) => {
    try {
      const response = await api.delete(`/carrito/${itemId}`);
      return response.data;
    } catch (error) {
      console.error('Error eliminando del carrito:', error);
      throw error;
    }
  },

  vaciarCarrito: async () => {
    try {
      const response = await api.delete('/carrito');
      return response.data;
    } catch (error) {
      console.error('Error vaciando carrito:', error);
      throw error;
    }
  }
};

export const servicioComentarios = {

  obtenerPorProducto: async (productoId) => {
    try {
      const response = await api.get(`/comentarios/producto/${productoId}`);
      return response.data;
    } catch (error) {
      console.error(`Error obteniendo comentarios de producto ${productoId}:`, error);
      return [];
    }
  },

  crearComentario: async (comentarioData) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      const usuarioId = user?.id;

      if (!usuarioId) {
        console.error('No hay usuario en localStorage al crear comentario');
        throw new Error('Usuario no autenticado');
      }

      const response = await api.post('/comentarios', {
        ...comentarioData,
        usuarioId,
      });

      return response.data;
    } catch (error) {
      console.error('Error creando comentario:', error);
      throw error;
    }
  }
};

export default api;
