# -*- coding: utf-8 -*-
"""生成四角色内测 PDF 手册（分步操作 + 预期结果 + 截图区）。"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import date
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    Image,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

OUT_DIR = ROOT / "docs" / "product-specs" / "beta-pdfs"
ASSETS = OUT_DIR / "assets"
SITE = "https://www.tutor-platform.zhiyouyue.top"

FONT_CANDIDATES = [
    Path(r"C:\Windows\Fonts\msyh.ttc"),
    Path(r"C:\Windows\Fonts\msyhbd.ttc"),
    Path(r"C:\Windows\Fonts\simsun.ttc"),
]


def register_font() -> str:
    for path in FONT_CANDIDATES:
        if path.exists():
            name = "ZhFont"
            pdfmetrics.registerFont(TTFont(name, str(path)))
            return name
    raise SystemExit("未找到中文字体（msyh.ttc / simsun.ttc）")


@dataclass
class Step:
    title: str
    actions: list[str]
    expected: list[str]
    shot_caption: str


@dataclass
class Manual:
    filename: str
    role_title: str
    subtitle: str
    intro: list[str]
    steps: list[Step]
    notes: list[str]


COMMON_PREP = [
    f"内测地址：{SITE}",
    "推荐浏览器：Chrome 或 Edge（最新版）。",
    "在线课堂需允许摄像头和麦克风。",
    "登录页有四个入口：专家（导师）、运营、管理员、学员。账号与入口必须对应，混用会提示角色错误。",
    "页面上的项目、课次等状态应显示中文；若出现英文代码请截图反馈。",
]

ADMIN_ACCOUNTS = [
    "管理员示例账号：admin / admin123（以运营方实际发放为准）。",
]
OPS_ACCOUNTS = [
    "运营示例账号：ops1 / ops123456（以运营方实际发放为准）。",
    "每位运营只能看到自己创建/负责的学生、项目和课次。",
]
EXPERT_ACCOUNTS = [
    "导师需自行注册；注册后须等管理员认证通过才能正常接单。",
]
STUDENT_ACCOUNTS = [
    "学员不能自助注册。由运营在「学生」里建档后，点「发登录链接」复制口令。",
    "学员在登录页下方「口令登录」粘贴该口令即可进入。",
]


def expert_manual() -> Manual:
    return Manual(
        filename="内测手册-导师（专家）.pdf",
        role_title="导师内测手册",
        subtitle="登录页请选择「专家」",
        intro=COMMON_PREP + EXPERT_ACCOUNTS,
        steps=[
            Step(
                "1. 注册与登录",
                [
                    "打开内测地址，点击「专家」。",
                    "填写账号、密码、手机号、姓名等信息完成注册。",
                    "使用刚注册的账号登录。",
                ],
                [
                    "能进入导师工作台。",
                    "认证未通过前，接单相关能力可能受限（以页面提示为准）。",
                ],
                "图1：专家登录/注册页",
            ),
            Step(
                "2. 提交认证",
                [
                    "左侧进入「个人中心」→「认证信息」。",
                    "按页面要求填写并点击提交认证。",
                ],
                [
                    "认证状态显示「待审核」或「草稿」等中文状态。",
                    "提交成功后等待管理员审核。",
                ],
                "图2：认证信息页",
            ),
            Step(
                "3. 个人资料与工作经历",
                [
                    "「个人中心」→「个人资料」查看姓名、手机号、账号等。",
                    "在工作经历区域点击添加，填写公司、职位、时间等并保存。",
                    "尝试修改一条、删除一条，确认保存生效。",
                ],
                [
                    "工作经历列表能展示刚保存的内容。",
                    "刷新页面后数据仍在。",
                ],
                "图3：个人资料与工作经历",
            ),
            Step(
                "4. 我的能力",
                [
                    "进入「我的能力」。",
                    "勾选服务人群、辅导内容、行业、岗位等选项。",
                    "点击保存。",
                ],
                [
                    "选项来自系统列表，无需手填英文代码。",
                    "保存后再次进入，勾选状态保持。",
                ],
                "图4：我的能力",
            ),
            Step(
                "5. 我的时间",
                [
                    "进入「我的时间」。",
                    "为某几个 weekday 添加可辅导时段。",
                    "打开「可接受项目」开关。",
                    "可选：添加一段「临时不可用」日期。",
                ],
                [
                    "时段列表显示中文星期。",
                    "「可接受项目」为开启状态。",
                ],
                "图5：我的时间",
            ),
            Step(
                "6. 工作台与待确认项目",
                [
                    "进入「工作台」，查看统计与待确认项目。",
                    "若有待确认项目：可在工作台直接「接受」或「拒绝」。",
                    "进入「我的项目」→「待确认」，对另一条待确认项目点「拒绝」并填写原因。",
                ],
                [
                    "工作台数字与列表合理（无数据时显示「暂无」类中文提示）。",
                    "从「我的项目」拒绝时会弹出填写原因；从工作台点拒绝则原因记为「专家拒绝」。",
                    "项目状态显示中文，如「待专家确认」「进行中」。",
                ],
                "图6：工作台 / 我的项目",
            ),
            Step(
                "7. 项目详情与交付",
                [
                    "在「我的项目」→「进行中」打开某项目「详情」。",
                    "填写一条辅导记录并保存。",
                    "提交一个交付物标题。",
                    "点击「进入交付空间」。",
                ],
                [
                    "辅导节点、记录保存成功有提示。",
                    "交付空间可切换「专家与学员」「专家与运营」频道并发送消息。",
                    "可看到本项目课次安排（中文状态）。",
                ],
                "图7：项目详情与交付空间",
            ),
            Step(
                "8. 课次与在线课堂",
                [
                    "在「我的时间」或项目相关区域找到近期课次。",
                    "若已到上课时间，点击「进入课堂」（需浏览器授权设备）。",
                    "下课后点击「标记课次完成」并填写备注（如有）。",
                ],
                [
                    "课堂页有连接中/进行中等中文提示；失败时检查浏览器权限。",
                    "标记完成后，运营端可「确认完成」。",
                ],
                "图8：进入课堂 / 标记完成",
            ),
            Step(
                "9. 项目结案与收入",
                [
                    "项目进行中时，在项目详情点击「提交项目完成」。",
                    "待运营确认后，进入「我的收入」查看汇总与明细。",
                ],
                [
                    "提交后项目进入待验收类状态（中文展示）。",
                    "运营确认并入账后，收入页出现记录；无记录时显示「暂无收入记录」。",
                ],
                "图9：我的收入",
            ),
            Step(
                "10. 通知与退出",
                [
                    "点击右上角铃铛查看站内通知，点开一条标为已读。",
                    "点击左侧底部「退出登录」。",
                ],
                [
                    "通知内容为排课、改期、改派等相关中文说明。",
                    "退出后回到选择身份页面，需重新登录才能进入导师端。",
                ],
                "图10：通知与退出登录",
            ),
        ],
        notes=[
            "页面上不应出现大段英文或开发用语。",
            "不应看到收款账户、修改密码等已隐藏的菜单。",
        ],
    )


def ops_manual() -> Manual:
    return Manual(
        filename="内测手册-运营（班主任）.pdf",
        role_title="运营内测手册",
        subtitle="登录页请选择「运营」",
        intro=COMMON_PREP + OPS_ACCOUNTS,
        steps=[
            Step(
                "1. 登录与首页",
                [
                    "打开内测地址，点击「运营」，使用运营账号登录。",
                    "查看首页统计卡片、导师档期概览、最近项目列表。",
                ],
                [
                    "首页数据加载正常；项目状态为中文标签。",
                    "仅能看到本运营负责的数据（可与另一运营账号对比）。",
                ],
                "图1：运营首页",
            ),
            Step(
                "2. 添加学员与发登录口令",
                [
                    "进入「学生」，单个添加：姓名 + 手机号。",
                    "再试批量添加：一行「姓名,手机号」。",
                    "对某学员点击「发登录链接」，复制页面显示的口令。",
                ],
                [
                    "学员列表出现新学员。",
                    "口令明文展示，可复制（不会发短信/邮件）。",
                ],
                "图2：学生列表与登录口令",
            ),
            Step(
                "3. 创建与发布项目",
                [
                    "进入「项目」→「创建项目」。",
                    "选择学员、已认证导师、标题、总价、辅导类型，创建。",
                    "进入项目详情，点击「发布给专家」。",
                ],
                [
                    "新建项目状态为「草稿」等中文。",
                    "发布后导师端可见待确认项目。",
                ],
                "图3：创建项目 / 发布给专家",
            ),
            Step(
                "4. 排课",
                [
                    "进入「课程」，新建课次。",
                    "选择进行中或待确认的项目、日期、导师已开放的时段，填写主题。",
                    "保存后在列表中查看新课次。",
                ],
                [
                    "日期星期与导师开放时间一致才能选到时段。",
                    "课次状态为中文，如「已排课」「已确认」。",
                ],
                "图4：新建课次",
            ),
            Step(
                "5. 课次运营操作",
                [
                    "待导师标记完成后，对课次点击「确认完成」。",
                    "另选一课次试「延期」并填写原因（可选测改期、未完成/扣费）。",
                ],
                [
                    "状态随操作更新为中文。",
                    "学员、导师铃铛出现相关通知。",
                ],
                "图5：课次列表操作",
            ),
            Step(
                "6. 改派与项目结案",
                [
                    "在项目详情对进行中项目「改派专家」（输入导师编号）。",
                    "导师提交项目完成后，点击「确认完成并入账」。",
                ],
                [
                    "改派后导师/学员收到通知。",
                    "项目变为已完成，导师收入入账。",
                ],
                "图6：项目详情结案",
            ),
            Step(
                "7. 收入与退出",
                [
                    "进入「收入」查看签约总额与项目数。",
                    "点击「退出登录」。",
                ],
                [
                    "收入仅为负责项目签约汇总，不是打款界面。",
                    "退出后回到身份选择页。",
                ],
                "图7：收入与退出",
            ),
        ],
        notes=[
            "不能把项目转给另一位运营当班主任。",
            "导师未认证或未排时间时，排课应无法选到合适时段。",
        ],
    )


def admin_manual() -> Manual:
    return Manual(
        filename="内测手册-管理员.pdf",
        role_title="管理员内测手册",
        subtitle="登录页请选择「管理员」",
        intro=COMMON_PREP + ADMIN_ACCOUNTS,
        steps=[
            Step(
                "1. 登录与菜单",
                [
                    "打开内测地址，点击「管理员」，登录。",
                    "确认左侧只有「专家认证」「项目看板」。",
                ],
                [
                    "无学生管理、排课、收入明细等入口。",
                ],
                "图1：管理员菜单",
            ),
            Step(
                "2. 专家认证 — 通过",
                [
                    "进入「专家认证」，找到待审核申请。",
                    "查看姓名、账号、职位、城市、提交时间。",
                    "点击「通过」。",
                ],
                [
                    "列表刷新后该条消失或状态更新。",
                    "导师端认证变为「已认证」。",
                ],
                "图2：通过认证",
            ),
            Step(
                "3. 专家认证 — 拒绝",
                [
                    "另找一条待审核（或新注册导师），点击「拒绝」。",
                    "必须填写拒绝原因并确认。",
                ],
                [
                    "导师端能看到拒绝原因，状态为「已拒绝」。",
                ],
                "图3：拒绝认证",
            ),
            Step(
                "4. 项目看板",
                [
                    "进入「项目看板」。",
                    "查看按导师汇总的项目数、进行中数量。",
                    "留意「未分配导师」单独一行（若有）。",
                ],
                [
                    "数据为全平台汇总，与运营首页「我负责的项目」不同。",
                ],
                "图4：项目看板",
            ),
            Step(
                "5. 退出登录",
                [
                    "点击左侧「退出登录」。",
                ],
                [
                    "回到身份选择页。",
                ],
                "图5：退出登录",
            ),
        ],
        notes=[
            "无「平台配置」「权限管理」菜单，属正常。",
        ],
    )


def student_manual() -> Manual:
    return Manual(
        filename="内测手册-学员.pdf",
        role_title="学员内测手册",
        subtitle="登录页请选择「学员」",
        intro=COMMON_PREP + STUDENT_ACCOUNTS,
        steps=[
            Step(
                "1. 口令登录",
                [
                    "向班主任索取登录口令（运营「发登录链接」生成）。",
                    "打开内测地址，点击「学员」。",
                    "在下方「口令登录」粘贴口令并登录。",
                ],
                [
                    "成功进入学员主页。",
                    "不能使用导师/运营/管理员入口登录。",
                ],
                "图1：学员口令登录",
            ),
            Step(
                "2. 主页",
                [
                    "查看当前项目名称、导师姓名、下一节课信息。",
                ],
                [
                    "有项目时信息完整；无课次时有联系班主任类提示。",
                ],
                "图2：学员主页",
            ),
            Step(
                "3. 辅导与交付空间",
                [
                    "进入底部「辅导」，打开项目。",
                    "进入交付空间，向导师发送一条消息。",
                    "查看项目文件与上课安排。",
                ],
                [
                    "默认「专家和学员」聊天频道。",
                    "无底部「消息」独立页。",
                ],
                "图3：辅导 / 交付空间",
            ),
            Step(
                "4. 预约与课堂",
                [
                    "进入「预约」，查看课次主题、时间、导师、状态（即将上课/进行中等）。",
                    "在可进入时段点击「进入课堂」（Chrome/Edge + 授权设备）。",
                    "查看「历史课次」中已结束或不可再进的课。",
                ],
                [
                    "状态均为中文。",
                    "历史课次不能再进课堂。",
                ],
                "图4：预约与进入课堂",
            ),
            Step(
                "5. 我的、通知、退出",
                [
                    "进入「我的」，查看账号与打码手机号。",
                    "点击铃铛查看排课/改期通知。",
                    "右上角「退出登录」。",
                ],
                [
                    "「我的」中无无效的通知开关保存项。",
                    "退出后需重新口令登录。",
                ],
                "图5：我的 / 通知 / 退出",
            ),
        ],
        notes=[
            "学员不能自助注册。",
        ],
    )


def build_styles(font: str):
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "title",
            fontName=font,
            fontSize=20,
            leading=26,
            alignment=TA_LEFT,
            spaceAfter=8,
        ),
        "h2": ParagraphStyle(
            "h2",
            fontName=font,
            fontSize=14,
            leading=20,
            spaceBefore=10,
            spaceAfter=6,
            textColor=colors.HexColor("#1a1a1a"),
        ),
        "body": ParagraphStyle(
            "body",
            fontName=font,
            fontSize=11,
            leading=16,
            spaceAfter=4,
        ),
        "small": ParagraphStyle(
            "small",
            fontName=font,
            fontSize=9,
            leading=13,
            textColor=colors.HexColor("#555555"),
        ),
        "shot": ParagraphStyle(
            "shot",
            fontName=font,
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#666666"),
            alignment=TA_LEFT,
        ),
    }


def _fit_image_size(img_path: Path, max_w: float, max_h: float) -> tuple[float, float]:
    try:
        from PIL import Image as PILImage

        with PILImage.open(img_path) as pil:
            w, h = pil.size
        if w <= 0 or h <= 0:
            return max_w, max_h * 0.56
        scale = min(max_w / w, max_h / h)
        return w * scale, h * scale
    except Exception:
        return max_w, max_h * 0.56


def shot_placeholder(styles, caption: str, img_path: Path | None):
    flow = []
    flow.append(Spacer(1, 0.2 * cm))
    if img_path and img_path.exists():
        max_w, max_h = 16 * cm, 9.5 * cm
        iw, ih = _fit_image_size(img_path, max_w, max_h)
        im = Image(str(img_path), width=iw, height=ih)
        im.hAlign = "LEFT"
        flow.append(im)
    else:
        t = Table(
            [[Paragraph(f"【截图位置】{caption}<br/>请测试时截取本步全屏或关键区域，粘贴到内测反馈文档。", styles["shot"])]],
            colWidths=[16 * cm],
            rowHeights=[7 * cm],
        )
        t.setStyle(
            TableStyle(
                [
                    ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#cccccc")),
                    ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f7f7f7")),
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 12),
                ]
            )
        )
        flow.append(t)
    flow.append(Paragraph(caption, styles["small"]))
    flow.append(Spacer(1, 0.35 * cm))
    return flow


def render_manual(manual: Manual, font: str, step_images: dict[str, Path]):
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    path = OUT_DIR / manual.filename
    styles = build_styles(font)
    doc = SimpleDocTemplate(
        str(path),
        pagesize=A4,
        leftMargin=2 * cm,
        rightMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
        title=manual.role_title,
    )
    story = []

    story.append(Paragraph(manual.role_title, styles["title"]))
    story.append(Paragraph(manual.subtitle, styles["body"]))
    story.append(Paragraph(f"文档日期：{date.today().isoformat()}", styles["small"]))
    story.append(Spacer(1, 0.5 * cm))

    story.append(Paragraph("测试前准备", styles["h2"]))
    for line in manual.intro:
        story.append(Paragraph(f"• {line}", styles["body"]))

    story.append(PageBreak())
    story.append(Paragraph("分步测试（操作 → 预期 → 截图）", styles["h2"]))
    story.append(
        Paragraph(
            "请按顺序执行。每步完成后在截图区保存页面截图；若内测反馈需要，可将截图与问题一并发送给产品/开发。",
            styles["body"],
        )
    )
    story.append(Spacer(1, 0.3 * cm))

    for step in manual.steps:
        story.append(Paragraph(step.title, styles["h2"]))
        story.append(Paragraph("操作：", styles["body"]))
        for i, act in enumerate(step.actions, 1):
            story.append(Paragraph(f"{i}. {act}", styles["body"]))
        story.append(Paragraph("预期结果：", styles["body"]))
        for exp in step.expected:
            story.append(Paragraph(f"• {exp}", styles["body"]))
        img = step_images.get(step.shot_caption)
        if img is None and step_images:
            print(f"警告: 缺少截图 [{manual.filename}] {step.shot_caption}")
        story.extend(shot_placeholder(styles, step.shot_caption, img))
        story.append(Spacer(1, 0.2 * cm))

    story.append(PageBreak())
    story.append(Paragraph("补充说明", styles["h2"]))
    for n in manual.notes:
        story.append(Paragraph(f"• {n}", styles["body"]))
    story.append(Spacer(1, 0.5 * cm))
    story.append(
        Paragraph(
            "联调全流程建议：导师注册认证 → 管理员审核 → 运营建学员/项目/排课 → 导师接单上课 → 运营确认完课与结案 → 四方查看收入/看板/通知。",
            styles["body"],
        )
    )

    doc.build(story)
    return path


def main():
    from beta_screenshot_capture import capture_all

    font = register_font()
    try:
        all_shots = capture_all()
    except Exception as exc:
        print("自动截图失败，将生成占位 PDF:", exc)
        import traceback

        traceback.print_exc()
        all_shots = {}

    manuals = [expert_manual(), ops_manual(), admin_manual(), student_manual()]
    paths = []
    for m in manuals:
        shots = all_shots.get(m.filename, {})
        p = render_manual(m, font, shots)
        paths.append(p)
        print("OK", p, f"({len(shots)} 张截图)")

    readme = OUT_DIR / "README.md"
    readme.write_text(
        "# 内测 PDF 手册\n\n"
        f"生成日期：{date.today().isoformat()}\n\n"
        "文件列表：\n"
        + "\n".join(f"- [{p.name}](./{p.name})" for p in paths)
        + "\n\n"
        "截图：使用本机 Edge/Chrome 自动截取（无需 `playwright install chromium`）。"
        " 原始 PNG 在 [`assets/`](./assets/)。\n\n"
        "重新生成：`python scripts/generate_beta_test_pdfs.py`\n",
        encoding="utf-8",
    )
    print("README", readme)


if __name__ == "__main__":
    main()
