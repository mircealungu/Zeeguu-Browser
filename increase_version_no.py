import codecs
import json

increment = 0.001

f = codecs.open('manifest.json',encoding='utf-8')
d = json.load(f)

new_version_string = str(round (float(d['version'])+increment, 3))

if len(new_version_string) == 4:
	new_version_string += '0'

d ['version'] = new_version_string
print "New version: " + new_version_string

# write to file
w = codecs.open('manifest.json','w', encoding='utf-8')
w.write(json.dumps(d, w, indent=4))
