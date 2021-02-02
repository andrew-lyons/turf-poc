import csv
import json
import time
from datetime import datetime

path = 'public/json'

file = F"{path}/mcd_hic_fc_p1.csv"
json_file = F"{path}/mcd_hic_fc_p1.json"

#Read CSV File
#No logic for checking if csv has proper format, limited to csv with headers in first row
#3.3 MB to

def read_CSV(file, json_file):
    csv_rows = []
    with open(file, encoding='mac_roman') as csvfile:
        reader = csv.DictReader(csvfile)
        
        #reduce csv fieldnames to ones needed for geoJSON only
        #replace longform names with short versions
        #remove 'lon' 'lat' and replace with 'lonlat' in geoJSON-ready format
        #3.3MB -> 733kb filesize
        preferred_dict = {
            "Flavor Change Schedule Date": "date",
            "Store Number": "num",
            "Latitude": "lat",
            "Longitude": "lon",
        }
        field = list(preferred_dict.keys())

        #Original idea was to skip cases of #N/A lon/lat, but turf requires all float/int coordinates, and breaks with strings.
        #Because of list comprehension structure I just iterate over twice... much more efficient way out there for sure.
        for row in reader:
            csv_rows.extend([{preferred_dict[field[i]]:row[field[i]] for i in range(len(field))}])
        for row in csv_rows:
            ms = int(datetime.strptime(row['date'], "%m/%d/%Y").timestamp() * 1000)
            try:
                row['lon'] = float(row['lon'])
                row['lat'] = float(row['lat'])
                row['date'] = ms
            except:
                csv_rows.pop(csv_rows.index(row))
        convert_write_json(csv_rows, json_file)

#Convert csv data into json
def convert_write_json(data, json_file):
    with open(json_file, "w") as f:
        #pretty parse
        #f.write(json.dumps(data, sort_keys=False, indent=4, separators=(',', ': ')))

        #one-line parse
        f.write(json.dumps(data))

read_CSV(file,json_file)
print()