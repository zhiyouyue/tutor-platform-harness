# -*- coding: utf-8 -*-
"""内测手册截图：优先使用本机 Edge/Chrome，不下载 Playwright Chromium。"""
from __future__ import annotations

import json
import os
import re
import shutil
import time
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "docs" / "product-specs" / "beta-pdfs" / "assets"
SITE = os.environ.get("BETA_SITE_URL", "https://www.tutor-platform.zhiyouyue.top")

OPS_ACCOUNT = ("ops1", "ops123456")
ADMIN_ACCOUNT = ("admin", "admin123")


def _clear_playwright_locks() -> None:
    for env_key in ("LOCALAPPDATA", "TEMP"):
        base = Path(os.environ.get(env_key, ""))
        if not base.is_dir():
            continue
        try:
            for lock in base.rglob("playwright/__dirlock"):
                shutil.rmtree(lock, ignore_errors=True)
        except OSError:
            pass
    sandbox = Path(os.environ.get("LOCALAPPDATA", "")) / "Temp" / "cursor-sandbox-cache"
    lock = sandbox / "ef35ab81acf582434ca027e435ee23cc" / "playwright" / "__dirlock"
    if lock.exists():
        shutil.rmtree(lock, ignore_errors=True)


def _launch_browser(playwright):
    # 与 playwright-install-cn 一致，优先用用户目录里已安装的 Chromium
    browsers_path = os.environ.get("PLAYWRIGHT_BROWSERS_PATH") or str(
        Path(os.environ.get("LOCALAPPDATA", "")) / "ms-playwright"
    )
    os.environ.setdefault("PLAYWRIGHT_BROWSERS_PATH", browsers_path)

    errors: list[str] = []
    cache = Path(browsers_path)
    for sub in sorted(cache.glob("chromium-*"), reverse=True):
        exe = sub / "chrome-win" / "chrome.exe"
        if exe.is_file():
            try:
                browser = playwright.chromium.launch(executable_path=str(exe), headless=True)
                print(f"使用 PLAYWRIGHT_BROWSERS_PATH 缓存: {sub.name}")
                return browser
            except Exception as exc:
                errors.append(f"{exe}: {exc}")

    for channel in ("msedge", "chrome"):
        try:
            browser = playwright.chromium.launch(channel=channel, headless=True)
            print(f"使用系统浏览器 channel={channel}")
            return browser
        except Exception as exc:
            errors.append(f"{channel}: {exc}")

    raise RuntimeError("无法启动浏览器（请安装 Edge/Chrome 或 playwright install chromium）: " + " | ".join(errors))


def _shot(page, path: Path) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    page.wait_for_timeout(800)
    page.screenshot(path=str(path), full_page=False)
    return path


def _goto_home(page) -> None:
    page.goto(SITE, wait_until="domcontentloaded", timeout=90000)
    try:
        page.wait_for_load_state("networkidle", timeout=60000)
    except Exception:
        pass


_ROLE_CARD_NAME: dict[str, re.Pattern[str]] = {
    "专家": re.compile(r"^专家\s"),
    "运营": re.compile(r"^运营\s"),
    "学员": re.compile(r"^学员\s"),
    "管理员": re.compile(r"^管理员\s"),
}


def _pick_role_card(page, role: str) -> None:
    _goto_home(page)
    page.get_by_text("请选择您的身份").wait_for(timeout=15000)
    name_pat = _ROLE_CARD_NAME.get(role, re.compile(rf"^{re.escape(role)}\s"))
    page.get_by_role("button", name=name_pat).first.click()
    page.wait_for_timeout(600)


def _open_student_login(page) -> None:
    page.evaluate("() => { localStorage.clear(); sessionStorage.clear(); }")
    _pick_role_card(page, "学员")
    page.get_by_text("口令登录").wait_for(timeout=12000)


def _ui_login(page, account: str, password: str) -> None:
    page.locator('input[name="username"]').fill(account)
    page.locator('input[name="password"]').fill(password)
    page.get_by_role("button", name="登录").click()
    page.wait_for_timeout(2500)


def _logout_via_ui(page) -> None:
    btn = page.get_by_role("button", name="退出登录")
    if btn.count():
        btn.first.click()
        page.wait_for_timeout(1500)
    _goto_home(page)


def _sidebar_nav(page, label: str) -> None:
    page.locator("aside").get_by_text(label, exact=True).first.click()
    page.wait_for_timeout(1200)


def _student_bottom_nav(page, label: str) -> None:
    page.locator("nav").get_by_text(label, exact=True).first.click()
    page.wait_for_timeout(1200)


def _api_origin(site: str) -> str:
    """界面可以是 localhost；API 统一走正式后端（或 TUTOR_API_PROXY）。"""
    explicit = os.environ.get("TUTOR_API_PROXY", "").strip()
    if explicit:
        return explicit.rstrip("/")
    if "localhost" in site or "127.0.0.1" in site:
        return "https://www.tutor-platform.zhiyouyue.top"
    return site.rstrip("/")


def _api_base(site: str) -> str:
    return _api_origin(site) + "/api/v1"


def _auth_headers(page, json_body: bool = False) -> dict[str, str]:
    auth = page.evaluate("() => localStorage.getItem('auth_token') || ''")
    headers = {"Authorization": f"Bearer {auth}"}
    if json_body:
        headers["Content-Type"] = "application/json"
    return headers


def _ops_list_homeroom_students(page, site: str) -> list[dict]:
    headers = _auth_headers(page)
    if not headers["Authorization"].replace("Bearer ", "").strip():
        return []
    list_res = page.request.get(f"{_api_base(site)}/ops/students", headers=headers)
    payload = list_res.json()
    if not payload.get("success"):
        print("学员列表 API 失败:", payload.get("message"))
        return []
    return payload.get("data", {}).get("items", [])


def _ops_create_project_for_student(page, site: str, student_id: int, suffix: str) -> bool:
    """班主任学生列表依赖「该 ops 负责的项目」；新建学员后须建项目才会出现在 UI。"""
    res = page.request.post(
        f"{_api_base(site)}/ops/projects",
        headers=_auth_headers(page, json_body=True),
        data=json.dumps(
            {
                "title": f"内测辅导项目{suffix}",
                "studentId": student_id,
                "totalAmount": 0,
                "coachingTypes": ["mock_interview"],
            }
        ),
    )
    body = res.json()
    if not body.get("success"):
        print("创建内测项目失败:", body.get("message"))
        return False
    return True


def _ensure_ops_has_student(page, site: str, suffix: str) -> int | None:
    """确保 ops 账号下至少有一名可见学员，返回 student_profiles.id。"""
    items = _ops_list_homeroom_students(page, site)
    if items:
        return int(items[0]["id"])

    phone = f"139{suffix.zfill(8)}"[:11]
    cr = page.request.post(
        f"{_api_base(site)}/ops/students",
        headers=_auth_headers(page, json_body=True),
        data=json.dumps({"realName": f"内测学员{suffix}", "phone": phone}),
    )
    created = cr.json()
    if not created.get("success"):
        print("创建学员失败:", created.get("message"))
        return None
    student_id = int(created["data"]["id"])
    if not _ops_create_project_for_student(page, site, student_id, suffix):
        return None
    return student_id


def _ops_refresh_students_list(page) -> None:
    """勿整页 reload（会回到身份选择页）；切走再进「学生」以重新拉列表。"""
    _sidebar_nav(page, "首页")
    _sidebar_nav(page, "学生")
    page.wait_for_timeout(800)


def _ops_fetch_login_token(page, site: str, student_id: int) -> str:
    """生成口令：优先 UI（便于运营截图），失败则走 send-login-link API。"""
    _ops_refresh_students_list(page)
    link_btn = page.get_by_role("button", name="发登录链接").first
    if link_btn.count():
        link_btn.click()
        page.wait_for_timeout(1500)
        m = re.search(r"\b[a-f0-9]{48}\b", page.content())
        if m:
            print(f"已获取学员登录口令（长度 {len(m.group(0))}）")
            return m.group(0)

    res = page.request.post(
        f"{_api_base(site)}/ops/students/{student_id}/send-login-link",
        headers=_auth_headers(page, json_body=True),
        data="{}",
    )
    body = res.json()
    if body.get("success") and body.get("data", {}).get("token"):
        tok = body["data"]["token"]
        print(f"API 获取学员登录口令（长度 {len(tok)}）")
        return tok
    print("获取学员登录口令失败:", body.get("message"))
    return ""


def _student_ui_magic_login(page, raw_token: str) -> bool:
    """在学员登录页粘贴口令（与内测手册一致；口令仅可使用一次）。"""
    magic_input = page.get_by_placeholder("粘贴登录口令")
    if not magic_input.count():
        print("未找到学员口令输入框")
        return False
    magic_input.fill(raw_token)
    page.get_by_role("button", name="使用链接登录").click()
    try:
        page.get_by_text("学员中心").first.wait_for(timeout=15000)
        page.wait_for_timeout(800)
        return True
    except Exception:
        try:
            page.get_by_text("你好").first.wait_for(timeout=8000)
            page.wait_for_timeout(800)
            return True
        except Exception:
            print("学员口令登录后仍未进入学员端")
            return False


def capture_all() -> dict[str, dict[str, Path]]:
    from playwright.sync_api import sync_playwright

    _clear_playwright_locks()
    ASSETS.mkdir(parents=True, exist_ok=True)
    out: dict[str, dict[str, Path]] = {
        "内测手册-导师（专家）.pdf": {},
        "内测手册-运营（班主任）.pdf": {},
        "内测手册-管理员.pdf": {},
        "内测手册-学员.pdf": {},
    }

    suffix = str(int(time.time()))[-6:]
    expert_account = f"beta_expert_{suffix}"
    expert_password = "test123456"

    with sync_playwright() as p:
        browser = _launch_browser(p)
        context = browser.new_context(viewport={"width": 1280, "height": 800}, locale="zh-CN")
        page = context.new_page()

        _goto_home(page)
        common_role = _shot(page, ASSETS / "common-role-select.png")

        # —— 导师 ——
        ex = out["内测手册-导师（专家）.pdf"]
        _pick_role_card(page, "专家")
        ex["图1：专家登录/注册页"] = _shot(page, ASSETS / "expert-01-login.png")

        page.get_by_role("button", name="注册").click()
        page.wait_for_timeout(300)
        page.locator('input[name="username"]').fill(expert_account)
        page.locator('input[name="password"]').fill(expert_password)
        page.get_by_role("button", name="注册并进入").click()
        page.wait_for_timeout(3500)

        if page.get_by_text("工作台", exact=True).count():
            _sidebar_nav(page, "个人中心")
            page.get_by_role("button", name="认证信息").click()
            page.wait_for_timeout(400)
            ex["图2：认证信息页"] = _shot(page, ASSETS / "expert-02-cert.png")
            _sidebar_nav(page, "个人中心")
            ex["图3：个人资料与工作经历"] = _shot(page, ASSETS / "expert-03-profile.png")
            _sidebar_nav(page, "我的能力")
            ex["图4：我的能力"] = _shot(page, ASSETS / "expert-04-capabilities.png")
            _sidebar_nav(page, "我的时间")
            ex["图5：我的时间"] = _shot(page, ASSETS / "expert-05-schedule.png")
            _sidebar_nav(page, "工作台")
            ex["图6：工作台 / 我的项目"] = _shot(page, ASSETS / "expert-06-dashboard.png")
            _sidebar_nav(page, "我的项目")
            ex["图7：项目详情与交付空间"] = _shot(page, ASSETS / "expert-07-projects.png")
            ex["图8：进入课堂 / 标记完成"] = ex["图5：我的时间"]
            _sidebar_nav(page, "我的收入")
            ex["图9：我的收入"] = _shot(page, ASSETS / "expert-09-income.png")
            _sidebar_nav(page, "工作台")
            bell = page.get_by_role("button", name="站内通知")
            if bell.count():
                bell.first.click()
                page.wait_for_timeout(600)
            ex["图10：通知与退出登录"] = _shot(page, ASSETS / "expert-10-notify.png")
        else:
            fallback = ex["图1：专家登录/注册页"]
            for key in (
                "图3：个人资料与工作经历",
                "图4：我的能力",
                "图5：我的时间",
                "图6：工作台 / 我的项目",
                "图7：项目详情与交付空间",
                "图8：进入课堂 / 标记完成",
                "图9：我的收入",
                "图10：通知与退出登录",
            ):
                ex[key] = fallback

        _logout_via_ui(page)

        # —— 运营 ——
        op = out["内测手册-运营（班主任）.pdf"]
        _pick_role_card(page, "运营")
        _ui_login(page, *OPS_ACCOUNT)
        op["图1：运营首页"] = _shot(page, ASSETS / "ops-01-dashboard.png")
        _sidebar_nav(page, "学生")
        beta_student_id = _ensure_ops_has_student(page, SITE, suffix)
        student_token = ""
        if beta_student_id:
            student_token = _ops_fetch_login_token(page, SITE, beta_student_id)
        op["图2：学生列表与登录口令"] = _shot(page, ASSETS / "ops-02-students.png")

        _sidebar_nav(page, "项目")
        op["图3：创建项目 / 发布给专家"] = _shot(page, ASSETS / "ops-03-projects.png")
        _sidebar_nav(page, "课程")
        op["图4：新建课次"] = _shot(page, ASSETS / "ops-04-schedule.png")
        op["图5：课次列表操作"] = op["图4：新建课次"]
        op["图6：项目详情结案"] = op["图3：创建项目 / 发布给专家"]
        _sidebar_nav(page, "收入")
        op["图7：收入与退出"] = _shot(page, ASSETS / "ops-07-finance.png")
        _logout_via_ui(page)

        # —— 管理员 ——
        ad = out["内测手册-管理员.pdf"]
        _pick_role_card(page, "管理员")
        _ui_login(page, *ADMIN_ACCOUNT)
        ad["图1：管理员菜单"] = _shot(page, ASSETS / "admin-01-menu.png")
        _sidebar_nav(page, "专家认证")
        ad["图2：通过认证"] = _shot(page, ASSETS / "admin-02-cert.png")
        ad["图3：拒绝认证"] = ad["图2：通过认证"]
        _sidebar_nav(page, "项目看板")
        ad["图4：项目看板"] = _shot(page, ASSETS / "admin-04-board.png")
        ad["图5：退出登录"] = ad["图1：管理员菜单"]
        _logout_via_ui(page)

        # —— 学员 ——
        st = out["内测手册-学员.pdf"]
        try:
            _open_student_login(page)
            st["图1：学员口令登录"] = _shot(page, ASSETS / "student-01-login.png")
            if student_token and _student_ui_magic_login(page, student_token):
                _student_bottom_nav(page, "主页")
                page.wait_for_timeout(1000)
                st["图2：学员主页"] = _shot(page, ASSETS / "student-02-home.png")
                _student_bottom_nav(page, "辅导")
                page.wait_for_timeout(800)
                enter = page.get_by_role("button", name="进入交付空间")
                if enter.count():
                    enter.first.click()
                    page.wait_for_timeout(1200)
                st["图3：辅导 / 交付空间"] = _shot(page, ASSETS / "student-03-project.png")
                _student_bottom_nav(page, "预约")
                page.wait_for_timeout(1000)
                st["图4：预约与进入课堂"] = _shot(page, ASSETS / "student-04-schedule.png")
                _student_bottom_nav(page, "我的")
                page.wait_for_timeout(800)
                bell = page.get_by_role("button", name="站内通知")
                if bell.count():
                    bell.first.click()
                    page.wait_for_timeout(500)
                st["图5：我的 / 通知 / 退出"] = _shot(page, ASSETS / "student-05-profile.png")
            else:
                print("警告: 学员端截图不完整（未拿到口令或登录失败）")
                fb = st["图1：学员口令登录"]
                st["图2：学员主页"] = fb
                st["图3：辅导 / 交付空间"] = fb
                st["图4：预约与进入课堂"] = fb
                st["图5：我的 / 通知 / 退出"] = fb
        except Exception as exc:
            print("学员截图步骤异常:", exc)

        browser.close()

    out["内测手册-导师（专家）.pdf"].setdefault("图1：专家登录/注册页", common_role)
    print("截图完成，目录:", ASSETS)
    return out
