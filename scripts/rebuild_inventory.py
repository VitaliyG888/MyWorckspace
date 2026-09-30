"""Static-only originals audit. Usage: python rebuild_inventory.py ORIGINALS_DIR OUTPUT_DIR
Requires pypdf only for PDF metadata. Does not import or execute the uploaded Python.
Writes independent audit outputs, not the reviewed migration decisions.
"""
import ast, pathlib, json, csv, sys, hashlib, re
from pypdf import PdfReader
root=pathlib.Path(sys.argv[1]);out=pathlib.Path(sys.argv[2]);out.mkdir(parents=True,exist_ok=True)
def save(name,data): (out/name).write_text(json.dumps(data,ensure_ascii=False,indent=2))
symbols=[]; routes=[]; tools=[]; health=[]; manifest=[]; pdf=[]
for filename in ['hexstrike_server.py','hexstrike_mcp.py']:
 text=(root/filename).read_text();tree=ast.parse(text);imports=[]
 class Visitor(ast.NodeVisitor):
  def __init__(self):self.parents=[]
  def visit_Import(self,n):imports.extend(x.name for x in n.names)
  def visit_ImportFrom(self,n):imports.append(n.module or '')
  def definition(self,n,kind):
   symbols.append({'file':filename,'name':'.'.join(self.parents+[n.name]),'kind':kind,'line':n.lineno,'end':n.end_lineno})
   for d in getattr(n,'decorator_list',[]):
    if not isinstance(d,ast.Call):continue
    name=ast.unparse(d.func)
    if name=='app.route':routes.append({'file':filename,'line':n.lineno,'path':ast.literal_eval(d.args[0]),'handler':n.name,'methods':next((ast.literal_eval(k.value) for k in d.keywords if k.arg=='methods'),['GET'])})
    if name=='mcp.tool':tools.append({'file':filename,'line':n.lineno,'name':n.name,'signature':ast.unparse(n.args)})
   if n.name=='health_check':
    for x in ast.walk(n):
     if isinstance(x,ast.Assign) and isinstance(x.value,ast.List):
      for v in x.value.elts:
       if isinstance(v,ast.Constant) and isinstance(v.value,str):health.append({'name':v.value,'line':v.lineno,'category':ast.unparse(x.targets[0])})
   self.parents.append(n.name);self.generic_visit(n);self.parents.pop()
  def visit_ClassDef(self,n):self.definition(n,'class')
  def visit_FunctionDef(self,n):self.definition(n,'function')
  def visit_AsyncFunctionDef(self,n):self.definition(n,'async_function')
 Visitor().visit(tree);save(filename+'.imports.json',sorted(set(imports)))
for f in root.iterdir():
 if f.is_file() and f.suffix in ['.py','.pdf','.txt','.md','.json']:manifest.append({'file':f.name,'sha256':hashlib.sha256(f.read_bytes()).hexdigest(),'bytes':f.stat().st_size})
 if f.suffix=='.pdf':
  for i,p in enumerate(PdfReader(f).pages,1):
   text=p.extract_text() or '';pdf.append({'file':f.name,'page':i,'characters':len(text.strip()),'needs_ocr':not bool(text.strip()),'urls':re.findall(r'https?://[^\s<>]+',text)})
for n,d in [('symbols',symbols),('routes',routes),('mcp_tools',tools),('health',health),('sources',manifest),('pdf_pages',pdf)]:save(n+'.json',d)
print(json.dumps({'routes':len(routes),'mcp_registrations':len(tools),'unique_mcp':len({t['name'] for t in tools}),'pdf_pages':len(pdf),'ocr_needed':[(p['file'],p['page']) for p in pdf if p['needs_ocr']]},indent=2))
