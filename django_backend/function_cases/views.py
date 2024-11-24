from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from .models import FunctionCase
import json

# Create your views here.

class CreateFunctionCaseView(APIView):
    def post(self, request):
        try:
            with transaction.atomic():
                data = request.data
                FunctionCase.objects.create(
                    name=data.get('name'),
                    module=data.get('module'),
                    testtitle=data.get('testtitle'),
                    directory=data.get('directory'),
                    importance=data.get('importance'),
                    precondition=data.get('precondition'),
                    testinput=data.get('testinput'),
                    steps=data.get('steps'),
                    expectedresults=data.get('expectedresults')
                )
                return Response({"message": "Function case created successfully"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class GetAllFunctionCasesView(APIView):
    def get(self, request):
        try:
            cases = FunctionCase.objects.all()
            cases_data = [{
                "id": case.id,
                "name": case.name,
                "module": case.module,
                "testtitle": case.testtitle,
                "directory": case.directory,
                "importance": case.importance,
                "precondition": case.precondition,
                "testinput": case.testinput,
                "steps": case.steps,
                "expectedresults": case.expectedresults
            } for case in cases]
            return Response({"cases": cases_data}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class GetSelectedFunctionCasesView(APIView):
    def post(self, request):
        try:
            ids = request.data.get('ids', [])
            cases = FunctionCase.objects.filter(id__in=ids)
            cases_data = [{
                "id": case.id,
                "name": case.name,
                "module": case.module,
                "testtitle": case.testtitle,
                "directory": case.directory,
                "importance": case.importance,
                "precondition": case.precondition,
                "testinput": case.testinput,
                "steps": case.steps,
                "expectedresults": case.expectedresults
            } for case in cases]
            return Response({"cases": cases_data}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class DeleteFunctionCasesView(APIView):
    def post(self, request):
        try:
            with transaction.atomic():
                ids = request.data.get('ids', [])
                FunctionCase.objects.filter(id__in=ids).delete()
                return Response({"message": "Function case deleted successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class UpdateFunctionCaseView(APIView):
    def post(self, request):
        try:
            with transaction.atomic():
                data = request.data
                case_id = data.get('id')
                case = FunctionCase.objects.get(id=case_id)
                
                case.name = data.get('name', case.name)
                case.module = data.get('module', case.module)
                case.testtitle = data.get('testtitle', case.testtitle)
                case.directory = data.get('directory', case.directory)
                case.importance = data.get('importance', case.importance)
                case.precondition = data.get('precondition', case.precondition)
                case.testinput = data.get('testinput', case.testinput)
                case.steps = data.get('steps', case.steps)
                case.expectedresults = data.get('expectedresults', case.expectedresults)
                
                case.save()
                return Response({"message": "Function case updated successfully"}, status=status.HTTP_200_OK)
        except FunctionCase.DoesNotExist:
            return Response({"error": "Function case not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
