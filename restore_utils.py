import subprocess
import os

base = r'D:\QLPK-WEB\frontend\src\utils'
os.makedirs(base, exist_ok=True)

files_to_restore = ['jwtUtils.js', 'searchUtils.js', 'vitalsValidation.js']

for fname in files_to_restore:
    git_path = f'frontend/src/utils/{fname}'
    result = subprocess.run(
        ['git', 'show', f'HEAD:{git_path}'],
        capture_output=True, cwd=r'D:\QLPK-WEB'
    )
    if result.returncode == 0:
        filepath = os.path.join(base, fname)
        with open(filepath, 'wb') as f:
            f.write(result.stdout)
        print(f'Restored: {fname} ({len(result.stdout)} bytes)')
    else:
        stderr = result.stderr.decode('utf-8', errors='replace')
        print(f'Failed to restore {fname}: {stderr[:300]}')

print(f'Files in utils dir: {sorted(os.listdir(base))}')
