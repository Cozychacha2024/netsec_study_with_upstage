import json
from pathlib import Path
from xml.sax.saxutils import escape
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, LongTable, TableStyle, Spacer

ROOT=Path(__file__).resolve().parents[1]
terms=json.loads((ROOT/'app/terms.json').read_text(encoding='utf-8'))
pdfmetrics.registerFont(TTFont('Malgun','C:/Windows/Fonts/malgun.ttf'))
pdfmetrics.registerFont(TTFont('MalgunBold','C:/Windows/Fonts/malgunbd.ttf'))
normal=ParagraphStyle('body',fontName='Malgun',fontSize=9,leading=15,wordWrap='CJK',textColor=colors.HexColor('#24324b'))
name=ParagraphStyle('name',parent=normal,fontName='MalgunBold')
head=ParagraphStyle('head',parent=name,textColor=colors.white)
title=ParagraphStyle('title',parent=name,fontSize=18,leading=25,textColor=colors.black)
def p(s,style=normal):return Paragraph(escape(s).replace('\n','<br/>'),style)
rows=[[p('용어',head),p('뜻',head)]]+[[p(t['term'],name),p(t['original'])] for t in terms]
table=LongTable(rows,colWidths=[139,372.27],repeatRows=1,hAlign='LEFT')
table.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#243b60')),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,colors.HexColor('#f5f7fa')]),('GRID',(0,0),(-1,-1),.5,colors.HexColor('#d9d9d9')),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),10),('RIGHTPADDING',(0,0),(-1,-1),10),('TOPPADDING',(0,0),(-1,-1),8),('BOTTOMPADDING',(0,0),(-1,-1),8)]))
out=ROOT/'public/network-security-original.pdf'
doc=SimpleDocTemplate(str(out),pagesize=A4,rightMargin=42,leftMargin=42,topMargin=42,bottomMargin=42,title='네트워크 보안 용어집',author='')
def footer(canvas,doc):
 canvas.setFont('Malgun',8);canvas.setFillColor(colors.HexColor('#6b7280'));canvas.drawRightString(A4[0]-42,25,str(doc.page))
doc.build([p('네트워크 보안 용어집',title),Spacer(1,18),table],onFirstPage=footer,onLaterPages=footer)
print(f'Created {out.name} with {len(terms)} original definitions')
