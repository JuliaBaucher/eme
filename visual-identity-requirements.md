# EME Monaco - Visual Identity Requirements
## Extended Monaco Entreprises - Design System Specifications

Based on analysis of eme.gouv.mc and government digital service standards.

---

## 1. COLOR PALETTE

### Primary Colors
```css
:root {
  /* Monaco Official Colors */
  --monaco-red: #CE1126;           /* RGB(206, 17, 38) - Monaco flag red */
  --monaco-red-rgb: 206, 17, 38;
  
  --monaco-white: #FFFFFF;         /* RGB(255, 255, 255) - Monaco flag white */
  --monaco-white-rgb: 255, 255, 255;
  
  /* Government Digital Service Colors */
  --primary-blue: #003366;         /* RGB(0, 51, 102) - Authority, trust */
  --primary-blue-rgb: 0, 51, 102;
  
  --secondary-blue: #0066CC;       /* RGB(0, 102, 204) - Interactive elements */
  --secondary-blue-rgb: 0, 102, 204;
}
```

### Functional Colors
```css
:root {
  /* Status Colors */
  --success-green: #28A745;        /* RGB(40, 167, 69) */
  --success-green-rgb: 40, 167, 69;
  
  --warning-orange: #FFC107;       /* RGB(255, 193, 7) */
  --warning-orange-rgb: 255, 193, 7;
  
  --error-red: #DC3545;           /* RGB(220, 53, 69) */
  --error-red-rgb: 220, 53, 69;
  
  --info-blue: #17A2B8;           /* RGB(23, 162, 184) */
  --info-blue-rgb: 23, 162, 184;
}
```

### Neutral Colors
```css
:root {
  /* Grays */
  --gray-900: #212529;            /* RGB(33, 37, 41) - Primary text */
  --gray-800: #343A40;            /* RGB(52, 58, 64) - Secondary text */
  --gray-700: #495057;            /* RGB(73, 80, 87) - Muted text */
  --gray-600: #6C757D;            /* RGB(108, 117, 125) - Placeholder */
  --gray-500: #ADB5BD;            /* RGB(173, 181, 189) - Borders */
  --gray-400: #CED4DA;            /* RGB(206, 212, 218) - Light borders */
  --gray-300: #DEE2E6;            /* RGB(222, 226, 230) - Dividers */
  --gray-200: #E9ECEF;            /* RGB(233, 236, 239) - Light backgrounds */
  --gray-100: #F8F9FA;            /* RGB(248, 249, 250) - Page background */
}
```

### Usage Rules
```css
/* DO - Correct Usage */
.primary-action {
  background-color: var(--secondary-blue);
  color: var(--monaco-white);
}

.government-header {
  background-color: var(--primary-blue);
  color: var(--monaco-white);
}

.monaco-accent {
  border-left: 4px solid var(--monaco-red);
}

/* DON'T - Incorrect Usage */
.avoid-red-text {
  color: var(--monaco-red); /* Don't use Monaco red for body text */
}

.avoid-low-contrast {
  background-color: var(--gray-300);
  color: var(--gray-400); /* Insufficient contrast */
}
```

---

## 2. TYPOGRAPHY

### Font Stack
```css
:root {
  /* Primary Font - Government Standard */
  --font-primary: 'Source Sans Pro', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  
  /* Secondary Font - Headings */
  --font-secondary: 'Roboto', 'Source Sans Pro', sans-serif;
  
  /* Monospace - Code/Data */
  --font-mono: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}
```

### Typography Scale
```css
:root {
  /* Font Sizes */
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.875rem;    /* 14px */
  --text-base: 1rem;      /* 16px - Base size */
  --text-lg: 1.125rem;    /* 18px */
  --text-xl: 1.25rem;     /* 20px */
  --text-2xl: 1.5rem;     /* 24px */
  --text-3xl: 1.875rem;   /* 30px */
  --text-4xl: 2.25rem;    /* 36px */
  --text-5xl: 3rem;       /* 48px */
  
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

### Typography Hierarchy
```css
/* Headings */
.h1, h1 {
  font-family: var(--font-secondary);
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  color: var(--primary-blue);
  margin-bottom: 1.5rem;
}

.h2, h2 {
  font-family: var(--font-secondary);
  font-size: var(--text-3xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-tight);
  color: var(--primary-blue);
  margin-bottom: 1.25rem;
}

.h3, h3 {
  font-family: var(--font-secondary);
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-normal);
  color: var(--gray-900);
  margin-bottom: 1rem;
}

/* Body Text */
.body-large {
  font-family: var(--font-primary);
  font-size: var(--text-lg);
  font-weight: var(--font-normal);
  line-height: var(--leading-relaxed);
  color: var(--gray-800);
}

.body-normal {
  font-family: var(--font-primary);
  font-size: var(--text-base);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--gray-800);
}

.body-small {
  font-family: var(--font-primary);
  font-size: var(--text-sm);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--gray-700);
}
```

---

## 3. SPACING SYSTEM

### Base Spacing Scale
```css
:root {
  /* Spacing Scale (8px base) */
  --space-0: 0;
  --space-1: 0.25rem;    /* 4px */
  --space-2: 0.5rem;     /* 8px */
  --space-3: 0.75rem;    /* 12px */
  --space-4: 1rem;       /* 16px */
  --space-5: 1.25rem;    /* 20px */
  --space-6: 1.5rem;     /* 24px */
  --space-8: 2rem;       /* 32px */
  --space-10: 2.5rem;    /* 40px */
  --space-12: 3rem;      /* 48px */
  --space-16: 4rem;      /* 64px */
  --space-20: 5rem;      /* 80px */
  --space-24: 6rem;      /* 96px */
}
```

### Layout Spacing
```css
:root {
  /* Container Spacing */
  --container-padding: var(--space-4);
  --container-max-width: 1200px;
  
  /* Section Spacing */
  --section-padding-y: var(--space-16);
  --section-padding-x: var(--space-4);
  
  /* Component Spacing */
  --component-gap: var(--space-6);
  --element-gap: var(--space-4);
}
```

---

## 4. ICONS & IMAGERY

### Icon System
```css
:root {
  /* Icon Sizes */
  --icon-xs: 1rem;       /* 16px */
  --icon-sm: 1.25rem;    /* 20px */
  --icon-md: 1.5rem;     /* 24px */
  --icon-lg: 2rem;       /* 32px */
  --icon-xl: 2.5rem;     /* 40px */
}
```

### Icon Usage Rules
```css
/* Government Service Icons */
.icon-government {
  color: var(--primary-blue);
  fill: currentColor;
}

.icon-interactive {
  color: var(--secondary-blue);
  transition: color 0.2s ease;
}

.icon-interactive:hover {
  color: var(--primary-blue);
}

/* Status Icons */
.icon-success { color: var(--success-green); }
.icon-warning { color: var(--warning-orange); }
.icon-error { color: var(--error-red); }
.icon-info { color: var(--info-blue); }
```

### Imagery Guidelines
```css
/* Image Containers */
.image-container {
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.hero-image {
  aspect-ratio: 16/9;
  object-fit: cover;
}

.thumbnail {
  aspect-ratio: 1/1;
  object-fit: cover;
}
```

---

## 5. UI COMPONENTS

### Border Radius
```css
:root {
  --radius-none: 0;
  --radius-sm: 0.125rem;   /* 2px */
  --radius-md: 0.375rem;   /* 6px */
  --radius-lg: 0.5rem;     /* 8px */
  --radius-xl: 0.75rem;    /* 12px */
  --radius-full: 9999px;
}
```

### Shadows
```css
:root {
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
```

### Buttons
```css
/* Primary Button */
.btn-primary {
  background-color: var(--secondary-blue);
  color: var(--monaco-white);
  border: 2px solid var(--secondary-blue);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-family: var(--font-primary);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  transition: all 0.2s ease;
  cursor: pointer;
}

.btn-primary:hover {
  background-color: var(--primary-blue);
  border-color: var(--primary-blue);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

/* Secondary Button */
.btn-secondary {
  background-color: transparent;
  color: var(--secondary-blue);
  border: 2px solid var(--secondary-blue);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-family: var(--font-primary);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  transition: all 0.2s ease;
  cursor: pointer;
}

.btn-secondary:hover {
  background-color: var(--secondary-blue);
  color: var(--monaco-white);
}
```

### Cards
```css
.card {
  background-color: var(--monaco-white);
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.2s ease;
}

.card:hover {
  box-shadow: var(--shadow-md);
}

.card-header {
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--gray-200);
}

.card-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--primary-blue);
  margin: 0;
}
```

### Forms
```css
.form-group {
  margin-bottom: var(--space-5);
}

.form-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--gray-900);
  margin-bottom: var(--space-2);
}

.form-input {
  width: 100%;
  padding: var(--space-3);
  border: 2px solid var(--gray-400);
  border-radius: var(--radius-md);
  font-family: var(--font-primary);
  font-size: var(--text-base);
  color: var(--gray-900);
  background-color: var(--monaco-white);
  transition: border-color 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--secondary-blue);
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
}

.form-input:invalid {
  border-color: var(--error-red);
}
```

---

## 6. DO / DON'T EXAMPLES

### ✅ DO - Color Usage
```css
/* Correct: Use Monaco red as accent, not primary */
.highlight-box {
  border-left: 4px solid var(--monaco-red);
  background-color: var(--gray-100);
  padding: var(--space-4);
}

/* Correct: High contrast text */
.readable-text {
  color: var(--gray-900);
  background-color: var(--monaco-white);
}
```

### ❌ DON'T - Color Usage
```css
/* Wrong: Monaco red as primary background */
.wrong-background {
  background-color: var(--monaco-red); /* Too aggressive */
  color: var(--monaco-white);
}

/* Wrong: Low contrast */
.unreadable-text {
  color: var(--gray-500);
  background-color: var(--gray-400); /* Fails WCAG AA */
}
```

### ✅ DO - Typography
```css
/* Correct: Clear hierarchy */
.content-section h2 {
  font-size: var(--text-3xl);
  font-weight: var(--font-semibold);
  color: var(--primary-blue);
  margin-bottom: var(--space-4);
}

.content-section p {
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  color: var(--gray-800);
}
```

### ❌ DON'T - Typography
```css
/* Wrong: Poor hierarchy */
.bad-hierarchy h2 {
  font-size: var(--text-base); /* Too small for heading */
  font-weight: var(--font-normal); /* No emphasis */
}

.bad-hierarchy p {
  font-size: var(--text-xl); /* Larger than heading */
}
```

### ✅ DO - Spacing
```css
/* Correct: Consistent spacing */
.well-spaced-component {
  padding: var(--space-6);
  margin-bottom: var(--space-8);
}

.well-spaced-component > * + * {
  margin-top: var(--space-4);
}
```

### ❌ DON'T - Spacing
```css
/* Wrong: Inconsistent spacing */
.poorly-spaced {
  padding: 13px 27px; /* Random values */
  margin-bottom: 33px; /* Not from scale */
}
```

---

## 7. ACCESSIBILITY REQUIREMENTS

### Color Contrast
```css
/* Minimum contrast ratios (WCAG AA) */
:root {
  --min-contrast-normal: 4.5; /* Normal text */
  --min-contrast-large: 3.0;  /* Large text (18px+ or 14px+ bold) */
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  :root {
    --primary-blue: #000066;
    --gray-700: #000000;
  }
}
```

### Focus States
```css
/* Visible focus indicators */
.focusable:focus {
  outline: 2px solid var(--secondary-blue);
  outline-offset: 2px;
}

/* Skip to content link */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--primary-blue);
  color: var(--monaco-white);
  padding: var(--space-2) var(--space-4);
  text-decoration: none;
  border-radius: var(--radius-md);
  z-index: 1000;
}

.skip-link:focus {
  top: 6px;
}
```

### Responsive Design
```css
/* Mobile-first breakpoints */
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
}

/* Responsive typography */
@media (max-width: 768px) {
  .h1, h1 { font-size: var(--text-3xl); }
  .h2, h2 { font-size: var(--text-2xl); }
  
  .container {
    padding: var(--space-4);
  }
}
```

---

## 8. IMPLEMENTATION NOTES

### CSS Custom Properties Usage
- Use CSS custom properties for all design tokens
- Implement dark mode support through property overrides
- Ensure fallback values for older browsers

### Component Architecture
- Follow BEM methodology for CSS classes
- Create reusable component classes
- Maintain consistent naming conventions

### Performance Considerations
- Optimize font loading with font-display: swap
- Use system fonts as fallbacks
- Minimize CSS bundle size through purging unused styles

### Browser Support
- Support modern browsers (Chrome 90+, Firefox 88+, Safari 14+)
- Provide graceful degradation for older browsers
- Test across different devices and screen sizes