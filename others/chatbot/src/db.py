import pymongo
import os
from dotenv import load_dotenv

load_dotenv()

_mongo_uri = os.getenv('MONGO_URI')
_db = pymongo.MongoClient(_mongo_uri)['test']

users = _db['users']
messages = _db['messages']
personalities = _db['bigfive']
