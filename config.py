import json

_config = None

def get_config():
    if _config is None:
        reload_config()
    return _config


def save_config():
    with open("config.json", "w") as config_file:
        json.dump(_config, config_file, indent=4)


def reload_config():
    global _config
    try:
        with open("config.json", "r") as config_file:
            ast = config_file.read()
            js = json.loads(ast)
    except:
        js = {}

    changed = False

    if "regions" not in js:
        js["regions"] = []
        changed = True

    if "min_cycle_time" not in js:
        js["min_cycle_time"] = 20
        changed = True

    if "factorify-server" not in js:
        js["factorify-server"] = "https://trilab.factorify.cloud"
        changed = True

    if "factorify-login" not in js:
        js["factorify-login"] = ""
        changed = True

    if "factorify-password" not in js:
        js["factorify-password"] = ""
        changed = True

    _config = js

    if changed:
        save_config()