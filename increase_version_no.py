import codecs
import json

f = codecs.open('manifest.json',encoding='utf-8')
d = json.load(f)
new_version = float(d['version'])+0.01
d ['version'] = new_version
print "new version: " + str(new_version)

# write to file
w = codecs.open('manifest.json','w', encoding='utf-8')
w.write(json.dumps(d, w, indent=4))
