from urllib.parse import urlparse

from django.conf import settings


class CorsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        origin = request.headers.get("Origin", "")
        parsed_origin = urlparse(origin)
        allowed = origin in settings.CORS_ALLOW_ORIGINS or (
            parsed_origin.scheme in {"http", "https"}
            and parsed_origin.hostname in {"localhost", "127.0.0.1"}
            and parsed_origin.port is not None
        )
        if request.method == "OPTIONS":
            from django.http import HttpResponse

            response = HttpResponse(status=204)
        else:
            response = self.get_response(request)
        if origin and allowed:
            response["Access-Control-Allow-Origin"] = origin
            response["Access-Control-Allow-Credentials"] = "true"
            response["Access-Control-Allow-Methods"] = "GET, POST, PATCH, DELETE, OPTIONS"
            response["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
            response["Vary"] = "Origin"
        return response
