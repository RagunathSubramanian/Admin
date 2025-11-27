# Angular 19 Admin Dashboard Template

A fully scaffolded admin dashboard template built with Angular 19, featuring standalone components, signals, Tailwind CSS, and comprehensive developer tooling.

## 🚀 Features

- **Angular 19** with standalone components and signals
- **Tailwind CSS** for styling
- **Chart.js** integration for data visualization
- **Reactive Forms** with validation
- **Accessibility** features (ARIA labels, keyboard navigation, focus management)
- **Testing** setup with Karma/Jasmine and Playwright
- **Storybook** for component development
- **ESLint & Prettier** for code quality

## 📁 Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── guards/          # Route guards (auth, role-based)
│   │   └── services/        # Core services (API, Auth)
│   ├── layout/              # Layout components (AppShell, Topbar, Sidebar)
│   ├── pages/               # Feature pages (Dashboard, Users, Settings, Login)
│   └── shared/
│       └── components/      # Reusable UI components
├── assets/                  # Static assets
└── styles.css              # Global styles with Tailwind
```

## 🛠️ Installation

### Prerequisites

- Node.js >= 18.x
- npm >= 9.x

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Initialize Tailwind CSS** (if not already configured):
   ```bash
   npx tailwindcss init
   ```

3. **Initialize Storybook** (if not already configured):
   ```bash
   npx storybook@latest init
   ```

## 🎯 Development

### Start Development Server

```bash
npm start
```

Navigate to `http://localhost:4200/`

### Build for Production

```bash

ng build --configuration=production --base-href "/"   
npx angular-cli-ghpages --dir=dist/angular-admin-dashboard/browser --branch=gh-pages
npm run build:prod
```

### Run Tests

```bash
# Unit tests
npm test

# Unit tests with coverage
npm run test:coverage

# E2E tests
npm run e2e
```

### Linting

```bash
# Check for linting errors
npm run lint

# Auto-fix linting errors
npm run lint:fix

# Format code
npm run format
```

### Storybook

```bash
# Start Storybook
npm run storybook

# Build Storybook
npm run build-storybook
```

## 📦 Components

### Layout Components

- **AppShellComponent**: Main application shell with sidebar and topbar
- **TopbarComponent**: Top navigation bar with search, notifications, and user menu
- **SidebarComponent**: Side navigation with menu items

### UI Components

- **ButtonComponent**: Button with variants (primary, secondary, danger, ghost)
- **IconButtonComponent**: Icon-only button
- **CardComponent**: Container card with header, content, and footer
- **TableComponent**: Data table with sorting and pagination
- **ModalComponent**: Modal dialog with focus trap and keyboard navigation
- **FormFieldComponent**: Form field wrapper with label, hint, and error
- **BadgeComponent**: Badge with variants
- **AvatarComponent**: User avatar with initials fallback
- **TooltipComponent**: Tooltip component

## 🔧 Services

### ApiService

HTTP client service with mock adapter. Toggle between mock and real API:

```typescript
// In api.service.ts
private useMock = signal<boolean>(true); // Set to false for real API
```

### AuthService

Authentication service with signals for reactive state:

```typescript
// Check authentication status
authService.isAuthenticated() // boolean

// Get current user
authService.currentUser() // User | null
```

## 🛡️ Guards

### AuthGuard

Protects routes requiring authentication:

```typescript
{
  path: 'dashboard',
  canActivate: [authGuard],
  component: DashboardComponent
}
```

### RoleGuard

Protects routes requiring specific roles:

```typescript
{
  path: 'admin',
  canActivate: [authGuard, roleGuard('admin')],
  component: AdminComponent
}
```

## 📝 Adding New Components

1. **Generate component:**
   ```bash
   ng generate component shared/components/my-component --standalone
   ```

2. **Add to barrel export** (`src/app/shared/components/index.ts`):
   ```typescript
   export * from './my-component.component';
   ```

3. **Create Storybook story** (`src/app/shared/components/my-component.stories.ts`)

4. **Add unit tests** (`src/app/shared/components/my-component.spec.ts`)

## 🎨 Styling

This project uses Tailwind CSS. Customize the theme in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: { /* ... */ }
    }
  }
}
```

## 🧪 Testing

### Unit Tests

Tests are written with Jasmine and run with Karma. Example:

```typescript
describe('MyComponent', () => {
  it('should create', () => {
    const component = new MyComponent();
    expect(component).toBeTruthy();
  });
});
```

### E2E Tests

E2E tests use Playwright. See `e2e/example.spec.ts` for examples.

## 📚 State Management

This template uses Angular Signals for app-level state. For more complex state management, consider:

- **NgRx** (commented out folder structure provided)
- **Akita**
- **NGXS**

## 🔐 Authentication

The authentication is currently stubbed. To implement real authentication:

1. Update `AuthService.login()` to call your API
2. Implement token storage (use secure storage in production)
3. Add token refresh logic
4. Update `AuthGuard` to validate tokens

## 📊 Charts

Charts are implemented using Chart.js with `ng2-charts`. See `DashboardComponent` for examples.

## ♿ Accessibility

- ARIA labels on interactive elements
- Keyboard navigation support
- Focus management in modals
- Semantic HTML

## 🚀 Deployment

1. Build the application:
   ```bash
   npm run build:prod
   ```

2. Deploy the `dist/angular-admin-dashboard` folder to your hosting provider

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Note**: This is a template project. Remember to:
- Replace mock data with real API calls
- Implement actual authentication
- Configure environment variables
- Set up CI/CD pipelines
- Add error monitoring
- Configure analytics

