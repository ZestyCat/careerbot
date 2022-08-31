from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

# Pull the terms from a text file subtracting stopwords

def get_eeo_terms(textfile):
    print("getting stopwords...")
    stops = set(stopwords.words("english"))

    # get EEO terms, exclude later
    print("getting terms...")
    with open(textfile) as f:
        eeo = f.read().lower()
        tokens = word_tokenize(eeo)
        eeo_terms = [t for t in tokens if t not in stops and t.isalpha()]
        return eeo_terms

if __name__ == "__main__":
    terms = get_eeo_terms("./data/benefits.txt")
    with open("benefit_terms.txt", "w") as f:
            f.write(" ".join(terms))
