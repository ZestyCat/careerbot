from scrapingbee import ScrapingBeeClient
from urllib.parse import urljoin
from bs4 import BeautifulSoup
import re
import pandas as pd


api_key = "5GCDSFBMAEZYROB3GRM4ZW2M8R4M90ET20SPXEQDFAS0UOCRHLN2B223FFXZGLJ17F3Q3U9GLEIALEWN"
client = ScrapingBeeClient(api_key)


#r = client.get(base_url.format("USA", "0"), params = {"render_js": "False"})

#soup = BeautifulSoup(r.text, features="lxml")

#job_cards = soup.find_all("table", {"class": "jobCard_mainContent"})
#job_links = [c.find("a", {"class": "jcs-JobTitle"}).attrs["href"] for c in job_cards]

listings = {"title" : [],
            "company": [],
            "description": [],
            "qualifications": [],
            "location": [],
            "salary": [],
            "salary_units": [],
            "benefits": [],
            "schedule": [],
            "employment": []}


def get_listing_urls(client, base_url = "https://www.indeed.com/jobs?q={}&l={}&start={}", 
                     query="", location="USA", start=0, attempts=3, logfile="./log.txt"):
    url = base_url.format(query, location, str(start))
    r = client.get(url, params={
        "render_js": "False",
        "extract_rules": {
            "hrefs": {
                "selector": "a.jcs-JobTitle",
                "type": "list",
                "output": "@href"
            }
        }
    })
    urls = [urljoin("https://www.indeed.com", href) for href in r.json()["hrefs"]]
    return urls

@get_until_got(n_tries=3, logfile="./log.txt")
def get_listing_data(client, url, attempts=3):
    for i in range(0, attempts):
        r = client.get(url, params={
            "render_js": "False",
            "extract_rules": {
                "title": "h1",
                "company": "div.icl-u-lg-mr--sm",
                "description": "#jobDescriptionText"
            }
        })
        return r
