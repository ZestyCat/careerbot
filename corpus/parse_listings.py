import pandas as pd
import json
from nltk.stem import PorterStemmer
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.tokenize import sent_tokenize
from nltk.probability import FreqDist
import nltk

print("reading csv...")
jobs = pd.DataFrame(pd.read_csv("./data/jobs.csv", names = ["company", "title", "description"]))
jobs["company"] = jobs["company"].str.lower()
jobs["title"] = jobs["title"].str.lower()
jobs["description"] = jobs["description"].str.lower()

# get stopwords
with open("data/eeo_terms.txt") as f:
    eeo = f.read().split(" ")
with open("data/common.txt") as f:
    common = f.read().split(" ")
stops = " ".join(set(stopwords.words("english") + eeo + common))

# Tokenize
company, description = "amazon", "engineer"
selection = jobs[jobs["company"].str.contains(company)] \
        [jobs["description"].str.contains(description)]
tokens = [word for word in word_tokenize(selection["description"].to_string()) \
        if word.isalpha()]

# get eeo-related sentences to discard
sentences = sent_tokenize(" ".join(selection["description"].to_list()))
def filter_sentences(sentences, filter_words, tolerance = .20):
    """  Remove sentences if they have too high ratio of listed terms """
    filtered = []
    for s in sentences:
        tok = word_tokenize(s)
        n = set(t for t in tok).intersection(e for e in eeo)
        ratio = len(n) / len(tok)
        if ratio > tolerance:
            continue
        if ratio < tolerance:
            filtered.append(s)
    return filtered

# tag and filter tokens
tag_filt = [tok for tok in nltk.pos_tag(tokens) if tok[0] not in stops]
key_tags = pd.DataFrame({"word" : [tok[0] for tok in tag_filt],
                   "tag" : [tok[1] for tok in tag_filt]})
key_list = key_tags[key_tags["tag"].str.contains("NN")]["word"].to_list()


porter = PorterStemmer()
trigrams = nltk.trigrams([t for t in tokens if porter.stem(t) not in stops])

fdist_1 = FreqDist(key_list).most_common(50)
fdist_3 = FreqDist(trigrams).most_common(20)

print(fdist_1)
