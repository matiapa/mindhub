import numpy as np
from db import interests, preferences

INTEREST_AFFINITY_GROWTH_RATE = 1

INTEREST_SCORE_BY_RELEVANCE = {
    'normal': 1,
    'favorite': 2,
}

CATEGORY_RELEVANCE_WEIGHTS = {
    'low': 0.5,
    'normal': 1,
    'high': 2,
}


# It will grow slower until reaching a limit value of 1
def neg_exp_decay(x, k):
    return 1 - np.exp(-x * k)


def interest_affinity(user, potentials):
    affinities = []

    user_prefs = preferences.find_one({'_id': user})
    if user_prefs != None and 'interestTypeRelevances' in user_prefs:
        user_type_relevances = user_prefs['interestTypeRelevances']
    else:
        user_type_relevances = {'artist': 'normal', 'track': 'normal'}

    for potential in potentials:
        # Get the common interests between user and potential

        shared_interests = interests.aggregate([
            { '$match': { 'userId': { '$in': [user, potential] } } },
            { '$group': {
                '_id': '$resource.id',
                'resource': { '$first': '$resource' },
                'relevances': { '$push': { 'userId': '$userId', 'relevance': '$relevance' } },
                'count': { '$count': {} }
            } },
            { '$match': { 'count': { '$gte': 2 } } },
        ])
        
        # Add up the amount of common interests per resource type
        # considering the interest relevance for user and potential

        category_affinities = {
            'artist': 0,
            'track': 0,
        }

        for shared_interest in shared_interests:
            relevance_a = shared_interest['relevances'][0]['relevance']
            relevance_b = shared_interest['relevances'][1]['relevance']

            score_a = INTEREST_SCORE_BY_RELEVANCE[relevance_a]
            score_b = INTEREST_SCORE_BY_RELEVANCE[relevance_b]

            common_score = (score_a + score_b) / 2
            category_affinities[shared_interest['resource']['type']] += \
                neg_exp_decay(common_score, INTEREST_AFFINITY_GROWTH_RATE)

        # Add up the resource type scores into a global score
        # considering the resource type relevance of the user

        ponderated_weight = CATEGORY_RELEVANCE_WEIGHTS[user_type_relevances['artist']] * category_affinities['artist']
        ponderated_weight += CATEGORY_RELEVANCE_WEIGHTS[user_type_relevances['track']] * category_affinities['track']
        affinity_score = ponderated_weight / (2 * CATEGORY_RELEVANCE_WEIGHTS['high'])

        affinities.append({
            'category': category_affinities,
            'score': affinity_score,
        })

    return affinities
