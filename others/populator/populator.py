# A script for populating the database with dummy data

import numpy as np
import json
import requests
from datetime import datetime, timedelta
from db import users, bigfive, interests
from utils import generate_random_location

# -------------------------------------------------------------------------------

OWN_USER = '5995335d-6250-4eee-9067-332af090e55e'
OWN_USER_LAT = -34.5944921
OWN_USER_LONG = -58.4059338

OTHER_USERS_EMAIL = 'mapablaza@itba.edu.ar'

FRIENDSHIP_PERCENTAGE = 0.2

# -------------------------------------------------------------------------------

ids_file = open('ids.json', 'r')
resources_file = open('resources.json', 'r')
biographies_file = open('biographies.json', 'r')

ids = json.loads(ids_file.read())
resources = json.loads(resources_file.read())
biographies = json.loads(biographies_file.read())

users_vecs = []
pers_vecs = []
interests_vecs = []
friendships_vecs = []
rating_vecs = []

fake_users = requests.get('https://randomuser.me/api/?results=101&seed=1').json()['results']

for i, id in enumerate(ids):

    # Generate a random date between 0 and 24 hours ago from today
    last_connection_date = datetime.now() - timedelta(hours = np.random.randint(0, 24))

    # Generate a random location within a 10km radius from the user's location
    last_connection_location = generate_random_location(OWN_USER_LAT, OWN_USER_LONG, 10)

    # Download the user picture and save it to a file
    # picture = requests.get(fake_users[i]['picture']['large']).content
    # with open(f'./pictures/{id}', 'wb') as f:
    #     f.write(picture)

    users_vecs.append({
        "_id": id,
        "email": OTHER_USERS_EMAIL,
        "profile": {
            "name": fake_users[i]['name']['first'],
            "gender": 'man' if fake_users[i]['gender'] == 'male' else 'woman',
            "biography": biographies[i],
            "birthday": fake_users[i]['dob']['date'],
        },
        "lastConnection": {
            "location": {
                "type": "Point",
                "coordinates": [
                    last_connection_location[1],
                    last_connection_location[0]
                ]
            },
            "date": last_connection_date,
        },
        "isFake": True,
    })

    # Generate user's personality

    pers_vec = np.random.rand(5)
    pers_vecs.append({
        "userId": id,
        "o": pers_vec[0],
        "c": pers_vec[1],
        "e": pers_vec[2],
        "a": pers_vec[3],
        "n": pers_vec[4],
    })

    # Generate user's interests

    resources_smp = np.random.choice(resources, 10, replace=False)
    for resource in resources_smp:
        interests_vecs.append({
            "userId": id,
            "provider": resource['provider'],
            "relevance": "normal",
            "resource": resource['resource'],
        })

# users.delete_many({'_id': {'$in': ids}})
# users.insert_many(users_vecs) 

# interests.delete_many({'userId': {'$in': ids}})
# interests.insert_many(interests_vecs)

# bigfive.delete_many({'_id': {'$in': ids}})
# bigfive.insert_many(pers_vecs)
