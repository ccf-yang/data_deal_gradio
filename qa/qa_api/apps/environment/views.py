from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Environment
from django.db import transaction
from django.core.exceptions import ObjectDoesNotExist

# Create your views here.

class CreateEnvironmentView(APIView):
    def post(self, request):
        try:
            with transaction.atomic():
                env_data = request.data
                Environment.objects.create(**env_data)
                return Response({"message": "Environment created successfully"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class GetEnvironmentsView(APIView):
    def get(self, request):
        try:
            environments = Environment.objects.all()
            env_list = []
            for env in environments:
                env_list.append({
                    'name': env.name,
                    'host': env.host,
                    'port': env.port,
                    'secret_key': env.secret_key
                })
            return Response({"environments": env_list})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class DeleteEnvironmentView(APIView):
    def post(self, request):
        try:
            with transaction.atomic():
                name = request.data.get('name')
                env = Environment.objects.get(name=name)
                env.delete()
                return Response({"message": "Environment deleted successfully"})
        except ObjectDoesNotExist:
            return Response({"error": "Environment not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class UpdateEnvironmentView(APIView):
    def post(self, request):
        try:
            with transaction.atomic():
                name = request.data.get('name')
                if not name:
                    return Response(
                        {"error": "name is required"}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                env = Environment.objects.get(name=name)
                
                # Update fields that are present in the request
                if 'host' in request.data:
                    env.host = request.data['host']
                if 'port' in request.data:
                    env.port = request.data['port']
                if 'secret_key' in request.data:
                    env.secret_key = request.data['secret_key']
                
                env.save()
                return Response({"message": f"Environment {name} updated successfully"})
        except ObjectDoesNotExist:
            return Response({"error": "Environment not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
