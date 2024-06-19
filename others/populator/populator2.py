# A script for populating the database with dummy data

import numpy as np
from db import recommendations, friendships, rates

# -------------------------------------------------------------------------------

OWN_USER = '5995335d-6250-4eee-9067-332af090e55e'
OWN_USER_LAT = -34.5944921
OWN_USER_LONG = -58.4059338

OTHER_USERS_EMAIL = 'mapablaza@itba.edu.ar'

FRIENDSHIP_PERCENTAGE = 0.2

# -------------------------------------------------------------------------------

ids = recommendations.find({"targetUserId": OWN_USER}).distinct("recommendedUserId")

friendships_vecs = []
rating_vecs = []

for i, id in enumerate(ids):
    # Generate own user friendship and rating relationship with this user

    if np.random.random() < FRIENDSHIP_PERCENTAGE:
        friendships_vecs.append({
            "proposer": OWN_USER,
            "target": id,
            "status": "accepted"
        })

        rate = np.random.randint(1, 6)
        rating_vecs.append({
            "rater": OWN_USER,
            "ratee": id,
            "rating": rate
        })

friendships.delete_many({'target': {'$in': ids}})
friendships.insert_many(friendships_vecs)

rates.delete_many({'ratee': {'$in': ids}})
rates.insert_many(rating_vecs)
