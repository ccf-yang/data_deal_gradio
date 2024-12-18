import json
import os

def get_api_info(apis=[]):
    api_dic = {}
    # print(json.dumps(apis))
    if not apis:
        # Load API data
        api_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'api.json')
        with open(api_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            swagger_data = data.get("console")
    else:
        swagger_data = apis

    for api in swagger_data:
        path = api.get('path', '')
        method = api.get('method', '').lower()
        name = api.get('summary', '')
        
        # Process parameters
        path_params = []
        query_params = []
        body_params = []
        
        # Extract parameters from the parameters list
        for param in api.get('parameters', []):
            param_name = param.get('name', '')
            param_in = param.get('in', '')
            param_type = param.get("type","string")
            
            if param_in == 'path':
                path_params.append(f"{param_name}/{param_type}")
            elif param_in == 'query':
                query_params.append(f"{param_name}/{param_type}")

        # Extract body parameters from requestBody
        body_params = []
        if 'requestBody' in api and api['requestBody']:
            request_body = api['requestBody']
            if isinstance(request_body, dict):
                content = request_body.get('content', {})
                if isinstance(content, dict):
                    json_content = content.get('application/json', {})
                    if isinstance(json_content, dict):
                        schema = json_content.get('schema', {})
                        if isinstance(schema, dict):
                            # Only process if we have direct properties
                            if 'properties' in schema:
                                properties = schema['properties']
                                # required = schema.get('required', [])
                                # required_types = schema.get('type', '')
                                
                                # # Add required fields first
                                # if required:
                                #     print("required:", required)
                                #     body_params.extend(f"{required}_{required_types}")
                                
                                # Then add remaining properties
                                for prop_name, prop_details in properties.items():
                                    a=prop_name
                                    b=prop_details
                                    if prop_name not in body_params:
                                        if prop_details.get('type') == 'object':
                                            # Handle nested object with properties
                                            if 'properties' in prop_details:
                                                for subpropname, subpropdetails in prop_details['properties'].items():
                                                    sub_key = f"{prop_name}.{subpropname}"
                                                    if sub_key not in body_params:
                                                        sub_key_type = subpropdetails.get('type', 'string')
                                                        body_params.append(f"{sub_key}/{sub_key_type}")
                                            # Handle array with object items
                                            elif 'items' in prop_details:
                                                print("---"*100)
                                                print(api)
                                                items = prop_details['items']
                                                if isinstance(items, dict) and 'properties' in items:
                                                    inner_props = list(items['properties'].keys())
                                                    body_params.append(f"{prop_name}_{','.join(inner_props)}")
                                                else:
                                                    body_params.append(f"{prop_name}/string")
                                        else:
                                            # Handle simple types
                                            body_params.append(f"{prop_name}/{prop_details.get('type','string')}")
        
        # Extract response parameters
        resp_params = {}
        if 'responses' in api and '200' in api['responses']:
            success_response = api['responses']['200']
            if 'content' in success_response:
                content = success_response['content']
                if 'application/json' in content:
                    schema = content['application/json'].get('schema', {})
                    if schema and isinstance(schema, dict):
                        def process_properties(properties):
                            """Process schema properties"""
                            if not isinstance(properties, dict):
                                return {}
                            
                            result = {}
                            for prop_name, prop_details in properties.items():
                                if not isinstance(prop_details, dict):
                                    result[prop_name] = ""
                                    continue
                                
                                # Handle nested object with properties
                                if 'properties' in prop_details:
                                    inner_props = list(prop_details['properties'].keys())
                                    result[prop_name] = ','.join(inner_props)
                                # Handle array with object items
                                elif 'items' in prop_details:
                                    items = prop_details['items']
                                    if isinstance(items, dict) and 'properties' in items:
                                        inner_props = list(items['properties'].keys())
                                        result[prop_name] = ','.join(inner_props)
                                    else:
                                        result[prop_name] = ""
                                # Handle simple types
                                else:
                                    result[prop_name] = ""
                            return result

                        # Only process if we have direct properties
                        if 'properties' in schema:
                            resp_params = process_properties(schema['properties'])
                        
        # Convert response parameters to string format
        resp_params_str = json.dumps(resp_params) if resp_params else '{}'
        
        # Format parameters as strings
        path_params_str = ','.join(path_params) if path_params else ''
        query_params_str = ','.join(query_params) if query_params else ''
        body_params_str = ','.join(body_params) if body_params else ''
        
        # Check if parameters are needed
        needpath = '1' if path_params else ''
        needquery = '1' if query_params else ''
        needbody = '1' if body_params_str else ''
        
        # Generate function name
        funcname = f"{method.lower()}_{'_'.join(path.strip('/').split('/'))}"
        
        # Create API identifier
        api_id = f"{method}{path.replace('/', '_')}"
        
        # Combine all information with ++ separator
        api_info = '++'.join([
            method,
            path,
            needpath,
            needquery,
            needbody,
            funcname,
            name,
            path_params_str,
            query_params_str,
            body_params_str,
            api_id,
            '',  # customstatus
            resp_params_str
        ])
        
        api_dic[api_id] = api_info
    
    return api_dic


if __name__ == '__main__':
    apis = []
    api_info = get_api_info(apis)
    print(api_info)
    
    # Debug print
    # print("Sample API info entry:")
    # for api_id, details in api_info.items():
    #     print(f"Key: {api_id}")
    #     print(f"Value: {details}")
    #     print(f"Number of '++' separated values: {len(details.split('++'))}")
    
