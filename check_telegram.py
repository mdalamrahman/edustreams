import requests
import json

BOT_TOKEN = "8931548931:AAEZgRPOngvCGNHa9cfZSb4B2dtyf_IS2vI"
BASE_URL = f"https://api.telegram.org/bot{BOT_TOKEN}"

channels = {
    "DSA": [-4390749731, -1004390749731],
    "System Design": [-4329144420, -1004329144420],
    "DBMS": [-4332462419, -1004332462419],
    "Computer Networks": [-4308430774, -1004308430774]
}

print("=== Checking Telegram Bot Updates & Channels ===")

# 1. Check getUpdates
try:
    resp = requests.get(f"{BASE_URL}/getUpdates")
    data = resp.json()
    print("getUpdates Result:", json.dumps(data, indent=2))
except Exception as e:
    print("getUpdates Error:", e)

# 2. Check getChat for each channel
for name, ids in channels.items():
    for cid in ids:
        try:
            r = requests.get(f"{BASE_URL}/getChat", params={"chat_id": cid})
            res = r.json()
            if res.get("ok"):
                print(f"[FOUND] Channel '{name}' (ID: {cid}):", res.get("result", {}).get("title"))
            else:
                print(f"[INFO] Channel '{name}' (ID: {cid}) response:", res.get("description"))
        except Exception as err:
            print(f"Error checking {name} ({cid}):", err)
