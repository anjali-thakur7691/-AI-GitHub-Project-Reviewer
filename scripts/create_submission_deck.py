"""Create a self-contained CodeLens AI project presentation (.pptx)."""

from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile
from xml.sax.saxutils import escape
import tempfile

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "docs" / "CodeLens_AI_Project_Presentation.pptx"
WIDTH, HEIGHT = 1600, 900
EMU_W, EMU_H = 12192000, 6858000
FONT_REG = r"C:\Windows\Fonts\segoeui.ttf"
FONT_BOLD = r"C:\Windows\Fonts\segoeuib.ttf"


def font(size, bold=False):
    return ImageFont.truetype(FONT_BOLD if bold else FONT_REG, size)


def wrap(draw, text, face, max_width):
    lines, current = [], ""
    for word in text.split():
        candidate = f"{current} {word}".strip()
        if draw.textlength(candidate, font=face) <= max_width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def make_slide(spec, index, total):
    image = Image.new("RGB", (WIDTH, HEIGHT), "#0b1020")
    pixels = image.load()
    top, bottom = (11, 16, 32), (18, 29, 54)
    for y in range(HEIGHT):
        t = y / HEIGHT
        color = tuple(round(top[c] * (1 - t) + bottom[c] * t) for c in range(3))
        for x in range(WIDTH):
            pixels[x, y] = color
    draw = ImageDraw.Draw(image, "RGBA")
    draw.ellipse((1180, -330, 1750, 240), fill=(99, 75, 255, 26))
    draw.ellipse((-300, 680, 260, 1240), fill=(31, 194, 189, 18))
    draw.rounded_rectangle((74, 54, 266, 98), radius=22, fill=(87, 74, 229, 48), outline=(126, 116, 255, 100), width=2)
    draw.text((96, 64), "CODELENS AI", font=font(19, True), fill="#bfc3ff")
    draw.text((1462, 66), f"{index:02d} / {total:02d}", font=font(17, True), fill="#828da9")

    title_face = font(49 if index == 1 else 42, True)
    title_y = 164 if index == 1 else 145
    title_color = "#ffffff"
    if index == 1:
        draw.text((76, title_y), "CodeLens AI", font=font(82, True), fill=title_color)
        draw.text((82, 278), "AI GitHub Project Reviewer", font=font(36), fill="#c1c9df")
        draw.rounded_rectangle((82, 360, 94, 500), radius=6, fill="#7667ff")
        draw.text((120, 370), "Understand your repository.\nFind risks. Improve with confidence.", font=font(32, True), fill="#eef0ff", spacing=18)
        draw.text((82, 568), "Project Presentation", font=font(23, True), fill="#9da9c4")
        draw.text((82, 621), "Team: Anjali Thakur  |  Prerna  |  Yamini  |  Mitali  |  Kasis", font=font(21), fill="#9da9c4")
        draw.rounded_rectangle((1100, 265, 1460, 625), radius=34, fill=(26, 36, 66, 230), outline=(111, 100, 255, 130), width=3)
        draw.rounded_rectangle((1150, 320, 1410, 378), radius=14, fill=(78, 70, 190, 145))
        draw.text((1174, 335), "REPOSITORY HEALTH", font=font(17, True), fill="#d9dcff")
        draw.ellipse((1195, 410, 1365, 580), outline="#43d5bb", width=13)
        draw.text((1235, 455), "AI", font=font(50, True), fill="#ffffff")
        draw.text((1208, 588), "CODE REVIEW", font=font(17, True), fill="#9ca8c6")
    else:
        draw.text((78, title_y), spec["title"], font=title_face, fill=title_color)
        draw.rounded_rectangle((80, 212, 218, 220), radius=4, fill="#7667ff")
        if spec.get("subtitle"):
            draw.text((80, 245), spec["subtitle"], font=font(21), fill="#aab5ce")
        cards = spec["cards"]
        gap = 24
        cols = 1 if len(cards) <= 2 else 2
        card_w = (1440 - gap * (cols - 1)) // cols
        top_y = 305 if spec.get("subtitle") else 278
        rows = (len(cards) + cols - 1) // cols
        card_h = min(220, (510 - gap * (rows - 1)) // rows)
        for i, card in enumerate(cards):
            row, col = divmod(i, cols)
            x = 80 + col * (card_w + gap)
            y = top_y + row * (card_h + gap)
            draw.rounded_rectangle((x, y + 7, x + card_w, y + card_h + 7), radius=22, fill=(0, 0, 0, 58))
            draw.rounded_rectangle((x, y, x + card_w, y + card_h), radius=22, fill=(25, 35, 60, 235), outline=(88, 106, 153, 90), width=2)
            draw.rounded_rectangle((x + 24, y + 25, x + 70, y + 71), radius=14, fill=(103, 88, 237, 92))
            draw.text((x + 39, y + 33), str(i + 1), font=font(21, True), fill="#ddd9ff")
            draw.text((x + 88, y + 29), card[0], font=font(24, True), fill="#ffffff")
            body_face = font(19)
            lines = wrap(draw, card[1], body_face, card_w - 52)
            for j, line in enumerate(lines[:4]):
                draw.text((x + 27, y + 91 + j * 31), line, font=body_face, fill="#b8c2d9")
    draw.line((80, 830, 1520, 830), fill=(99, 113, 152, 85), width=2)
    footer = "CODELENS AI  •  PROJECT OVERVIEW" if index == 1 else "CodeLens AI  •  AI-assisted repository review"
    draw.text((80, 846), footer, font=font(16, True), fill="#7d89a7")
    return image


SLIDES = [
    {"title": "The problem", "subtitle": "Repository review can be slow and difficult to prioritize.", "cards": [
        ("Large codebases", "Important files and risks are hard to spot when reviewing a repository by hand."),
        ("Security oversights", "Secrets and risky source patterns can be committed before anyone notices."),
        ("Unclear next steps", "A list of findings is more useful when it includes severity, location, and guidance."),
    ]},
    {"title": "The solution", "subtitle": "Paste a public GitHub URL to get a focused, readable review.", "cards": [
        ("Scan", "Fetch repository metadata and selected source files from GitHub."),
        ("Prioritize", "Group detected findings by category and severity, with file and line details."),
        ("Understand", "Use repository-aware AI chat and voice to ask what a finding means."),
        ("Improve", "Review suggested fixes and export a report for follow-up."),
    ]},
    {"title": "How a scan works", "subtitle": "A bounded source-pattern review designed for a quick first look.", "cards": [
        ("1 · Repository URL", "The backend validates an HTTPS github.com repository URL."),
        ("2 · GitHub metadata", "Repository details, languages, and the file tree are fetched from GitHub."),
        ("3 · Selected files", "The analyzer checks supported source extensions and caps the scan at 25 files."),
        ("4 · Findings", "The dashboard shows detected patterns, score estimates, and file locations."),
    ]},
    {"title": "Product features", "subtitle": "One dashboard for repository health, issues, and follow-up.", "cards": [
        ("Repository dashboard", "Health estimate, language breakdown, file structure, and scan history."),
        ("Code issues", "Severity-tagged pattern findings, explanations, and fix suggestions."),
        ("Security view", "Common risky patterns and potential exposed-secret findings."),
        ("Reports & chat", "Downloadable analysis report and contextual AI questions."),
    ]},
    {"title": "Voice AI assistant", "subtitle": "Ask about scan results out loud and hear the response.", "cards": [
        ("Speak", "Browser speech recognition captures the spoken question after microphone permission."),
        ("Get context", "The app sends the question with the current repository analysis to /api/chat."),
        ("Answer", "Gemini can answer when configured; otherwise the backend uses a basic fallback."),
        ("Listen", "Browser speech synthesis reads the answer aloud; playback can be stopped."),
    ]},
    {"title": "System architecture", "subtitle": "A single Python web service serves both the built UI and JSON API.", "cards": [
        ("Frontend", "React + Vite user interface; Tailwind CSS styling and Lucide icons."),
        ("Backend", "Python standard-library HTTP server handles analysis, authentication, and chat."),
        ("External services", "GitHub REST/raw endpoints provide public repository data; Gemini is optional."),
        ("Persistence", "SQLite stores password hashes, sessions, and saved repository analyses."),
    ]},
    {"title": "Database model", "subtitle": "Three related SQLite tables support accounts, sessions, and scan history.", "cards": [
        ("users", "Account profile and password salt/hash. Email is unique and case-insensitive."),
        ("sessions", "Hashed session token, user reference, creation time, and expiry."),
        ("repository_analyses", "Repository URL/name, JSON result, timestamp, and optional user reference."),
    ]},
    {"title": "Technology stack", "subtitle": "Built with a lightweight Python backend and React frontend.", "cards": [
        ("React 18 · Vite", "Component-based frontend and production bundling."),
        ("Tailwind CSS · Lucide", "Responsive utility styling and interface icons."),
        ("Python · SQLite", "Built-in HTTP server, heuristic scanner, and local persistence."),
        ("Gemini · Web Speech API", "Optional AI responses plus browser-native speech input/output."),
    ]},
    {"title": "Scope and next steps", "subtitle": "CodeLens AI is a first-pass reviewer, not a full security audit.", "cards": [
        ("Current limitation", "Heuristic source-pattern checks cover a capped selection of supported files; findings need human verification."),
        ("Broader analysis", "Add dependency vulnerability checks, deeper language coverage, and configurable scan rules."),
        ("Production data", "Move from demo SQLite storage to managed persistent database storage."),
        ("Accessibility & scale", "Add multilingual voice input, stronger tests, rate limits, and larger-repository processing."),
    ]},
    {"title": "Try CodeLens AI", "subtitle": "Live demo and source repository", "cards": [
        ("Live demo", "https://ai-github-project-reviewer.onrender.com"),
        ("GitHub", "github.com/anjali-thakur7691/-AI-GitHub-Project-Reviewer"),
        ("Next step", "Paste a public GitHub repository URL and review its findings."),
    ]},
]


def xml_text(text):
    return escape(text, {"\"": "&quot;"})


def base_tree():
    return ('<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>'
            '<p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/>'
            '<a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>')


def build_pptx(images):
    ns = 'xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"'
    with ZipFile(OUTPUT, "w", ZIP_DEFLATED) as ppt:
        overrides = ['<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>',
                     '<Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>',
                     '<Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>',
                     '<Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>']
        overrides.extend(f'<Override PartName="/ppt/slides/slide{i}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>' for i in range(1, len(images) + 1))
        ppt.writestr('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/>' + ''.join(overrides) + '</Types>')
        ppt.writestr('_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/></Relationships>')
        slide_ids = ''.join(f'<p:sldId id="{255+i}" r:id="rId{i+1}"/>' for i in range(len(images)))
        ppt.writestr('ppt/presentation.xml', f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:presentation {ns}><p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst><p:sldIdLst>{slide_ids}</p:sldIdLst><p:sldSz cx="{EMU_W}" cy="{EMU_H}" type="screen16x9"/><p:notesSz cx="6858000" cy="9144000"/></p:presentation>')
        pres_rels = '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>' + ''.join(f'<Relationship Id="rId{i+2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide{i+1}.xml"/>' for i in range(len(images)))
        ppt.writestr('ppt/_rels/presentation.xml.rels', f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">{pres_rels}</Relationships>')
        master = f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sldMaster {ns}><p:cSld><p:spTree>{base_tree()}</p:spTree></p:cSld><p:clrMap accent1="7667ff" accent2="43d5bb" accent3="ffffff" accent4="aab5ce" accent5="0b1020" accent6="12203a" bg1="lt1" bg2="lt2" folHlink="hlink" hlink="folHlink" tx1="dk1" tx2="dk2"/><p:sldLayoutIdLst><p:sldLayoutId id="1" r:id="rId1"/></p:sldLayoutIdLst><p:txStyles><p:titleStyle><p:lvl1pPr><a:defRPr lang="en-US" sz="4400"/></p:lvl1pPr></p:titleStyle><p:bodyStyle><p:lvl1pPr><a:defRPr lang="en-US" sz="1800"/></p:lvl1pPr></p:bodyStyle><p:otherStyle><p:lvl1pPr><a:defRPr lang="en-US" sz="1800"/></p:lvl1pPr></p:otherStyle></p:txStyles></p:sldMaster>'
        ppt.writestr('ppt/slideMasters/slideMaster1.xml', master)
        ppt.writestr('ppt/slideMasters/_rels/slideMaster1.xml.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/></Relationships>')
        layout = f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sldLayout {ns} type="blank" preserve="1"><p:cSld name="Blank"><p:spTree>{base_tree()}</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>'
        ppt.writestr('ppt/slideLayouts/slideLayout1.xml', layout)
        ppt.writestr('ppt/slideLayouts/_rels/slideLayout1.xml.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/></Relationships>')
        fill_style = '<a:solidFill><a:schemeClr val="phClr"/></a:solidFill>'
        line_style = '<a:ln w="6350"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln>'
        effect_style = '<a:effectStyle><a:effectLst/></a:effectStyle>'
        theme = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="CodeLens"><a:themeElements><a:clrScheme name="CodeLens"><a:dk1><a:srgbClr val="0B1020"/></a:dk1><a:lt1><a:srgbClr val="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="12203A"/></a:dk2><a:lt2><a:srgbClr val="E9ECF5"/></a:lt2><a:accent1><a:srgbClr val="7667FF"/></a:accent1><a:accent2><a:srgbClr val="43D5BB"/></a:accent2><a:accent3><a:srgbClr val="FFFFFF"/></a:accent3><a:accent4><a:srgbClr val="AAB5CE"/></a:accent4><a:accent5><a:srgbClr val="41506F"/></a:accent5><a:accent6><a:srgbClr val="9B8FFF"/></a:accent6><a:hlink><a:srgbClr val="43D5BB"/></a:hlink><a:folHlink><a:srgbClr val="9B8FFF"/></a:folHlink></a:clrScheme><a:fontScheme name="Aptos"><a:majorFont><a:latin typeface="Aptos Display"/><a:ea typeface=""/><a:cs typeface=""/></a:majorFont><a:minorFont><a:latin typeface="Aptos"/><a:ea typeface=""/><a:cs typeface=""/></a:minorFont></a:fontScheme><a:fmtScheme name="Office"><a:fillStyleLst>' + fill_style * 3 + '</a:fillStyleLst><a:lnStyleLst>' + line_style * 3 + '</a:lnStyleLst><a:effectStyleLst>' + effect_style * 3 + '</a:effectStyleLst><a:bgFillStyleLst>' + fill_style * 3 + '</a:bgFillStyleLst></a:fmtScheme></a:themeElements><a:objectDefaults/><a:extraClrSchemeLst/></a:theme>')
        ppt.writestr('ppt/theme/theme1.xml', theme)
        for i, image in enumerate(images, 1):
            pic = f'<p:pic><p:nvPicPr><p:cNvPr id="2" name="Slide {i} artwork" descr="CodeLens AI project presentation slide {i}"/><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr><p:blipFill><a:blip r:embed="rId2"/><a:stretch><a:fillRect/></a:stretch></p:blipFill><p:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="{EMU_W}" cy="{EMU_H}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr></p:pic>'
            ppt.writestr(f'ppt/slides/slide{i}.xml', f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sld {ns}><p:cSld><p:spTree>{base_tree()}{pic}</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>')
            rels = '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/slide%d.png"/>' % i
            ppt.writestr(f'ppt/slides/_rels/slide{i}.xml.rels', f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">{rels}</Relationships>')
            ppt.write(image, f'ppt/media/slide{i}.png')


def main():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    specs = [{"title": "CodeLens AI"}] + SLIDES
    with tempfile.TemporaryDirectory() as temporary:
        images = []
        for number, spec in enumerate(specs, 1):
            image = make_slide(spec, number, len(specs))
            path = Path(temporary) / f"slide-{number:02d}.png"
            image.save(path, optimize=True)
            images.append(path)
        build_pptx(images)
    print(f"Created {OUTPUT} ({len(specs)} slides)")


if __name__ == "__main__":
    main()
