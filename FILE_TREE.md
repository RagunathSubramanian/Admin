# Angular 19 Admin Dashboard - File Tree

```
angular-admin-dashboard/
├── .storybook/
│   ├── main.ts
│   └── preview.ts
├── e2e/
│   └── example.spec.ts
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts
│   │   │   │   └── index.ts
│   │   │   └── services/
│   │   │       ├── api.service.ts
│   │   │       ├── auth.service.ts
│   │   │       └── index.ts
│   │   ├── layout/
│   │   │   ├── app-shell.component.ts
│   │   │   ├── sidebar.component.ts
│   │   │   ├── sidebar.component.html
│   │   │   ├── sidebar.component.css
│   │   │   ├── topbar.component.ts
│   │   │   ├── topbar.component.html
│   │   │   └── topbar.component.css
│   │   ├── pages/
│   │   │   ├── dashboard/
│   │   │   │   ├── dashboard.component.ts
│   │   │   │   ├── dashboard.component.html
│   │   │   │   └── dashboard.component.css
│   │   │   ├── login/
│   │   │   │   ├── login.component.ts
│   │   │   │   ├── login.component.html
│   │   │   │   └── login.component.css
│   │   │   ├── settings/
│   │   │   │   └── settings.component.ts
│   │   │   └── users/
│   │   │       ├── users.routes.ts
│   │   │       ├── user-list.component.ts
│   │   │       ├── user-list.component.html
│   │   │       ├── user-list.component.css
│   │   │       ├── user-detail.component.ts
│   │   │       ├── user-create.component.ts
│   │   │       ├── user-create.component.html
│   │   │       └── user-create.component.css
│   │   ├── shared/
│   │   │   └── components/
│   │   │       ├── avatar.component.ts
│   │   │       ├── badge.component.ts
│   │   │       ├── button.component.ts
│   │   │       ├── card.component.ts
│   │   │       ├── card.component.spec.ts
│   │   │       ├── card.stories.ts
│   │   │       ├── form-field.component.ts
│   │   │       ├── icon-button.component.ts
│   │   │       ├── modal.component.ts
│   │   │       ├── table.component.ts
│   │   │       ├── table.component.html
│   │   │       ├── tooltip.component.ts
│   │   │       └── index.ts
│   │   ├── app.component.ts
│   │   ├── app.component.spec.ts
│   │   └── app.routes.ts
│   ├── assets/
│   ├── index.html
│   ├── main.ts
│   ├── styles.css
│   └── favicon.ico
├── .eslintrc.json
├── .gitignore
├── .prettierrc
├── angular.json
├── karma.conf.js
├── package.json
├── playwright.config.ts
├── postcss.config.js
├── README.md
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.app.json
└── tsconfig.spec.json
```

## Key Directories

- **`src/app/core/`**: Core services and guards
- **`src/app/layout/`**: Layout components (shell, sidebar, topbar)
- **`src/app/pages/`**: Feature pages (dashboard, users, settings, login)
- **`src/app/shared/components/`**: Reusable UI components
- **`.storybook/`**: Storybook configuration
- **`e2e/`**: End-to-end tests

