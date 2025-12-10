// src/componentes/ReporteLibros.jsx
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    marginBottom: 10,
    fontSize: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginBottom: 5,
    paddingBottom: 4,
  },
  columnSmall: { width: '20%' },
  columnMedium: { width: '40%' },
  columnPrice: { width: '20%', textAlign: 'right' },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    paddingVertical: 4,
  },
});

const ReporteLibros = ({ libros }) => (
  <Document>
    <Page style={styles.page}>
      <Text style={styles.title}>Reporte de Libros Disponibles</Text>
      <Text style={styles.subtitle}>
        Fecha de generación: {new Date().toLocaleDateString()}
      </Text>

      <View style={styles.tableHeader}>
        <Text style={styles.columnSmall}>ID</Text>
        <Text style={styles.columnMedium}>Nombre</Text>
        <Text style={styles.columnSmall}>Categoría</Text>
        <Text style={styles.columnPrice}>Precio</Text>
      </View>

      {libros.map((libro) => (
        <View key={libro.id} style={styles.tableRow}>
          <Text style={styles.columnSmall}>{libro.id}</Text>
          <Text style={styles.columnMedium}>{libro.nombre}</Text>
          <Text style={styles.columnSmall}>{libro.categoria}</Text>
          <Text style={styles.columnPrice}>Bs {libro.precio}</Text>
        </View>
      ))}
    </Page>
  </Document>
);

export default ReporteLibros;
