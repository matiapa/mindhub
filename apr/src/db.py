import pymongo
import os
from dotenv import load_dotenv

load_dotenv()

_mongo_uri = os.getenv('MONGO_URI')
_db = pymongo.MongoClient(_mongo_uri)['test']

texts_repo = _db['texts']
bigfive_repo = _db['bigfive']
