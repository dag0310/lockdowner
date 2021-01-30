import sys
import os
import urllib.request

if len(sys.argv) < 2:
    print("Country ISO code argument missing, e.g. 'AUT'")
    quit()

country = sys.argv[1].upper()
file_in_name = 'owid-covid-data.csv'
file_out_name = 'owid-covid-data-' + country + '.csv'

urllib.request.urlretrieve("https://covid.ourworldindata.org/data/" + file_in_name, os.path.join(os.path.dirname(__file__), file_in_name))

with open(os.path.join(os.path.dirname(__file__), file_in_name), 'r') as file_in:
    with open(os.path.join(os.path.dirname(__file__), file_out_name), 'w') as file_out:
        is_first_line = True
        for line in file_in:
            if line[0:3] == country or is_first_line:
                if is_first_line:
                    is_first_line = False
                file_out.write(line)
