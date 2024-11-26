# Django Backend API Documentation

## Database Tables

### SavedAPI Table
- **Table Name**: savedapi_savedapi
- **Description**: Stores basic API information
- **Columns**:
  - `id` (int, primary key, auto increment)
  - `apiinfo` (JSON)
  - `directory` (string)
  - `api_method` (string)
  - `api_path` (string)

### SavedAPIDirectory Table
- **Table Name**: savedapi_savedapidirectory
- **Description**: Stores directory information
- **Columns**:
  - `id` (int, primary key, auto increment)
  - `name` (string)
  - `directory_type` (string)

### SavedApiCode Table
- **Table Name**: autoapi_savedapicode
- **Description**: Stores API code and test information
- **Columns**:
  - `id` (int, primary key, auto increment)
  - `api_method` (string)
  - `api_path` (string)
  - `directory` (string)
  - `bussiness_code` (text, optional)
  - `common_code` (text, optional)
  - `testcases_code` (text, optional)
  - `is_auto_test` (boolean)
  - `report_url` (string, optional)
  - `header_params` (text, optional)
  - `path_params` (text, optional)
  - `query_params` (text, optional)
  - `body_params` (text, optional)
  - `response_params` (text, optional)
  - `group` (JSON array)

### Environment Table
- **Table Name**: environment_environment
- **Description**: Stores environment configuration information
- **Columns**:
  - `id` (int, primary key, auto increment)
  - `name` (string, unique)
  - `host` (string)
  - `port` (int)
  - `secret_key` (string)

## API Endpoints

### SavedAPI Endpoints

#### Save APIs
- **Path**: `/savedapi/save/`
- **Method**: POST
- **Payload**:
```json
{
    "apis": [{"method": "GET", "path": "/example"}],
    "directory": "string"
}
```
- **Response**: `{"message": "APIs saved successfully"}`

#### Remove APIs
- **Path**: `/savedapi/remove/`
- **Method**: POST
- **Payload**:
```json
{
    "apis": [{"method": "GET", "path": "/example"}],
    "directory": "string"
}
```
- **Response**: `{"message": "APIs deleted successfully"}`

#### Get Saved APIs
- **Path**: `/savedapi/saved-apis/`
- **Method**: GET
- **Response**: List of saved APIs

#### Get/Create Directories
- **Path**: `/savedapi/directories/`
- **Method**: GET/POST
- **POST Payload**:
```json
{
    "name": "string",
    "directory_type": "string"
}
```
- **Response**: List of directories or created directory details

#### Convert Swagger/OpenAPI
- **Path**: `/savedapi/convert/`
- **Method**: POST
- **Payload**: Swagger/OpenAPI file
- **Response**: Converted API details

### AutoAPI Endpoints

#### API Code Operations

##### Add API Code Without Group
- **Path**: `/autoapi/addapicodewithoutgroup`
- **Method**: POST
- **Payload**:
```json
{
    "api_method": "",
    "api_path": "",
    "directory": "",
    "bussiness_code": "",
    "common_code": "",
    "testcases_code": "",
    "is_auto_test": false,
    "report_url": "",
    "header_params": "",
    "path_params": "",
    "query_params": "",
    "body_params": "",
    "response_params": "",
    "group": []
}
```
- **Response**: `{"message": "API created successfully"}`

##### Get API Code
- **Path**: `/autoapi/getapicode`
- **Method**: POST
- **Payload**:
```json
{
    "api_method": "",
    "api_path": "",
    "directory": ""
}
```
- **Response**:
```json
{
    "api_method": "",
    "api_path": "",
    "directory": "",
    "bussiness_code": "",
    "common_code": "",
    "testcases_code": "",
    "is_auto_test": false,
    "report_url": "",
    "header_params": "",
    "path_params": "",
    "query_params": "",
    "body_params": "",
    "response_params": ""
}
```

##### Update API Code
- **Path**: `/autoapi/updateapicode`
- **Method**: POST
- **Payload**:
```json
{
    "api_method": "",
    "api_path": "",
    "directory": "",
    "bussiness_code": "",
    "common_code": "",
    "testcases_code": "",
    "is_auto_test": false,
    "report_url": "",
    "header_params": "",
    "path_params": "",
    "query_params": "",
    "body_params": "",
    "response_params": ""
}
```
- **Response**: `{"message": "API updated successfully"}`

##### Delete API Code
- **Path**: `/autoapi/deleteapicode`
- **Method**: POST
- **Payload**:
```json
{
    "api_method": "",
    "api_path": "",
    "directory": ""
}
```
- **Response**: `{"message": "API deleted successfully"}`

#### Group API Operations

##### Get All Group APIs
- **Path**: `/autoapi/groupall`
- **Method**: GET
- **Response**:
```json
{
    "group1": [
        {
            "api_method": "",
            "api_path": "",
            "directory": "",
            "bussiness_code": "",
            "common_code": "",
            "testcases_code": "",
            "is_auto_test": false,
            "report_url": "",
            "header_params": "",
            "path_params": "",
            "query_params": "",
            "body_params": "",
            "response_params": "",
            "group": []
        }
    ]
}
```

##### Get Group APIs
- **Path**: `/autoapi/group?group_name="group_name"`
- **Method**: GET
- **Response**:
```json
{
    "group1": [
        {
            "api_method": "",
            "api_path": "",
            "directory": "",
            "bussiness_code": "",
            "common_code": "",
            "testcases_code": "",
            "is_auto_test": false,
            "report_url": "",
            "header_params": "",
            "path_params": "",
            "query_params": "",
            "body_params": "",
            "response_params": "",
            "group": []
        }
    ]
}
```

##### Delete API from Group
- **Path**: `/autoapi/deletegroupapi`
- **Method**: POST
- **Payload**:
```json
{
    "api_method": "",
    "api_path": "",
    "directory": "",
    "group": ""
}
```
- **Response**: `{"message": "API deleted successfully"}`

#### Group Management

##### Get All Groups
- **Path**: `/autoapi/groups`
- **Method**: GET
- **Response**: `["group1", "group2"]`

##### Delete Group
- **Path**: `/autoapi/deletegroup`
- **Method**: POST
- **Payload**:
```json
{
    "group_name": "group_name"
}
```
- **Response**: `{"message": "Group deleted successfully"}`
- **Note**: This will remove the group from all APIs and delete the group from SavedAPIDirectory

##### Add Group
- **Path**: `/autoapi/addgroup`
- **Method**: POST
- **Payload**:
```json
{
    "group_name": "group_name"
}
```
- **Response**: `{"message": "Group added successfully"}`



### Environment Endpoints

#### Create Environment
- **Path**: `/environment/create`
- **Method**: POST
- **Payload**:
```json
{
    "name": "",
    "host": "",
    "port": "",
    "secret_key": ""
}
```
- **Response**: `{"message": "Environment created successfully"}`

#### Get All Environments
- **Path**: `/environment/environments`
- **Method**: GET
- **Response**:
```json
{
    "environments": [
        {
            "name": "",
            "host": "",
            "port": "",
            "secret_key": ""
        }
    ]
}
```

#### Delete Environment
- **Path**: `/environment/delete`
- **Method**: POST
- **Payload**:
```json
{
    "name": ""
}
```
- **Response**: `{"message": "Environment deleted successfully"}`

#### Update Environment
- **Path**: `/environment/update`
- **Method**: POST
- **Payload**:
```json
{
    "name": "",
    "host": "",
    "port": "",
    "secret_key": ""
}
```
- **Note**: Only provided fields will be updated, others will be ignored
- **Response**: `{"message": "Environment {name} updated successfully"}`

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

3. Start the server:
```bash
python manage.py runserver
