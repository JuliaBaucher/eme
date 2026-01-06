# EME Monaco Chatbot

Assistant numérique officiel pour Extended Monaco Entreprises (EME) - Services de transformation digitale du Gouvernement Princier de Monaco.

## 🎯 Fonctionnalités

- **Assistant IA conversationnel** pour les services EME
- **Interface gouvernementale officielle** avec branding Monaco
- **Accessibilité WCAG 2.1 AA** complète
- **Responsive design** mobile-first
- **Sécurité renforcée** avec sanitisation XSS
- **Persistance locale** des conversations
- **Mode hors-ligne** avec gestion d'erreurs robuste

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+ 
- npm ou yarn

### Installation

```bash
# Cloner le projet
git clone https://github.com/JuliaBaucher/eme.git
cd eme

# Installer les dépendances
npm install

# Démarrer en mode développement
npm run dev
```

L'application sera disponible sur `http://localhost:3000`

### Scripts disponibles

```bash
# Développement
npm run dev

# Build de production
npm run build

# Prévisualisation du build
npm run preview

# Tests
npm run test
npm run test:ui
npm run test:coverage

# Linting
npm run lint
npm run type-check
```

## 🏗️ Architecture

### Structure du projet

```
src/
├── components/          # Composants UI
│   ├── ChatbotContainer.ts
│   ├── InputField.ts
│   ├── MessageContainer.ts
│   ├── MessageBubble.ts
│   └── TrustHeader.ts
├── services/           # Services métier
│   ├── ChatAPI.ts
│   ├── StorageManager.ts
│   ├── InputValidator.ts
│   └── ErrorHandler.ts
├── utils/              # Utilitaires
│   ├── sanitization.ts
│   └── accessibility.ts
├── styles/             # Styles CSS
│   ├── design-tokens.css
│   ├── components.css
│   └── main.css
├── types/              # Types TypeScript
│   └── interfaces.ts
└── tests/              # Tests
    ├── unit/
    ├── integration/
    └── properties/
```

### Technologies utilisées

- **TypeScript** - Typage statique
- **Vite** - Build tool moderne
- **Vitest** - Framework de test
- **fast-check** - Property-based testing
- **DOMPurify** - Sanitisation XSS
- **marked** - Rendu Markdown
- **CSS Custom Properties** - Design system

## 🎨 Design System

Le chatbot utilise le système de design officiel EME avec :

- **Couleurs Monaco** : Rouge #CE1126, Bleu gouvernemental #003366
- **Typographie** : Source Sans Pro, Roboto
- **Espacement** : Échelle basée sur 8px
- **Accessibilité** : Contraste 4.5:1, support clavier complet

## 🔒 Sécurité

- **Sanitisation XSS** avec DOMPurify
- **Content Security Policy** stricte
- **Validation d'entrée** robuste
- **Stockage local sécurisé**
- **Protection CSRF**

## ♿ Accessibilité

- **WCAG 2.1 AA** conforme
- **Support lecteur d'écran** complet
- **Navigation clavier** optimisée
- **Contraste élevé** disponible
- **Mouvement réduit** respecté

## 🧪 Tests

Le projet inclut une suite de tests complète :

- **Tests unitaires** pour les composants
- **Tests de propriétés** pour la validation
- **Tests d'intégration** pour les flux utilisateur
- **Tests d'accessibilité** automatisés

```bash
# Lancer tous les tests
npm run test

# Tests avec interface
npm run test:ui

# Couverture de code
npm run test:coverage
```

## 📱 Responsive Design

- **Mobile** : 320px - 768px
- **Tablet** : 768px - 1024px  
- **Desktop** : 1024px+
- **Cibles tactiles** : 44px minimum
- **Clavier virtuel** géré

## 🌐 Internationalisation

- **Langue principale** : Français
- **Support prévu** : Anglais, Italien
- **Format dates** : FR (dd/mm/yyyy)
- **Nombres** : Format français (1 234,56)

## 🔧 Configuration

### Variables d'environnement

```bash
# .env.local
VITE_API_URL=https://api.eme.gouv.mc/chat
VITE_APP_VERSION=1.0.0
```

### Configuration API

L'API EME doit implémenter :

```typescript
POST /chat
{
  "message": "string",
  "sessionId": "string", 
  "context": {
    "userType": "business" | "individual" | "government",
    "previousMessages": ChatMessage[],
    "language": "fr" | "en"
  }
}
```

## 📊 Monitoring

- **Core Web Vitals** surveillés
- **Erreurs** loggées et reportées
- **Performance** mesurée
- **Accessibilité** auditée

## 🚀 Déploiement

### Build de production

```bash
npm run build
```

### Serveur statique

Les fichiers générés dans `dist/` peuvent être servis par n'importe quel serveur web statique.

### Configuration serveur

```nginx
# nginx.conf
location / {
  try_files $uri $uri/ /index.html;
  
  # Headers de sécurité
  add_header X-Frame-Options DENY;
  add_header X-Content-Type-Options nosniff;
  add_header Referrer-Policy strict-origin-when-cross-origin;
}
```

## 📄 Licence

© 2024 Gouvernement Princier de Monaco - Tous droits réservés

## 🤝 Contribution

Ce projet suit les standards de développement du gouvernement monégasque. Pour contribuer :

1. Fork le projet
2. Créer une branche feature
3. Implémenter avec tests
4. Vérifier l'accessibilité
5. Soumettre une pull request

## 📞 Support

- **Email** : contact@eme.gouv.mc
- **Site web** : https://eme.gouv.mc
- **Documentation** : https://eme.gouv.mc/docs

---

**Extended Monaco Entreprises** - Accélérer la transformation numérique des entreprises monégasques