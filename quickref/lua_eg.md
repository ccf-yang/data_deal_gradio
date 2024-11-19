# Lua Quick Reference Guide

## 1. 变量定义、赋值和使用
```lua
local x = 10
local name = "John"
print(x, name)
```

## 2. 条件判断
```lua
if x > 5 then
    print("x is greater than 5")
elseif x < 5 then
    print("x is less than 5")
else
    print("x is equal to 5")
end
```

## 3. 循环结构
```lua
for i = 1, 5 do
    print(i)
end

local j = 1
while j <= 5 do
    print(j)
    j = j + 1
end
```

## 4. 函数定义和调用
```lua
function greet(name)
    return "Hello, " .. name
end

print(greet("Alice"))
```

## 5. 特殊数据结构
```lua
local arr = {1, 2, 3, 4, 5}
local dict = {name = "John", age = 30}
```

## 6. 类型转换
```lua
local num = tonumber("10")
local str = tostring(10)
```

## 7. 文件操作
```lua
local file = io.open("test.txt", "w")
file:write("Hello, World!")
file:close()
```

## 8. 多线程（Lua 不直接支持，但可以通过协程模拟）
```lua
local co = coroutine.create(function()
    print("In coroutine")
end)
coroutine.resume(co)
```

## 9. 正则表达式
```lua
local s = string.gsub("hello world", "l", "L")
```

## 10. 命令行参数
```lua
local arg = {...}
print(arg[1])
```

## 11. 命令行选项
Lua 本身不直接支持，需要自行解析

## 12. 字符串处理
```lua
local s = "hello,world"
local parts = {}
for part in s:gmatch("[^,]+") do
    table.insert(parts, part)
end
```

## 13. 数学运算
```lua
local sum = 5 + 3
local product = 5 * 3
```

## 14. 文件系统操作
```lua
local current_dir = os.getenv("PWD")
local file_info = os.execute("ls -l")
```

## 15. 环境变量
```lua
local path = os.getenv("PATH")
```

## 16. 字符串操作
```lua
local s = "hello"
print(#s)  -- 长度
print(string.sub(s, 1, 2))  -- 截取
print(string.gsub(s, "l", "L"))  -- 替换
```

## 17. 错误处理
```lua
local status, err = pcall(function()
    error("An error occurred")
end)
if not status then
    print("Caught error: " .. err)
end
```
