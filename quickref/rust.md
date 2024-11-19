# Rust 快速参考指南

## 1. 变量定义、赋值和使用

```rust
// 不可变变量
let x = 5;

// 可变变量
let mut y = 10;
y = 20;

// 常量
const MAX_POINTS: u32 = 100_000;

// 隐藏
let x = 5;
let x = x + 1;

// 类型标注
let z: i32 = 30;
```

## 2. 条件判断结构

```rust
let number = 6;

if number % 4 == 0 {
    println!("number is divisible by 4");
} else if number % 3 == 0 {
    println!("number is divisible by 3");
} else {
    println!("number is not divisible by 4 or 3");
}

// if 是表达式
let condition = true;
let number = if condition { 5 } else { 6 };
```

## 3. 循环结构

```rust
// for 循环
for i in 0..5 {
    println!("i: {}", i);
}

// while 循环
let mut n = 0;
while n < 5 {
    println!("n: {}", n);
    n += 1;
}

// loop 循环
let mut counter = 0;
loop {
    println!("count: {}", counter);
    counter += 1;
    if counter == 5 {
        break;
    }
}
```

## 4. 函数定义和调用
### Rust 中的返回值要注意
// 1. 隐式返回：函数体最后一个表达式的值会被自动返回
fn implicit_return() -> i32 {
    42 // 无需 return 关键字
}

// 2. 显式返回：使用 return 关键字提前返回
fn explicit_return(x: i32) -> i32 {
    if x < 0 {
        return 0; // 提前返回
    }
    x * 2 // 隐式返回
}

// 3. 空返回：使用 unit 类型 ()
fn no_return() {
    println!("This function returns nothing");
}

// 4. Result 类型返回：用于可能失败的操作
fn divide(a: f64, b: f64) -> Result<f64, String> {
    if b == 0.0 {
        Err("Division by zero".to_string())
    } else {
        Ok(a / b)
    }
}

// 5. Option 类型返回：用于可能没有值的情况
fn find_even(numbers: &[i32]) -> Option<i32> {
    numbers.iter().find(|&&x| x % 2 == 0).cloned()
}

```rust
// 普通函数
fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

// 使用 Result 和 unwrap 的函数
fn divide(a: f64, b: f64) -> Result<f64, String> {
    if b == 0.0 {
        Err("除数不能为零".to_string())
    } else {
        Ok(a / b)
    }
}

fn main() {
    // 普通函数调用
    let message = greet("Alice");
    println!("{}", message);

    // 使用 unwrap 的函数调用
    let result = divide(10.0, 2.0).unwrap();
    println!("10 / 2 = {}", result);

    // rust 中的返回
    let result = if true {
        "早期返回"
    } else {
        "不会执行到这里"
    };
    println!("{}", result);
}
```

## 5. 特殊数据结构

```rust
// 数组
let arr: [i32; 5] = [1, 2, 3, 4, 5];

// 动态数组 (Vector)
let mut vec = vec![1, 2, 3];
vec.push(4);

// HashMap
use std::collections::HashMap;
let mut scores = HashMap::new();
scores.insert(String::from("Blue"), 10);
```

## 6. 类型转换

```rust
// 整数转浮点数
let integer = 5;
let float = integer as f64;

// 字符串转整数
let s = "42";
let n: i32 = s.parse().unwrap();
```

## 7. 文件操作

```rust
use std::fs::File;
use std::io::{Write, Read};

// 写入文件
let mut file = File::create("example.txt").unwrap();
file.write_all(b"Hello, World!").unwrap();

// 读取文件
let mut contents = String::new();
File::open("example.txt").unwrap().read_to_string(&mut contents).unwrap();
```

## 8. 多线程

```rust
use std::thread;

let handle = thread::spawn(|| {
    println!("Hello from a thread!");
});

handle.join().unwrap();
```

## 9. 正则表达式

```rust
use regex::Regex;

let re = Regex::new(r"^\d{4}-\d{2}-\d{2}$").unwrap();
println!("Date matched: {}", re.is_match("2022-03-14"));
```

## 10. 命令行参数处理

```rust
use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();
    println!("Program name: {}", args[0]);
    for arg in &args[1..] {
        println!("Argument: {}", arg);
    }
}
```

## 11. 命令行选项

```rust
use clap::{App, Arg};

fn main() {
    let matches = App::new("My Program")
        .version("1.0")
        .author("Your Name")
        .about("Does awesome things")
        .arg(Arg::with_name("config")
            .short("c")
            .long("config")
            .value_name("FILE")
            .help("Sets a custom config file")
            .takes_value(true))
        .get_matches();

    if let Some(c) = matches.value_of("config") {
        println!("Custom config file: {}", c);
    }
}
```

## 12. 字符串处理

```rust
let s = String::from("hello world");

// 分割
let parts: Vec<&str> = s.split_whitespace().collect();

// 连接
let joined = parts.join("-");

// 替换
let replaced = s.replace("world", "Rust");
```

## 13. 数学运算

```rust
let sum = 5 + 10;
let difference = 95.5 - 4.3;
let product = 4 * 30;
let quotient = 56.7 / 32.2;
let remainder = 43 % 5;
```

## 14. 文件系统操作

```rust
use std::env;
use std::fs;

// 当前工作目录
let current_dir = env::current_dir().unwrap();
println!("Current directory: {:?}", current_dir);

// 文件信息
let metadata = fs::metadata("example.txt").unwrap();
println!("File size: {} bytes", metadata.len());
```

## 15. 环境变量

```rust
use std::env;

// 设置环境变量
env::set_var("MY_VAR", "my_value");

// 获取环境变量
match env::var("MY_VAR") {
    Ok(val) => println!("MY_VAR: {}", val),
    Err(_) => println!("MY_VAR is not set"),
}
```

## 16. 字符串操作

```rust
let s = String::from("hello");

// 长度
println!("Length: {}", s.len());

// 截取
let slice = &s[0..2];

// 替换
let new_s = s.replace("hello", "world");
```

## 17. 错误处理和异常捕获

```rust
use std::fs::File;
use std::io::ErrorKind;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let f = File::open("hello.txt");

    let f = match f {
        Ok(file) => file,
        Err(error) => match error.kind() {
            ErrorKind::NotFound => match File::create("hello.txt") {
                Ok(fc) => fc,
                Err(e) => return Err(Box::new(e)),
            },
            other_error => return Err(Box::new(other_error)),
        },
    };

    Ok(())
}
```
## 18. Rust 常用概念说明

### `unwrap()`
- 作用：从 `Result` 或 `Option` 类型中提取值
- 用法：`let value = some_result.unwrap();`
- 详细说明：
  - 对于 `Option<T>`：如果是 `Some(value)`，返回 `value`；如果是 `None`，panic
  - 对于 `Result<T, E>`：如果是 `Ok(value)`，返回 `value`；如果是 `Err(e)`，panic
- 示例：
  ```rust
  let x: Option<i32> = Some(5);
  assert_eq!(x.unwrap(), 5);

  let y: Result<i32, &str> = Ok(10);
  assert_eq!(y.unwrap(), 10);

  // 以下代码会 panic
  // let z: Option<i32> = None;
  // z.unwrap();
  ```
- 注意：在确定值存在时使用，否则可能导致程序崩溃

### `?` 运算符
- 作用：简化错误处理，类似于 `unwrap()`，但会传播错误而不是 panic
- 用法：`let value = some_result?;`
- 注意：只能在返回 `Result` 的函数中使用

### `match` 表达式
- 作用：模式匹配，常用于处理枚举和复杂条件
- 用法：
  ```rust
  match value {
      Pattern1 => expression1,
      Pattern2 => expression2,
      _ => default_expression,
  }
  ```

### 生命周期标注
- 作用：指定引用的有效范围，确保内存安全
- 用法：`&'a T` 表示一个生命周期为 `'a` 的引用
- 示例：
  ```rust
  fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
      if x.len() > y.len() { x } else { y }
  }
  ```

### `derive` 属性
- 作用：自动实现某些 trait
- 用法：`#[derive(Debug, Clone, PartialEq)]`
- 常见派生 trait：`Debug`, `Clone`, `Copy`, `PartialEq`, `Eq`

### 智能指针
- `Box<T>`：用于在堆上分配值
- `Rc<T>`：引用计数指针，允许多所有权
- `Arc<T>`：原子引用计数指针，用于多线程场景
- `RefCell<T>`：提供内部可变性

### 闭包
- 作用：匿名函数，可以捕获环境中的变量
- 用法：`let closure = |params| { /* body */ };`
- 示例：`let add_one = |x| x + 1;`

