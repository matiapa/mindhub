from db import users, recommendations, bigfive
from friendship_affinity import friendship_affinity
from interests_affinity import interest_affinity
from datetime import datetime

FRIENDSHIP_AFFINITY_WEIGHT = 0.7
INTERESTS_AFFINITY_WEIGHT = 0.3

def get_ids(iterable):
    return list(map(lambda o : o['_id'], iterable))

def global_affinity(user, potentials):
    print("Calculating friendship affinities")
    friendship_affinities = friendship_affinity(user, potentials)

    print("Calculating interests affinities")
    interests_affinities = interest_affinity(user, potentials)

    scores = []

    for i, potential in enumerate(potentials):
        global_score = FRIENDSHIP_AFFINITY_WEIGHT * friendship_affinities[i]['score'] + INTERESTS_AFFINITY_WEIGHT * interests_affinities[i]['score']

        scores.append({
            'targetUserId': user,
            'recommendedUserId': potential,
            'score': {
                'global': global_score,
                'friendship': friendship_affinities[i],
                'interests': interests_affinities[i]
            },
        })

    return scores

def generate_recommendations(user):
    # Get the list of already recommended users which where accepted or rejected
    reviewed_ids = recommendations.distinct('recommendedUserId', {'targetUserId': user, 'reviewed': {'$exists': True}})

    # Get the list of users with a personality vector
    with_personality_ids = bigfive.distinct('userId')
    
    # Potentials are all the users which have a personality vector and the user has not reviewed yet
    potentials = users.distinct('_id', {
        "$and": [
            { '_id': {'$nin': reviewed_ids + [user]} },
            { '_id': {'$in': with_personality_ids} },
        ]
    })

    user_recommendations = global_affinity(user, potentials)

    for recommendation in user_recommendations:
        recommendation['generatedAt'] = datetime.now()

    recommendations.delete_many({'targetUserId': user})
    recommendations.insert_many(user_recommendations)

    return user_recommendations
