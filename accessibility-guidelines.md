# EME Monaco - Accessibility Guidelines
## Extended Monaco Entreprises - WCAG 2.1 AA Compliance

---

## 1. COLOR CONTRAST REQUIREMENTS

### Minimum Contrast Ratios (WCAG 2.1 AA)
- **Normal text**: 4.5:1 minimum
- **Large text** (18px+ or 14px+ bold): 3.0:1 minimum
- **UI components**: 3.0:1 minimum
- **Graphical objects**: 3.0:1 minimum

### Approved Color Combinations
```css
/* ✅ WCAG AA Compliant Combinations */

/* High Contrast - Normal Text */
.text-primary { color: var(--gray-900); background: var(--monaco-white); } /* 21:1 */
.text-secondary { color: var(--primary-blue); background: var(--monaco-white); } /* 12.6:1 */
.text-muted { color: var(--gray-700); background: var(--monaco-white); } /* 7.2:1 */

/* Medium Contrast - Large Text Only */
.text-large-only { color: var(--gray-600); background: var(--monaco-white); } /* 4.1:1 */

/* Interactive Elements */
.link-primary { color: var(--secondary-blue); background: var(--monaco-white); } /* 8.2:1 */
.button-primary { color: var(--monaco-white); background: var(--secondary-blue); } /* 8.2:1 */
```

### ❌ Non-Compliant Combinations to Avoid
```css
/* These combinations fail WCAG AA standards */
.avoid-low-contrast {
  color: var(--gray-500); /* Only 3.4:1 ratio */
  background: var(--monaco-white);
}

.avoid-monaco-red-text {
  color: var(--monaco-red); /* Only 3.9:1 ratio */
  background: var(--monaco-white);
}
```

---

## 2. KEYBOARD NAVIGATION

### Focus Management
```css
/* Visible focus indicators for all interactive elements */
.focusable:focus {
  outline: 2px solid var(--secondary-blue);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

/* Enhanced focus for high contrast mode */
@media (prefers-contrast: high) {
  .focusable:focus {
    outline: 3px solid var(--primary-blue);
    outline-offset: 3px;
  }
}
```

### Tab Order Requirements
- Logical tab sequence following visual layout
- Skip links for main content areas
- Modal dialogs trap focus appropriately
- Hidden elements excluded from tab order

### Keyboard Shortcuts
```html
<!-- Skip to main content -->
<a href="#main-content" class="skip-link">Passer au contenu principal</a>

<!-- Skip to navigation -->
<a href="#main-nav" class="skip-link">Passer à la navigation</a>
```

---

## 3. SCREEN READER SUPPORT

### Semantic HTML Structure
```html
<!-- Proper heading hierarchy -->
<h1>Extended Monaco Entreprises</h1>
  <h2>Services Numériques</h2>
    <h3>FlashUP Tool Box</h3>

<!-- Landmark regions -->
<header role="banner">
<nav role="navigation" aria-label="Navigation principale">
<main role="main" id="main-content">
<aside role="complementary" aria-label="Informations complémentaires">
<footer role="contentinfo">
```

### ARIA Labels and Descriptions
```html
<!-- Form labels -->
<label for="email">Adresse e-mail *</label>
<input type="email" id="email" required aria-describedby="email-help">
<div id="email-help">Format: nom@exemple.com</div>

<!-- Button descriptions -->
<button aria-label="Fermer la boîte de dialogue">×</button>

<!-- Status messages -->
<div role="status" aria-live="polite" id="form-status"></div>
<div role="alert" aria-live="assertive" id="error-messages"></div>
```

### Screen Reader Only Content
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

---

## 4. RESPONSIVE DESIGN & MOBILE ACCESSIBILITY

### Touch Target Sizes
```css
/* Minimum 44px touch targets */
.btn, .nav-link, .form-input {
  min-height: 44px;
  min-width: 44px;
}

/* Adequate spacing between touch targets */
.touch-target + .touch-target {
  margin-left: var(--space-2); /* 8px minimum */
}
```

### Responsive Typography
```css
/* Scalable text that respects user preferences */
@media (max-width: 768px) {
  html {
    font-size: 16px; /* Never below 16px on mobile */
  }
  
  .h1 { font-size: clamp(1.875rem, 4vw, 2.25rem); }
  .h2 { font-size: clamp(1.5rem, 3vw, 1.875rem); }
}

/* Respect user's font size preferences */
@media (prefers-reduced-motion: no-preference) {
  html {
    font-size: max(16px, 1rem); /* Respects browser zoom */
  }
}
```

---

## 5. MOTION & ANIMATION

### Reduced Motion Support
```css
/* Respect user's motion preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Safe animations that can remain */
@media (prefers-reduced-motion: reduce) {
  .fade-in {
    opacity: 1; /* Skip fade animation */
  }
  
  .slide-in {
    transform: translateX(0); /* Skip slide animation */
  }
}
```

### Animation Guidelines
- Animations should not exceed 5 seconds
- Provide pause/stop controls for auto-playing content
- Avoid flashing content (max 3 flashes per second)
- Use `prefers-reduced-motion` media query

---

## 6. FORM ACCESSIBILITY

### Required Field Indicators
```html
<!-- Visual and programmatic indication -->
<label for="nom" class="form-label required">
  Nom complet
  <span aria-label="requis">*</span>
</label>
<input type="text" id="nom" required aria-describedby="nom-help">
<div id="nom-help" class="form-help">Votre nom et prénom</div>
```

### Error Handling
```html
<!-- Error state with ARIA -->
<label for="email-error" class="form-label">Adresse e-mail</label>
<input 
  type="email" 
  id="email-error" 
  aria-invalid="true"
  aria-describedby="email-error-msg"
  class="form-input error">
<div id="email-error-msg" class="form-error" role="alert">
  Veuillez saisir une adresse e-mail valide
</div>
```

### Form Validation
```css
/* Visual error states */
.form-input[aria-invalid="true"] {
  border-color: var(--error-red);
  box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.2);
}

.form-error {
  color: var(--error-red);
  font-size: var(--text-sm);
  margin-top: var(--space-1);
}
```

---

## 7. IMAGES & MEDIA

### Alternative Text Guidelines
```html
<!-- Informative images -->
<img src="logo-eme.png" alt="Extended Monaco Entreprises - Services numériques">

<!-- Decorative images -->
<img src="decoration.png" alt="" role="presentation">

<!-- Complex images -->
<img src="chart.png" alt="Graphique des services numériques" aria-describedby="chart-desc">
<div id="chart-desc">
  Répartition des services : 40% formation, 35% conseil, 25% support technique
</div>
```

### Video Accessibility
```html
<!-- Video with captions and transcript -->
<video controls>
  <source src="presentation.mp4" type="video/mp4">
  <track kind="captions" src="captions-fr.vtt" srclang="fr" label="Français">
  <track kind="descriptions" src="descriptions-fr.vtt" srclang="fr">
</video>
<a href="transcript.html">Transcription complète</a>
```

---

## 8. LANGUAGE & INTERNATIONALIZATION

### Language Declaration
```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Extended Monaco Entreprises</title>
</head>
```

### Language Changes
```html
<!-- Mixed language content -->
<p>
  Le programme <span lang="en">FlashUP</span> propose des formations en français.
</p>
```

---

## 9. TESTING CHECKLIST

### Automated Testing Tools
- **axe-core**: Accessibility engine for automated testing
- **WAVE**: Web accessibility evaluation tool
- **Lighthouse**: Google's accessibility audit
- **Pa11y**: Command line accessibility tester

### Manual Testing Requirements
- [ ] Keyboard-only navigation test
- [ ] Screen reader testing (NVDA, JAWS, VoiceOver)
- [ ] High contrast mode verification
- [ ] Mobile device testing
- [ ] Zoom testing up to 200%
- [ ] Color blindness simulation

### Browser Testing Matrix
- Chrome + NVDA (Windows)
- Firefox + NVDA (Windows)
- Safari + VoiceOver (macOS/iOS)
- Edge + Narrator (Windows)

---

## 10. COMPLIANCE DOCUMENTATION

### WCAG 2.1 AA Conformance Statement
```
Extended Monaco Entreprises (eme.gouv.mc) conforms to WCAG 2.1 level AA.
This conformance statement applies to the entire website.

Standards: Web Content Accessibility Guidelines 2.1
Conformance level: AA
Scope: Entire website (eme.gouv.mc)
Date: [Current Date]
```

### Accessibility Statement Template
```html
<!-- Link in footer -->
<a href="/accessibilite">Déclaration d'accessibilité</a>

<!-- Feedback mechanism -->
<p>
  Si vous rencontrez des difficultés d'accessibilité sur ce site, 
  contactez-nous à <a href="mailto:accessibilite@eme.gouv.mc">accessibilite@eme.gouv.mc</a>
</p>
```

---

## 11. IMPLEMENTATION PRIORITIES

### Phase 1 - Critical (Immediate)
1. Color contrast compliance
2. Keyboard navigation
3. Form accessibility
4. Image alt text
5. Heading structure

### Phase 2 - Important (Within 30 days)
1. ARIA implementation
2. Screen reader optimization
3. Mobile accessibility
4. Error handling
5. Focus management

### Phase 3 - Enhancement (Within 60 days)
1. Advanced ARIA patterns
2. Animation controls
3. Comprehensive testing
4. User feedback integration
5. Documentation updates

---

## 12. MAINTENANCE & MONITORING

### Regular Audits
- Monthly automated accessibility scans
- Quarterly manual testing sessions
- Annual comprehensive accessibility review
- User feedback integration process

### Team Training Requirements
- WCAG 2.1 guidelines understanding
- Screen reader usage basics
- Keyboard navigation patterns
- Inclusive design principles
- Testing methodology