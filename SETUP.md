# Quick Setup Guide

## Initial Setup Commands

After cloning or downloading this template, run these commands:

### 1. Install Dependencies

```bash
npm install
```

**Note:** The project uses `--legacy-peer-deps` (configured in `.npmrc`) to handle peer dependency conflicts with `ng2-charts` and Angular 19. This is safe and won't affect functionality.

### 2. Initialize Tailwind CSS (if needed)

The Tailwind config is already set up, but if you need to regenerate:

```bash
npx tailwindcss init
```

### 3. Initialize Storybook (if needed)

Storybook config is already included, but to reinitialize:

```bash
npx storybook@latest init
```

### 4. Start Development Server

```bash
npm start
```

The app will be available at `http://localhost:4200`

## Next Steps

1. **Configure Environment Variables**
   - Create `src/environments/environment.ts` and `environment.prod.ts`
   - Add API endpoints and configuration

2. **Update API Service**
   - Set `useMock` to `false` in `src/app/core/services/api.service.ts`
   - Configure base URL from environment

3. **Implement Authentication**
   - Update `AuthService.login()` to call your authentication API
   - Implement token refresh logic
   - Configure secure token storage

4. **Customize Theme**
   - Update colors in `tailwind.config.js`
   - Modify component styles as needed

5. **Add Real Data**
   - Replace mock data in components with API calls
   - Implement proper error handling

## Common Issues

### Chart.js not working
Make sure `ng2-charts` and `chart.js` are installed:
```bash
npm install chart.js ng2-charts
```

### Tailwind styles not applying
Ensure `postcss.config.js` and `tailwind.config.js` are in the root directory.

### Storybook not starting
Try reinstalling Storybook:
```bash
npm install --save-dev @storybook/angular @storybook/addon-essentials
```

