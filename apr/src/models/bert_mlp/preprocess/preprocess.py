import preprocessor
import re

def preprocess_text(sentence):
    # Remove hyperlinks, hashtags, smileys, emojies
    sentence = preprocessor.clean(sentence)

    # Remove hyperlinks
    sentence = re.sub(r"http\S+", " ", sentence)

    # Remove punctuations and numbers
    # sentence = re.sub('[^a-zA-Z]', ' ', sentence)
    # sentence = re.sub('[^a-zA-Z.?!,]', ' ', sentence)

    # Single character removal (except I)
    # sentence = re.sub(r"\s+[a-zA-HJ-Z]\s+", ' ', sentence)

    # Removing multiple spaces
    sentence = re.sub(r"\s+", " ", sentence)
    sentence = re.sub(r"\|\|\|", " ", sentence)

    return sentence
