from db import ratings, users, recommendations
from friendship_affinity import friendship_affinity
from interests_affinity import interest_affinity

def get_ids(iterable):
    return list(map(lambda o : o['_id'], iterable))

def recommendation_scores(user, potentials):

    friendship_affinities = friendship_affinity(user, potentials)

    interests_affinities = interest_affinity(user, potentials)

    scores = []

    for i, potential in enumerate(potentials):
        global_score = 0.7 * friendship_affinities[i]['score'] + 0.3 * interests_affinities[i]['score']

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

def calculate_recommendations(user):
    ratees = ratings.distinct('ratee', {'rater': user})
    potentials = users.distinct('_id', {'_id': {'$not': {'$in': ratees}}})

    user_recommendations = recommendation_scores(user, potentials)

    recommendations.delete_many({'targetUserId': user})
    recommendations.insert_many(user_recommendations)

    return user_recommendations
