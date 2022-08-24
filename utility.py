import yake
import wikipedia
from nltk.corpus import stopwords

def extract(text, ngram = 3, dup = 0.3, max_kw = 10):
    kw_extractor = yake.KeywordExtractor(dedupLim=dup, n=ngram, top = max_kw)
    keywords = kw_extractor.extract_keywords(text)
    return keywords
