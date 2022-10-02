import pandas as pd
import re
import json
from nltk.stem import PorterStemmer
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.tokenize import sent_tokenize
from nltk.probability import FreqDist
import nltk

# remove apostrophes from word list
def remove_apostrophes(words):
    no_aps = []
    for w in words:
        if "'" in w:
            no_aps.append(re.sub(r"'", "", w))
    return no_aps

# turn list of tags into lookahead regex 
def make_search(tags):
    regex = r""
    for tag in tags:
        regex = regex + f"(?=.*{tag.lower()})"
    return re.compile(regex)

# get stopwords from nltk and from other files
def get_stops(common = True, files = list()):
    words = []
    if files:
        for file in files:
            with open(file) as f:
                words = words + f.read().split(" ")
    if common:
        words = words + stopwords.words("english")
    words = words + remove_apostrophes(words)
    return " ".join(set(words))

def select_jobs(df, company = "", title = ""):
    selection = df[df["company"].str.contains(company, flags=re.IGNORECASE)] \
            [df["title"].str.lower().str.contains(title)]
    return selection

# Tokenize
def tokenize_jobs(selection):
    tokens = [word for word in word_tokenize(selection["description"].to_string()) \
            if word.isalpha()]
    return tokens

# get eeo-related sentences to discard
def filter_sentences(sentences, stopwords, tolerance = .15):
    """  Remove sentences from text if they have too high ratio of stopwords """
    filtered = []
    if type(stopwords) is str:
        stopwords = stopwords.split(" ")
    for s in sentences:
        tok = word_tokenize(s)
        n = set(t.lower() for t in tok).intersection(f.lower() for f in stopwords)
        ratio = len(n) / len(tok)
        if ratio >= tolerance:
            continue 
        else:
            filtered.append(s)
    return " ".join(filtered)

if __name__ == "__main__":
    print("reading csv...")
    jobs = pd.DataFrame(pd.read_csv("./data/jobs.csv", names = ["company", "title", "description"]))

    # filter fluff (eeo, benefits, etc) and stopwords
    print("getting stopwords...")
    fluff = get_stops(common = False, files = ["./data/eeo_terms.txt", "./data/benefit_terms.txt"])
    stops = get_stops(common = True, files = ["./data/eeo_terms.txt", "./data/benefit_terms.txt"])
    
    print("searching for jobs with specified titles...")
    titles = make_search([""]) # make lookahead regex to search title with
    selection = select_jobs(jobs, company="ATAC", title=titles)
    
    print("filtering sentences with too many stopwords...")
    sentences = filter_sentences(sent_tokenize(" ".join(selection["description"].to_list())), fluff)

    print("tokenizing sentences...")
    tokens = word_tokenize(sentences)

    print("removing stopwords from tokens...")
    tag_filt = [tok for tok in nltk.pos_tag(tokens) if tok[0].lower() not in stops]

    print("extracting key skills...")
    key_tags = pd.DataFrame({"word" : [tok[0] for tok in tag_filt],
                       "tag" : [tok[1] for tok in tag_filt]})
    key_list = key_tags[key_tags["tag"].str.contains("NN")]["word"].to_list()

    print("extracting key phrases...")
    porter = PorterStemmer()
    ignore_stems = [porter.stem(w) for w in fluff.split(" ")]
    trigrams = nltk.trigrams([s for s in sentences.split(" ") if porter.stem(s) not in ignore_stems])

    fdist_1 = FreqDist(key_list).most_common(100)
    fdist_3 = FreqDist(trigrams).most_common(20)
