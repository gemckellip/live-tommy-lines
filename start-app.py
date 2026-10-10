from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Timer
import webbrowser


class AppRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


def create_server():
    directory = Path(__file__).resolve().parent
    handler = partial(AppRequestHandler, directory=str(directory))
    try:
        return ThreadingHTTPServer(("127.0.0.1", 8010), handler)
    except OSError:
        return ThreadingHTTPServer(("127.0.0.1", 0), handler)


def main():
    with create_server() as server:
        url = f"http://127.0.0.1:{server.server_port}/index.html?week=2026-10-10-r2"
        print(f"Live Tommy Lines - week of October 10, 2026\n{url}", flush=True)
        print("Keep this window open. Press Ctrl+C to stop.", flush=True)
        Timer(0.5, lambda: webbrowser.open(url)).start()
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == "__main__":
    main()
