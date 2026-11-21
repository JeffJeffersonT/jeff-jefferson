#!/usr/bin/env python3
"""Moderate the sidebar shoutbox on jeffersons.space.

usage:
  python3 scripts/shouts.py list
  python3 scripts/shouts.py delete <id>

The admin token is read from /workspace/.guestbook-admin-token, or from
the ADMIN_TOKEN env var. It is never printed.
"""
import json
import os
import sys
import urllib.error
import urllib.request
from datetime import datetime
from zoneinfo import ZoneInfo

ENDPOINT = os.environ.get(
    "COMMENTS_ENDPOINT",
    "https://jeffersons-guestbook.jeffjefferson.workers.dev",
).rstrip("/")
TOKEN_FILE = "/workspace/.guestbook-admin-token"
DUBAI = ZoneInfo("Asia/Dubai")


def die(msg):
    print(f"error: {msg}", file=sys.stderr)
    sys.exit(1)


def token():
    env = os.environ.get("ADMIN_TOKEN") or os.environ.get("GUESTBOOK_ADMIN_TOKEN")
    if env and env.strip():
        return env.strip()
    if os.path.isfile(TOKEN_FILE):
        value = open(TOKEN_FILE, encoding="utf-8").read().strip()
        if value:
            return value
    die("no admin token found")


def get(path):
    req = urllib.request.Request(ENDPOINT + path, headers={"Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.load(r)


def delete(path):
    req = urllib.request.Request(
        ENDPOINT + path,
        method="DELETE",
        headers={"Authorization": "Bearer " + token(), "Accept": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.load(r)


def fmt(ts):
    try:
        return datetime.fromtimestamp(ts / 1000, tz=DUBAI).strftime("%Y-%m-%d %H:%M %Z")
    except Exception:
        return str(ts)


def cmd_list():
    data = get("/shouts")
    shouts = data.get("shouts") or []
    if not shouts:
        print("no shouts")
        return
    for s in shouts:
        print(f"{s.get('id','?')}\t{fmt(s.get('ts') or 0)}\t{s.get('name','')}\t{s.get('message','')}")


def cmd_delete(sid):
    delete(f"/shouts/{sid}")
    print("deleted", sid)


def main():
    if len(sys.argv) < 2 or sys.argv[1] in {"-h", "--help", "help"}:
        print(__doc__.strip())
        return
    cmd = sys.argv[1]
    try:
        if cmd == "list":
            cmd_list()
        elif cmd == "delete":
            if len(sys.argv) < 3:
                die("usage: shouts.py delete <id>")
            cmd_delete(sys.argv[2])
        else:
            die("unknown command")
    except urllib.error.HTTPError as e:
        die(f"http {e.code}")
    except urllib.error.URLError as e:
        die(str(e.reason))


if __name__ == "__main__":
    main()
