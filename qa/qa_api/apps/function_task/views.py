from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from .models import FunctionTask
import json

# Create your views here.

class CreateFunctionTaskView(APIView):
    def post(self, request):
        try:
            with transaction.atomic():
                task_data = {
                    'name': request.data.get('name'),
                    'assigned_person': request.data.get('assignedPerson'),
                    'cases': json.dumps(request.data.get('cases', [])),
                    'status': request.data.get('status', 'pending'),
                    'deadline': request.data.get('deadline')
                }
                FunctionTask.objects.create(**task_data)
                return Response({"message": "Function task created successfully"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class GetAllFunctionTasksView(APIView):
    def get(self, request):
        try:
            tasks = FunctionTask.objects.all()
            tasks_data = [{
                'id': task.id,
                'name': task.name,
                'assignedPerson': task.assigned_person,
                'cases': json.loads(task.cases),
                'status': task.status,
                'deadline': task.deadline.isoformat() if task.deadline else None,
                'createdAt': task.created_at,
                'updatedAt': task.updated_at
            } for task in tasks]
            return Response({"tasks": tasks_data}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class GetSelectedFunctionTasksView(APIView):
    def post(self, request):
        try:
            ids = request.data.get('ids', [])
            tasks = FunctionTask.objects.filter(id__in=ids)
            tasks_data = [{
                'id': task.id,
                'name': task.name,
                'assignedPerson': task.assigned_person,
                'cases': json.loads(task.cases),
                'status': task.status,
                'deadline': task.deadline.isoformat() if task.deadline else None,
                'createdAt': task.created_at,
                'updatedAt': task.updated_at
            } for task in tasks]
            return Response({"tasks": tasks_data}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class DeleteFunctionTasksView(APIView):
    def post(self, request):
        try:
            with transaction.atomic():
                ids = request.data.get('ids', [])
                FunctionTask.objects.filter(id__in=ids).delete()
                return Response({"message": "Function tasks deleted successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class UpdateFunctionTaskView(APIView):
    def post(self, request):
        try:
            with transaction.atomic():
                data = request.data
                task_id = data.get('id')
                task = FunctionTask.objects.get(id=task_id)
                
                task.name = data.get('name', task.name)
                task.assigned_person = data.get('assignedPerson', task.assigned_person)
                task.cases = json.dumps(data.get('cases', json.loads(task.cases)))  # Convert list to JSON string
                task.status = data.get('status', task.status)
                task.deadline = data.get('deadline', task.deadline)
                
                task.save()
                return Response({"message": "Function task updated successfully"}, status=status.HTTP_200_OK)
        except FunctionTask.DoesNotExist:
            return Response({"error": "Function task not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
