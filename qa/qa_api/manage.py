#!/usr/bin/env python

"""Django's command-line utility for administrative tasks."""
import os  # 导入操作系统环境变量模块
import sys  # 导入系统模块

def main():
    # 设置环境变量，指定Django项目的配置文件
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'qa.settings')
    try:
        # 从Django的核心管理模块中导入执行命令行的函数
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        # 如果导入Django失败，抛出错误信息
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    # 执行命令行，传入系统参数
    execute_from_command_line(sys.argv)

# 如果当前文件作为主程序运行
if __name__ == '__main__':
    # 调用主函数
    main()
