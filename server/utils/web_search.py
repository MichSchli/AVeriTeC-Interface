from googleapiclient.discovery import build
import argparse
import json

from urllib.parse import urlparse

parser = argparse.ArgumentParser()
parser.add_argument('--query', default='works?')
parser.add_argument('--page', default=1, type=int)
parser.add_argument('--results_per_page', default=10, type=int)
parser.add_argument('--date', default="30/09/2021")
parser.add_argument('--country_code', default="us")
args = parser.parse_args()

api_key = " AIzaSyAzGwvRt9C8KfdxcNtdXIsEGvI0hYTdo2g"
search_engine_id = "14256c6500607070e"

start_idx = args.page * args.results_per_page

date, month, year = args.date.split("/")
sort_date = year + month + date

misinfo_list_file = "data/misinfo_list.txt"

misinfo_list = []

for line in open(misinfo_list_file, "r"):
    if line.strip():
        misinfo_list.append(line.strip().lower())


def get_domain_name(url):
    if '://' not in url:
        url = 'http://' + url

    domain = urlparse(url).netloc

    if domain.startswith("www."):
        return domain[4:]
    else:
        return domain


def google_search(search_term, api_key, cse_id, **kwargs):
    service = build("customsearch", "v1", developerKey=api_key)
    res = service.cse().list(q=search_term, cx=cse_id, **kwargs).execute()
    return res['items']

try:
    results = google_search(
        args.query,
        api_key,
        search_engine_id,
        num=args.results_per_page,
        start=start_idx,
        sort="date:r:19000101:"+sort_date,
        dateRestrict=None,
        gl=args.country_code.upper()
    )

    out_elems = []
    for result in results:
        out_elems.append({
            "link": result["link"],
            "title": result["title"],
            "snippet": result["snippet"] if "snippet" in result else "",
            "is_misinfo": get_domain_name(result["link"]) in misinfo_list
        })
except:
    out_elems = []

print(json.dumps(out_elems))