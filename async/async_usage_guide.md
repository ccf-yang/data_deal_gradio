# Python Async/Await 使用指南

## 1. 基本概念

### 什么是 async/await？
- `async`：用于定义异步函数（加在 def 关键字前面，使函数变成协程）
- `await`：
  1. 用于调用异步函数
  2. 只能在 async 函数内部使用
  3. 等待一个协程完成并获取其结果
- 协程（Coroutine）：可以暂停执行的函数，让出控制权给其他任务

### 为什么使用 async/await？
1. 提高性能：同时处理多个耗时操作
2. 提高响应性：不会阻塞主线程
3. 更好的资源利用：在等待I/O时可以处理其他任务
4. 简化并发代码：比传统的线程更容易管理

## 2. 基本语法规则

### 定义异步函数
```python
async def async_function():
    # await 只能在 async 函数内部使用
    result = await some_async_operation()  # 等待异步操作完成并获取结果
    return result
```

### await 的使用规则
1. 只能在 async 函数内部使用
2. 用于调用和等待异步函数的结果
3. 当遇到 await 时，函数会暂停执行，让出控制权
4. 等待的操作完成后，从暂停点继续执行

### 使用限制
1. `await` 只能在 `async def` 函数内部使用
2. 异步函数必须由其他异步函数调用，或使用 `asyncio.run()` 运行
3. 不能在同步函数中直接使用 `await`

## 3. 常见使用场景

### a) 基础异步函数
```python
async def basic_async_function():
    # await 等待异步操作完成
    await asyncio.sleep(1)  
    return "完成"
```

### b) 嵌套调用
```python
async def nested_async_function():
    # await 等待第一个异步函数完成并获取结果
    result1 = await basic_async_function()
    # 等待第二个异步函数完成并获取结果
    result2 = await basic_async_function()
    return f"获得结果: {result1}, {result2}"
```

### c) 并发执行
```python
async def concurrent_async_function():
    # 创建多个任务
    tasks = [
        basic_async_function(),  # 这里不使用 await，因为我们要并发执行
        basic_async_function(),
        basic_async_function()
    ]
    # 使用 await + gather 并发等待所有任务完成
    results = await asyncio.gather(*tasks)
    return results
```

### d) 异步上下文管理器
```python
async def async_context_manager():
    async with aiohttp.ClientSession() as session:
        async with session.get('url') as response:
            return await response.text()
```

### e) 异步迭代器
```python
async def async_iterator():
    async for i in async_range(3):
        print(i)
        await asyncio.sleep(0.5)
```

### f) 异步生成器
```python
async def async_generator():
    for i in range(3):
        await asyncio.sleep(0.1)
        yield f"生成值 {i}"
```

## 4. 常见使用模式

### 单个等待
```python
#这里举例没有加async，只是为了演示，实际上async是必须的，await要在async函数内使用
result = await async_function()
```

### 并发等待
```python
results = await asyncio.gather(*tasks)
```

### 上下文管理
```python
async with resource() as r:
    await r.do_something()
```

### 异步循环
```python
async for item in async_iterator():
    await process(item)
```

## 5. 实际应用示例

### Web API 服务器
```python
async def handle_request(request_id: int):
    print(f"收到请求 {request_id}")
    await asyncio.sleep(1)  # 模拟处理时间
    return f"请求 {request_id} 处理完成"

async def api_server():
    tasks = [handle_request(i) for i in range(10)]
    results = await asyncio.gather(*tasks)
```

### 批量数据处理
```python
async def process_data(data: dict):
    await asyncio.sleep(1)  # 模拟处理时间
    return {"id": data["id"], "result": "处理完成"}

async def process_batch(data_list):
    tasks = [process_data(item) for item in data_list]
    return await asyncio.gather(*tasks)
```

## 6. 性能对比

### 同步处理 vs 异步处理
- 同步处理 10 个请求：约需 10 秒
- 异步处理 10 个请求：约需 1 秒
- 异步处理可以在等待时执行其他任务

## 7. 最佳实践

1. 使用 `asyncio.gather()` 并发执行多个任务
2. 避免在异步函数中使用同步阻塞操作
3. 合理使用异步上下文管理器
4. 注意异常处理
5. 使用 `async for` 处理异步迭代器
6. 适当设置超时机制

## 8. 常见问题

1. "RuntimeError: This event loop is already running"
   - 解决：避免在已运行的事件循环中调用 `asyncio.run()`

2. "RuntimeError: Coroutine was never awaited"
   - 解决：确保使用 `await` 等待协程完成

3. "SyntaxError: 'await' outside async function"
   - 解决：确保 `await` 只在 `async def` 函数内使用

## 9. 调试技巧

1. 使用 `asyncio.create_task()` 创建命名任务
2. 设置 `asyncio` 调试模式：`asyncio.get_event_loop().set_debug(True)`
3. 使用 `async_timeout` 控制超时
4. 打印协程状态进行调试

## 10. 相关资源

- [Python asyncio 官方文档](https://docs.python.org/3/library/asyncio.html)
- [aiohttp 文档](https://docs.aiohttp.org/)
- [Python 异步编程指南](https://realpython.com/async-io-python/)
