import gradio as gr
import openai
import json
import os
from dotenv import load_dotenv
import requests

# Load environment variables
load_dotenv()

def process_text(input_text):
    openai.api_key = os.getenv("OPENAI_API_KEY")
    
    try:
        response = openai.Completion.create(
            engine="text-davinci-002",
            prompt=input_text,
            max_tokens=100,
            timeout=8  # Add timeout to the API call
        )
        return response.choices[0].text.strip(), ""


        # res = requests.get("https://www.google.com", timeout=3)
        # return res.text, ""

    except Exception as e:
        return "", f"An error occurred: {str(e)}"

def clear_text():
    return "", "", ""

def save_text(input_text, output_text):
    if not input_text or not output_text:
        return "Error: Both input and output text must not be empty"
    try:
        filename = "dataset.jsonl"
        data = {"prompt": input_text, "completion": output_text}
        with open(filename, "a") as file:
            json.dump(data, file)
            file.write("\n")
        return f"Successfully saved to {filename}"
    except Exception as e:
        return f"Error saving: {str(e)}"

def process_wrapper(input_text):
    if not input_text:
        return "", "Error: Input text is empty"
    try:
        output, error = process_text(input_text)
        return output, error
    except Exception as e:
        return "", f"Error: {str(e)}"

with gr.Blocks() as demo:
    gr.Markdown("模型微调数据集生成工具")
    
    input_text = gr.Textbox(label="输入文本", lines=5)
    output_text = gr.Textbox(label="处理后的文本", lines=5)

    with gr.Row():
        process_btn = gr.Button("处理")
        clear_btn = gr.Button("清除")
        save_btn = gr.Button("保存")

    error_text = gr.Textbox(label="错误信息", lines=1)
    status_msg = gr.Textbox(label="状态")
    
    # 配置处理按钮的点击事件
    process_btn.click(
        fn=process_wrapper,          # 指定点击后要执行的函数，这里是 process_wrapper 函数
        inputs=input_text,           # 指定输入组件，这里是输入文本框，函数会接收到文本框的值
        outputs=[output_text, error_text],  # 指定输出组件列表，函数的返回值会分别更新这些组件
        api_name="process",          # 指定API端点名称，可通过 /api/process 访问此功能
        queue=False                  # 禁用队列，使请求立即处理，不需要等待之前的请求完成
    )
    
    clear_btn.click(
        fn=clear_text,
        inputs=None,
        outputs=[input_text, output_text, error_text],
        queue=False
    )
    
    save_btn.click(
        fn=save_text,
        inputs=[input_text, output_text],
        outputs=status_msg,
        queue=False
    )

if __name__ == "__main__":
    demo.launch(
        server_name="0.0.0.0",
        share=True,
        show_error=True
    )
