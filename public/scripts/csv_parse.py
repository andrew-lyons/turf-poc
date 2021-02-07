import csv
import json
import time
from datetime import datetime

path = '../json'

file = F"{path}/mcd_hic_fc_p1.csv"
json_file = F"{path}/mcd_hic_fc_p1.json"

#Read CSV File
#No logic for checking if csv has proper format, limited to csv with headers in first row

def read_CSV(file, json_file):
    csv_rows = []
    csv_rows_formatted = []
    with open(file, encoding='mac_roman') as csvfile:
        reader = csv.DictReader(csvfile)
        preferred_dict = {
            "Flavor Change Schedule Date": "date",
            "Store Number": "num",
            "Street Address": "a",
            "City": "c",
            "State": "s",
            "Zip": "z",
            "Latitude": "lat",
            "Longitude": "lon",
        }
        field = list(preferred_dict.keys())

        #Make csv_rows in [ {}, {} ... ] format
        #Append to csv_rows_formatted with proper formatting
        for row in reader:
            csv_rows.extend([{preferred_dict[field[i]]:row[field[i]] for i in range(len(field))}])
        for row in csv_rows:
            if row['lat'] != "#N/A":
                ms = int(datetime.strptime(row['date'], "%m/%d/%Y").timestamp() * 1000)
                row['date'] = ms
                row['lat'] = float(row['lat'])
                row['lon'] = float(row['lon'])
                csv_rows_formatted.append(row)
            else:
                print(row)
        convert_write_json(csv_rows_formatted, json_file)

#Convert csv data into json
def convert_write_json(data, json_file):
    with open(json_file, "w") as f:
        #pretty parse
        #f.write(json.dumps(data, sort_keys=False, indent=4, separators=(',', ': ')))

        #one-line parse
        f.write(json.dumps(data))

read_CSV(file,json_file)