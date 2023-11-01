import json
import sys

json_out = []
for line in open("data/fullfact_data.txt", "r"):
    line = line.strip()
    json_out.append(
        {
            "fact_checking_article": line
        }
    )

json.dump(json_out, indent=4, fp=sys.stdout)