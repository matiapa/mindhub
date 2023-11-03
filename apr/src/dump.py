import datetime
import pymongo
import os
import json
from dotenv import load_dotenv

def serialize_datetime(obj): 
    if isinstance(obj, datetime.datetime): 
        return obj.isoformat() 
    raise TypeError("Type not serializable") 

load_dotenv()

_mongo_uri = os.getenv('MONGO_URI')
_db = pymongo.MongoClient(_mongo_uri)['test']

def dump():
    texts = list(_db['texts'].find({}))
    file = open('texts.json', 'w')
    file.write(json.dumps(texts, default=serialize_datetime))

def load():
    file = open('texts.json', 'r')
    texts = json.loads(file.read())
    _db['texts'].insert_many(texts)

load()