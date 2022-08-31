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
def get_stops(common = True, files = None):
    words = []
    if files:
        for file in files:
            with open(file) as f:
                words = words + f.read().split(" ")
    if common:
        words = words + stopwords.words("english")
    return " ".join(set(words))

def select_jobs(df, company = "", title = ""):
    selection = df[df["company"].str.contains(company)] \
            [df["title"].str.contains(title)]
    return selection

# Tokenize
def tokenize_jobs(selection):
    tokens = [word for word in word_tokenize(selection["description"].to_string()) \
            if word.isalpha()]
    return tokens

# get eeo-related sentences to discard
def filter_sentences(sentences, stopwords, tolerance = .1):
    """  Remove sentences from text if they have too high ratio of stopwords """
    filtered = []
    if type(stopwords) is str:
        stopwords = stopwords.split(" ")
    for s in sentences:
        tok = word_tokenize(s)
        n = set(t for t in tok).intersection(f for f in stopwords)
        ratio = len(n) / len(tok)
        if ratio >= tolerance:
            continue 
        else:
            filtered.append(s)
    return " ".join(filtered)

if __name__ == "__main__":
    # tag and filter tokens
    ignore = get_stops(common = False, files = ["./data/eeo_terms.txt", "./data/benefit_terms.txt"])
    stops = get_stops(common = True, files = ["./data/eeo_terms.txt", "./data/benefit_terms.txt"])
    selection = select_jobs(jobs, "amazon", "engineer")
    porter = PorterStemmer()

    sentences = filter_sentences(sent_tokenize(" ".join(selection["description"].to_list())), ignore)
    tokens = word_tokenize(sentences)

    tag_filt = [tok for tok in nltk.pos_tag(tokens) if porter.stem(tok[0]) not in stops]
    key_tags = pd.DataFrame({"word" : [tok[0] for tok in tag_filt],
                       "tag" : [tok[1] for tok in tag_filt]})
    key_list = key_tags[key_tags["tag"].str.contains("NN")]["word"].to_list()


    ignore_stems = [porter.stem(w) for w in ignore.split(" ")]
    trigrams = nltk.trigrams([s for s in sentences.split(" ") if porter.stem(s) not in ignore_stems])

    fdist_1 = FreqDist(key_list).most_common(100)
    fdist_3 = FreqDist(trigrams).most_common(20)

    print(fdist_1)
