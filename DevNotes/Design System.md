# 🎨 ChessMino Design System

## 🎯 **DESIGN SYSTEM OVERVIEW**

### **Vision:**
Modern, accessible, chess-focused design language that scales from mobile to desktop while maintaining consistency and usability.

### **Design Principles:**
- 🎯 **Chess-Centric:** Board and piece visibility is paramount
- 📱 **Mobile-First:** Touch-friendly, responsive design
- ♿ **Accessible:** WCAG 2.1 AA compliant
- ⚡ **Performance:** Lightweight, fast loading
- 🎨 **Cohesive:** Consistent visual language across all components

---

## 🎨 **COLOR PALETTE**

### **Primary Colors:**
```css
:root {
  /* Chess Board Colors */
  --board-light: #F0D9B5;    /* Classic light squares */
  --board-dark: #B58863;     /* Classic dark squares */
  --board-highlight: #FFE135; /* Move highlights */
  --board-danger: #FF6B6B;   /* Checks, threats */
  
  /* Primary Brand */
  --primary-50: #EEF2FF;
  --primary-100: #E0E7FF;
  --primary-200: #C7D2FE;
  --primary-300: #A5B4FC;
  --primary-400: #818CF8;
  --primary-500: #6366F1;    /* Main brand color */
  --primary-600: #4F46E5;
  --primary-700: #4338CA;
  --primary-800: #3730A3;
  --primary-900: #312E81;
  
  /* Secondary (Chess piece hints) */
  --secondary-50: #F0FDF4;
  --secondary-100: #DCFCE7;
  --secondary-200: #BBF7D0;
  --secondary-300: #86EFAC;
  --secondary-400: #4ADE80;
  --secondary-500: #22C55E;   /* Success, correct moves */
  --secondary-600: #16A34A;
  --secondary-700: #15803D;
  --secondary-800: #166534;
  --secondary-900: #14532D;
}
```

### **Semantic Colors:**
```css
:root {
  /* Status Colors */
  --success: #22C55E;        /* Correct moves, completions */
  --error: #EF4444;          /* Wrong moves, errors */
  --warning: #F59E0B;        /* Hints, cautions */
  --info: #3B82F6;          /* Information, tips */
  
  /* Grays */
  --gray-50: #F9FAFB;
  --gray-100: #F3F4F6;
  --gray-200: #E5E7EB;
  --gray-300: #D1D5DB;
  --gray-400: #9CA3AF;
  --gray-500: #6B7280;       /* Text secondary */
  --gray-600: #4B5563;       /* Text primary */
  --gray-700: #374151;
  --gray-800: #1F2937;
  --gray-900: #111827;       /* Text emphasis */
}
```

### **Dark Mode Support:**
```css
[data-theme="dark"] {
  /* Dark mode board colors */
  --board-light: #769656;
  --board-dark: #4A5A3A;
  --board-highlight: #FFE135;
  
  /* Dark mode UI colors */
  --bg-primary: #111827;
  --bg-secondary: #1F2937;
  --text-primary: #F9FAFB;
  --text-secondary: #D1D5DB;
}
```

---

## 📝 **TYPOGRAPHY**

### **Font Stack:**
```css
:root {
  /* Primary font for UI */
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  
  /* Monospace for notation */
  --font-mono: 'JetBrains Mono', 'Fira Code', Consolas, 'Liberation Mono', Menlo, monospace;
  
  /* Chess pieces font */
  --font-chess: 'Chess Cases', 'FreeSerif', serif;
}
```

### **Type Scale:**
```css
:root {
  /* Font Sizes */
  --text-xs: 0.75rem;    /* 12px - Small labels */
  --text-sm: 0.875rem;   /* 14px - Body small */
  --text-base: 1rem;     /* 16px - Body text */
  --text-lg: 1.125rem;   /* 18px - Large body */
  --text-xl: 1.25rem;    /* 20px - Small headings */
  --text-2xl: 1.5rem;    /* 24px - Medium headings */
  --text-3xl: 1.875rem;  /* 30px - Large headings */
  --text-4xl: 2.25rem;   /* 36px - Display */
  
  /* Line Heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
  
  /* Font Weights */
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

### **Typography Classes:**
```css
.text-display-1 {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  letter-spacing: -0.025em;
}

.text-heading-1 {
  font-size: var(--text-3xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-tight);
}

.text-heading-2 {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-tight);
}

.text-body {
  font-size: var(--text-base);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
}

.text-caption {
  font-size: var(--text-sm);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--gray-500);
}
```

---

## 📏 **SPACING & LAYOUT**

### **Spacing Scale:**
```css
:root {
  /* Base spacing unit: 4px */
  --space-0: 0;
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-5: 1.25rem;  /* 20px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-10: 2.5rem;  /* 40px */
  --space-12: 3rem;    /* 48px */
  --space-16: 4rem;    /* 64px */
  --space-20: 5rem;    /* 80px */
  --space-24: 6rem;    /* 96px */
}
```

### **Layout Grid:**
```css
:root {
  /* Container max-widths */
  --container-sm: 640px;
  --container-md: 768px;
  --container-lg: 1024px;
  --container-xl: 1280px;
  --container-2xl: 1536px;
  
  /* Breakpoints */
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}
```

### **Chess Board Sizing:**
```css
:root {
  /* Responsive board sizes */
  --board-size-xs: 280px;  /* Mobile portrait */
  --board-size-sm: 320px;  /* Mobile landscape */
  --board-size-md: 400px;  /* Tablet */
  --board-size-lg: 500px;  /* Desktop */
  --board-size-xl: 600px;  /* Large desktop */
  
  /* Square sizes (board-size / 8) */
  --square-size-xs: 35px;
  --square-size-sm: 40px;
  --square-size-md: 50px;
  --square-size-lg: 62.5px;
  --square-size-xl: 75px;
}
```

---

## 🎭 **COMPONENT STYLES**

### **Buttons:**
```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-2) var(--space-4);
  border-radius: 0.5rem;
  font-weight: var(--font-medium);
  font-size: var(--text-sm);
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid transparent;
}

.btn-primary {
  background: var(--primary-500);
  color: white;
  border-color: var(--primary-500);
}

.btn-primary:hover {
  background: var(--primary-600);
  border-color: var(--primary-600);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.btn-secondary {
  background: transparent;
  color: var(--gray-600);
  border-color: var(--gray-300);
}

.btn-success {
  background: var(--success);
  color: white;
}

.btn-error {
  background: var(--error);
  color: white;
}

/* Size variants */
.btn-sm {
  padding: var(--space-1) var(--space-3);
  font-size: var(--text-xs);
}

.btn-lg {
  padding: var(--space-3) var(--space-6);
  font-size: var(--text-base);
}
```

### **Cards:**
```css
.card {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition: all 0.2s ease;
}

.card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
}

.card-header {
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--gray-200);
}

.card-body {
  padding: var(--space-6);
}

.card-footer {
  padding: var(--space-4) var(--space-6);
  background: var(--gray-50);
  border-top: 1px solid var(--gray-200);
}
```

### **Chess-Specific Components:**
```css
/* Puzzle Navigation Grid */
.puzzle-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: var(--space-2);
  max-width: 300px;
  margin: 0 auto;
}

.puzzle-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  font-weight: var(--font-semibold);
  font-size: var(--text-sm);
  border: 2px solid transparent;
  transition: all 0.2s ease;
  cursor: pointer;
}

.puzzle-cell--completed {
  background: var(--success);
  color: white;
  border-color: var(--secondary-600);
}

.puzzle-cell--current {
  background: var(--primary-500);
  color: white;
  border-color: var(--primary-600);
  animation: pulse 2s infinite;
}

.puzzle-cell--available {
  background: var(--gray-100);
  color: var(--gray-600);
  border-color: var(--gray-300);
}

.puzzle-cell--locked {
  background: var(--gray-50);
  color: var(--gray-400);
  cursor: not-allowed;
  opacity: 0.5;
}

/* Board highlighting */
.board-highlight-move {
  background: rgba(255, 225, 53, 0.5) !important;
}

.board-highlight-check {
  background: rgba(239, 68, 68, 0.5) !important;
}

.board-highlight-hint {
  background: rgba(245, 158, 11, 0.5) !important;
}
```

---

## 🎬 **ANIMATIONS & TRANSITIONS**

### **Animation Tokens:**
```css
:root {
  /* Timing functions */
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  
  /* Durations */
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 350ms;
  --duration-slower: 500ms;
}
```

### **Keyframe Animations:**
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0, 0, 0);
  }
  40%, 43% {
    transform: translate3d(0, -8px, 0);
  }
  70% {
    transform: translate3d(0, -4px, 0);
  }
  90% {
    transform: translate3d(0, -2px, 0);
  }
}

@keyframes slideInUp {
  from {
    transform: translate3d(0, 100%, 0);
    opacity: 0;
  }
  to {
    transform: translate3d(0, 0, 0);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
  20%, 40%, 60%, 80% { transform: translateX(4px); }
}
```

### **Transition Classes:**
```css
.transition-all {
  transition: all var(--duration-normal) var(--ease-in-out);
}

.transition-colors {
  transition: color var(--duration-normal) var(--ease-in-out),
              background-color var(--duration-normal) var(--ease-in-out),
              border-color var(--duration-normal) var(--ease-in-out);
}

.transition-transform {
  transition: transform var(--duration-normal) var(--ease-in-out);
}

/* Hover effects */
.hover-lift {
  transition: transform var(--duration-normal) var(--ease-out);
}

.hover-lift:hover {
  transform: translateY(-2px);
}
```

---

## 📱 **RESPONSIVE DESIGN**

### **Mobile-First Breakpoints:**
```css
/* Base styles for mobile (320px+) */
.container {
  width: 100%;
  padding: 0 var(--space-4);
}

/* Small devices (640px+) */
@media (min-width: 640px) {
  .container {
    max-width: var(--container-sm);
    margin: 0 auto;
  }
}

/* Medium devices (768px+) */
@media (min-width: 768px) {
  .container {
    max-width: var(--container-md);
    padding: 0 var(--space-6);
  }
}

/* Large devices (1024px+) */
@media (min-width: 1024px) {
  .container {
    max-width: var(--container-lg);
    padding: 0 var(--space-8);
  }
}

/* Extra large devices (1280px+) */
@media (min-width: 1280px) {
  .container {
    max-width: var(--container-xl);
  }
}
```

### **Chess Board Responsive Rules:**
```css
.chess-board-container {
  width: var(--board-size-xs);
  height: var(--board-size-xs);
}

@media (min-width: 480px) {
  .chess-board-container {
    width: var(--board-size-sm);
    height: var(--board-size-sm);
  }
}

@media (min-width: 768px) {
  .chess-board-container {
    width: var(--board-size-md);
    height: var(--board-size-md);
  }
}

@media (min-width: 1024px) {
  .chess-board-container {
    width: var(--board-size-lg);
    height: var(--board-size-lg);
  }
}

@media (min-width: 1280px) {
  .chess-board-container {
    width: var(--board-size-xl);
    height: var(--board-size-xl);
  }
}
```

---

## ♿ **ACCESSIBILITY**

### **Color Contrast:**
```css
/* Ensure WCAG AA compliance */
:root {
  --contrast-aa-normal: 4.5; /* Normal text */
  --contrast-aa-large: 3;    /* Large text */
  --contrast-aaa-normal: 7;  /* Enhanced */
  --contrast-aaa-large: 4.5; /* Enhanced large */
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  :root {
    --primary-500: #0066CC;
    --success: #008800;
    --error: #CC0000;
    --gray-600: #000000;
  }
}
```

### **Motion Preferences:**
```css
/* Respect reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### **Focus States:**
```css
.focus-ring {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}

/* Chess board focus for keyboard navigation */
.chess-square:focus {
  outline: 3px solid var(--primary-500);
  outline-offset: -3px;
  z-index: 10;
}
```

---

## 🎨 **DESIGN TOKENS IMPLEMENTATION**

### **CSS Custom Properties Structure:**
```css
/* tokens/colors.css */
:root {
  /* Color tokens are defined here */
}

/* tokens/typography.css */
:root {
  /* Typography tokens are defined here */
}

/* tokens/spacing.css */
:root {
  /* Spacing tokens are defined here */
}

/* tokens/animations.css */
:root {
  /* Animation tokens are defined here */
}
```

### **Component-Based CSS Architecture:**
```
styles/
├── tokens/
│   ├── colors.css
│   ├── typography.css
│   ├── spacing.css
│   └── animations.css
├── base/
│   ├── reset.css
│   ├── global.css
│   └── utilities.css
├── components/
│   ├── buttons.css
│   ├── cards.css
│   ├── forms.css
│   └── chess/
│       ├── board.css
│       ├── pieces.css
│       └── navigation.css
└── pages/
    ├── puzzle-page.css
    ├── lesson-page.css
    └── home-page.css
```

---

## 🎯 **IMPLEMENTATION STRATEGY**

### **Phase 1: Foundation** ⏰ `3 gün`
- Design tokens setup
- Base styles and utilities
- Core component styles
- Responsive grid system

### **Phase 2: Component Library** ⏰ `4 gün`
- Button variants
- Card components
- Form elements
- Chess-specific components

### **Phase 3: Page Layouts** ⏰ `3 gün`
- Puzzle page redesign
- Lesson page layout
- Navigation patterns
- Mobile optimizations

### **Phase 4: Polish & Testing** ⏰ `2 gün`
- Animation refinements
- Accessibility testing
- Cross-browser testing
- Performance optimization

---

## 📊 **DESIGN SYSTEM METRICS**

### **Performance Goals:**
- 🎯 CSS bundle size: <100KB
- ⚡ First paint: <1.5s
- 📱 Mobile performance score: >90
- 🔧 Build time impact: <20%

### **Consistency Goals:**
- 🎨 Design token coverage: >95%
- 📋 Component reusability: >80%
- ♿ Accessibility compliance: WCAG 2.1 AA
- 🔄 Design-code sync: <2 day lag

---

**🎯 OBJECTIVE: A cohesive, scalable design system that enhances the chess learning experience!**