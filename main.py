import gradio as gr
import openai
import json
import os
from dotenv import load_dotenv
import requests
from openai import OpenAI
import time

# Load environment variables
load_dotenv()

class CommonOpenAI:
    def __init__(self, base_url, api_key, model='', max_tokens=8192, system_message=None):
        self.base_url = base_url
        self.api_key = api_key
        self.model = model
        self.max_tokens = max_tokens
        self.client = OpenAI(base_url=self.base_url, api_key=self.api_key)
        self.system_message = system_message if system_message else "You are a Python code assistant. Your task is to analyze pytest.mark.parametrize decorators and their associated docstrings. Based on the docstring description, fill in appropriate parameter values that match the documentation. Only provide the completed pytest.mark.parametrize decorator with filled parameters. Do not include any explanations or additional text in your response."

    def chat_stream(self, prompt):
        try:
            start_time = time.time()
            chat_completion_res = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": self.system_message},
                    {"role": "user", "content": prompt}
                ],
                stream=True,
                max_tokens=self.max_tokens
            )

            response = ""
            for chunk in chat_completion_res:
                if time.time() - start_time > 30:
                    raise TimeoutError("请求超时啦！")
                response += chunk.choices[0].delta.content or ""
            return response, ""
        except TimeoutError as e:
            return "", f"Timeout error: {str(e)}"
        except Exception as e:
            return "", f"An error occurred: {str(e)}"

    def chat_non_stream(self, prompt):
        try:
            start_time = time.time()
            chat_completion_res = self.client.chat.completions.create(
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

def get_ai_instance(platform, api_key, system_prompt, model):
    if platform == "Novita":
        return CommonOpenAI(base_url="https://api.novita.ai/v3/openai", api_key='d63ccf43-a0e1-4011-b5cc-19d204794b29', system_message=system_prompt, model=model)
    elif platform == "OpenAI":
        return CommonOpenAI(base_url="https://api.openai.com/v1", api_key=api_key, system_message=system_prompt, model=model)
    else:
        raise ValueError("Unsupported platform")

def process_text(input_text, ai_instance):
    try:
        response, error = ai_instance.chat_non_stream(input_text)
        if error:
            return "", error
        return response.strip(), ""
    except Exception as e:
        return "", f"An error occurred: {str(e)}"

def clear_text():
    return "", "", ""

def save_text(input_text, output_text, system_message):
    if not input_text or not output_text or not system_message:
        return "Error: Input text, output text, and system message must not be empty"
    try:
        filename = "dataset.json"
        data = {
            "instruction": system_message,
            "input": input_text,
            "output": output_text
        } 
        # Read existing data or create an empty list
        try:
            with open(filename, "r") as file:
                existing_data = json.load(file)
        except (FileNotFoundError, json.JSONDecodeError):
            existing_data = []
        
        # Append new data and write back to file
        existing_data.append(data)
        with open(filename, "w") as file:
            json.dump(existing_data, file, ensure_ascii=False, indent=2)
        
        return f"Successfully saved to {filename}"
    except Exception as e:
        return f"Error saving: {str(e)}"

def process_wrapper(input_text, platform, api_key, system_prompt, model):
    if not input_text:
        return "", "Error: Input text is empty"
    try:
        ai_instance = get_ai_instance(platform, api_key, system_prompt, model)
        output, error = process_text(input_text, ai_instance)
        return output, error
    except Exception as e:
        return "", f"Error: {str(e)}"

with gr.Blocks() as demo:
    gr.Markdown("模型微调数据集生成工具")
    with gr.Row(): # 一个gr一行， with gr.row会在一行中显示
        platform = gr.Dropdown(["Novita", "OpenAI"], label="使用平台", value="Novita")
        api_key = gr.Textbox(label="API Key")
        model = gr.Dropdown(
            [
                "qwen/qwen-2.5-72b-instruct",
                "qwen/qwen-2-72b-instruct",
                "meta-llama/llama-3.1-405b-instruct",
                "meta-llama/llama-3-70b-instruct",
                "meta-llama/llama-3.1-70b-instruct"
            ],
            label="使用模型",
            value="qwen/qwen-2.5-72b-instruct"
        )
        system_prompt = gr.Dropdown(
            [
                "You are a Python code assistant. Your task is to analyze pytest.mark.parametrize decorators and their associated docstrings. Based on the docstring description, fill in appropriate parameter values that match the documentation. Only provide the completed pytest.mark.parametrize decorator with filled parameters. Do not include any explanations or additional text in your response.",
                "You are a helpful assistant. Provide concise and accurate responses to user queries."
            ],
            label="系统提示词",
            value="You are a Python code assistant. Your task is to analyze pytest.mark.parametrize decorators and their associated docstrings. Based on the docstring description, fill in appropriate parameter values that match the documentation. Only provide the completed pytest.mark.parametrize decorator with filled parameters. Do not include any explanations or additional text in your response."
        )

    input_text = gr.Textbox(label="输入文本", lines=5)
    output_text = gr.Textbox(label="处理后的文本", lines=5)

    with gr.Row():
        process_btn = gr.Button("处理")
        clear_btn = gr.Button("清除")
        save_btn = gr.Button("保存")

    error_text = gr.Textbox(label="错误信息", lines=1)
    status_msg = gr.Textbox(label="状态")
    
    process_btn.click(
        fn=process_wrapper,                                              # 指定点击后要执行的函数，这里是 process_wrapper 函数
        inputs=[input_text, platform, api_key, system_prompt, model],    # 指定输入组件，这里是输入文本框，函数会接收到文本框的值
        outputs=[output_text, error_text],                               # 指定输出组件列表，函数的返回值会分别更新这些组件
        api_name="process",                                              # 指定API端点名称，可通过 /api/process 访问此功能
        queue=False                                                      # 禁用队列，使请求立即处理，不需要等待之前的请求完成
    )
    
    clear_btn.click(
        fn=clear_text,
        inputs=None,
        outputs=[input_text, output_text, error_text],
        queue=False
    )
    
    save_btn.click(
        fn=save_text,
        inputs=[input_text, output_text, system_prompt],
        outputs=status_msg,
        queue=False
    )

if __name__ == "__main__":
    demo.launch(
        server_name="0.0.0.0",
        share=True,
        show_error=True
    )
