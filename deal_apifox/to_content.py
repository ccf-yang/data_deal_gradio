from typing import Dict, List, Any, Tuple
from dataclasses import dataclass
import json
import csv

@dataclass
class BaseKey:
    name: str
    nametype: str
    description: str
    required: bool

@dataclass
class BaseDict:
    oldDict: Dict = None
    allType: List[BaseKey] = None # object类型的参数不要放在里面，比如一个字典{"a":{"b":1}},这里应该是[{"name":"b","nametype":"int","description":"","required":false}]

@dataclass
class InterfaceContent:
    title: str = None
    method: str = None
    path: str = None
    fullPath: str = None # 如果有path parameters，需要拼接成完整的path，没有就等于path值
    tags: List[str] = None
    description: str = None
    parameters_example: List[str] = None  # 参数示例 ["name","pass"]
    parameters_structure: List[BaseKey] = None # 参数结构 [{"name":"name","nametype":"string","description":"","required":false}]
    headers_example: List[str] = None
    headers_structure: List[BaseKey] = None
    requestBody_example: Dict = None
    requestBody_structure: List[BaseKey] = None
    response_example: Dict = None
    responses_structure: List[BaseKey] = None
    deprecated: bool = None


def parse_parameters(params: List[Dict]) -> List[BaseKey]:
    result = []
    if params:
        for param in params:
            if param.get("in") != "header":
                result.append(BaseKey(
                    name=param.get("name", ""),
                    nametype=param.get("schema", {}).get("type", param.get("type", "string")),
                    description=param.get("description", ""),
                    required=param.get("required", False)
                ))
    return result

def parse_headers(params: List[Dict]) -> List[BaseKey]:
    result = []
    if params:
        for param in params:
            if param.get("in") == "header":
                result.append(BaseKey(
                    name=param.get("name", ""),
                    nametype=param.get("schema", {}).get("type", param.get("type", "string")),
                    description=param.get("description", ""),
                    required=param.get("required", False)
                ))
    return result

def parse_schema_properties(schema: Dict) -> List[BaseKey]:
    result = []
    if not schema or 'properties' not in schema:
        return result
    
    properties = schema['properties']
    required_fields = schema.get('required', [])
    
    def parse_property(prop_name, prop_details, parent_is_array=False):
        if prop_details.get('type') == 'object' and 'properties' in prop_details:
            for sub_prop_name, sub_prop_details in prop_details['properties'].items():
                parse_property(f"{prop_name}.{sub_prop_name}", sub_prop_details, parent_is_array)
        elif prop_details.get('type') == 'array' and 'items' in prop_details:
            items = prop_details['items']
            if items.get('type') == 'object' and 'properties' in items:
                for sub_prop_name, sub_prop_details in items['properties'].items():
                    parse_property(f"{prop_name}.+{sub_prop_name}", sub_prop_details, True)
            else:
                result.append(BaseKey(
                    name=f"{prop_name}.+" if parent_is_array else f"+{prop_name}",
                    nametype=f"array of {items.get('type', 'string')}",
                    description=prop_details.get('description', ''),
                    required=prop_name in required_fields
                ))
        else:
            result.append(BaseKey(
                name=f"{prop_name}" if parent_is_array else prop_name,
                nametype=prop_details.get('type', 'string'),
                description=prop_details.get('description', ''),
                required=prop_name in required_fields
            ))
    
    for prop_name, prop_details in properties.items():
        parse_property(prop_name, prop_details)
    
    return result

def get_parameter_examples(parameters: List[Dict]) -> List[str]:
    examples = []
    if parameters:
        for param in parameters:
            if param.get("in") != "header":
                name = param.get("name", "")
                examples.append(f"{name}")
    return examples

def get_header_examples(parameters: List[Dict]) -> List[str]:
    examples = []
    if parameters:
        for param in parameters:
            if param.get("in") == "header":
                name = param.get("name", "")
                examples.append(f"{name}")
    return examples

def get_content_example(content: Dict) -> Dict:
    if not content:
        return {}
    
    if "example" in content:
        # if len(content["example"]) < 300:
        return content["example"]
    else:
        print("没有example")
        return {}
    schema = content.get("schema", {})
    schema_keys = parse_schema_properties(schema)
    
    if schema_keys:
        result = {}
        for key in schema_keys:
            parts = key.name.split('.')
            current = result
            for i, part in enumerate(parts):
                if part.startswith('+'):
                    part = part[1:]
                    if i == len(parts) - 1: # 最后一层
                        if isinstance(current, list):
                            current.append({part: key.nametype})
                        else:
                            current = [{part: key.nametype}]
                    else:
                        if not isinstance(current, list):
                            current = []
                        if not current or not isinstance(current[-1], dict):
                            current.append({})
                        current = current[-1]
                        if part not in current:
                            current[part] = []
                        current = current[part]
                else:
                    if i == len(parts) - 1:
                        current[part] = key.nametype
                    else:
                        if part not in current:
                            if any(p.startswith('+') for p in parts[i+1:]):
                                current[part] = []
                            else:
                                current[part] = {}
                        current = current[part]
                        # 这里创建新的嵌套字典结构，如果key不存在
        return result
    
    return {}

def parse_openapi_spec(file_path: str = "openapi.json") -> List[InterfaceContent]:
    with open(file_path, 'r', encoding='utf-8') as f:
        spec = json.load(f)
    
    interfaces = []
    paths = spec.get('paths', {})
    
    for path, methods in paths.items():
        for method, operation in methods.items():
            # if path != '/v3/async/txt2video':
            #     continue
            interface = InterfaceContent()
            interface.path = path
            interface.method = method.upper()
            interface.title = operation.get('summary', '')
            interface.description = operation.get('description', '')
            interface.tags = operation.get('tags', [])
            interface.deprecated = operation.get('deprecated', False)
            
            # Handle parameters
            parameters = operation.get('parameters', [])
            interface.parameters_structure = parse_parameters(parameters)
            interface.headers_structure = parse_headers(parameters)
            interface.parameters_example = get_parameter_examples(parameters)
            interface.headers_example = get_header_examples(parameters)
            
            # Handle request body
            request_body = operation.get('requestBody', {})
            if request_body:
                content = request_body.get('content', {}).get('application/json', {})
                schema = content.get('schema', {})
                interface.requestBody_example = get_content_example(content)
                interface.requestBody_structure = parse_schema_properties(schema)
                # print(interface.requestBody_structure)
            
            # Handle responses
            responses = operation.get('responses', {}).get('200', {})
            if responses:
                content = responses.get('content', {}).get('application/json', {})
                schema = content.get('schema', {})
                interface.response_example = get_content_example(content)
                interface.responses_structure = parse_schema_properties(schema)
            
            interfaces.append(interface)
    
    return interfaces

def print_interfaces(interfaces: List[InterfaceContent]):
    for interface in interfaces:
        print(interface)
        print("\n" + "="*50)
        print(f"Title: {interface.title}")
        print(f"Method: {interface.method}")
        print(f"Path: {interface.path}")
        print(f"Tags: {interface.tags}")
        print(f"Description: {interface.description}")
        print(f"Deprecated: {interface.deprecated}")
        print("Parameters:")
        if interface.parameters_structure:
            for param in interface.parameters_structure:
                print(f"  - {param.name} ({param.nametype}): {param.description}")
        print("Headers:")
        if interface.headers_structure:
            for header in interface.headers_structure:
                print(f"  - {header.name} ({header.nametype}): {header.description}")
        print("Request Body:")
        if interface.requestBody_structure:
            for body_param in interface.requestBody_structure:
                print(f"  - {body_param.name} ({body_param.nametype}): {body_param.description}")
        print("Response:")
        if interface.responses_structure:
            for response_param in interface.responses_structure:
                print(f"  - {response_param.name} ({response_param.nametype}): {response_param.description}")
        print("="*50)
        # break

def convert_basekey_list_to_dict_list(basekey_list):
    """将BaseKey对象列表转换为字典列表"""
    if not basekey_list:
        return []
    return [
        {
            "name": item.name,
            "type": item.nametype,
            "description": item.description,
            "required": item.required
        }
        for item in basekey_list
    ]

def export_interfaces_to_csv(interfaces: List[InterfaceContent], filename: str = "api_documentation.csv"):
    if not interfaces:
        return
    
    fields = [
        'title', 'method', 'path', 'fullPath', 'tags', 'description',
        'parameters_example', 'parameters_structure', 'headers_example',
        'headers_structure', 'requestBody_example', 'requestBody_structure',
        'response_example', 'responses_structure', 'deprecated'
    ]
    
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        
        for interface in interfaces:
            row = {field: getattr(interface, field) for field in fields }
            if len(row['title']) > 100:
                continue
            print(row['title'])
            # Convert complex objects to JSON strings
            if row['parameters_example']:
                row['parameters_example'] = json.dumps(row['parameters_example'], ensure_ascii=False)
            if row['headers_example']:
                row['headers_example'] = json.dumps(row['headers_example'], ensure_ascii=False)
            # if row['requestBody_example']:
            #     row['requestBody_example'] = json.dumps(row['requestBody_example'], ensure_ascii=False)
            # if row['response_example']:
            #     row['response_example'] = json.dumps(row['response_example'], ensure_ascii=False)
            
            # Convert structures to dict lists and then to JSON strings
            if row['parameters_structure']:
                row['parameters_structure'] = json.dumps(convert_basekey_list_to_dict_list(row['parameters_structure']), ensure_ascii=False)
            if row['headers_structure']:
                row['headers_structure'] = json.dumps(convert_basekey_list_to_dict_list(row['headers_structure']), ensure_ascii=False)
            # if row['requestBody_structure']:
            #     row['requestBody_structure'] = json.dumps(convert_basekey_list_to_dict_list(row['requestBody_structure']), ensure_ascii=False)
            # if row['responses_structure']:
            #     row['responses_structure'] = json.dumps(convert_basekey_list_to_dict_list(row['responses_structure']), ensure_ascii=False)
            
            print(json.dumps(row, ensure_ascii=False, indent=2))
            # break
            writer.writerow(row)
    
    print(f"接口文档已导出到 {filename}")

if __name__ == "__main__":
    file_path = "/Volumes/local/local_code/yang/python_gradio_web_ui/deal_apifox/Novita.ai.openapi.json"
    try:
        interfaces = parse_openapi_spec(file_path)
        # print_interfaces(interfaces)
        export_interfaces_to_csv(interfaces)
    except Exception as e:
        print(f"\n\033[91m错误: {str(e)}\033[0m")