# Spug Web Frontend

## Project Architecture

### Directory Structure

```
qa_web/
├── src/                    # Source code
│   ├── components/        # Reusable components
│   ├── layout/           # Layout components (Header, Sider, Footer)
│   ├── libs/             # Utility functions and services
│   ├── pages/            # Page components
│   └── routes.js         # Route configurations
├── public/               # Static files
└── package.json         # Dependencies
```

### Core Components

1. **Layout System** (`src/layout/`)
   - `Header.js`: Top navigation bar
   - `Sider.js`: Sidebar menu
   - `Footer.js`: Footer component
   - `index.js`: Main layout component

2. **Authentication** 
   - Token-based authentication , set in pages/login/index.js
   - Route protection via `PrivateRoute` in app.js

3. **Routing** (`src/routes.js`)
   - Centralized route configuration
   - Support for nested routes
   - Permission-based route rendering

### API Endpoints

The frontend communicates with these main API endpoints:

1. **Authentication**
   - `/api/account/login/` - User login
   - `/api/account/logout/` - User logout

2. **Navigation**
   - `/api/home/navigation/` - CRUD operations for navigation items

3. **System**
   - `/api/setting/about/` - System information

### Adding New Pages

To add a new page (e.g., cases.js with a table):

1. **Create the Component**
   ```javascript
   // src/pages/cases/index.js
   import React from 'react';
   import { Table, Button } from 'antd';
   import { http } from 'libs';

   function Cases() {
     // Component logic here
     return (
       <div>
         <Table />
         <Button />
       </div>
     );
   }

   export default Cases;
   ```

2. **Add Route and PrivateRoute**
   ```javascript
   // src/routes.js
   import CasesIndex from './pages/cases';

   export default [
     // ... existing routes
     {
       icon: <FileOutlined />,
       title: '案例管理',
       path: '/cases',
       component: CasesIndex
     }
   ];
   ```

   ```javascript
   // src/app.js
   
   ```

3. **API Integration**
   - Create API endpoints in the backend
   - Use the `http` utility from `libs` for API calls
   - Handle loading states and errors

### Best Practices

1. **State Management**
   - Use React hooks for local state
   - Utilize MobX for global state when needed
   - Keep state close to where it's used

2. **Code Organization**
   - Group related components in feature folders
   - Use index.js files for cleaner imports
   - Keep components small and focused

3. **Error Handling**
   - Use try-catch blocks for async operations
   - Show user-friendly error messages
   - Log errors appropriately

4. **Performance**
   - Use React.memo for expensive components
   - Implement proper loading states
   - Optimize API calls with caching

### Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm start
   ```

3. Build for production:
   ```bash
   npm run build
   ```

### Security Considerations

1. **Authentication**
   - Token stored in localStorage
   - Automatic token refresh
   - Secure route protection

2. **API Calls**
   - CSRF protection
   - Request/Response interceptors
   - Proper error handling

3. **Permissions**
   - Role-based access control
   - Frontend route protection
   - API endpoint protection
