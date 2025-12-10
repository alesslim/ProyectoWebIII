DROP DATABASE IF EXISTS el_buen_libro_db;
CREATE DATABASE el_buen_libro_db;
USE el_buen_libro_db;

CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('cliente', 'admin') DEFAULT 'cliente',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE productos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(200) NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    categoria ENUM('Manga', 'Comic', 'Novela', 'Terror', 'Suspenso', 'Acción') NOT NULL,
    descripcion TEXT,
    imagen_url VARCHAR(500),
    stock INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE carrito (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT DEFAULT 1,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    UNIQUE KEY unique_carrito (usuario_id, producto_id)
);


CREATE TABLE comentarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    producto_id INT NOT NULL,
    comentario TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
);


INSERT INTO usuarios (username, email, password, role) VALUES 
('admin', 'admin@elbuenlibro.com', '$2a$10$TuHashDeAdmin123', 'admin'),
('cliente', 'cliente@elbuenlibro.com', '$2a$10$TuHashDeCliente123', 'cliente');

INSERT INTO productos (nombre, precio, categoria, imagen_url, stock) VALUES
('Fairytail Volumen', 150.00, 'Manga', 'https://m.media-amazon.com/images/I/81EIdomF4FL._AC_UF1000,1000_QL80_.jpg', 15),
('Heartstopper', 180.00, 'Comic', 'https://encantalibros.com/wp-content/uploads/2020/12/9789877475876.jpg', 25),
('Bajo la misma Estrella', 165.00, 'Novela', 'https://hips.hearstapps.com/vader-prod.s3.amazonaws.com/1636903987-51xwkWYYgkL._SL500_.jpg', 30),
('Dragon Ball', 349.00, 'Manga', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQt6cjrBcb7m4A5pUzkKZWdeQgSMjMApMs3Ew&s', 20),
('Dandadan', 599.00, 'Manga', 'https://preview.redd.it/dandadan-final-manga-cover-theory-v0-3rc2yr5pljld1.jpg', 12),
('One Piece', 150.00, 'Manga', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEgjU1nHebaqP4uN3sGzQzltyblD6pTGcB1Q&s', 8),
('Kimetsu no Yaiba', 150.00, 'Manga', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFJEz8HI8d21Fkd09OEnHXBknPxhfNdV8N0A&s', 8),
('Bleach', 150.00, 'Manga', 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhehTQV8x9JKwlRcrjq3LFovF3c2lzk9lyRkFJvnqwtOwhTRhQuvJI2gXxBMdOkTobB4s9iKMQQY7S1Ws_pHQa9wro9BZltLaniOWhclV6hKIF5Rmosxgay973OxPAy1Ax-FV5eNOhuxAXr/s1600/BLEACH57_c1.jpg', 8),
('Al filo de las sombras', 150.00, 'Terror', 'https://i0.wp.com/digitalibro.com/wp-content/uploads/sites/9/2019/12/Al-filo-de-las-sombras.-El-%C3%81ngel-de-la-noche-2-Brent-Weeks.jpg', 8),
('My hero academy', 150.00, 'Manga', 'https://pm1.aminoapps.com/6681/66ccf65cd2d9225f77fa3dd27d3d08a7e287206e_hq.jpg', 8),
('Donde aullan las clinas', 150.00, 'Novela', 'https://hips.hearstapps.com/vader-prod.s3.amazonaws.com/1742386526-516iWLHZrGL._SL500_.jpg', 8),
('Jojos', 150.00, 'Manga', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6mXBT14LIONUXLYyZhS8m5XOae9qmLjReBw&s', 8),
('Given Vol. 10', 1500.00, 'Manga', 'https://www.akiracomics.com/media/products/113553/113553-0-med.jpg', 8),
('Dakaretai otoko', 150.00, 'Manga', 'https://pbs.twimg.com/media/FC7CVbUWYAIoekJ.jpg', 8),
('Dos leones', 150.00, 'Manga', 'https://www.eliusweb.com/wp-content/uploads/2022/02/image-1-scaled.jpeg', 8),
('Black or white', 150.00, 'Comic', 'https://cdn.kobo.com/book-images/4e5ada74-7ff4-43ac-bd0e-4e73ea115dc3/353/569/90/False/black-or-white-vol-1-yaoi-manga.jpg', 25),
('Superman', 150.00, 'Comic', 'https://www.oldskull.net/wp-content/uploads/2014/03/infinite-crisis-superman.jpg', 25),
('Batnman', 150.00, 'Comic', 'https://i1.whakoom.com/large/22/3b/50c0d20af8f441b49a3d1632e894139a.jpg', 25),
('La paciencia silenciosa', 150.00, 'Acción', 'https://m.media-amazon.com/images/I/91DY3xdkv9L.jpg', 25),
('Deadpool', 150.00, 'Comic', 'https://i0.wp.com/comicbookdispatch.com/wp-content/uploads/2024/05/DPOOL2024003_Preview_page_1.jpeg', 25),
('Amanda Black', 150.00, 'Suspenso', 'https://i.blogs.es/dd6366/captura/450_1000.jpeg', 25),
('Los dioses del norte', 200.00, 'Terror', 'https://i.blogs.es/e1922e/81borxyvw8l/450_1000.jpeg', 25);

INSERT INTO comentarios (usuario_id, producto_id, comentario) VALUES
(2, 1, '¡Excelente servicio! Los mangas llegaron en perfecto estado y muy rápido.'),
(2, 2, '¡Excelente servicio! Los mangas llegaron en perfecto estado y muy rápido.');

