import pymongo
import os
from dotenv import load_dotenv

load_dotenv()

_mongo_uri = os.getenv('MONGO_URI')
_db = pymongo.MongoClient(_mongo_uri)['test']

users = _db['users']
interests = _db['interests']
bigfive = _db['bigfive']
recommendations = _db['recommendations']
friendships = _db['friendships']
rates = _db['rates']
