"""Import the supplied glossary verbatim; use --write after reviewing the diff."""
import json
import re
import sys
from pathlib import Path
from zipfile import ZipFile
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT.parent / '네트워크 보안 - 과제 1.docx'
NS = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'

def read_source():
    with ZipFile(SOURCE) as archive:
        doc = ET.fromstring(archive.read('word/document.xml'))
    paragraphs = []
    for paragraph in doc.iter(NS + 'p'):
        parts = []
        for node in paragraph.iter():
            if node.tag == NS + 't':
                parts.append(node.text or '')
            elif node.tag in (NS + 'br', NS + 'cr'):
                parts.append('\n')
            elif node.tag == NS + 'tab':
                parts.append('\t')
        paragraphs.append(''.join(parts))
    text = '\n'.join(paragraphs)
    headings = list(re.finditer(r'(?m)^(\d+)\. (.+)$', text))
    records = []
    for i, heading in enumerate(headings):
        body = text[heading.end():headings[i+1].start() if i+1 < len(headings) else len(text)].strip('\n')
        original, supplement = re.split(r'(?:✅\s*)?\[보충 정의\]', body, maxsplit=1)
        assert '[원본]' in original, heading.group(0)
        records.append({'sourceNumber':int(heading[1]), 'term':heading[2],
                        'original':original.split('[원본]', 1)[1].rstrip('\n'),
                        'supplement':supplement.rstrip('\n')})
    assert records and text.count('[원본]') == len(records), 'Unparsed source entries'
    return records

if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    old = json.loads((ROOT / 'app/terms.json').read_text(encoding='utf-8'))
    source = read_source()
    assert [t['sourceNumber'] for t in source] == list(range(1, len(source)+1)), 'Source numbering must be consecutive starting at 1'
    assert [t['id'] for t in old] == list(range(1, len(old)+1)), 'Review the saved-record migration before changing IDs'
    # Internal IDs preserve existing study records when the source order is stable.
    assert len(source) == len(old), 'Entry count changed; review ID mapping before import'
    assert all(a['term'] == b['term'] for a,b in zip(source,old)), 'Names or order changed; review ID mapping'
    new = [{'id':previous['id']} | {key:value for key,value in record.items() if key != 'sourceNumber'}
           for record,previous in zip(source,old)]
    changes = [{'id':a['id'], 'before':a['term'], 'after':b['term'],
                'fields':[key for key in ('term','original','supplement') if a[key] != b[key]]}
               for a,b in zip(old,new) if a != b]
    print(json.dumps({'count':len(new),'changed':len(changes),'changes':changes},ensure_ascii=False,indent=2))
    if '--write' in sys.argv:
        (ROOT / 'app/terms.json').write_text(json.dumps(new,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
