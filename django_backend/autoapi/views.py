from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import SavedApiCode
from django.db import transaction
from django.core.exceptions import ObjectDoesNotExist
from savedapi.models import SavedAPIDirectory
from .models import Group
import json

# Create your views here.

class AddApiCodeWithGroupView(APIView):
    def post(self, request):
        try:
            with transaction.atomic():
                api_data = request.data
                api_method = api_data['api_method']
                api_path = api_data['api_path']
                directory = api_data['directory']
                new_groups = api_data.get('group', [])

                # Check if API already exists
                try:
                    api = SavedApiCode.objects.get(
                        api_method=api_method,
                        api_path=api_path,
                        directory=directory
                    )
                    # Get existing groups and append new ones
                    existing_groups = api.get_group()
                    updated_groups = list(set(existing_groups + new_groups))  # Remove duplicates
                    api.set_group(updated_groups)
                    api.save()
                    message = "API groups updated successfully"
                except SavedApiCode.DoesNotExist:
                    # Create new API with groups
                    api = SavedApiCode.objects.create(
                        api_method=api_method,
                        api_path=api_path,
                        directory=directory,
                        bussiness_code=api_data.get('bussiness_code', ''),
                        common_code=api_data.get('common_code', ''),
                        testcases_code=api_data.get('testcases_code', ''),
                        is_auto_test=api_data.get('is_auto_test', False),
                        report_url=api_data.get('report_url', ''),
                        header_params=api_data.get('header_params', ''),
                        path_params=api_data.get('path_params', ''),
                        query_params=api_data.get('query_params', ''),
                        body_params=api_data.get('body_params', ''),
                        response_params=api_data.get('response_params', '')
                    )
                    api.set_group(new_groups)
                    api.save()
                    message = "API created with groups successfully"

                return Response({"message": message}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class AddApiCodeWithoutGroupView(APIView):
    def post(self, request):
        try:
            with transaction.atomic():
                api_data = request.data
                api = SavedApiCode.objects.create(
                    api_method=api_data['api_method'],
                    api_path=api_data['api_path'],
                    directory=api_data['directory'],
                    bussiness_code=api_data.get('bussiness_code', ''),
                    common_code=api_data.get('common_code', ''),
                    testcases_code=api_data.get('testcases_code', ''),
                    is_auto_test=api_data.get('is_auto_test', False),
                    report_url=api_data.get('report_url', ''),
                    header_params=api_data.get('header_params', ''),
                    path_params=api_data.get('path_params', ''),
                    query_params=api_data.get('query_params', ''),
                    body_params=api_data.get('body_params', ''),
                    response_params=api_data.get('response_params', '')
                )
                api.set_group([])
                api.save()
                return Response({"message": "API created successfully"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class GetApiCodeView(APIView):
    def post(self, request):
        try:
            api_method = request.data.get('api_method')
            api_path = request.data.get('api_path')
            directory = request.data.get('directory')
            
            api = SavedApiCode.objects.get(
                api_method=api_method,
                api_path=api_path,
                directory=directory
            )
            
            return Response({
                'api_method': api.api_method,
                'api_path': api.api_path,
                'directory': api.directory,
                'bussiness_code': api.bussiness_code,
                'common_code': api.common_code,
                'testcases_code': api.testcases_code,
                'is_auto_test': api.is_auto_test,
                'report_url': api.report_url,
                'header_params': api.header_params,
                'path_params': api.path_params,
                'query_params': api.query_params,
                'body_params': api.body_params,
                'response_params': api.response_params,
                'group': api.get_group(),
                'apiinfo': api.apiinfo
            })
        except ObjectDoesNotExist:
            return Response({"error": "API not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class UpdateApiCodeView(APIView):
    def post(self, request):
        try:
            with transaction.atomic():
                api_method = request.data.get('api_method')
                api_path = request.data.get('api_path')
                directory = request.data.get('directory')
                
                api = SavedApiCode.objects.get(
                    api_method=api_method,
                    api_path=api_path,
                    directory=directory
                )
                
                # Update fields
                api.bussiness_code = request.data.get('bussiness_code', api.bussiness_code)
                api.common_code = request.data.get('common_code', api.common_code)
                api.testcases_code = request.data.get('testcases_code', api.testcases_code)
                api.is_auto_test = request.data.get('is_auto_test', api.is_auto_test)
                api.report_url = request.data.get('report_url', api.report_url)
                api.header_params = request.data.get('header_params', api.header_params)
                api.path_params = request.data.get('path_params', api.path_params)
                api.query_params = request.data.get('query_params', api.query_params)
                api.body_params = request.data.get('body_params', api.body_params)
                api.response_params = request.data.get('response_params', api.response_params)
                
                api.save()
                return Response({"message": "API updated successfully"})
        except ObjectDoesNotExist:
            return Response({"error": "API not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class DeleteApiCodeView(APIView):
    def post(self, request):
        try:
            with transaction.atomic():
                api_method = request.data.get('api_method')
                api_path = request.data.get('api_path')
                directory = request.data.get('directory')
                
                api = SavedApiCode.objects.get(
                    api_method=api_method,
                    api_path=api_path,
                    directory=directory
                )
                
                api.delete()
                return Response({"message": "API deleted successfully"})
        except ObjectDoesNotExist:
            return Response({"error": "API not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class GetAllGroupsApiCodeView(APIView):
    def get(self, request):
        try:
            apis = SavedApiCode.objects.all()
            result = {}
            for api in apis:
                groups = api.get_group()
                for group in groups:
                    if group not in result:
                        result[group] = []
                    result[group].append({
                        'api_method': api.api_method,
                        'api_path': api.api_path,
                        'directory': api.directory,
                        'bussiness_code': api.bussiness_code,
                        'common_code': api.common_code,
                        'testcases_code': api.testcases_code,
                        'is_auto_test': api.is_auto_test,
                        'report_url': api.report_url,
                        'header_params': api.header_params,
                        'path_params': api.path_params,
                        'query_params': api.query_params,
                        'body_params': api.body_params,
                        'response_params': api.response_params,
                        'group': groups,
                        'apiinfo': api.apiinfo
                    })
            return Response(result)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class GetGroupApiCodeView(APIView):
    def get(self, request):
        try:
            group_name = request.GET.get('group_name')
            if not group_name:
                return Response({"error": "group_name is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            apis = SavedApiCode.objects.all()
            result = []
            for api in apis:
                groups = api.get_group()
                if group_name in groups:
                    result.append({
                        'api_method': api.api_method,
                        'api_path': api.api_path,
                        'directory': api.directory,
                        'bussiness_code': api.bussiness_code,
                        'common_code': api.common_code,
                        'testcases_code': api.testcases_code,
                        'is_auto_test': api.is_auto_test,
                        'report_url': api.report_url,
                        'header_params': api.header_params,
                        'path_params': api.path_params,
                        'query_params': api.query_params,
                        'body_params': api.body_params,
                        'response_params': api.response_params,
                        'group': groups,
                        'apiinfo': api.apiinfo
                    })
            return Response({group_name: result})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class DeleteGroupApiCodeView(APIView):
    def post(self, request):
        try:
            with transaction.atomic():
                api_method = request.data.get('api_method')
                api_path = request.data.get('api_path')
                directory = request.data.get('directory')
                group_name = request.data.get('group')

                api = SavedApiCode.objects.get(
                    api_method=api_method,
                    api_path=api_path,
                    directory=directory
                )
                
                groups = api.get_group()
                if group_name in groups:
                    groups.remove(group_name)
                    api.set_group(groups)
                    api.save()
                
                return Response({"message": "API deleted successfully"})
        except ObjectDoesNotExist:
            return Response({"error": "API not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class GetGroupsView(APIView):
    def get(self, request):
        try:
            groups = Group.objects.all().values('id', 'name', 'url')
            return Response(list(groups))
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class DeleteGroupView(APIView):
    def post(self, request):
        try:
            with transaction.atomic():
                group_name = request.data.get('name')
                if not group_name:
                    return Response({"error": "Group name is required"}, status=status.HTTP_400_BAD_REQUEST)

                # Delete the group
                try:
                    group = Group.objects.get(name=group_name)
                    group.delete()

                    # Remove this group from all APIs that have it
                    apis = SavedApiCode.objects.all()
                    for api in apis:
                        groups = api.get_group()
                        if group_name in groups:
                            groups.remove(group_name)
                            api.set_group(groups)
                            api.save()

                    return Response({"message": "Group deleted successfully"})
                except Group.DoesNotExist:
                    return Response({"error": "Group not found"}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class AddGroupView(APIView):
    def post(self, request):
        try:
            with transaction.atomic():
                group_name = request.data.get('name')
                group_url = request.data.get('url', '')

                if not group_name:
                    return Response({"error": "Group name is required"}, status=status.HTTP_400_BAD_REQUEST)

                # Create new group
                group = Group.objects.create(
                    name=group_name,
                    url=group_url
                )

                return Response({
                    "message": "Group created successfully",
                    "id": group.id,
                    "name": group.name,
                    "url": group.url
                })
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class UpdateGroupView(APIView):
    def post(self, request):
        try:
            with transaction.atomic():
                group_name = request.data.get('name')
                new_url = request.data.get('url')

                if not group_name:
                    return Response({"error": "Group name is required"}, status=status.HTTP_400_BAD_REQUEST)
                if new_url is None:
                    return Response({"error": "New URL is required"}, status=status.HTTP_400_BAD_REQUEST)

                try:
                    group = Group.objects.get(name=group_name)
                    group.url = new_url
                    group.save()

                    return Response({
                        "message": "Group URL updated successfully",
                        "id": group.id,
                        "name": group.name,
                        "url": group.url
                    })
                except Group.DoesNotExist:
                    return Response({"error": "Group not found"}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class GetAllAutoTestStatusView(APIView):
    def get(self, request):
        try:
            # Get all saved APIs
            apis = SavedApiCode.objects.all()
            
            # Create a list of dictionaries with API info and auto test status
            auto_test_statuses = []
            for api in apis:
                auto_test_statuses.append({
                    'api_method': api.api_method,
                    'api_path': api.api_path,
                    'directory': api.directory,
                    'is_auto_test': api.is_auto_test
                })
            
            return Response({
                'status': 'success',
                'data': auto_test_statuses
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
