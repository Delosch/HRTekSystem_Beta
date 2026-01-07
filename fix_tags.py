import os

path = r'c:\Users\jmadh\OneDrive\Desktop\old_hrtek\old_hrtek\app\routes\consulting-report.$id\route.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Remove space after < for section tags
content = re.sub(r'<\s*section', '<section', content)
# Remove space before > for section tags
content = re.sub(r'section([^>]*) >', r'section\1>', content)
# Fix className spacing
content = re.sub(r'className\s*=\s*', 'className=', content)
# Fix closing tags
content = re.sub(r'</\s*section\s*>', '</section>', content)
content = re.sub(r'</\s*div\s*>', '</div>', content)
# Fix comments
content = re.sub(r'\*/\s*}', '*/}', content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Comprehensive fix applied")
