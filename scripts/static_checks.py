"""Artifact/inventory checks only. Does NOT compile or execute Rust."""
import json, pathlib, tomllib, unittest, collections, csv, re
ROOT=pathlib.Path(__file__).resolve().parents[1]
class ArtifactTests(unittest.TestCase):
 def test_manifest(self):self.assertEqual(tomllib.loads((ROOT/'Cargo.toml').read_text())['package']['name'],'hexstrike-rust')
 def test_source_modules(self):
  for f in (ROOT/'src').rglob('*.rs'):
   for name in re.findall(r'^pub mod (\w+);',f.read_text(),re.M):self.assertTrue((f.parent/(name+'.rs')).exists() or (f.parent/name/'mod.rs').exists(),str(f)+' '+name)
 def test_routes(self):
  r=json.loads((ROOT/'docs/inventory/http_routes.json').read_text());self.assertEqual(len(r),156);self.assertEqual(sum(x['path'].startswith('/api/tools/') for x in r),90)
 def test_mcp(self):
  t=json.loads((ROOT/'docs/inventory/mcp_tools.json').read_text());self.assertEqual(len(t),151);self.assertEqual(len({x['name'] for x in t}),150)
 def test_duplicate(self):
  t=json.loads((ROOT/'docs/inventory/mcp_tools.json').read_text());self.assertEqual([n for n,k in collections.Counter(x['name'] for x in t).items() if k>1],['httpx_probe'])
 def test_pdf_coverage(self):
  p=json.loads((ROOT/'docs/inventory/pdf_pages.json').read_text());self.assertEqual(len(p),733);self.assertEqual(len({x['file'] for x in p}),6);self.assertTrue(all(x['characters']>0 for x in p))
 def test_symbols(self):
  for file,c,f in [('hexstrike_server.py',44,448),('hexstrike_mcp.py',3,160)]:
   s=json.loads((ROOT/f'docs/inventory/{file}.symbols.json').read_text());self.assertEqual(sum(x['kind']=='class' for x in s),c);self.assertEqual(sum(x['kind']!='class' for x in s),f)
 def test_no_shell(self):
  s='\n'.join(p.read_text() for p in (ROOT/'src').rglob('*.rs'));self.assertNotIn('Command::new("sh")',s);self.assertNotIn('Command::new("bash")',s)
 def test_source_hash_fields(self):
  m=json.loads((ROOT/'docs/inventory/source_manifest.json').read_text());self.assertEqual(len(m),11);self.assertTrue(all(len(x['sha256'])==64 for x in m))
 def test_migration_catalog(self):
  with (ROOT/'docs/inventory/tool_migration.csv').open() as f:r=list(csv.DictReader(f))
  self.assertEqual(len(r),133);self.assertTrue(all(x['rust_implemented']=='False' for x in r))
 def test_no_full_pdf_copies(self):self.assertFalse(list(ROOT.rglob('*.pdf')))
 def test_stable_mcp_config(self):self.assertEqual(json.loads((ROOT/'examples/mcp-config.json').read_text())['mcpServers']['hexstrike-rust']['args'],['--mcp-stdio'])
if __name__=='__main__':unittest.main(verbosity=2)
