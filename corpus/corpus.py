import pandas as pd
import yake
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
#from gensim.models.phrases import Phraser, Phrases
print("reading csv...")
jobs = pd.read_csv("./jobs_devel.csv", names = ["company", "title", "description"])

# get EEO terms, exclude later
print("getting eeo terms...")
with open("EEO.txt") as f:
    eeo = f.read()
    kwx_eeo = yake.KeywordExtractor(n=2, top=300)
    eeo_terms = [ngram[0] for ngram in kwx_eeo.extract_keywords(eeo)]

# get job categories
print("getting job categories...")
titles = " ".join(jobs["title"].to_list())
kwx_categories = yake.KeywordExtractor(n=1, top=20)
categories = kwx_categories.extract_keywords(titles) # tokenize job title column

# get generic words from job descriptions
print("getting job descriptions...")
descriptions = " ".join([word for word in " ".join(jobs["description"].to_list()).split(" ") \
        if word not in eeo_terms])
kwx_common = yake.KeywordExtractor(n=1, top=100)
common = kwx_common.extract_keywords(descriptions)

# get keywords by job category
print("getting keywords by category...")
jobs[jobs["title"].str.contains(cat)]

