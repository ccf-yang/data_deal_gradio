import asyncio
import aiohttp
import time
from typing import List
import json

# 模拟一个耗时的数据处理函数
async def process_data(data: dict) -> dict:
    """模拟数据处理，比如AI模型推理或复杂计算"""
    await asyncio.sleep(1)  # 模拟耗时操作
    return {
        "id": data["id"],
        "result": f"处理完成: {data['content']}"
    }

# 异步方式处理多条数据
async def process_batch_async(data_list: List[dict]) -> List[dict]:
    """异步批量处理数据"""
    start_time = time.time()
    
    # 创建多个任务并同时执行
    tasks = [process_data(item) for item in data_list]
    results = await asyncio.gather(*tasks)
    
    end_time = time.time()
    print(f"异步处理 {len(data_list)} 条数据用时: {end_time - start_time:.2f} 秒")
    return results

# 同步方式处理多条数据
def process_batch_sync(data_list: List[dict]) -> List[dict]:
    """同步批量处理数据"""
    start_time = time.time()
    
    results = []
    for item in data_list:
        # 在同步版本中，我们需要用同步方式等待
        time.sleep(1)  # 模拟耗时操作
        result = {
            "id": item["id"],
            "result": f"处理完成: {item['content']}"
        }
        results.append(result)
    
    end_time = time.time()
    print(f"同步处理 {len(data_list)} 条数据用时: {end_time - start_time:.2f} 秒")
    return results

# 模拟实际应用场景：处理用户提交的多条数据
async def main():
    # 模拟待处理的数据
    test_data = [
        {"id": i, "content": f"用户数据_{i}"} 
        for i in range(5)
    ]
    
    print("开始异步处理...")
    async_results = await process_batch_async(test_data)
    print("异步处理结果:", json.dumps(async_results, ensure_ascii=False, indent=2))
    
    print("\n开始同步处理...")
    sync_results = process_batch_sync(test_data)
    print("同步处理结果:", json.dumps(sync_results, ensure_ascii=False, indent=2))

# 实际应用示例：异步API服务器
async def simulate_api_server():
    """模拟一个处理并发请求的API服务器"""
    async def handle_request(request_id: int):
        print(f"收到请求 {request_id}")
        await asyncio.sleep(1)  # 模拟API处理时间
        return f"请求 {request_id} 处理完成"

    # 模拟10个并发请求
    requests = range(10)
    start_time = time.time()
    
    # 同时处理所有请求
    tasks = [handle_request(req_id) for req_id in requests]
    results = await asyncio.gather(*tasks)
    
    end_time = time.time()
    print(f"\nAPI服务器处理 {len(requests)} 个并发请求用时: {end_time - start_time:.2f} 秒")
    return results

# 1. 基础异步函数定义
async def basic_async_function():
    """最基本的异步函数"""
    await asyncio.sleep(1)  # await 等待一个异步操作完成
    return "完成"

# 2. 异步函数的嵌套使用
async def nested_async_function():
    """演示异步函数的嵌套使用"""
    print("开始嵌套调用")
    
    # await 等待其他异步函数的结果
    result1 = await basic_async_function()
    result2 = await basic_async_function()
    
    return f"获得结果: {result1}, {result2}"

# 3. 并发执行多个异步操作
async def concurrent_async_function():
    """演示如何并发执行多个异步操作"""
    print("开始并发执行")
    
    # 创建多个任务
    tasks = [
        basic_async_function(),
        basic_async_function(),
        basic_async_function()
    ]
    
    # await + asyncio.gather 并发等待多个任务完成
    results = await asyncio.gather(*tasks)
    return results

# 4. 异步上下文管理器
async def async_context_manager():
    """演示异步上下文管理器的使用"""
    async with aiohttp.ClientSession() as session:  # async with 用于异步上下文
        async with session.get('http://example.com') as response:
            return await response.text()  # await 等待响应内容

# 5. 异步迭代器
async def async_iterator():
    """演示异步迭代器的使用"""
    async for i in async_range(3):  # async for 用于异步迭代
        print(i)
        await asyncio.sleep(0.5)

async def async_range(count):
    """一个简单的异步迭代器"""
    for i in range(count):
        await asyncio.sleep(0.1)
        yield i

# 6. 异步生成器
async def async_generator():
    """演示异步生成器的使用"""
    for i in range(3):
        await asyncio.sleep(0.1)
        yield f"生成值 {i}"

# 7. 综合示例
async def comprehensive_example():
    """综合演示各种async/await的用法"""
    print("\n=== async/await 使用方法演示 ===")
    
    print("\n1. 基础异步函数调用:")
    result = await basic_async_function()
    print(f"基础异步函数结果: {result}")
    
    print("\n2. 嵌套异步函数调用:")
    nested_result = await nested_async_function()
    print(f"嵌套调用结果: {nested_result}")
    
    print("\n3. 并发执行结果:")
    concurrent_results = await concurrent_async_function()
    print(f"并发执行结果: {concurrent_results}")
    
    print("\n4. 异步迭代器示例:")
    await async_iterator()
    
    print("\n5. 异步生成器示例:")
    async for value in async_generator():
        print(f"生成的值: {value}")

# 运行示例
if __name__ == "__main__":
    # 使用 asyncio.run() 运行顶层异步函数
    asyncio.run(comprehensive_example())

    # 原有的示例保持不变
    print("\n=== 示例1: 批量数据处理 ===")
    # 异步处理5条数据只需要约1秒
    # 同步处理5条数据需要约5秒
    asyncio.run(main())
    
    print("\n=== 示例2: API服务器并发请求处理 ===")
    asyncio.run(simulate_api_server())
