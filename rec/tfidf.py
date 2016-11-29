from __future__ import division
import string
import math

# Splits a document into words
tokenize = lambda doc: doc.lower().split(" ")

# Currently hardcoded, change to read from redis pipe
document_0 = "China has a strong economy that is growing at a rapid pace. However politically it differs greatly from the US Economy."
document_1 = "At last, China seems serious about confronting an endemic problem: domestic violence and corruption."
document_2 = "Japan's prime minister, Shinzo Abe, is working towards healing the economic turmoil in his own country for his view on the future of his people."
document_3 = "Vladimir Putin is working hard to fix the economy in Russia as the Ruble has tumbled."
document_4 = "What's the future of Abenomics? We asked Shinzo Abe for his views"
document_5 = "Obama has eased sanctions on Cuba while accelerating those against the Russian Economy, even as the Ruble's value falls almost daily."
document_6 = "Vladimir Putin was found to be riding a horse, again, without a shirt on while hunting deer. Vladimir Putin always seems so serious about things - even riding horses."

# Collect all documents into a list
all_documents = [document_0, document_1, document_2, document_3, document_4, document_5, document_6]

tokenized_documents = [tokenize(d) for d in all_documents]

# Removes all duplicates
all_tokens_set = set([item for sublist in tokenized_documents for item in sublist])

# Retrieve normalized frequency of words
def sublinear_term_frequency(term, tokenized_document):
  count = tokenized_document.count(term)

  # log(0) returns undefined, so return 0 if word not found in doc
  if count == 0:
    return 0

  # Otherwise, return normalized frequency of word in document
  return 1 + math.log(tokenized_document.count(term))

def inverse_document_frequencies(tokenized_documents):
  idf_values = {}

  # For each token in the unique token set, see if token exists in all other docs
  # The weighted sum of its existence is our IDF score (importance of word) for the token
  for tkn in all_tokens_set:
    contains_token = map(lambda doc: tkn in doc, tokenized_documents)
    idf_values[tkn] = 1 + math.log(len(tokenized_documents) / (sum(contains_token)))

  return idf_values

# Generate idf values for all documents
idf_values = inverse_document_frequencies(tokenized_documents)

# Vectorize documents (transform into matrices)
def tfidf(documents):
  tfidf_documents = []
  for document in tokenized_documents:
    doc_tfidf = []
    for term in idf_values.keys():
      tf = sublinear_term_frequency(term, document)
      doc_tfidf.append(tf * idf_values[term])
    tfidf_documents.append(doc_tfidf)
  return tfidf_documents

# Generate tf-idf representation for all documents
tfidf_representation = tfidf(all_documents)

# Generate cosine similarity between 2 vectors
def cosine_similarity(vector1, vector2):
  dot_product = sum(p*q for p,q in zip(vector1, vector2))
  magnitude = math.sqrt(sum([val**2 for val in vector1])) * math.sqrt(sum([val**2 for val in vector2]))
  if not magnitude:
    return 0
  return dot_product/magnitude

# Generate similarity ranking of all documents
our_tfidf_comparisons = []

for count_0, doc_0 in enumerate(tfidf_representation):
  for count_1, doc_1 in enumerate(tfidf_representation):
    our_tfidf_comparisons.append((cosine_similarity(doc_0, doc_1), count_0, count_1))

