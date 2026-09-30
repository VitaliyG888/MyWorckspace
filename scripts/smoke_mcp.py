"""Run only after compiling the local Rust binary. No external scanners or network."""
import subprocess,json,sys
binary=sys.argv[1]
requests=[
 {'jsonrpc':'2.0','id':1,'method':'initialize','params':{'protocolVersion':'2025-06-18','capabilities':{},'clientInfo':{'name':'smoke','version':'1'}}},
 {'jsonrpc':'2.0','method':'notifications/initialized'},
 {'jsonrpc':'2.0','id':2,'method':'tools/list'},
 {'jsonrpc':'2.0','id':3,'method':'tools/call','params':{'name':'normalize_urls','arguments':{'urls':['https://EXAMPLE.com:443/a#f','https://example.com/a']}}},
 {'jsonrpc':'2.0','id':4,'method':'tools/call','params':{'name':'plan_osint','arguments':{'target':'example.com.evil.test'}}},
]
p=subprocess.run([binary,'--mcp-stdio'],input=''.join(json.dumps(r)+'\n' for r in requests),capture_output=True,text=True,timeout=15,check=True,env={'HEXSTRIKE_SCOPE':'example.com'})
responses=[json.loads(x) for x in p.stdout.splitlines()]
assert len(responses)==4
assert len(responses[1]['result']['tools'])==2
assert json.loads(responses[2]['result']['content'][0]['text'])['urls']==['https://example.com/a']
assert responses[3]['result']['isError'] is True
print('MCP fixture smoke passed, no network.')
