import pandas as pd
import json
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.probability import FreqDist
import nltk

print("reading csv...")
jobs = pd.DataFrame(pd.read_csv("./data/jobs.csv", names = ["company", "title", "description"]))
jobs["company"] = jobs["company"].str.lower()
jobs["title"] = jobs["title"].str.lower()
jobs["description"] = jobs["description"].str.lower()

# Tokenize
tokens = [word for word in word_tokenize(jobs[jobs["company"].str.contains("amazon")]["description"].to_string()) \
        if word.isalpha()]

# get list of eeo terms
with open("data/eeo_terms.txt") as f:
    eeo = f.read().split(" ")

# get stopwords 
stops = set(stopwords.words("english") + eeo)

# tag and filter tokens
tag_filt = [tok for tok in nltk.pos_tag(tokens) if tok[0] not in stops]

key_tags = pd.DataFrame({"word" : [tok[0] for tok in tag_filt],
                   "tag" : [tok[1] for tok in tag_filt]})

key_list = key_tags[key_tags["tag"].str.contains("NN")]["word"].to_list()

trigrams = nltk.trigrams(tokens)

fdist_1 = FreqDist(key_list).most_common(100)

fdist_3 = FreqDist(trigrams).most_common(20)

print(fdist_1)
