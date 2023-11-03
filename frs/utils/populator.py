# A script for populating the database with dummy data

import numpy as np
import json
from db import users, bigfive, ratings, interests

ids_file = open('utils/ids.json', 'r')
resources_file = open('utils/resources.json', 'r')

ids = json.loads(ids_file.read())
resources = json.loads(resources_file.read())

OWN_USER = '5995335d-6250-4eee-9067-332af090e55e'

users_vecs = []
pers_vecs = []
interests_vecs = []
rating_vecs = []

for id in ids:
    users_vecs.append({
        "_id": id,
        "email": f'{id}@test.com',
    })

    pers_vec = np.random.rand(5)
    pers_vecs.append({
        "_id": id,
        "o": pers_vec[0],
        "c": pers_vec[1],
        "e": pers_vec[2],
        "a": pers_vec[3],
        "n": pers_vec[4],
    })

    resorces_smp = np.random.choice(resources, 10)
    for resource in resorces_smp:
        interests_vecs.append({
            "userId": id,
            "provider": resource['provider'],
            "relevance": "normal",
            "resource": resource['resource'],
        })

    if np.random.random() > 0.8:
        rate = np.random.random()
        rating_vecs.append({
            "rater": OWN_USER,
            "ratee": id,
            "rate": rate
        })

print(len(rating_vecs))

users.insert_many(users_vecs)    
bigfive.insert_many(pers_vecs)
ratings.insert_many(rating_vecs)
interests.insert_many(interests_vecs)
