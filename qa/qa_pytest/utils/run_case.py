import argparse
import os
import subprocess
import sys
import requests
import json

run_log = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'run.log')
def write_log(log_content):
    with open(run_log, 'a') as log_file:
        log_file.write(log_content + '\n')

headers = {
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'zh-CN,zh;q=0.9',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Content-Type': 'application/json',
    'X-Token': ''
    }
if os.getenv('DJANGO_HOST'):
    django_host = os.getenv('DJANGO_HOST')
else:
    django_host = 'http://127.0.0.1:8000'

def update_apireporturl(report_url,api_mark):
    url = f"{django_host}/autoapi/updateapicode"
    method = api_mark.split("_")[0]
    path = api_mark.split("_")[1]
    directory = api_mark.split("_")[2]
    payload = json.dumps({
        "api_method": method.upper(),
        "api_path": path,
        "directory": directory,
        "report_url": report_url
    })
    response = requests.request("POST", url, headers=headers, data=payload)
    if response.status_code == 200:
        print("Update api report url successfully")
        write_log(f"Update api report url successfully: {report_url}")
    else:
        print("Update api report url failed")
        write_log(f"Update api report url failed: {report_url}")


def update_groupurl(report_url,groupname):
    url = f"{django_host}/autoapi/updategroup"
    payload = json.dumps({
        "name": groupname,
        "url": report_url
    })
    response = requests.request("POST", url, headers=headers, data=payload)
    if response.status_code == 200:
        print("Update group report url successfully")
        write_log(f"Update group report url successfully: {report_url}")
    else:
        print("Update group report url failed")
        write_log(f"Update group report url failed: {report_url}")


def upload_url(random_suffix, groupname, api_mark):
    """
    Upload Allure report url to api reporturl or group url
    """
    url_header = 'http://192.168.71.145:8998/'
    report_dir = random_suffix + "_report/" + "index.html"
    report_url = url_header + report_dir
    try:
        if groupname != "null":
            update_groupurl(report_url, groupname)
        else:
            update_apireporturl(report_url, api_mark)
    except Exception as e:
        print(f"Error uploading report url: {e}")
        sys.exit(1)
    print("Report url uploaded successfully")
    write_log("Report url uploaded successfully")

# random_suffix = time.strftime('%Y_%m_%d_%H_%M_%S')
def run_tests(random_suffix, groupname, api_mark, mark='atest'):
    """
    Run pytest with specified marker in the test_auto_cases directory
    """
    test_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
                            'testcases', 'test_auto_cases')
    allure_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
                            'results', random_suffix)
    cmd = f'pytest -v -m {mark} {test_path} --alluredir {allure_path}'
    try:
        result = subprocess.run(cmd, shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        write_log(f"pytest run test cases successfully: {result.stdout.decode('utf-8')}")
        write_log(f"pytest run test cases failed: {result.stderr.decode('utf-8')}")
    except subprocess.CalledProcessError as e:
        print(f"pytest run test cases failed, details to see report: {e}")
        write_log(f"pytest run test cases failed: {e}")
    print("Tests completed successfully")
    write_log("Tests completed successfully")
    try:
        generate_allure_report(random_suffix)
        upload_url(random_suffix, groupname, api_mark)
    except Exception as e:
        print(f"Error generating Allure report or uploading report url: {e}")
        sys.exit(1)


def generate_allure_report(random_suffix):
    """
    Generate Allure report
    """
    allure_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
                            'results', random_suffix)
    allure_report_path =allure_path + "_report"
    if not os.path.exists(allure_path):
        os.mkdir(allure_path)
    cmd = f'allure generate {allure_path} -o {allure_report_path} -c {allure_path}'
    try:
        result = subprocess.run(cmd, shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        write_log(f"Allure report generated successfully, path: {allure_path}")
        write_log(f"Allure report generated successfully: {result.stdout.decode('utf-8')}")
        write_log(f"Allure report generated failed: {result.stderr.decode('utf-8')}")
    except subprocess.CalledProcessError as e:
        print(f"Error generating Allure report: {e}")
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description='Run automated test cases')
    parser.add_argument('-r', '--run', 
                       action='store_true',
                       help='Run automated test cases with marker "atest"')
    parser.add_argument('--time', 
                       type=str,
                       help='Set the time suffix for the Allure report')
    parser.add_argument('--groupname', 
                       type=str,
                       help='Set the group name for the Allure report')
    parser.add_argument('--api', 
                       type=str,
                       help='Set the marker for the api cases')
    
    args = parser.parse_args()

    random_suffix = args.time
    groupname = args.groupname
    api_mark = args.api
    print("random_suffix: ", random_suffix)
    print("groupname: ", groupname)
    print("api_mark: ", api_mark)
    
    if args.run:
        run_tests(random_suffix, groupname, api_mark)
    else:
        parser.print_help()

if __name__ == '__main__':
    main()