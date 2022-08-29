import pandas as pd
import yake
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer

print("getting stopwords...")
stops = set(stopwords.words("english"))

# get EEO terms, exclude later
print("getting eeo terms...")
with open("./data/EEO.txt") as f:
    eeo = f.read().lower()
    kwx_eeo_term = yake.KeywordExtractor(n=1, top=100)
    kwx_eeo_phrase = yake.KeywordExtractor(n=3, top=100)
    porter = PorterStemmer()
    eeo_terms = [ngram[0] for ngram in kwx_eeo_term.extract_keywords(eeo)]
    eeo_phrases = [ngram[0] for ngram in kwx_eeo_phrase.extract_keywords(eeo)]

with open("eeo_terms.txt", "w") as f:
    f.write(" ".join(eeo_terms + eeo_phrases))