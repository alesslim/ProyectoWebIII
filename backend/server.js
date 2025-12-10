  require('dotenv').config();
  const express = require('express');
  const cors = require('cors');
  const mysql = require('mysql2/promise');
  const bcrypt = require('bcryptjs');


  const app = express();
  const PORT = process.env.PORT || 5000;

  // Configurar conexión MySQL
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'el_buen_libro_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  // Middleware
  app.use(cors({
    origin: 'http://localhost:5173', // Tu frontend Vite
    credentials: true
  }));
  app.use(express.json());

  // ENDPOINTS PARA PRODUCTOS (como en tu React)

  // GET todos los productos
  app.get('/api/productos', async (req, res) => {
    try {
      const [rows] = await pool.execute('SELECT * FROM productos WHERE is_active = TRUE');
      res.json(rows);
    } catch (error) {
      console.error('Error fetching productos:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // GET producto por ID
  app.get('/api/productos/:id', async (req, res) => {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM productos WHERE id = ? AND is_active = TRUE',
        [req.params.id]
      );
      
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      
      res.json(rows[0]);
    } catch (error) {
      console.error('Error fetching producto:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // GET productos por categoría
  app.get('/api/productos/categoria/:categoria', async (req, res) => {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM productos WHERE categoria = ? AND is_active = TRUE',
        [req.params.categoria]
      );
      res.json(rows);
    } catch (error) {
      console.error('Error fetching productos por categoría:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // POST crear nuevo producto (admin)
  app.post('/api/productos', async (req, res) => {
    try {
      const { nombre, precio, categoria, descripcion, imagen_url, stock } = req.body;
      
      const [result] = await pool.execute(
        'INSERT INTO productos (nombre, precio, categoria, descripcion, imagen_url, stock) VALUES (?, ?, ?, ?, ?, ?)',
        [nombre, precio, categoria, descripcion || null, imagen_url || null, stock || 0]
      );
      
      const nuevoProducto = {
        id: result.insertId,
        nombre,
        precio,
        categoria,
        descripcion,
        imagen_url,
        stock,
        is_active: true
      };
      
      res.status(201).json(nuevoProducto);
    } catch (error) {
      console.error('Error creating producto:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // PUT actualizar producto (admin)
  app.put('/api/productos/:id', async (req, res) => {
    try {
      const { nombre, precio, categoria, descripcion, imagen_url, stock } = req.body;
      
      const [result] = await pool.execute(
        `UPDATE productos 
        SET nombre = ?, precio = ?, categoria = ?, descripcion = ?, imagen_url = ?, stock = ?
        WHERE id = ? AND is_active = TRUE`,
        [nombre, precio, categoria, descripcion || null, imagen_url || null, stock || 0, req.params.id]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      
      res.json({ success: true, message: 'Producto actualizado' });
    } catch (error) {
      console.error('Error updating producto:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // DELETE producto 
  app.delete('/api/productos/:id', async (req, res) => {
    try {
      const id = req.params.id;
      
      const [result] = await pool.execute(
        'UPDATE productos SET is_active = FALSE WHERE id = ?',
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      res.json({ success: true });

    } catch (error) {
      console.error('Error eliminando producto:', error);
      res.status(500).json({ error: 'Error del servidor' });
    }
  });

  // ENDPOINTS PARA CARRITO (BASE DE DATOS)
  // GET carrito del usuario
  app.get('/api/carrito', async (req, res) => {
    try {
      const usuario_id = 2;
      
      const [rows] = await pool.execute(`
        SELECT 
          c.id as carrito_id,  -- <- ¡IMPORTANTE! Este es el ID de la tabla carrito
          c.producto_id,
          c.cantidad,
          c.added_at,
          p.nombre,
          p.precio,
          p.imagen_url,
          p.categoria 
        FROM carrito c
        JOIN productos p ON c.producto_id = p.id
        WHERE c.usuario_id = ? AND p.is_active = TRUE
        ORDER BY c.added_at DESC
      `, [usuario_id]);
      
      res.json(rows);
    } catch (error) {
      console.error('Error fetching carrito:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
  // POST agregar al carrito
  app.post('/api/carrito', async (req, res) => {
    try {
      const { productoId, cantidad = 1 } = req.body;
      const usuario_id = 2; // Por ahora usuario fijo
      
      // Verificar que el producto existe y tiene stock
      const [producto] = await pool.execute(
        'SELECT * FROM productos WHERE id = ? AND is_active = TRUE AND stock > 0',
        [productoId]
      );
      
      if (producto.length === 0) {
        return res.status(404).json({ error: 'Producto no disponible' });
      }
      
      // Verificar si ya está en el carrito
      const [existe] = await pool.execute(
        'SELECT * FROM carrito WHERE usuario_id = ? AND producto_id = ?',
        [usuario_id, productoId]
      );
      
      if (existe.length > 0) {
        // Actualizar cantidad
        await pool.execute(
          'UPDATE carrito SET cantidad = cantidad + ? WHERE id = ?',
          [cantidad, existe[0].id]
        );
      } else {
        // Insertar nuevo
        await pool.execute(
          'INSERT INTO carrito (usuario_id, producto_id, cantidad) VALUES (?, ?, ?)',
          [usuario_id, productoId, cantidad]
        );
      }
      
      res.json({ 
        success: true, 
        message: 'Producto agregado al carrito',
        producto: producto[0]
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // PUT actualizar cantidad en carrito
  app.put('/api/carrito/:itemId', async (req, res) => {
    try {
      const { cantidad } = req.body;
      const itemId = req.params.itemId;
      const usuario_id = 2;
      
      if (cantidad < 1) {
        return res.status(400).json({ error: 'La cantidad debe ser al menos 1' });
      }
      
      const [result] = await pool.execute(
        'UPDATE carrito SET cantidad = ? WHERE id = ? AND usuario_id = ?',
        [cantidad, itemId, usuario_id]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Item no encontrado en el carrito' });
      }
      
      res.json({ success: true, message: 'Cantidad actualizada' });
    } catch (error) {
      console.error('Error updating cart item:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // DELETE eliminar del carrito
  app.delete('/api/carrito/:itemId', async (req, res) => {
    try {
      const itemId = req.params.itemId;
      const usuario_id = 2;
      
      const [result] = await pool.execute(
        'DELETE FROM carrito WHERE id = ? AND usuario_id = ?',
        [itemId, usuario_id]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Item no encontrado en el carrito' });
      }
      
      res.json({ success: true, message: 'Producto eliminado del carrito' });
    } catch (error) {
      console.error('Error removing from cart:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // DELETE vaciar carrito
  app.delete('/api/carrito', async (req, res) => {
    try {
      const usuario_id = 2;
      
      await pool.execute(
        'DELETE FROM carrito WHERE usuario_id = ?',
        [usuario_id]
      );
      
      res.json({ success: true, message: 'Carrito vaciado' });
    } catch (error) {
      console.error('Error clearing cart:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
  
  // ENDPOINTS PARA COMENTARIOS

  // GET comentarios de un producto
  app.get('/api/comentarios/producto/:productoId', async (req, res) => {
    try {
      const [rows] = await pool.execute(
        `SELECT c.*, u.username 
        FROM comentarios c
        JOIN usuarios u ON c.usuario_id = u.id
        WHERE c.producto_id = ?
        ORDER BY c.created_at DESC`,
        [req.params.productoId]
      );
      res.json(rows);
    } catch (error) {
      console.error('Error fetching comentarios:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // POST crear comentario
app.post('/api/comentarios', async (req, res) => {
  try {
    const { productoId, comentario, usuarioId } = req.body;

    // Si no viene usuarioId, usa 2 para no romper nada
    const usuario_id = usuarioId || 2;

    const [result] = await pool.execute(
      'INSERT INTO comentarios (usuario_id, producto_id, comentario) VALUES (?, ?, ?)',
      [usuario_id, productoId, comentario]
    );

    res.status(201).json({
      id: result.insertId,
      usuario_id,
      producto_id: productoId,
      comentario,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating comentario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


  // ENDPOINTS PARA AUTENTICACIÓN (BÁSICO)

  // POST login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Buscar usuario por username o email
    const [users] = await pool.execute(
      'SELECT * FROM usuarios WHERE username = ? OR email = ?',
      [username, username]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const user = users[0];

    // 2. Verificar contraseña encriptada
    const passwordOk = await bcrypt.compare(password, user.password);
    if (!passwordOk) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // 3. Verificar si el usuario está activo
    if (user.is_active === 0) {
      return res.status(403).json({ error: 'Usuario inactivo' });
    }

    // 4. Responder en el formato que espera login-backend.js
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token: 'token-simulado'
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

  // POST registro (con contraseña encriptada)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // 1. Verificar si usuario existe
    const [existing] = await pool.execute(
      'SELECT id FROM usuarios WHERE username = ? OR email = ?',
      [username, email]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Usuario o email ya registrado' });
    }

    // 2. Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Insertar nuevo usuario (role por defecto = 'cliente')
    const [result] = await pool.execute(
      'INSERT INTO usuarios (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );
    
    // 4. Responder
    res.status(201).json({
      success: true,
      user: {
        id: result.insertId,
        username,
        email,
        role: 'cliente'
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


  // RUTAS DE SALUD Y PRUEBA

  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'online',
      proyecto: 'El Buen Libro - Backend',
      timestamp: new Date().toISOString(),
      endpoints: {
        productos: '/api/productos',
        categorias: '/api/productos/categoria/:categoria',
        carrito: '/api/carrito',
        comentarios: '/api/comentarios',
        auth: '/api/auth'
      }
    });
  });

  // Ruta raíz
  app.get('/', (req, res) => {
    res.json({
      message: 'API del Buen Libro - Tienda de Mangas y Comics',
      version: '1.0.0',
      endpoints: 'Visita /api/health para más información'
    });
  });

  // INICIAR SERVIDOR
  app.listen(PORT, () => {
    console.log(`Puerto: ${PORT}`);
    console.log(`http://localhost:${PORT}`);
  });