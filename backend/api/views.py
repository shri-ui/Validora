import json
import logging
import time
from typing import Any

from django.http import HttpRequest, HttpResponse, JsonResponse, StreamingHttpResponse
from django.views.decorators.csrf import csrf_exempt

# from validator.auth import (
#     authenticate_user,
#     create_user,
#     delete_validation,
#     init_auth_db,
#     issue_token,
#     list_validations,
#     save_validation,
#     verify_token,
# )

from validator.auth import (
    authenticate_user, change_user_password, create_user, delete_validation,
    init_auth_db, issue_token, list_validations, save_validation,
    update_user, verify_token,
)

from validator.reporting import generate_pdf

_cache: dict[str, dict[str, Any]] = {}
logger = logging.getLogger(__name__)


def _body(request: HttpRequest):
    try:
        data = json.loads(request.body or b"{}")
        if not isinstance(data, dict):
            raise ValueError
        return data
    except (json.JSONDecodeError, UnicodeDecodeError, ValueError):
        return None


def _error(detail: str, status: int):
    return JsonResponse({"detail": detail}, status=status)


def _valid_email(email: str) -> bool:
    return len(email) <= 255 and "@" in email and "." in email.rsplit("@", 1)[-1]


def _current_user(request: HttpRequest):
    authorization = request.headers.get("Authorization", "")
    if not authorization.startswith("Bearer "):
        return None, _error("Login required.", 401)
    user = verify_token(authorization.removeprefix("Bearer ").strip())
    if not user:
        return None, _error("Session expired. Please log in again.", 401)
    return user, None


def _ensure_auth_db():
    init_auth_db()


@csrf_exempt
def health(request):
    if request.method != "GET":
        return _error("Method not allowed.", 405)
    return JsonResponse({"status": "ok"})


@csrf_exempt
def signup(request):
    if request.method != "POST":
        return _error("Method not allowed.", 405)
    data = _body(request)
    if data is None:
        return _error("Invalid JSON body.", 400)
    name, email, password = data.get("name"), data.get("email"), data.get("password")
    if not isinstance(name, str) or not 1 <= len(name) <= 120:
        return _error("Name must be between 1 and 120 characters.", 422)
    if not isinstance(email, str) or not 5 <= len(email) <= 255 or not _valid_email(email):
        return _error("Enter a valid email address.", 422)
    if not isinstance(password, str) or not 8 <= len(password) <= 128:
        return _error("Password must be between 8 and 128 characters.", 422)
    _ensure_auth_db()
    try:
        user = create_user(email, name, password)
    except ValueError as exc:
        return _error(str(exc), 409)
    return JsonResponse({"token": issue_token(user), "user": user})


@csrf_exempt
def login(request):
    if request.method != "POST":
        return _error("Method not allowed.", 405)
    data = _body(request)
    if data is None:
        return _error("Invalid JSON body.", 400)
    email, password = data.get("email"), data.get("password")
    if not isinstance(email, str) or not 5 <= len(email) <= 255 or not _valid_email(email):
        return _error("Enter a valid email address.", 422)
    if not isinstance(password, str) or not 8 <= len(password) <= 128:
        return _error("Password must be between 8 and 128 characters.", 422)
    _ensure_auth_db()
    user = authenticate_user(email, password)
    if not user:
        return _error("Invalid email or password.", 401)
    return JsonResponse({"token": issue_token(user), "user": user})


@csrf_exempt
def me(request):
    if request.method not in ("GET", "PATCH"):
        return _error("Method not allowed.", 405)
    _ensure_auth_db()
    user, error = _current_user(request)
    if error:
        return error
    if request.method == "GET":
        return JsonResponse(user)

    data = _body(request)
    if data is None:
        return _error("Invalid JSON body.", 400)
    name = data.get("name", user["name"])
    email = data.get("email", user["email"])
    if not isinstance(name, str) or not 1 <= len(name.strip()) <= 120:
        return _error("Name must be between 1 and 120 characters.", 422)
    if not isinstance(email, str) or not _valid_email(email.strip()):
        return _error("Enter a valid email address.", 422)
    try:
        updated = update_user(user["id"], name.strip(), email.strip().lower())
    except ValueError as exc:  # duplicate email, same pattern as create_user
        return _error(str(exc), 409)
    return JsonResponse(updated)


@csrf_exempt
def validate_startup(request):
    if request.method != "POST":
        return _error("Method not allowed.", 405)
    _ensure_auth_db()
    user, error = _current_user(request)
    if error:
        return error
    data = _body(request)
    if data is None:
        return _error("Invalid JSON body.", 400)
    idea = data.get("idea")
    if not isinstance(idea, str) or not 3 <= len(idea) <= 4000:
        return _error("Idea must be between 3 and 4000 characters.", 422)
    idea = idea.strip()
    cache_key = f"{user['id']}:{idea.lower()}"
    wants_stream = "text/event-stream" in request.headers.get("Accept", "")

    def event_response(events):
        response = StreamingHttpResponse(
            (f"data: {json.dumps(event, ensure_ascii=False)}\n\n" for event in events),
            content_type="text/event-stream",
        )
        response["Cache-Control"] = "no-cache"
        response["X-Accel-Buffering"] = "no"
        return response

    if cache_key in _cache:
        cached = dict(_cache[cache_key])
        cached["cached"] = True
        if wants_stream:
            cached_events = [
                {"type": "agent", "agent": name, "status": "complete"}
                for name in ("competitor_analysis", "market_sizing", "community_sentiment", "os_risk")
            ]
            cached_events.append({"type": "result", "result": cached})
            return event_response(cached_events)
        return JsonResponse(cached)

    from validator.graph import iter_validation

    start_time = time.time()

    def store_result(result_event):
        result = {
            "idea": idea,
            "score": result_event["score"],
            "verdict": result_event["verdict"],
            "summary": result_event["summary"],
            "results": result_event["results"],
            "elapsed": round(time.time() - start_time, 1),
            "cached": False,
        }
        result["historyId"] = save_validation(user["id"], result)
        result["savedAt"] = int(time.time() * 1000)
        _cache[cache_key] = result
        return result

    def validation_error(exc):
        logger.error("Startup validation failed", exc_info=(type(exc), exc, exc.__traceback__))
        if getattr(exc, "status_code", None) == 402 and "in_flight_budget_exhausted" in str(exc):
            return {
                "type": "error",
                "status": 402,
                "retryAfter": 120,
                "detail": "OpenRouter has reached its available credit limit for concurrent requests. Wait for current requests to finish or add credits, then retry.",
            }
        return {"type": "error", "status": 500, "detail": "Validation failed due to an internal or upstream service error."}

    if wants_stream:
        def stream_events():
            try:
                for event in iter_validation(idea):
                    if event["type"] == "result":
                        yield {"type": "result", "result": store_result(event)}
                    else:
                        yield event
            except Exception as exc:
                yield validation_error(exc)

        return event_response(stream_events())

    try:
        final_event = next(event for event in iter_validation(idea) if event["type"] == "result")
    except Exception as exc:
        error_event = validation_error(exc)
        if error_event["status"] == 402:
            response = _error(error_event["detail"], 402)
            response["Retry-After"] = "120"
            return response
        return _error(error_event["detail"], error_event["status"])
    return JsonResponse(store_result(final_event))


@csrf_exempt
def validation_history(request):
    _ensure_auth_db()
    user, error = _current_user(request)
    if error:
        return error
    if request.method != "GET":
        return _error("Method not allowed.", 405)
    return JsonResponse(list_validations(user["id"]), safe=False)


@csrf_exempt
def delete_validation_history(request, validation_id: int):
    if request.method != "DELETE":
        return _error("Method not allowed.", 405)
    _ensure_auth_db()
    user, error = _current_user(request)
    if error:
        return error
    if not delete_validation(user["id"], validation_id):
        return _error("Validation not found.", 404)
    return JsonResponse({"deleted": True})


@csrf_exempt
def report(request):
    if request.method != "POST":
        return _error("Method not allowed.", 405)
    _ensure_auth_db()
    _, error = _current_user(request)
    if error:
        return error
    data = _body(request)
    if data is None:
        return _error("Invalid JSON body.", 400)
    try:
        idea = data["idea"]
        score = data["score"]
        verdict = data["verdict"]
        summary = data["summary"]
        results = data["results"]
        if not isinstance(idea, str) or not isinstance(score, int) or not isinstance(verdict, str) or not isinstance(summary, str) or not isinstance(results, list):
            raise ValueError
        for result in results:
            if not isinstance(result, dict) or not isinstance(result.get("agent"), str):
                raise ValueError
            result.setdefault("findings", "")
            result.setdefault("sources", [])
        pdf = generate_pdf(idea, score, verdict, summary, results)
    except (KeyError, TypeError, ValueError):
        return _error("Invalid report data.", 422)
    response = HttpResponse(pdf, content_type="application/pdf")
    response["Content-Disposition"] = 'attachment; filename="startup-validation-report.pdf"'
    return response


@csrf_exempt
def change_password(request):
    if request.method != "POST":
        return _error("Method not allowed.", 405)
    _ensure_auth_db()
    user, error = _current_user(request)
    if error:
        return error
    data = _body(request)
    if data is None:
        return _error("Invalid JSON body.", 400)
    current, new = data.get("current_password"), data.get("new_password")
    if not isinstance(current, str) or not isinstance(new, str):
        return _error("Current and new password are required.", 422)
    if not 8 <= len(new) <= 128:
        return _error("Password must be between 8 and 128 characters.", 422)
    if not change_user_password(user["id"], current, new):
        return _error("Current password is incorrect.", 400)
    return JsonResponse({"detail": "Password updated."})
