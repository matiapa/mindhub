import numpy as np
from db import interests, preferences

INTEREST_AFFINITY_GROWTH_RATE = 0.046

INTEREST_RELEVANCE_WEIGHTS = {
    'normal': 1,
    'favorite': 2,
}

RESOURCE_TYPE_RELEVANCE_WEIGHTS = {
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

            score_a = INTEREST_RELEVANCE_WEIGHTS[relevance_a]
            score_b = INTEREST_RELEVANCE_WEIGHTS[relevance_b]
            common_score = (score_a + score_b) / 2

            resource_type = shared_interest['resource']['type']
            category_affinities[resource_type] += common_score
        
        category_affinities['artist'] = neg_exp_decay(category_affinities['artist'], INTEREST_AFFINITY_GROWTH_RATE)
        category_affinities['track'] = neg_exp_decay(category_affinities['track'], INTEREST_AFFINITY_GROWTH_RATE)

        # Add up the resource type scores into a global score
        # considering the resource type relevance of the user

        affinity_score = \
            RESOURCE_TYPE_RELEVANCE_WEIGHTS[user_type_relevances['artist']] * category_affinities['artist'] \
            + RESOURCE_TYPE_RELEVANCE_WEIGHTS[user_type_relevances['track']] * category_affinities['track']
        affinity_score /= RESOURCE_TYPE_RELEVANCE_WEIGHTS[user_type_relevances['artist']] + RESOURCE_TYPE_RELEVANCE_WEIGHTS[user_type_relevances['track']]

        affinities.append({
            'category': category_affinities,
            'score': affinity_score,
        })

    return affinities
