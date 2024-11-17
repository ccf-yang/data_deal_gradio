from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from openai import AsyncOpenAI
import time
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CommonOpenAI:
    def __init__(self, base_url, api_key, model='', max_tokens=8192, system_message=None):
        self.base_url = base_url
        self.api_key = api_key
        self.model = model
        self.max_tokens = max_tokens
        self.client = AsyncOpenAI(base_url=self.base_url, api_key=self.api_key)
        self.system_message = system_message if system_message else "You are a Python code assistant. Your task is to analyze pytest.mark.parametrize decorators and their associated docstrings. Based on the docstring description, fill in appropriate parameter values that match the documentation. Only provide the completed pytest.mark.parametrize decorator with filled parameters. Do not include any explanations or additional text in your response."

    async def chat_stream(self, prompt):
        try:
            start_time = time.time()
            chat_completion_res = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": self.system_message},
                    {"role": "user", "content": prompt}
                ],
                stream=True,
                max_tokens=self.max_tokens
            )

            response = ""
            async for chunk in chat_completion_res:
                if time.time() - start_time > 30:
                    raise TimeoutError("请求超时啦！")
                response += chunk.choices[0].delta.content or ""
            return response, ""
        except TimeoutError as e:
            return "", f"Timeout error: {str(e)}"
        except Exception as e:
            return "", f"An error occurred: {str(e)}"

    async def chat_non_stream(self, prompt):
        try:
            start_time = time.time()
            chat_completion_res = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": self.system_message},
                    {"role": "user", "content": prompt}
                ],
                stream=False,
                max_tokens=self.max_tokens
            )
            if time.time() - start_time > 30:
                raise TimeoutError("请求超时啦！")
            response = chat_completion_res.choices[0].message.content
            return response, ""
        except TimeoutError as e:
            return "", f"Timeout error: {str(e)}"
        except Exception as e:
            return "", f"An error occurred: {str(e)}"

novice_instance = CommonOpenAI(
    base_url="https://api.novita.ai/v3/openai",
    api_key='d63ccf43-a0e1-4011-b5cc-19d204794b29',
    model='qwen/qwen-2.5-72b-instruct'
)

class RequestModel(BaseModel):
    rawcontent: str

@app.post('/process')
async def process_request(request: RequestModel):
    if not request.rawcontent:
        raise HTTPException(status_code=400, detail="Missing 'rawcontent' in request body")

    try:
        response, error = await novice_instance.chat_non_stream(request.rawcontent)
        if error:
            if "Timeout" in error:
                raise HTTPException(status_code=400, detail="超时")
            raise HTTPException(status_code=500, detail=error)
        return {"code": 200, "result": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == '__main__':
    uvicorn.run(app, host="0.0.0.0", port=8000)
# 这里，不需要使用 asyncio.run() 是因为：
# FastAPI 自动管理异步上下文
# uvicorn 服务器处理底层的事件循环
# 路由处理函数会在正确的异步环境中执行
# 这是 Web 框架和普通 Python 脚本的主要区别之一。在 Web 框架中，异步运行时环境已经被框架配置好了。
