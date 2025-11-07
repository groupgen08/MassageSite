# split_css.py
import re
from pathlib import Path

src = Path('styles.css')
if not src.exists():
    print("Файл styles.css не найден — положите его в ту же папку и запустите скрипт снова.")
    raise SystemExit(1)

text = src.read_text(encoding='utf-8')

# Найдём маркеры (комментарии) в исходном css, которые делят файл.
# Это адаптировано под твой текущий файл: ищем заметки про Vision / Holistic / Apitherapy.
markers = [
    ('vision', re.compile(r'/\*.*Vision page', re.IGNORECASE)),
    ('holistic', re.compile(r'/\*.*Holistic page', re.IGNORECASE)),
    ('apitherapy', re.compile(r'/\*.*Apitherapy', re.IGNORECASE)),
]

# Найдём позиции маркеров в тексте
positions = []
for name, rx in markers:
    m = rx.search(text)
    if m:
        positions.append((m.start(), name))
# Сортируем по позиции
positions.sort()

# Если не нашли никаких маркеров — делаем один backup и сохраняем весь файл как base.
out_dir = Path('css')
out_dir.mkdir(exist_ok=True)

if not positions:
    print("Не найдено маркеров разделения (vision/holistic/apitherapy).")
    # просто копируем исходник в css/base.css
    Path('css/base.css').write_text(text, encoding='utf-8')
    print("Создан css/base.css (весь styles.css). Ручное разделение потребуется.")
    raise SystemExit(0)

# определим сегменты: от начала до первого маркера -> base,
# затем сегменты между маркерами -> соответствующие файлы,
# и хвост после последнего маркера -> последний файл (apitherapy)
segments = []

# base: от начала до первой позиции
first_pos = positions[0][0]
segments.append(('base', text[:first_pos]))

# между маркерами
for i, (pos, name) in enumerate(positions):
    start = pos
    end = positions[i+1][0] if i+1 < len(positions) else len(text)
    segments.append((name, text[start:end]))

# Запись файлов
mapping = {
    'base': out_dir / 'base.css',
    'vision': out_dir / 'vision.css',
    'holistic': out_dir / 'holistic.css',
    'apitherapy': out_dir / 'apitherapy.css'
}

for key, content in segments:
    path = mapping.get(key, out_dir / f'{key}.css')
    path.write_text(content, encoding='utf-8')
    print(f'Wrote {path} ({len(content)} bytes)')

print("\nГотово. Проверь папку css/ — там должны быть base.css и страничные css-файлы.")
print("Далее: обнови <link> в HTML согласно инструкции и протестируй локально.")
