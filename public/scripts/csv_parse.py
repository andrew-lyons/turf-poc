import csv
import json

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
        #3.3MB -> 750kb filesize
        preferred_fieldnames = ["HDQ Owner-Operator Name", "Latitude", "Longitude", "Street Address"]
        preffered_fieldnames_with_simple = {
            "HDQ Owner-Operator Name": "name",
            "Latitude": "lat",
            "Longitude": "lon",
            "Street Address": "address"
        }
        field = preferred_fieldnames

        #Could be more condensed. But doesn't need to be fancy yes? :)
        for row in reader:
            csv_rows.extend([{preffered_fieldnames_with_simple[field[i]]:row[field[i]] for i in range(len(field))}])
        for row in csv_rows:
            if row['lon'] != "#N/A":
                row['lonlat'] = [float(row['lon']), float(row['lat'])]
                row.pop('lat')
                row.pop('lon')
            else:
                row['lonlat'] = [10, 10]
                row.pop('lat')
                row.pop('lon')
        convert_write_json(csv_rows, json_file)

#Convert csv data into json
def convert_write_json(data, json_file):
    with open(json_file, "w") as f:
        #pretty parse
        #f.write(json.dumps(data, sort_keys=False, indent=4, separators=(',', ': ')))

        #one-line parse
        f.write(json.dumps(data))


read_CSV(file,json_file)