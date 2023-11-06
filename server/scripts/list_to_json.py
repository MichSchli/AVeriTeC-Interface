import json
import sys
import numpy as np
import argparse
import json
import tqdm
import sys
from urllib.parse import urlparse
import waybackpy
import time
from datetime import datetime, timedelta
import validators

convert_to_wayback = True

def should_skip(url):
    if url is None or url == "Metadata":
        return True

    if not validators.url(url):
        print("Skipped invalid url: \""+url+"\"", file=sys.stderr)
        return True

    archive_sites = [
        "archive.org",
        "web.archive.org",
        "archive.is",
        "archive.fo",
        "perma.cc",
        "archive.md",
        "archive.ph",
        "archive.vn",
        "archive.today",
        "web-archive-org.translate.goog"
    ]

    blocked_sites = [
        "linkedin.com",
        ]

    domain = urlparse(url).netloc

    if domain.startswith("www."):
        domain = domain[4:]

    return domain in archive_sites or domain in blocked_sites

def do_archive(url):
    user_agent = "Averitec dataset builder // contact: mss84@cam.ac.uk"

    wayback = waybackpy.Url(url, user_agent)

    # Test if the domain is blocked
    try:
        n_archived = wayback.total_archives()
    except:
        return url

    # Take either newest archive, or save an archive if none exists:
    if n_archived > 0:
        try:
            archive = wayback.newest()
            print("I found an existing saved archival page for " + url + "! Checking the timestamp...", file=sys.stderr)

            time_between_archival = datetime.now() - archive.timestamp
            if time_between_archival < timedelta(days=90):
                print("Page is less than three months old. Keeping it!")
            else:
                print("Page is too old. Rebuilding...")
                for i in range(5):
                    try:
                        archive = wayback.save()
                        break
                    except:
                        print(
                            "I couldn't reach the archive to build a page for " + url + ". Trying again in 3 seconds.",
                            file=sys.stderr)
                        time.sleep(3)
                        archive = None
        except:
            print("I failed to retrieve a saved archival page for " + url + ". Building a new page.", file=sys.stderr)

            for i in range(5):
                try:
                    archive = wayback.save()
                    break
                except:
                    print("I couldn't reach the archive to build a page for " + url + ". Trying again in 3 seconds.",
                          file=sys.stderr)
                    time.sleep(3)
                    archive = None
    else:
        print("I found no saved page for " + url + ". Building a new page.", file=sys.stderr)
        for i in range(5):
            try:
                archive = wayback.save()
                break
            except:
                print("I couldn't reach the archive to build a page for " + url + ". Trying again in 3 seconds.",
                      file=sys.stderr)
                time.sleep(3)
                archive = None

    if archive is not None:
        return archive.archive_url
    else:
        return None

json_out = []
for line in tqdm.tqdm(open("data/fullfact_data.txt", "r")):
    line = line.strip()
    json_out.append(
        {
            "fact_checking_article": line if not convert_to_wayback else do_archive(line),
        }
    )

json.dump(json_out, indent=4, fp=sys.stdout)