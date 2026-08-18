import urllib.request, json, urllib.error

BASE = 'http://localhost:8000'

def test(label, ok):
    status = "PASS" if ok else "FAIL"
    print(f"  [{status}] {label}")
    return ok

all_passed = True

# 1. Health
try:
    r = urllib.request.urlopen(BASE + '/health')
    data = json.loads(r.read())
    all_passed &= test("Health endpoint", data.get('status') == 'ok')
except Exception as e:
    all_passed &= test("Health endpoint", False)

# 2. Login
try:
    payload = json.dumps({'email':'demo@resumeai.com','password':'demo123'}).encode()
    req = urllib.request.Request(BASE+'/api/auth/login', data=payload, headers={'Content-Type':'application/json'}, method='POST')
    r = urllib.request.urlopen(req)
    resp = json.loads(r.read())
    token = resp['access_token']
    headers = {'Authorization': 'Bearer ' + token}
    all_passed &= test("Login (demo user)", bool(token))
except Exception as e:
    all_passed &= test("Login (demo user)", False)
    print("    Error:", e)
    token, headers = None, {}

# 3. Jobs API
try:
    r = urllib.request.urlopen(BASE + '/api/jobs')
    jobs = json.loads(r.read())
    all_passed &= test(f"Jobs API ({len(jobs)} jobs)", len(jobs) == 7)
except Exception as e:
    all_passed &= test("Jobs API", False)

# 4. Resumes API (authenticated)
try:
    req = urllib.request.Request(BASE+'/api/resumes', headers=headers)
    r = urllib.request.urlopen(req)
    resumes = json.loads(r.read())
    all_passed &= test("Resumes API (authenticated)", isinstance(resumes, list))
except Exception as e:
    all_passed &= test("Resumes API", False)

# 5. Recommendations (no resume = 400)
try:
    req = urllib.request.Request(BASE+'/api/recommendations', headers=headers)
    r = urllib.request.urlopen(req)
    all_passed &= test("Recommendations API", True)
except urllib.error.HTTPError as e:
    all_passed &= test("Recommendations API (no resume -> 400)", e.code == 400)

# 6. Match history
try:
    req = urllib.request.Request(BASE+'/api/matching/history', headers=headers)
    r = urllib.request.urlopen(req)
    matches = json.loads(r.read())
    all_passed &= test("Match history API", isinstance(matches, list))
except Exception as e:
    all_passed &= test("Match history API", False)

# 7. Admin login
try:
    payload = json.dumps({'email':'admin@resumeai.com','password':'admin123'}).encode()
    req = urllib.request.Request(BASE+'/api/auth/login', data=payload, headers={'Content-Type':'application/json'}, method='POST')
    r = urllib.request.urlopen(req)
    admin_token = json.loads(r.read())['access_token']
    admin_headers = {'Authorization': 'Bearer ' + admin_token}
    all_passed &= test("Admin login", bool(admin_token))
except Exception as e:
    all_passed &= test("Admin login", False)
    admin_headers = {}

# 8. Admin analytics
try:
    req = urllib.request.Request(BASE+'/api/admin/analytics', headers=admin_headers)
    r = urllib.request.urlopen(req)
    analytics = json.loads(r.read())
    all_passed &= test("Admin analytics API", 'total_users' in analytics)
except Exception as e:
    all_passed &= test("Admin analytics API", False)

print()
if all_passed:
    print("ALL TESTS PASSED!")
else:
    print("SOME TESTS FAILED - check errors above")
