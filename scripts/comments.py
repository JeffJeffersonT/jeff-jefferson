#!/usr/bin/env python3
"""Moderate post comments on jeffersons.space.

usage:
  python3 scripts/comments.py list <slug>
  python3 scripts/comments.py delete <slug> <id>

The admin token is read from /workspace/.guestbook-admin-token, or from
the ADMIN_TOKEN env var. It is never printed.
"""
import json
import os
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone
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


def request(method, path, auth=False):
    headers = {"Accept": "application/json", "User-Agent": "jeffersons-comments-mod"}
    if auth:
        headers["Authorization"] = "Bearer " + token()
    req = urllib.request.Request(ENDPOINT + path, method=method, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, json.loads(r.read().decode("utf-8") or "{}")
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", "replace")
        try:
            data = json.loads(body) if body else {}
        except json.JSONDecodeError:
            data = {"error": body or e.reason}
        return e.code, data


def fmt_ts(ts):
    try:
        d = datetime.fromtimestamp(int(ts) / 1000, tz=timezone.utc).astimezone(DUBAI)
    except (TypeError, ValueError, OSError):
        return "?"
    return d.strftime("%-d %b %Y, %-I:%M %p").lower() + " dubai"


def cmd_list(slug):
    status, data = request("GET", f"/comments/{slug}")
    if status != 200:
        die(data.get("error") or f"http {status}")
    comments = data.get("comments") or []
    print(f"{len(comments)} comment(s) on {slug}")
    for c in comments:
        cid = c.get("id", "?")
        name = c.get("name", "")
        when = fmt_ts(c.get("ts"))
        site = c.get("website") or ""
        msg = (c.get("message") or "").replace("\n", " ")
        extra = f"  {site}" if site else ""
        print(f"  {cid}  {name}  {when}{extra}")
        print(f"      {msg}")


def cmd_delete(slug, cid):
    status, data = request("DELETE", f"/comments/{slug}/{cid}", auth=True)
    if status != 200 or not data.get("ok"):
        die(data.get("error") or f"http {status}")
    print(f"deleted {cid} from {slug}")


def main():
    args = sys.argv[1:]
    if not args or args[0] in ("-h", "--help", "help"):
        print(__doc__.strip(), file=sys.stderr)
        sys.exit(0 if args else 1)
    cmd = args[0]
    if cmd == "list":
        if len(args) != 2:
            die("usage: comments.py list <slug>")
        cmd_list(args[1])
    elif cmd == "delete":
        if len(args) != 3:
            die("usage: comments.py delete <slug> <id>")
        cmd_delete(args[1], args[2])
    else:
        die(f"unknown command {cmd}")


if __name__ == "__main__":
    main()
