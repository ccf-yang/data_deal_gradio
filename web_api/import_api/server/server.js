const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const yaml = require('js-yaml');
const axios = require('axios');
const Swagger2Apipost = require('swagger2apipost');
const path = require('path');
const fs = require('fs').promises;
const upload = fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max-file-size
});

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件配置
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(upload);

// 静态文件服务
app.use(express.static(path.join(__dirname, '../client/build')));

// 目录配置
const SAVED_APIS_FILE = path.join(__dirname, '..', 'api.json');

// 工具函数
async function initSavedApisFile() {
  try {
    await fs.access(SAVED_APIS_FILE);
  } catch (error) {
    await fs.writeFile(SAVED_APIS_FILE, JSON.stringify({}));
  }
}

const convertSwagger = (data) => {
  try {
    const converter = new Swagger2Apipost();
    const result = converter.convert(data);
    
    if (!result || result.status === 'error') {
      throw new Error(result?.message || 'Failed to convert swagger document');
    }

    // Process and format the APIs
    const apis = [];
    if (data && data.paths) {
      for (const [path, methods] of Object.entries(data.paths)) {
        for (const [method, details] of Object.entries(methods)) {
          if (!['get', 'post', 'put', 'delete', 'patch', 'options', 'head'].includes(method.toLowerCase())) {
            continue;
          }
          
          apis.push({
            path,
            method: method.toUpperCase(),
            summary: details.summary || '',
            description: details.description || '',
            parameters: details.parameters || [],
            responses: details.responses || {},
            tags: details.tags || [],
            ...details
          });
        }
      }
    }

    return { apis, original: data };
  } catch (error) {
    console.error('Error converting swagger:', error);
    throw new Error('Failed to convert swagger document: ' + error.message);
  }
};

// 初始化
(async () => {
  await initSavedApisFile();
})();

// API路由
// 1. API管理路由
app.get('/api/saved-apis', async (req, res) => {
  try {
    let savedApis = {};
    try {
      const data = await fs.readFile(SAVED_APIS_FILE, 'utf8');
      savedApis = JSON.parse(data);
    } catch (error) {
      console.log('No saved APIs found');
    }
    
    // Return the raw api.json content, keeping directory structure
    res.json(savedApis);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch saved APIs' });
  }
});

app.post('/api/save', async (req, res) => {
  try {
    const { apis, directory } = req.body;
    
    if (!apis || !directory) {
      return res.status(400).json({ error: 'APIs and directory are required' });
    }

    // 读取现有的API数据
    const data = await fs.readFile(SAVED_APIS_FILE, 'utf8');
    const savedApis = JSON.parse(data);

    // 确保目录存在
    if (!savedApis[directory]) {
      savedApis[directory] = [];
    }

    // 添加新的APIs到指定目录
    savedApis[directory] = [...savedApis[directory], ...apis];

    // 保存更新后的数据
    await fs.writeFile(SAVED_APIS_FILE, JSON.stringify(savedApis, null, 2));

    res.json({ message: 'APIs saved successfully' });
  } catch (error) {
    console.error('Error saving APIs:', error);
    res.status(500).json({ error: 'Failed to save APIs' });
  }
});

app.get('/saved-apis', async (req, res) => {
  try {
    let savedApis = {};
    try {
      const data = await fs.readFile(SAVED_APIS_FILE, 'utf8');
      savedApis = JSON.parse(data);
    } catch (error) {
      console.log('No saved APIs found');
    }
    
    res.json({ apis: Object.values(savedApis).flat() });
  } catch (error) {
    console.error('Error loading saved APIs:', error);
    res.status(500).json({ error: 'Failed to load saved APIs' });
  }
});

app.post('/save-api', async (req, res) => {
  try {
    const { api } = req.body;
    if (!api) {
      return res.status(400).json({ error: 'API data is required' });
    }

    let savedApis = {};
    try {
      const data = await fs.readFile(SAVED_APIS_FILE, 'utf8');
      savedApis = JSON.parse(data);
    } catch (error) {
      console.log('No saved APIs found, creating new file');
    }
    
    const apiKey = `${api.method}-${api.path}`;
    const existingIndex = Object.values(savedApis).flat().findIndex(
      a => `${a.method}-${a.path}` === apiKey
    );

    if (existingIndex !== -1) {
      Object.values(savedApis).flat()[existingIndex] = api;
    } else {
      Object.values(savedApis).flat().push(api);
    }

    await fs.writeFile(SAVED_APIS_FILE, JSON.stringify(Object.values(savedApis).reduce((acc, curr) => ({ ...acc, [curr.directory]: curr }), {}), null, 2));
    res.json({ message: 'API saved successfully' });
  } catch (error) {
    console.error('Error saving API:', error);
    res.status(500).json({ error: 'Failed to save API' });
  }
});

app.post('/api/directories', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Directory name is required' });
    }

    // 这里我们不再创建实际的目录，而是确保在api.json中使用目录作为键
    let savedApis = {};
    try {
      const data = await fs.readFile(SAVED_APIS_FILE, 'utf8');
      savedApis = JSON.parse(data);
    } catch (error) {
      console.log('No saved APIs found, creating new file');
    }

    if (!savedApis[name]) {
      savedApis[name] = [];
      await fs.writeFile(SAVED_APIS_FILE, JSON.stringify(savedApis, null, 2));
    }

    res.json({ message: 'Directory created successfully' });
  } catch (error) {
    console.error('Error creating directory:', error);
    res.status(500).json({ error: 'Failed to create directory' });
  }
});

app.get('/api/directories', async (req, res) => {
  try {
    const apiData = JSON.parse(await fs.readFile(SAVED_APIS_FILE, 'utf8'));
    const directories = Object.keys(apiData);
    res.json(directories);
  } catch (error) {
    console.error('Error reading directories:', error);
    res.status(500).json({ error: 'Failed to fetch directories' });
  }
});

// 4. Swagger转换API
app.post('/convert', async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.files.file;
    let apiSpec;

    try {
      // 尝试解析为YAML
      apiSpec = yaml.load(file.data.toString());
    } catch (e) {
      try {
        // 如果YAML解析失败，尝试解析为JSON
        apiSpec = JSON.parse(file.data.toString());
      } catch (e2) {
        return res.status(400).json({ error: 'Invalid file format. Must be YAML or JSON' });
      }
    }

    // 转换为统一格式
    let convertedApis = [];
    if (apiSpec.swagger || apiSpec.openapi) {
      // 处理Swagger/OpenAPI格式
      Object.entries(apiSpec.paths || {}).forEach(([path, methods]) => {
        Object.entries(methods).forEach(([method, spec]) => {
          if (!['get', 'post', 'put', 'delete', 'patch', 'options', 'head'].includes(method.toLowerCase())) {
            return;
          }

          // 处理请求体
          let requestBody = null;
          if (spec.requestBody) {
            requestBody = spec.requestBody;
          } else if (spec.parameters) {
            // 处理旧版Swagger的body参数
            const bodyParam = spec.parameters.find(p => p.in === 'body');
            if (bodyParam) {
              requestBody = {
                required: bodyParam.required,
                content: {
                  'application/json': {
                    schema: bodyParam.schema,
                    example: bodyParam.example
                  }
                }
              };
            }
          }

          // 处理响应
          let responses = {};
          Object.entries(spec.responses || {}).forEach(([code, response]) => {
            responses[code] = {
              description: response.description || '',
              content: response.content || {
                'application/json': {
                  schema: response.schema,
                  example: response.example
                }
              }
            };
          });

          convertedApis.push({
            path,
            method: method.toUpperCase(),
            summary: spec.summary || '',
            description: spec.description || '',
            parameters: (spec.parameters || [])
              .filter(p => p.in !== 'body')
              .map(param => ({
                name: param.name,
                in: param.in,
                description: param.description || '',
                required: param.required || false,
                type: param.type || param.schema?.type || 'string',
                schema: param.schema
              })),
            requestBody,
            responses,
            tags: spec.tags || []
          });
        });
      });
    } else if (apiSpec.items) {
      // 处理ApiPost格式
      convertedApis = apiSpec.items.map(item => {
        // 构造请求体
        let requestBody = null;
        if (item.request?.body) {
          requestBody = {
            content: {
              'application/json': {
                schema: item.request.body.schema || {},
                example: item.request.body.example
              }
            }
          };
        }

        // 构造响应体
        let responses = {};
        if (item.response) {
          Object.entries(item.response).forEach(([code, response]) => {
            responses[code] = {
              description: response.description || '',
              content: {
                'application/json': {
                  schema: response.schema || {},
                  example: response.example
                }
              }
            };
          });
        }

        return {
          path: item.path,
          method: item.method.toUpperCase(),
          summary: item.title || '',
          description: item.description || '',
          parameters: [
            ...(item.request?.query || []).map(param => ({
              name: param.name,
              in: 'query',
              description: param.description || '',
              required: param.required || false,
              type: param.type || 'string'
            })),
            ...(item.request?.headers || []).map(param => ({
              name: param.name,
              in: 'header',
              description: param.description || '',
              required: param.required || false,
              type: param.type || 'string'
            }))
          ],
          requestBody,
          responses
        };
      });
    }

    res.json({ apis: convertedApis });
  } catch (error) {
    console.error('Error converting file:', error);
    res.status(500).json({ error: 'Failed to convert file' });
  }
});

app.post('/convert-url', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const response = await axios.get(url);
    const apiSpec = response.data;

    // 转换为统一格式
    let convertedApis = [];
    if (apiSpec.swagger || apiSpec.openapi) {
      // 处理Swagger/OpenAPI格式
      Object.entries(apiSpec.paths || {}).forEach(([path, methods]) => {
        Object.entries(methods).forEach(([method, spec]) => {
          // 处理请求体
          let requestBody = null;
          if (spec.requestBody) {
            requestBody = {
              required: spec.requestBody.required,
              content: spec.requestBody.content
            };
          }

          // 处理响应
          let responses = {};
          Object.entries(spec.responses || {}).forEach(([code, response]) => {
            responses[code] = {
              description: response.description || '',
              content: response.content || {}
            };
          });

          convertedApis.push({
            name: `${method.toUpperCase()} ${path}`,
            method: method.toUpperCase(),
            path: path,
            summary: spec.summary || '',
            description: spec.description || '',
            parameters: (spec.parameters || []).map(param => ({
              name: param.name,
              in: param.in,
              description: param.description || '',
              required: param.required || false,
              type: param.type || param.schema?.type || 'string',
              schema: param.schema
            })),
            requestBody: requestBody,
            responses: responses
          });
        });
      });
    } else if (apiSpec.items) {
      // 处理apipost格式
      convertedApis = apiSpec.items.map(item => {
        // 构造请求体
        let requestBody = null;
        if (item.request?.body) {
          requestBody = {
            content: {
              'application/json': {
                schema: item.request.body.schema || {},
                example: item.request.body.example
              }
            }
          };
        }

        // 构造响应体
        let responses = {};
        if (item.response) {
          Object.entries(item.response).forEach(([code, response]) => {
            responses[code] = {
              description: response.description || '',
              content: {
                'application/json': {
                  schema: response.schema || {},
                  example: response.example
                }
              }
            };
          });
        }

        return {
          name: `${item.method.toUpperCase()} ${item.path}`,
          method: item.method.toUpperCase(),
          path: item.path,
          summary: item.title || '',
          description: item.description || '',
          parameters: [
            ...(item.request?.query || []).map(param => ({
              name: param.name,
              in: 'query',
              description: param.description || '',
              required: param.required || false,
              type: param.type || 'string'
            })),
            ...(item.request?.headers || []).map(param => ({
              name: param.name,
              in: 'header',
              description: param.description || '',
              required: param.required || false,
              type: param.type || 'string'
            }))
          ],
          requestBody: requestBody,
          responses: responses
        };
      });
    }

    res.json({ apis: convertedApis });
  } catch (error) {
    console.error('Error fetching URL:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/import', async (req, res) => {
  try {
    const { file, format } = req.body;
    
    if (!file || !format) {
      return res.status(400).json({ error: 'File content and format are required' });
    }

    let apiSpec;
    if (format === 'yaml') {
      try {
        apiSpec = yaml.load(file);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid YAML format' });
      }
    } else if (format === 'json') {
      try {
        apiSpec = JSON.parse(file);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON format' });
      }
    }

    // 转换为统一格式
    let convertedApis = [];
    if (format === 'swagger') {
      const apipostFormat = swagger2apipost(apiSpec);
      convertedApis = apipostFormat.items.map(item => ({
        name: `${item.method.toUpperCase()} ${item.path}`,
        method: item.method.toUpperCase(),
        path: item.path,
        summary: item.title || '',
        description: item.description || '',
        parameters: item.request?.query || [],
        requestBody: item.request?.body || {},
        responses: item.response || {}
      }));
    } else {
      // 处理其他格式...
      Object.entries(apiSpec.paths || {}).forEach(([path, methods]) => {
        Object.entries(methods).forEach(([method, spec]) => {
          convertedApis.push({
            name: `${method.toUpperCase()} ${path}`,
            method: method.toUpperCase(),
            path: path,
            summary: spec.summary || '',
            description: spec.description || '',
            parameters: spec.parameters || [],
            requestBody: spec.requestBody || {},
            responses: spec.responses || {}
          });
        });
      });
    }

    res.json({ apis: convertedApis });
  } catch (error) {
    console.error('Error importing API:', error);
    res.status(500).json({ error: 'Failed to import API' });
  }
});

// 前端路由处理
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
