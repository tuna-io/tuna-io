from __future__ import division
import string
import math

# Splits a document into words
tokenize = lambda doc: doc.lower().split(" ")

document_0 = "China has a strong economy that is growing at a rapid pace. However politically it differs greatly from the US Economy."
document_1 = "At last, China seems serious about confronting an endemic problem: domestic violence and corruption."
document_2 = "Japan's prime minister, Shinzo Abe, is working towards healing the economic turmoil in his own country for his view on the future of his people."
document_3 = "Vladimir Putin is working hard to fix the economy in Russia as the Ruble has tumbled."
document_4 = "What's the future of Abenomics? We asked Shinzo Abe for his views"
document_5 = "Obama has eased sanctions on Cuba while accelerating those against the Russian Economy, even as the Ruble's value falls almost daily."
document_6 = "Vladimir Putin was found to be riding a horse, again, without a shirt on while hunting deer. Vladimir Putin always seems so serious about things - even riding horses."

# Collect all documents into a list
all_documents = [document_0, document_1, document_2, document_3, document_4, document_5, document_6]

tokenized_documents = [tokenize(d) for d in all_documents] # tokenized docs

# Removes all duplicates
all_tokens_set = set([item for sublist in tokenized_documents for item in sublist])

# Retrieve normalized frequency of words
def sublinear_term_frequency(term, tokenized_document):
  return 1 + math.log(tokenized_document.count(term))

def inverse_document_frequencies(tokenized_documents):
  idf_values = {}
  # For each token in the unique token set, see if token exists in all other docs
  # The weighted sum of its existence is our IDF score (importance of word) for the token
  for tkn in all_tokens_set:
    contains_token = map(lambda doc: tkn in doc, tokenized_documents)
    idf_values[tkn] = 1 + math.log(len(tokenized_documents)/(sum(contains_token)))
  return idf_values

idf_values = inverse_document_frequencies(tokenized_documents)
