import React, { memo } from 'react';
import { Document, Page, View, Text, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Create styles for PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
    borderBottom: '1px solid #666',
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subTitle: {
    fontSize: 12,
    color: '#555555',
    marginBottom: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  boardContainer: {
    marginBottom: 20,
    pageBreakInside: 'avoid',
  },
  flexRow: {
    flexDirection: 'row',
  },
  boardInfo: {
    fontSize: 10,
    marginBottom: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  boardNumber: {
    fontWeight: 'bold',
  },
  boardImage: {
    width: 300,
    height: 300,
    marginBottom: 10,
    alignSelf: 'center',
    objectFit: 'contain',
    objectPosition: 'center',
    border: '1px solid #ddd' // Görsel sınırlarını belirginleştirmek için
  },
  boardTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 10,
    marginBottom: 8,
    lineHeight: 1.4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 10,
    textAlign: 'center',
    color: '#555555',
    borderTop: '1px solid #999',
    paddingTop: 10,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 15,
    right: 30,
    fontSize: 10,
    color: '#555555',
  },
});

/**
 * PDFRenderer - Component for rendering chess positions to PDF using @react-pdf/renderer
 * This approach completely avoids the atob() errors by using React PDF's native image handling
 */
const PDFRenderer = memo(({
  positions = [],
  title = 'Satranç Pozisyonları',
  subtitle = '',
  author = 'ChessMino',
  showPageNumbers = true,
  footerText = '© ChessMino Satranç Eğitim Platformu',
}) => {  // Ensure positions is an array and filter out any invalid ones
  const positionsArray = Array.isArray(positions) 
    ? positions.filter(p => {
        // Position varlığını ve temel özelliklerini kontrol et
        const valid = p && (p.title || p.description || p.screenshot || p.image);
        
        // Görüntülerin varlığını ve formatını kontrol et
        const hasValidImage = p && (
          (typeof p.screenshot === 'string' && p.screenshot.startsWith('data:image/')) ||
          (typeof p.image === 'string' && p.image.startsWith('data:image/'))
        );
        
        if (p && !hasValidImage) {
          console.warn(`PDFRenderer: Position ${p.id || 'unknown'} has invalid image format`);
        }
        
        return valid;
      })
    : [];
  
  // Log for debugging
  console.debug(`PDFRenderer: Rendering PDF with ${positionsArray.length} positions`);
  
  const renderPosition = (position, index) => (
    <View style={styles.boardContainer} key={position.id || `position-${index}`}>
      <View style={styles.boardInfo}>
        <Text style={styles.boardNumber}>Pozisyon {index + 1}</Text>
        {position.id && (
          <Text style={{fontSize: 8, color: '#888'}}>{position.id}</Text>
        )}
      </View>
      
      {/* Board Image */}
      {(position.screenshot || position.image) ? (
        <Image 
          src={position.screenshot || position.image} 
          style={styles.boardImage}
          cache={false}
        />
      ) : (
        <View style={[styles.boardImage, {
          backgroundColor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }]}>
          <Text style={{color: '#888888'}}>Görüntü Yüklenemedi</Text>
        </View>
      )}
      
      {/* Position details */}
      {position.title && <Text style={styles.boardTitle}>{position.title}</Text>}
      {position.description && <Text style={styles.description}>{position.description}</Text>}
    </View>
  );
  
  return (
    <Document
      title={title}
      author={author}
      creator="ChessMino PDF Generator v2"
      producer="ChessMino"
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subTitle}>{subtitle}</Text>}
        </View>

        {/* Positions */}
        <View style={styles.section}>
          {positionsArray.length > 0 ? (
            positionsArray.map((position, index) => {
              console.debug(`PDFRenderer: Rendering position ${index + 1}, ID: ${position.id}`);
              
              return (
                <View 
                  key={`position-${position.id || index}`}
                  style={styles.boardContainer}
                  break={index > 0 && index % 2 === 0} // Break page after every two positions
                >
                  {renderPosition(position, index)}
                </View>
              );
            })
          ) : (
            <Text>Herhangi bir pozisyon eklenmemiş.</Text>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>{footerText}</Text>
        </View>
        
        {/* Page Number */}
        {showPageNumbers && (
          <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
            `${pageNumber} / ${totalPages}`
          )} fixed />
        )}
      </Page>
    </Document>
  );
});

PDFRenderer.displayName = 'PDFRenderer';

export default PDFRenderer;
