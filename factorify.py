import requests
import time

import config

server = "https://trilab.factorify.cloud"

_token = None


def login():
    app_config = config.get_config()
    resp = requests.post(f"{app_config['factorify-server']}/api/login/username",json={
        "username": app_config["factorify-login"],
        "password": app_config["factorify-password"]
    })
    js = resp.json()
    if not 'session' in js or not 'token' in js['session']:
        print("Failed to login")
        return
    global _token
    _token = resp.json()['session']['token']
    print("Logged in successfully")


def logout():
    requests.post(f"{server}/api/logout?token={_token}")
    print("Logged out...")


def get_stock_items(filter_by_column, offset):
    input = {
        "filterByColumn": filter_by_column,
        "logicalOperator": "AND",
        "sort": [],
        "selectedColumns": [],
        "offset": offset,
        "limit": 20
    }
    resp = requests.post(f"{server}/api/query/StockItem", json=input, cookies={"securityToken": _token})
    if resp.status_code != 200:
        return {}
    return resp.json()

login()