#!/usr/bin/env python3
"""フォントのセルフホスト用サブセットを生成する（2026-11-24 導入）。

背景:
  以前は @fontsource の CSS を読み込んでいたため、ビルド成果物（dist）に
  フォントサブセットが 938 件・約 31MB 含まれ、CSS も 584KB あった。
  本スクリプトは公式フォント（Google Fonts）からサブセット woff2 を生成し、
  public/fonts/ に配置する。あわせて src/styles/fonts.css を生成する。

2 層サブセット（unicode-range で出し分け）:
  - core: サイト本文の全文字 ＋ かな・ASCII・記号 ＋ 小学校配当漢字（1,026 字）
          → 通常の閲覧ではこちらだけがダウンロードされる。
  - ext : 残りの常用漢字・人名用漢字
          → 珍しい漢字が本文に現れたときだけ追加で読み込まれる。
  どちらの層にも無い文字は CSS のフォールバック書体（ヒラギノ明朝等）で
  表示される。実データ確定後に再実行すれば、本文の文字は必ず core に入る。

使い方:
  python3 scripts/build-fonts.py
  - ソースフォント等は tools/font-cache/ にダウンロードされる（git 管理外）。
  - 必要: pip install fonttools brotli
  - 生成物: public/fonts/*.woff2, public/fonts/licenses/OFL-*.txt,
            src/styles/fonts.css
"""

from __future__ import annotations

import re
import subprocess
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / "tools" / "font-cache"
OUT_DIR = ROOT / "public" / "fonts"
LICENSE_DIR = OUT_DIR / "licenses"
FONTS_CSS = ROOT / "src" / "styles" / "fonts.css"

GF = "https://github.com/google/fonts/raw/main/ofl"
FONT_SOURCES = {
    "ShipporiMinchoB1-Medium.ttf": f"{GF}/shipporiminchob1/ShipporiMinchoB1-Medium.ttf",
    "ShipporiMinchoB1-SemiBold.ttf": f"{GF}/shipporiminchob1/ShipporiMinchoB1-SemiBold.ttf",
    "ZenKakuGothicNew-Regular.ttf": f"{GF}/zenkakugothicnew/ZenKakuGothicNew-Regular.ttf",
    "ZenKakuGothicNew-Medium.ttf": f"{GF}/zenkakugothicnew/ZenKakuGothicNew-Medium.ttf",
    "CormorantGaramond-var.ttf": f"{GF}/cormorantgaramond/CormorantGaramond%5Bwght%5D.ttf",
    "OFL-shippori.txt": f"{GF}/shipporiminchob1/OFL.txt",
    "OFL-zenkaku.txt": f"{GF}/zenkakugothicnew/OFL.txt",
    "OFL-cormorant.txt": f"{GF}/cormorantgaramond/OFL.txt",
    "joyo.html": "https://en.wikipedia.org/wiki/List_of_j%C5%8Dy%C5%8D_kanji",
    "jinmeiyo.html": "https://en.wikipedia.org/wiki/Jinmeiy%C5%8D_kanji",
}

# (ソース, family 名, weight, 出力ベース名)
JAPANESE_JOBS = [
    ("ShipporiMinchoB1-Medium.ttf", "Shippori Mincho B1", 500, "shippori-mincho-b1-500"),
    ("ShipporiMinchoB1-SemiBold.ttf", "Shippori Mincho B1", 600, "shippori-mincho-b1-600"),
    ("ZenKakuGothicNew-Regular.ttf", "Zen Kaku Gothic New", 400, "zen-kaku-gothic-new-400"),
    ("ZenKakuGothicNew-Medium.ttf", "Zen Kaku Gothic New", 500, "zen-kaku-gothic-new-500"),
]
CORMORANT_WEIGHTS = [500, 600]


def download(url: str, dest: Path) -> None:
    if dest.exists() and dest.stat().st_size > 0:
        return
    print(f"download: {url}")
    req = urllib.request.Request(url, headers={"User-Agent": "build-fonts.py"})
    with urllib.request.urlopen(req) as res:
        dest.write_bytes(res.read())


def site_characters() -> set[str]:
    chars: set[str] = set()
    targets = list((ROOT / "src").rglob("*")) + [ROOT / "index.html"]
    for path in targets:
        if path.is_file() and path.suffix in {".ts", ".tsx", ".css", ".html", ".json"}:
            chars.update(path.read_text(encoding="utf-8", errors="ignore"))
    return {c for c in chars if ord(c) >= 0x20}


def joyo_kanji() -> tuple[set[str], set[str]]:
    """Wikipedia の常用漢字表から (常用漢字すべて, 小学校配当漢字) を抽出する。"""
    html = (CACHE / "joyo.html").read_text(encoding="utf-8", errors="ignore")
    all_kanji: set[str] = set()
    elementary: set[str] = set()
    for row in re.findall(r"<tr[^>]*>(.*?)</tr>", html, re.S):
        cells = [
            re.sub(r"<[^>]+>", "", c).strip()
            for c in re.findall(r"<t[dh][^>]*>(.*?)</t[dh]>", row, re.S)
        ]
        # 表の列: [#, 新字体, 旧字体, 部首, 画数, 学年, 追加年, 意味, 読み]
        if len(cells) >= 6 and cells[0].isdigit() and len(cells[1]) == 1:
            kanji, grade = cells[1], cells[5]
            if 0x4E00 <= ord(kanji) <= 0x9FFF:
                all_kanji.add(kanji)
                if grade in {"1", "2", "3", "4", "5", "6"}:
                    elementary.add(kanji)
    return all_kanji, elementary


def jinmeiyo_kanji() -> set[str]:
    html = (CACHE / "jinmeiyo.html").read_text(encoding="utf-8", errors="ignore")
    return {c for c in html if 0x4E00 <= ord(c) <= 0x9FFF}


def range_chars(start: int, end: int) -> set[str]:
    return {chr(c) for c in range(start, end + 1)}


def build_charsets() -> tuple[set[str], set[str], set[str]]:
    """(core, ext, latin) の文字集合を返す。"""
    site = site_characters()
    joyo_all, elementary = joyo_kanji()
    extra_kanji = (joyo_all | jinmeiyo_kanji()) - elementary

    core = set(site)
    core |= range_chars(0x0020, 0x007E)  # ASCII
    core |= range_chars(0x00A0, 0x00FF)  # Latin-1
    core |= range_chars(0x2000, 0x206F)  # 一般句読点
    core |= range_chars(0x3000, 0x303F)  # CJK 記号・句読点
    core |= range_chars(0x3041, 0x3096)  # ひらがな
    core |= range_chars(0x30A1, 0x30FA)  # カタカナ
    core |= {chr(0x30FB), chr(0x30FC)}   # ・ ー
    core |= range_chars(0xFF01, 0xFF5E)  # 全角英数・記号
    core |= {chr(c) for c in (0x2605, 0x2606, 0x2713, 0x2714, 0x2190, 0x2191, 0x2192, 0x2193, 0x25C6, 0x25C7)}
    core |= elementary

    ext = set(extra_kanji) - core

    latin = {c for c in core if ord(c) < 0x3000}
    return core, ext, latin


def unicode_range(chars: set[str]) -> str:
    points = sorted(ord(c) for c in chars)
    ranges: list[str] = []
    start = prev = points[0]
    for p in points[1:]:
        if p == prev + 1:
            prev = p
            continue
        ranges.append(f"U+{start:04X}" if start == prev else f"U+{start:04X}-{prev:04X}")
        start = prev = p
    ranges.append(f"U+{start:04X}" if start == prev else f"U+{start:04X}-{prev:04X}")
    return ",".join(ranges)


def subset(source: Path, text_file: Path, out: Path) -> None:
    cmd = [
        sys.executable, "-m", "fontTools.subset", str(source),
        f"--text-file={text_file}",
        "--flavor=woff2",
        "--no-hinting",
        f"--output-file={out}",
    ]
    subprocess.run(cmd, check=True, capture_output=True, text=True)
    print(f"subset: {out.name}  {out.stat().st_size / 1024:.0f} KiB")


def face_block(family: str, weight: int, file_name: str, chars: set[str] | None) -> str:
    lines = [
        "@font-face {",
        f"  font-family: \"{family}\";",
        "  font-style: normal;",
        f"  font-weight: {weight};",
        "  font-display: swap;",
        f"  src: url(\"/fonts/{file_name}\") format(\"woff2\");",
    ]
    if chars is not None:
        lines.append(f"  unicode-range: {unicode_range(chars)};")
    lines.append("}")
    return "\n".join(lines)


def main() -> int:
    CACHE.mkdir(parents=True, exist_ok=True)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    LICENSE_DIR.mkdir(parents=True, exist_ok=True)

    for name, url in FONT_SOURCES.items():
        download(url, CACHE / name)
    for name in ("OFL-shippori.txt", "OFL-zenkaku.txt", "OFL-cormorant.txt"):
        dest = LICENSE_DIR / name
        if not dest.exists():
            dest.write_bytes((CACHE / name).read_bytes())

    core, ext, latin = build_charsets()
    print(f"charset: core={len(core)}, ext={len(ext)}, latin={len(latin)}")
    core_text = CACHE / "charset-core.txt"
    ext_text = CACHE / "charset-ext.txt"
    latin_text = CACHE / "charset-latin.txt"
    core_text.write_text("".join(sorted(core)), encoding="utf-8")
    ext_text.write_text("".join(sorted(ext)), encoding="utf-8")
    latin_text.write_text("".join(sorted(latin)), encoding="utf-8")

    css_blocks = [
        "/* このファイルは scripts/build-fonts.py が生成します。直接編集しないでください。 */",
        "/* フォント: Shippori Mincho B1 / Zen Kaku Gothic New / Cormorant Garamond（いずれも OFL 1.1、ライセンスは public/fonts/licenses/） */",
    ]

    for source_name, family, weight, base in JAPANESE_JOBS:
        subset(CACHE / source_name, core_text, OUT_DIR / f"{base}-core.woff2")
        subset(CACHE / source_name, ext_text, OUT_DIR / f"{base}-ext.woff2")
        css_blocks.append(face_block(family, weight, f"{base}-core.woff2", core))
        css_blocks.append(face_block(family, weight, f"{base}-ext.woff2", ext))

    # Cormorant Garamond は可変フォントしか配布されていないため、
    # 必要なウェイトを実体化してからサブセットする。
    from fontTools import ttLib
    from fontTools.varLib.instancer import instantiateVariableFont

    for weight in CORMORANT_WEIGHTS:
        instance = ttLib.TTFont(CACHE / "CormorantGaramond-var.ttf")
        instantiateVariableFont(instance, {"wght": weight}, inplace=True)
        static_path = CACHE / f"CormorantGaramond-{weight}.ttf"
        instance.save(static_path)
        out_name = f"cormorant-garamond-{weight}.woff2"
        subset(static_path, latin_text, OUT_DIR / out_name)
        css_blocks.append(face_block("Cormorant Garamond", weight, out_name, None))

    FONTS_CSS.write_text("\n\n".join(css_blocks) + "\n", encoding="utf-8")
    print(f"wrote {FONTS_CSS.relative_to(ROOT)}")

    total = sum(p.stat().st_size for p in OUT_DIR.glob("*.woff2"))
    print(f"total woff2: {total / 1024:.0f} KiB in {len(list(OUT_DIR.glob('*.woff2')))} files")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
