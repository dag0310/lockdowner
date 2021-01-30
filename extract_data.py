import os
import csv
import json
import urllib.request

location = 'Österreich'
user_agent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.47 Safari/537.36'
csv_url = "https://covid19-dashboard.ages.at/data/CovidFaelle_Timeline.csv"

print('Downloading ' + csv_url)
req = urllib.request.Request(csv_url, data=None, headers={'User-Agent': user_agent})
csv_text = str(urllib.request.urlopen(req).read().decode('utf-8'))

entries = []
csv_reader = csv.reader(csv_text.split('\n'), delimiter=';')
next(csv_reader)  # skip header row
for row in csv_reader:
    if row[1].lower() != location.lower():
        continue
    ddmmyyyy = row[0].split(' ')[0].split('.')
    entries.append({
        'date': ddmmyyyy[2] + '-' + ddmmyyyy[1] + '-' + ddmmyyyy[0],
        'sevenDayIncidency': float(row[7].replace(',', '.'))
    })

with open(os.path.join(os.path.dirname(__file__), 'covid-austria.json'), 'w') as file_out:
    file_out.write(json.dumps(entries, indent=2))
