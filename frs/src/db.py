import pymongo
import os
from dotenv import load_dotenv

load_dotenv()

_mongo_uri = os.getenv('MONGO_URI')
_db_name = os.getenv('MONGO_DB')
_db = pymongo.MongoClient(_mongo_uri)[_db_name]

ratings = _db['ratings']
bigfive = _db['bigfive']
users = _db['users']
interests = _db['interests']
preferences = _db['preferences']
recommendations = _db['recommendations']
