import pymongo
import os

_mongo_uri = os.getenv('MONGO_URI')
_db_name = os.getenv('MONGO_DB')
_db = pymongo.MongoClient(_mongo_uri)[_db_name]

users = _db['users']
messages = _db['messages']
personalities = _db['bigfive']
friendships = _db['friendships']
notifications = _db['notifications']