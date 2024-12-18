from fastapi import FastAPI, Response, HTTPException
import uvicorn
from pydantic import BaseModel
import json
from fastapi.middleware.cors import CORSMiddleware
import sys
import os
from dataclasses import dataclass
import requests
import subprocess
import psutil
from typing import Dict
import multiprocessing
import time

cur_project_path = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
sys.path.insert(0, cur_project_path)
print(cur_project_path)
from common.generate_code.api_info_interface import get_api_info
from common.generate_code.api_info_generate import generate_code
from common.generate_code.common_config import *

Base={
    "headers":{
    'Accept': 'application/json, text/plain, */*',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'X-Token': '161b91c7818c4699bb700c0e9551cd98'
    }
}

app = FastAPI()
#取消跨域支持
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

django_host = 'http://localhost:3000'

def getapilist(path,method):
    url = django_host + "/api/savedapi/saved-apis/"
    response = requests.request("GET", url, headers=Base["headers"], data={})
    data = json.loads(response.text)
    for _, apis in data.items():
        for api in apis:
            # print(api)
            if api["path"] == path and api["method"] == method.upper():
                return api
    return {}

def getenvironment():
    url = django_host + "/api/environment/environments"
    response = requests.request("GET", url, headers=Base["headers"], data={})
    print(response.status_code)
    data = json.loads(response.text)
    return data.get("environments")

@dataclass
class RequestApiContent(BaseModel):
    path: str
    method: str

    def __str__(self) -> str:
        return f"path: {self.path}, method: {self.method}"

class RunInfo(BaseModel):
    groupname: str
    apis: list
    environment: str

@app.post("/ge_api_code")
async def save_info(con: RequestApiContent):
    path = con.path
    method = con.method
    api_info = getapilist(path,method)  # 从数据库中获取api信息
    print(api_info)
    dealed_api_info = get_api_info([api_info]) # 处理api信息
    print(dealed_api_info)
    try:
        business_codes, common_codes, testcase_codes, body_params = generate_code(dealed_api_info) # 生成代码
    except Exception as e:
        return Response(
            content=json.dumps({"code": 400, "business_code": "", "common_code": "", "testcase_code": "", "body_params": "", "message": f"{e}"}, ensure_ascii=False),
            media_type="application/json",
            status_code=400
        )

    return Response(
        content=json.dumps({"code": 200, "business_code": business_codes, "common_code": common_codes, "testcase_code": testcase_codes, "body_params": body_params}, ensure_ascii=False),
        media_type="application/json"
    )

def write_env(environment):
    # 写环境变量到文件中
    filepath = "testdata/api_params.json"
    if not os.path.exists(filepath):
        raise FileNotFoundError("文件: {} 未找到".format(filepath))
    with open(filepath, "r", encoding="utf-8") as f:
        data = f.read()
        old_data = json.loads(data)
    envs = getenvironment()
    print(envs)
    for env in envs:
        if env["name"] == environment:
            new_host = env["host"]
            new_authorization = env["secret_key"]
            if env["port"]:
                new_host = f"{new_host}:{env['port']}"
            old_data["host"] = new_host
            old_data["authorization"] = new_authorization
            break
    with open(filepath, "w") as f:
        json.dump(old_data, f, indent=4, ensure_ascii=False)


def write_bussiness(type="",code=''):
    bussiness_path = api_file_path
    with open(bussiness_path, "a",encoding='utf-8') as f:
        if type == 'header':
            f.write(bussiness_code_header)
        else:
            f.write(code)
def write_common(type="",code=''):  
    common_path = func_file_path
    with open(common_path, "a",encoding='utf-8') as f:
        if type == 'header':
            f.write(common_code_header)
        else:
            f.write(code)
def write_testcase(type="",code=''):
    testcase_path = case_file_path
    with open(testcase_path, "a",encoding='utf-8') as f:
        if type == 'header':
            f.write(testcases_code_header)
        else:
            f.write(code)

def write_params_json(params):
    with open('variables/params.json', "w", encoding='utf-8') as f:
        json.dump(params, f, indent=4, ensure_ascii=False)

def write_apis(apis):
    api_mark = ''
    api_params_data = []
    rm_exist_file()
    # 写apis代码到测试代码中
    write_bussiness(type="header")
    write_common(type="header")
    write_testcase(type="header")
    for api in apis:
        if not api["bussiness_code"]:
            raise Exception("bussiness_code 不能为空")
        if not api["common_code"]:
            raise Exception("common_code 不能为空")
        if not api["testcases_code"]:
            raise Exception("testcases_code 不能为空")

        business_c = api["bussiness_code"]
        common_c = api["common_code"]
        testcase_c = api["testcases_code"]
        if business_c:
            write_bussiness(code=business_c)
        if common_c:
            write_common(code=common_c)
        if testcase_c:
            write_testcase(code=testcase_c)
        if not api_mark:
            api_mark = api["api_method"].lower() + '_' + api["api_path"] + '_' + api["directory"]
        api_params_data.append(json.loads(api["body_params"]))

    write_params_json(api_params_data)
    return api_mark

#----------后台运行任务-------------
# 用于存储正在运行的进程信息
running_processes: Dict[str, psutil.Process] = {}

def run_long_task(command: str):
    """执行长时间运行的任务"""
    try:
        # 使用 nohup 来运行命令，确保在后台持续运行
        # 将输出重定向到日志文件
        with open("task.log", "a") as log_file:
            process = subprocess.Popen(
                f"nohup {command} &",
                shell=True,
                stdout=log_file,
                stderr=log_file,
                creationflags=subprocess.CREATE_NEW_CONSOLE  # Optional: run in a new console
            )
        return process.pid
    except Exception as e:
        print(f"Error running task: {e}")
        return None

def start_background_process(command: str, process_name: str):
    """启动后台进程"""
    # 创建新进程
    process = multiprocessing.Process(
        target=run_long_task,
        args=(command,)
    )
    # 设置为守护进程
    process.daemon = True
    # 启动进程
    process.start()
    # 记录进程信息
    running_processes[process_name] = psutil.Process(process.pid)
    return process.pid

#-----------------------
@app.post("/run")
async def run_api(con: RunInfo):
    try:
        environment = con.environment
        apis = con.apis
        groupname = con.groupname
        # 异步执行代码，成功运行就返回
        process_name = "my_pytest_task"
        # 检查是否已有相同任务在运行
        if process_name in running_processes:
            try:
                process = running_processes[process_name]
                if process.is_running():
                    return {"message": "Task is already running", "pid": process.pid}
            except psutil.NoSuchProcess:
                del running_processes[process_name]

        # 写环境变量到文件中
        write_env(environment)
        # 写apis代码到测试代码中
        api_mark = write_apis(apis)
        if groupname:
            groupname = groupname
        else:
            groupname = "null"

        random_suffix = time.strftime('%Y_%m_%d_%H_%M_%S')
        command = f'python3 utils/run_case.py --run --time {str(random_suffix)} --groupname {groupname} --api {api_mark}'
        # 启动后台进程
        print(command)
        pid = start_background_process(command, process_name)
        if pid:
            return {
                "message": "Task started successfully",
                "pid": pid,
                "code": 200
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to start task")

    except Exception as e:
        print(f"Error running task: {e}")
        return {
            "message": "Failed to start task",
            "error": str(e)
        }

if __name__ == "__main__":
    uvicorn.run("auto_api_for_platform:app", host="0.0.0.0", port=4567)
