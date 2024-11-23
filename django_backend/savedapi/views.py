from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import SavedAPI, SavedAPIDirectory
from django.db import transaction
import yaml
import json
from django.db.utils import IntegrityError

class SaveAPIView(APIView):
    def post(self, request):
        try:
            with transaction.atomic():
                apis = request.data.get('apis', [])
                directory = request.data.get('directory')
                
                saved_apis = []
                skipped_apis = []
                
                for api in apis:
                    method = api.get('method', '').upper()
                    path = api.get('path', '')
                    
                    try:
                        # Try to create new API
                        saved_api = SavedAPI.objects.create(
                            apiinfo=api,
                            directory=directory,
                            api_method=method,
                            api_path=path
                        )
                        saved_apis.append(saved_api)
                    except IntegrityError:
                        # API already exists
                        skipped_apis.append({
                            'method': method,
                            'path': path
                        })
                
                response_data = {
                    "message": f"{len(saved_apis)} APIs saved successfully"
                }
                
                if skipped_apis:
                    response_data["skipped"] = skipped_apis
                
                return Response(response_data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class RemoveAPIView(APIView):
    def post(self, request):
        try:
            with transaction.atomic():
                apis = request.data.get('apis', [])
                directory = request.data.get('directory')
                
                if not apis:
                    return Response({"error": "No APIs provided"}, status=status.HTTP_400_BAD_REQUEST)
                
                deleted_count = 0
                not_found = []
                
                for api in apis:
                    method = api.get('method', '').upper()
                    path = api.get('path', '')
                    
                    # Delete API by directory, method, and path
                    result = SavedAPI.objects.filter(
                        directory=directory,
                        api_method=method,
                        api_path=path
                    ).delete()
                    
                    if result[0] > 0:
                        deleted_count += result[0]
                    else:
                        not_found.append({
                            'method': method,
                            'path': path
                        })
                
                response_data = {
                    "message": f"{deleted_count} APIs deleted successfully",
                    "deleted_count": deleted_count
                }
                
                if not_found:
                    response_data["not_found"] = not_found
                
                return Response(response_data, status=status.HTTP_200_OK)
                
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class GetAllAPIsView(APIView):
    def get(self, request):
        try:
            # Get all APIs grouped by directory
            apis = SavedAPI.objects.all()
            result = {}
            
            for api in apis:
                if api.directory not in result:
                    result[api.directory] = []
                result[api.directory].append(api.apiinfo)
            
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class GetDirectoriesView(APIView):
    def get(self, request):
        try:
            directory_type = request.query_params.get('directory_type')
            
            if directory_type:
                # Filter directories by type if provided
                directories = SavedAPIDirectory.objects.filter(
                    directory_type=directory_type
                ).values_list('name', flat=True)
            else:
                # Get all directories if no type specified
                directories = SavedAPIDirectory.objects.values_list('name', flat=True)
            
            return Response(list(directories), status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    def post(self, request):
        try:
            name = request.data.get('name')
            directory_type = request.data.get('directory_type')
            
            if not name or not directory_type:
                return Response(
                    {"error": "Both name and directory_type are required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create new directory
            directory = SavedAPIDirectory.objects.create(
                name=name,
                directory_type=directory_type
            )
            
            return Response({
                "message": "Directory created successfully",
                "directory": {
                    "id": directory.id,
                    "name": directory.name,
                    "directory_type": directory.directory_type
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ConvertSwaggerView(APIView):
    def post(self, request):
        try:
            if 'file' not in request.FILES:
                return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)

            file = request.FILES['file']
            file_content = file.read().decode('utf-8')
            
            try:
                # Try to parse as YAML
                api_spec = yaml.safe_load(file_content)
            except yaml.YAMLError:
                try:
                    # If YAML parsing fails, try JSON
                    api_spec = json.loads(file_content)
                except json.JSONDecodeError:
                    return Response(
                        {"error": "Invalid file format. Must be YAML or JSON"},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            converted_apis = []
            
            if api_spec.get('swagger') or api_spec.get('openapi'):
                # Process Swagger/OpenAPI format
                paths = api_spec.get('paths', {})
                for path, methods in paths.items():
                    for method, spec in methods.items():
                        if method.lower() not in ['get', 'post', 'put', 'delete', 'patch', 'options', 'head']:
                            continue

                        # Handle request body
                        request_body = None
                        if spec.get('requestBody'):
                            request_body = spec['requestBody']
                        elif spec.get('parameters'):
                            body_param = next(
                                (p for p in spec['parameters'] if p.get('in') == 'body'),
                                None
                            )
                            if body_param:
                                request_body = {
                                    'required': body_param.get('required', False),
                                    'content': {
                                        'application/json': {
                                            'schema': body_param.get('schema', {}),
                                            'example': body_param.get('example')
                                        }
                                    }
                                }

                        # Handle responses
                        responses = {}
                        for code, response in spec.get('responses', {}).items():
                            responses[code] = {
                                'description': response.get('description', ''),
                                'content': response.get('content') or {
                                    'application/json': {
                                        'schema': response.get('schema'),
                                        'example': response.get('example')
                                    }
                                }
                            }

                        converted_apis.append({
                            'path': path,
                            'method': method.upper(),
                            'summary': spec.get('summary', ''),
                            'description': spec.get('description', ''),
                            'parameters': [
                                {
                                    'name': p.get('name'),
                                    'in': p.get('in'),
                                    'description': p.get('description', ''),
                                    'required': p.get('required', False),
                                    'type': p.get('type') or p.get('schema', {}).get('type', 'string'),
                                    'schema': p.get('schema')
                                }
                                for p in spec.get('parameters', [])
                                if p.get('in') != 'body'
                            ],
                            'requestBody': request_body,
                            'responses': responses,
                            'tags': spec.get('tags', [])
                        })

            elif api_spec.get('items'):
                # Process ApiPost format
                for item in api_spec['items']:
                    request_body = None
                    if item.get('request', {}).get('body'):
                        request_body = {
                            'content': {
                                'application/json': {
                                    'schema': item['request']['body'].get('schema', {}),
                                    'example': item['request']['body'].get('example')
                                }
                            }
                        }

                    responses = {}
                    if item.get('response'):
                        for code, response in item['response'].items():
                            responses[code] = {
                                'description': response.get('description', ''),
                                'content': {
                                    'application/json': {
                                        'schema': response.get('schema', {}),
                                        'example': response.get('example')
                                    }
                                }
                            }

                    parameters = []
                    # Add query parameters
                    for param in item.get('request', {}).get('query', []):
                        parameters.append({
                            'name': param.get('name'),
                            'in': 'query',
                            'description': param.get('description', ''),
                            'required': param.get('required', False),
                            'type': param.get('type', 'string')
                        })
                    # Add header parameters
                    for param in item.get('request', {}).get('headers', []):
                        parameters.append({
                            'name': param.get('name'),
                            'in': 'header',
                            'description': param.get('description', ''),
                            'required': param.get('required', False),
                            'type': param.get('type', 'string')
                        })

                    converted_apis.append({
                        'path': item.get('path'),
                        'method': item.get('method', '').upper(),
                        'summary': item.get('title', ''),
                        'description': item.get('description', ''),
                        'parameters': parameters,
                        'requestBody': request_body,
                        'responses': responses
                    })

            return Response({'apis': converted_apis}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": f"Failed to convert file: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
