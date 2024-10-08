import requests
import logging

import config

logger = logging.getLogger("factorify")
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
        logger.error("Failed to login")
        return
    global _token
    _token = resp.json()['session']['token']
    logger.info("Logged in successfully")


def logout():
    requests.post(f"{server}/api/logout?token={_token}")
    logger.info("Logged out...")


def get_stock_items(filter_by_column, offset, retry = True):
    input = {
        "filterByColumn": filter_by_column,
        "logicalOperator": "AND",
        "sort": [],
        "selectedColumns": [],
        "offset": offset,
        "limit": 20
    }
    resp = requests.post(f"{server}/api/query/StockItem", json=input, cookies={"securityToken": _token})

    if resp.status_code == 401 and retry:
        login()
        return get_stock_items(filter_by_column, offset, False)

    if resp.status_code != 200:
        logger.warning(f"get_stock_items status code {resp.status_code} - {resp.text}")
        return {}
    return resp.json()

def move_items(id, box_id, retry = True):
    search_filter = {
        "stock": {
            "operator": "IN",
            "value": [
                {
                    "id": 9,
                    "referenceName": "Vývoj sklad"
                }
            ],
            "noValueOperator": False
        },
        "goods.id": {
            "operator": "EQUALS",
            "value": id,
            "noValueOperator": False
        }
    }
    stock_items = get_stock_items(search_filter,0)
    quantity = stock_items["rows"][0]["quantity"]
    input_transfer = {
        "type": "TRANSFER",
        "position": box_id,
        "moves": [
            {
                "goods": {
                    "id": id
                },
                "stock": {
                    "id": 9
                },
                "quantity": -quantity
            },
            {
                "goods": {
                    "id": id
                },
                "stock": {
                    "id": 9
                },
                "quantity": quantity,
                "position": box_id
            }
        ],
        "version": 0
    }
    resp = requests.post(f"{server}/api/stock/document", json=input_transfer, cookies={"securityToken": _token})

    if resp.status_code == 401 and retry:
        login()
        return move_items(id, box_id, False)

    if resp.status_code != 200:
        logger.warning(f"get_stock_items status code {resp.status_code} - {resp.text}")
    return resp.text, resp.status_code

login()