# personalities: user, personality_vector
# ratings: rater, rated, rate

import numpy as np

PERS_DIMS = ['O','C','E','A','N']
RATING_SIMILARITY_THRESHOLD = 5
PERSONALITY_SIMILARITY_THRESHOLD = 5
NEIGHBOUR_CARDINALITY_THRESHOLD = 5
PERSONET_PERSONALITY_WEIGHT = 0.5

def personality_similarity(pv1, pv2, strategy):
    if strategy == 'pearson':
        return np.corrcoef(pv1, pv2)
    
# Rating vectors are the score assigned by the rater a set of users
# This set of users must be the same between the rating vectors
# Thus rv1[i] and rv2[i] refer to the score that users 1 and 2
# assigned to the user i, respectively
def rating_similarity(rv1, rv2, strategy):
    if strategy == 'pearson':
        return np.corrcoef(rv1, rv2)
    
def personet_similarity(pv1, rv1, pv2, rv2):
    alpha = PERSONET_PERSONALITY_WEIGHT
    return alpha * personet_similarity(pv1, pv2) + (1-alpha) * rating_similarity(rv1, rv2)

# For a potential friend, it gets all the users who have rated him
# and are similar to the target considering rating similarity
def neighbours_by_rating(target, potential, ratings_df):
    df = ratings_df

    neighbours = []
    potential_raters = df[df['ratee'] == potential]['rater']

    for rater in potential_raters:
        common_rates = df[df['rater'].isin([target, rater])] \
            .groupby('ratee') \
            .filter(lambda x : len(set(x['rater'])) == 2)

        target_rv = common_rates[df['rater'] == target].sort_values('ratee')['rate'].to_numpy()

        rater_rv = common_rates[df['rater'] == rater].sort_values('ratee')['rate'].to_numpy()

        if rating_similarity(target_rv, rater_rv) > RATING_SIMILARITY_THRESHOLD:
            neighbours.append(rater)

def recommendations(target, potentials, pers_df, ratings_df, strategy):
    recommendations = []

    # Determine based on target-potential personality similarity
    if strategy == 'personality':
        target_pv = pers_df[pers_df['user'] == target]

        for potential in potentials:
            potential_pv = pers_df[pers_df['user'] == potential]
            pers_sim = personality_similarity(target_pv, potential_pv)

            if pers_sim > PERSONALITY_SIMILARITY_THRESHOLD:
                recommendations.append({'id': potential, 'score': pers_sim})

    # Determine based on target-(potential neighours) rating similarity
    elif strategy == 'collaborative':
        for potential in potentials:
            neighbours = neighbours_by_rating(target, potential, ratings_df)

            if len(neighbours) > NEIGHBOUR_CARDINALITY_THRESHOLD:
                recommendations.append({'id': potential, 'score': neighbours})

    elif strategy == 'personet':
        # Get the target ratees whose rate is over a threshold

        positive_ratees = ratings_df[(ratings_df['rater'] == target) & (ratings_df['score'] > RATING_SIMILARITY_THRESHOLD)]['ratee']

        # Calculate their mean personality vector

        mean_pr_pv = pers_df[pers_df['user'].isin(positive_ratees)][PERS_DIMS].mean()

        for potential in potentials:
            potential_pv = pers_df[pers_df['user'] == potential]
            pers_sim = personet_similarity(mean_pr_pv, )

            neighbours = neighbours_by_rating(target, potential, ratings_df)

            if pers_sim > PERSONALITY_SIMILARITY_THRESHOLD and len(neighbours) > NEIGHBOUR_CARDINALITY_THRESHOLD:
                recommendations.append({'id': potential, 'score': pers_sim})
