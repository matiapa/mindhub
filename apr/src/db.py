import pymongo
import os
from dotenv import load_dotenv

load_dotenv()

_mongo_uri = os.getenv('MONGO_URI')
_db_name = os.getenv('MONGO_DB')
_db = pymongo.MongoClient(_mongo_uri)[_db_name]

texts_repo = _db['texts']
bigfive_repo = _db['bigfive']
