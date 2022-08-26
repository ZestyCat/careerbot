import scrapy
import numpy as np
import w3lib.html
import csv
import re
import json

class BoozSpider(scrapy.Spider):
    name = "boozjobs"

    def start_requests(self, n_jobs = 500):        
        for j in np.arange(0, n_jobs, 10):
            if j == 0:
                continue
            url = 'https://careers.boozallen.com/jobs/search/?jobOffset={}'.format(int(j))
            yield scrapy.Request(url=url, callback=self.get_links)

    def get_links(self, response):
        for link in response.css("a.link::attr(href)").getall():
            yield scrapy.Request(url=link, callback=self.get_page)

    def get_page(self, response):
        job = re.sub(r"[^a-zA-z0-9\s]","",response.css("title::text").get().strip())
        description = re.sub(" +"," ",re.sub(r"[^a-zA-z0-9-\s]","",w3lib.html.remove_tags( \
                response.css("div.article__content--rich-text").get()) \
                .strip()))
        with open ("jobs.csv", "a") as file:
            writer = csv.writer(file, delimiter=",")
            writer.writerow(["Booz Allen Hamilton", job, description])
            print(description)

class NorthropSpider(scrapy.Spider):
    name = "northropjobs"

    def start_requests(self, n_pages = 300):        
        for j in range(1, n_pages):
            url = 'https://www.northropgrumman.com/jobs/page/{}/'.format(int(j))
            yield scrapy.Request(url=url, callback=self.get_links)

    def get_links(self, response):
        used_links = [] # Duplicate links to skip
        for link in response.css("a::attr(href)").getall():
            if "jobs" in link and "page" not in link and link not in used_links:
                print(link)
                used_links.append(link)
                yield scrapy.Request(url=link, callback=self.get_page)

    def get_page(self, response):
        job = re.sub(r"[^a-zA-z0-9\s]","",response.css("title::text").get())
        description = re.sub(" +"," ",re.sub(r"[^a-zA-z0-9\s]","",w3lib.html.remove_tags( \
                response.css("div.jobContent").get().strip().replace("\n", "") )))
        with open("jobs.csv", "a") as file:
            writer = csv.writer(file, delimiter=",")
            writer.writerow(["Northrop Grumman", job, description])
            print(description)

class MontroseScraper(scrapy.Spider):
    name = "montrosejobs"

    with open("./montrose_listings.json") as f:
        jobs = json.loads(f.read())
        urls = [job["externalPath"] for job in jobs["jobPostings"]]

    def start_requests(self, urls = urls):
        base_url = "https://montrose.wd1.myworkdayjobs.com/wday/cxs/montrose/MEG"
        for url in urls:
            yield scrapy.Request(url=base_url+url, callback=self.get_page)

    def get_page(self, response):
        job = re.sub(r"[^a-zA-z0-9\s]","",response.json()["jobPostingInfo"]["title"])
        description = re.sub(r"[^a-zA-z0-9\s]","",w3lib.html.remove_tags( \
                response.json()["jobPostingInfo"]["jobDescription"]))
        with open("jobs.csv", "a") as file:
            writer = csv.writer(file)
            writer.writerow(["Montrose", job, description])
            print(job)