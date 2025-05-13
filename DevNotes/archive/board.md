# Satranç Tahtası Düzenleyici (BasicBoardPage.jsx) Geliştirme Kılavuzu

## İçindekiler
1. [Genel Bakış](#genel-bakış)
2. [Geliştirme Aşamaları](#geliştirme-aşamaları)
3. [Karşılaşılan Sorunlar ve Çözümleri](#karşılaşılan-sorunlar-ve-çözümleri)
4. [Şahsız Konum Oluşturma](#şahsız-konum-oluşturma)
5. [Kaçınılması Gereken Yanılgılar](#kaçınılması-gereken-yanılgılar)
6. [İyi Uygulama Örnekleri](#iyi-uygulama-örnekleri)
7. [İleri Seviye Özellikler](#ileri-seviye-özellikler)

## Genel Bakış

`BasicBoardPage.jsx`, sürükle-bırak mantığıyla çalışan interaktif bir satranç tahtası düzenleyicisidir. Kullanıcılar taş paletlerinden taşları sürükleyerek satranç konumları oluşturabilir, önceden tanımlanmış pozisyonları kullanabilir veya FEN notasyonu ile pozisyonları yükleyebilir. En önemli özelliklerinden biri, şahsız konumları da desteklemesidir.

## Geliştirme Aşamaları

### 1. Temel Bileşenlerin Kurulumu

```jsx
import React, { useState, useMemo, useEffect, useRef } from "react";
import { Chessboard, ChessboardDnDProvider, SparePiece } from "react-chessboard";
import { ExtendedChess } from "../../utils/chess/ExtendedChess.js";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useId } from "react";
import useChessStore from '../../store/useChessStore';
import { CustomDragLayer } from './CustomDragLayer';