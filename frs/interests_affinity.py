import numpy as np

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


def interest_affinity(user, potentials, interests_df, preferences_df):
    affinities = []

    user_type_relevances = preferences_df[preferences_df['user'] == user]['user_type_relevances']

    for potential in potentials:
        # Get the common interests between user and potential

        df = interests_df
        shared_interests = df[df['user'].isin([user, potential])] \
            .groupby('resource.id') \
            .filter(lambda x : len(set(x['user'])) == 2)
        
        # Add up the amount of common interests per resource type
        # considering the interest relevance for user and potential

        category_affinities = {
        'artist': 0,
        'track': 0,
        }

        for shared_interest in shared_interests:
            score_a = INTEREST_SCORE_BY_RELEVANCE[shared_interest.relevanceForUserA]
            score_b = INTEREST_SCORE_BY_RELEVANCE[shared_interest.relevanceForUserB]

            common_score = (score_a + score_b) / 2
            category_affinities[shared_interest.resource.type] += \
                neg_exp_decay(common_score, INTEREST_AFFINITY_GROWTH_RATE)

        # Add up the resource type scores into a global score
        # considering the resource type relevance of the user

        ponderated_weight = CATEGORY_RELEVANCE_WEIGHTS[user_type_relevances['artist']] * category_affinities['artist']
        ponderated_weight += CATEGORY_RELEVANCE_WEIGHTS[user_type_relevances['track']] * category_affinities['track']
        global_affinity = ponderated_weight / (2 * CATEGORY_RELEVANCE_WEIGHTS['high'])

        affinities.append({
        'category': category_affinities,
        'global': global_affinity,
        })

    return affinities
