# Test platform

A modern web application for importing, viewing, and managing Swagger/OpenAPI specifications.

## Features

- Import API specifications via file upload (.json, .yaml, .yml)
- Import API specifications via URL
- View and navigate API endpoints
- Save and manage multiple API specifications
- Modern, responsive UI with a three-column layout

## Development Guide

### Project Structure

```
client/
  ├── src/
  │   ├── components/        # React components
  │   ├── App.js            # Main application component
  │   └── App.css           # Global styles
  └── public/               # Static files

server.js             # Express backend server
```

### Component Development Guide

When adding new components to the application, follow these steps for consistency and maintainability:

1. **Create Component File**
   - Create a new file in `src/components/` directory
   - Use PascalCase for component names (e.g., `Toast.js`)
   - Basic component structure:
   ```jsx
   import React from 'react';
   import './ComponentName.css';

   const ComponentName = ({ props }) => {
     return (
       <div className="component-name">
         {/* Component content */}
       </div>
     );
   };

   export default ComponentName;
   ```

2. **Create Component Styles**
   - Create a matching CSS file (e.g., `Toast.css`)
   - Use component-specific class names to avoid conflicts
   - Follow BEM naming convention when applicable
   - Example:
   ```css
   .component-name {
     /* Base styles */
   }

   .component-name__element {
     /* Element styles */
   }

   .component-name--modifier {
     /* Modifier styles */
   }
   ```

3. **Integrate Component**
   - Import the component in `App.js` or parent component
   - Add necessary state management
   - Add required props and event handlers
   - Example:
   ```jsx
   import ComponentName from './components/ComponentName';

   function App() {
     const [state, setState] = useState(initialState);

     return (
       <ComponentName
         prop1={value1}
         prop2={value2}
         onEvent={handleEvent}
       />
     );
   }
   ```

### React状态管理：认识useState

#### 什么是useState？

`useState` 是React的一个Hook（钩子函数），它让你能在函数组件中添加状态管理。可以把状态理解为组件的"记忆"——用来存储那些会随时间变化的值。

#### 基本语法

```javascript
const [值, 设置值的函数] = useState(初始值);
```

- `值`：当前的状态值
- `设置值的函数`：用来更新状态的函数
- `初始值`：组件首次渲染时的状态值

#### 实际例子

```javascript
// 1. 简单的计数器
const [count, setCount] = useState(0);

// 使用状态
<button onClick={() => setCount(count + 1)}>
  当前计数：{count}
</button>

// 2. 管理对象类型的状态
const [user, setUser] = useState({
  name: '',
  email: ''
});

// 更新对象状态
setUser({
  ...user,           // 保留其他属性
  name: '张三'       // 更新特定属性
});

// 3. 管理数组类型的状态
const [items, setItems] = useState([]);

// 添加新项到数组
setItems([...items, newItem]);
```

#### 状态更新规则

1. **状态是只读的**
   ```javascript
   // ❌ 错误：直接修改状态
   user.name = '张三';

   // ✅ 正确：使用设置函数更新
   setUser({ ...user, name: '张三' });
   ```

2. **状态更新是异步的**
   ```javascript
   // ❌ 可能不会如预期工作
   setCount(count + 1);
   setCount(count + 1);

   // ✅ 使用函数式更新处理依赖前值的情况
   setCount(prevCount => prevCount + 1);
   setCount(prevCount => prevCount + 1);
   ```

3. **状态更新会触发重新渲染**
   - 当状态改变时，组件会重新渲染
   - 子组件可能也会重新渲染

#### 我们项目中的使用场景

```javascript
// 1. 简单的布尔值
const [loading, setLoading] = useState(false);
// 用于加载状态、开关状态等

// 2. 表单输入
const [urlInput, setUrlInput] = useState('');
// 用于控制表单输入

// 3. 复杂对象
const [toast, setToast] = useState({
  visible: false,
  message: '',
  type: 'success'
});
// 用于管理有多个属性的组件状态

// 4. 数组
const [apis, setApis] = useState([]);
// 用于管理列表、集合等
```

#### 最佳实践

1. **命名规范**
   ```javascript
   const [isLoading, setIsLoading] = useState(false);    // 布尔值用is开头
   const [count, setCount] = useState(0);                // 数字直接用名词
   const [user, setUser] = useState(null);               // 对象用描述性名词
   const [items, setItems] = useState([]);               // 数组用复数
   ```

2. **状态组织**
   ```javascript
   // ❌ 过多分散的状态
   const [firstName, setFirstName] = useState('');
   const [lastName, setLastName] = useState('');
   const [email, setEmail] = useState('');

   // ✅ 组合相关状态
   const [userForm, setUserForm] = useState({
     firstName: '',
     lastName: '',
     email: ''
   });
   ```

3. **初始状态**
   ```javascript
   // ❌ 初始状态中包含复杂计算
   const [data, setData] = useState(复杂计算());

   // ✅ 使用延迟初始化
   const [data, setData] = useState(() => 复杂计算());
   ```

4. **状态更新技巧**
   ```javascript
   // 更新数组
   setItems(prevItems => [...prevItems, newItem]);

   // 更新对象
   setUser(prevUser => ({
     ...prevUser,
     name: newName
   }));
   ```

#### 调试技巧

1. **状态变化日志**
   ```javascript
   useEffect(() => {
     console.log('状态已更新:', someState);
   }, [someState]);
   ```

2. **常见问题**
   - 状态没有立即更新（因为异步特性）
   - 忘记展开之前的状态（...）
   - 直接修改状态而不是用设置函数

#### 什么时候使用useState

- 组件特定的状态管理
- 简单且不需要共享的状态
- UI状态（加载中、错误信息、表单输入等）
- 需要触发重新渲染的场景

### React副作用管理：认识useEffect

#### 什么是useEffect？

`useEffect` 是React的另一个重要Hook，用于处理组件中的"副作用"。副作用包括：
- 数据获取（API调用）
- 订阅数据
- 手动修改DOM
- 设置定时器
- 记录日志
等不直接与渲染UI相关的操作。

#### 基本语法

```javascript
useEffect(() => {
  // 副作用代码
  return () => {
    // 清理代码（可选）
  };
}, [依赖项数组]);
```

- `副作用代码`：需要执行的操作
- `清理代码`：在组件卸载或依赖项变化前执行的清理操作
- `依赖项数组`：决定effect何时重新执行的依赖列表

#### 实际例子

```javascript
// 1. 基础用法：组件挂载时获取数据
useEffect(() => {
  async function fetchData() {
    const response = await axios.get('/api/data');
    setData(response.data);
  }
  fetchData();
}, []); // 空数组表示只在挂载时执行一次

// 2. 监听状态变化
useEffect(() => {
  console.log('count改变了:', count);
}, [count]); // 当count改变时执行

// 3. 清理副作用
useEffect(() => {
  const subscription = dataSource.subscribe(handleData);
  
  // 返回清理函数
  return () => {
    subscription.unsubscribe();
  };
}, [dataSource]); // 当dataSource改变时重新订阅

// 4. 不提供依赖数组：每次渲染都执行
useEffect(() => {
  document.title = `当前计数: ${count}`;
}); // 没有第二个参数
```

#### 依赖项规则

1. **空依赖数组**
   ```javascript
   // 只在组件挂载时执行一次
   useEffect(() => {
     console.log('组件已挂载');
   }, []);
   ```

2. **有依赖项**
   ```javascript
   // 当userId或user变化时执行
   useEffect(() => {
     fetchUserData(userId);
   }, [userId, user]);
   ```

3. **没有依赖数组**
   ```javascript
   // 每次渲染后都执行
   useEffect(() => {
     console.log('组件已更新');
   });
   ```

#### 我们项目中的使用场景

```javascript
// 1. 数据加载
useEffect(() => {
  const loadSavedApis = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/saved-apis');
      setSavedApis(response.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  loadSavedApis();
}, []); // 组件挂载时加载已保存的API

// 2. 监听状态变化并更新UI
useEffect(() => {
  if (error) {
    showToast(error, 'error');
  }
}, [error]); // 当错误状态改变时显示提示

// 3. 清理定时器
useEffect(() => {
  const timer = setTimeout(() => {
    setToast({ visible: false });
  }, 2000);

  return () => clearTimeout(timer);
}, []);
```

#### 最佳实践

1. **正确设置依赖项**
   ```javascript
   // ❌ 错误：缺少依赖项
   useEffect(() => {
     fetchData(userId);
   }, []); // eslint会警告缺少userId依赖
   
   // ✅ 正确：包含所有依赖项
   useEffect(() => {
     fetchData(userId);
   }, [userId]);
   ```

2. **避免无限循环**
   ```javascript
   // ❌ 错误：在effect中直接设置状态
   useEffect(() => {
     setCount(count + 1);
   }, [count]); // 会导致无限循环
   
   // ✅ 正确：使用条件判断或其他依赖
   useEffect(() => {
     if (shouldUpdate) {
       setCount(count + 1);
     }
   }, [shouldUpdate, count]);
   ```

3. **合理拆分副作用**
   ```javascript
   // ❌ 错误：一个effect做太多事情
   useEffect(() => {
     fetchUserData();
     fetchUserPosts();
     setupSubscription();
   }, [userId]);
   
   // ✅ 正确：拆分为多个专注的effect
   useEffect(() => {
     fetchUserData();
   }, [userId]);
   
   useEffect(() => {
     fetchUserPosts();
   }, [userId]);
   
   useEffect(() => {
     setupSubscription();
   }, [userId]);
   ```

#### 常见问题和解决方案

1. **异步操作**
   ```javascript
   // ✅ 正确处理异步操作
   useEffect(() => {
     let isMounted = true;
     
     async function fetchData() {
       try {
         const result = await api.getData();
         if (isMounted) {
           setData(result);
         }
       } catch (error) {
         if (isMounted) {
           setError(error);
         }
       }
     }
     
     fetchData();
     return () => {
       isMounted = false;
     };
   }, []);
   ```

2. **条件执行**
   ```javascript
   useEffect(() => {
     if (!userId) return; // 提前返回
     
     fetchUserData(userId);
   }, [userId]);
   ```

#### 调试技巧

1. **使用开发者工具**
   ```javascript
   useEffect(() => {
     console.log('Effect执行了，依赖项:', {
       userId,
       count
     });
     
     return () => {
       console.log('Effect清理了');
     };
   }, [userId, count]);
   ```

2. **常见问题排查**
   - 检查依赖项列表是否完整
   - 确认是否需要清理副作用
   - 注意异步操作的竞态条件
   - 避免在不必要的时候创建新的函数或对象

### Best Practices

1. **Component Organization**
   - Keep components small and focused
   - One component per file
   - Group related components in subdirectories
   - Use index.js for exporting multiple components

2. **State Management**
   - Keep state as close as possible to where it's used
   - Lift state up when needed by multiple components
   - Use context for global state when necessary

3. **Styling**
   - Use component-specific CSS files
   - Avoid inline styles
   - Use CSS classes for reusable styles
   - Consider CSS modules for larger applications

4. **Props**
   - Document props with comments or PropTypes
   - Use meaningful prop names
   - Provide default props when appropriate

5. **Event Handling**
   - Use handle prefix for event handlers
   - Keep event handlers close to related state
   - Debounce or throttle when necessary

### Example: Adding a Toast Component

Here's a practical example of adding a new component:

1. **Create Files**
   ```
   src/components/
   ├── Toast/
   │   ├── Toast.js
   │   └── Toast.css
   ```

2. **Component Implementation**
   ```jsx
   // Toast.js
   import React from 'react';
   import './Toast.css';

   const Toast = ({ message, type, visible }) => {
     return (
       <div className={`toast ${type} ${visible ? 'visible' : ''}`}>
         <span>{message}</span>
       </div>
     );
   };

   export default Toast;
   ```

3. **Styling**
   ```css
   /* Toast.css */
   .toast {
     position: fixed;
     top: 20px;
     /* Additional styles */
   }
   ```

4. **Integration**
   ```jsx
   // App.js
   import Toast from './components/Toast';

   function App() {
     const [toast, setToast] = useState({
       visible: false,
       message: '',
       type: 'success'
     });

     const showToast = (message, type) => {
       setToast({ visible: true, message, type });
       // Hide toast after delay
     };

     return (
       <div className="app">
         <Toast {...toast} />
         {/* Other components */}
       </div>
     );
   }
   ```

## Getting Started

1. Install dependencies:
   ```bash
   cd client && npm install
   cd ../ && npm install
   ```

2. Start the development servers:
   ```bash
   # Start backend and frontend servers
   npm run dev-full
   ```

## License

MIT
