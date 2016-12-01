#!/usr/bin/env python3
from __future__ import division
import string
import math
import redis
import json

class Tfidf:
  def __init__(self):
    self.all_transcripts = {}
    self.all_documents = []
    self.tokenized_documents = []
    self.all_tokens_set = set()
    self.idf_values = {}
    self.our_tfidf_comparisons = {}

    # Redis connection configuration
    self.r = redis.StrictRedis(host="localhost", port=6379, db=0, charset="utf-8", decode_responses=True)

  """
  Pipe in all transcripts from redis
  """
  def get_latest_transcripts(self): 
    keys = self.r.keys("video:*") # Get all `video:*` keys
    pipe = self.r.pipeline() # Create pipeline to execute multi-commands

    for key in keys:
      pipe.hgetall(key) # Get all k/v pairs in hash

    all_videos_array = pipe.execute()

    for video in all_videos_array:
      self.all_transcripts[video["hash"]] = ""

      transcript = json.loads(video["transcript"])

      # Convert JSON transcript into string representation
      for word in transcript["Words"]:
        self.all_transcripts[video["hash"]] += " " + word["Token"]

  def tokenize_all_documents(self):
    # Splits a document into words
    tokenize = lambda doc: doc.lower().split(" ")

    # Collect all documents into a list
    for key, value in self.all_transcripts.items():
      self.all_documents.append((key, value))

    self.tokenized_documents = [tokenize(d[1]) for d in self.all_documents]

    # Removes all duplicates
    self.all_tokens_set = set([item for sublist in self.tokenized_documents for item in sublist])

  # Retrieve normalized frequency of words
  def sublinear_term_frequency(self, term, tokenized_document):
    count = tokenized_document.count(term)

    # log(0) returns undefined, so return 0 if word not found in doc
    if count == 0:
      return 0

    # Otherwise, return normalized frequency of word in document
    return 1 + math.log(tokenized_document.count(term))

  def inverse_document_frequencies(self, tokenized_documents):
    idf_values = {}

    # For each token in the unique token set, see if token exists in all other docs
    # The weighted sum of its existence is our IDF score (importance of word) for the token
    for tkn in self.all_tokens_set:
      contains_token = map(lambda doc: tkn in doc, tokenized_documents)
      idf_values[tkn] = 1 + math.log(len(tokenized_documents) / (sum(contains_token)))

    return idf_values

  # Vectorize documents (transform into matrices)
  def tfidf(self, documents):
    tfidf_documents = []
    for document in self.tokenized_documents:
      doc_tfidf = []
      for term in self.idf_values.keys():
        tf = self.sublinear_term_frequency(term, document)
        doc_tfidf.append(tf * self.idf_values[term])
      tfidf_documents.append(doc_tfidf)
    return tfidf_documents

  # Generate cosine similarity between 2 vectors
  def cosine_similarity(self, vector1, vector2):
    dot_product = sum(p*q for p,q in zip(vector1, vector2))
    magnitude = math.sqrt(sum([val**2 for val in vector1])) * math.sqrt(sum([val**2 for val in vector2]))
    if not magnitude:
      return 0
    return dot_product/magnitude

  # Generate similarity ranking of all documents
  def generate_similarity_rankings(self):
    self.get_latest_transcripts()
    self.tokenize_all_documents()
    self.idf_values = self.inverse_document_frequencies(self.tokenized_documents)
    self.tfidf_representation = self.tfidf(self.all_documents)    

    for count_0, doc_0 in enumerate(self.tfidf_representation):
      for count_1, doc_1 in enumerate(self.tfidf_representation):
        if self.our_tfidf_comparisons.get(self.all_documents[count_0][0]) == None:
          self.our_tfidf_comparisons[self.all_documents[count_0][0]] = []
        else: 
          self.our_tfidf_comparisons[self.all_documents[count_0][0]].append((str(self.cosine_similarity(doc_0, doc_1)), self.all_documents[count_1][0]))

    for key in self.our_tfidf_comparisons:
      self.our_tfidf_comparisons[key] = sorted(self.our_tfidf_comparisons[key], key=lambda element: (element[0]), reverse=True)
  
  """
  Pipe all results back to Redis
  ...string({video#hash: score, ...})
  """
  def send_top_rankings(self):
    pipe = self.r.pipeline()

    # For each video, save the 10 closest matches
    for key in self.our_tfidf_comparisons:
      pipe.hset("video:%s" % (key), "similar_videos", json.dumps(self.our_tfidf_comparisons[key][0:10]))

    pipe.execute()

if __name__ == "__main__":
  similar_videos = Tfidf()

  # Save top comparisons into `our_tfidf_comparisons`
  similar_videos.generate_similarity_rankings()

  # Update Redis with the latest rankings
  similar_videos.send_top_rankings()
