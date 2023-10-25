import numpy as np
from sklearn.neighbors import KNeighborsRegressor

MAX_DIM_VALUE = 5
MAX_RATE_VALUE = 5
PERS_DIMS = ['O','C','E','A','N']

POSITIVE_RATE_THRESHOLD = MAX_RATE_VALUE / 2
KNN_K = 5
RATING_WEIGHT_GROWTH_RATE = 1
RATING_WEIGHT_MIDDLE_POINT = 1

AFFINITY_BY_RATING_STRATEGY = 'knn'
AFFINITY_BY_PERSONALITY_STRATEGY = 'selfhout'

# It will start growing fast, but at x0 it will start
# to grow slower until reaching a limit value of 1
def sigmoid(x, k, x0):
    return 1 / (1 + np.exp(-k * (x - x0)))


def ponderate_dim_scores(dim_scores):
    return (2 * dim_scores['O'] + dim_scores['C'] + 4 * dim_scores['E'] + 3 * dim_scores['A'] + dim_scores['N']) / 11


def affinity_by_user_ratings(user, potentials, pers_df, ratings_df):
    potentials_pvs = pers_df[pers_df['user'].isin(potentials)][PERS_DIMS]
    affinity_scores = []

    if AFFINITY_BY_RATING_STRATEGY == 'interquartile':
        user_positive_rates = ratings_df[ratings_df['rater'] == user & ratings_df['rate'] > POSITIVE_RATE_THRESHOLD]
        positive_ratees_pvs = pers_df[pers_df['user'].isin(user_positive_rates['ratee'])][PERS_DIMS]
        
        q1s = positive_ratees_pvs.quantile(0.25)
        q3s = positive_ratees_pvs.quantile(0.75)

        for potential_pv in potentials_pvs:
            dim_scores = {}

            # For each dimension add up the IQ agreement score
            for dim in PERS_DIMS:
                iqa_score = 1 if potential_pv[dim] > q1s[dim] and potential_pv[dim] < q3s[dim] else 0
                dim_scores[dim] = iqa_score
            
            # The scores are weighted based on their order of importance
            affinity_score = ponderate_dim_scores(dim_scores)

            affinity_scores.append(affinity_score)
    
    elif AFFINITY_BY_RATING_STRATEGY == 'knn':
        user_rates = ratings_df[ratings_df['rater'] == user]
        ratees_pvs = pers_df[pers_df['user'].isin(user_rates['ratee'])][PERS_DIMS]
        ratees_rates = user_rates['rate']

        neigh = KNeighborsRegressor(n_neighbors=KNN_K, weights='distance')
        rate_regressor = neigh.fit(ratees_pvs, ratees_rates)

        for potential_pv in potentials_pvs:
            potential_pv = potentials_pvs[i]

            # Predict the rating score and scale it to an affinity score
            affinity_score = rate_regressor.predict(potential_pv) / MAX_RATE_VALUE

            affinity_scores.append(affinity_score)

    return affinity_scores


def affinity_by_user_personality(user, potentials, pers_df):
    user_pv = pers_df[pers_df['user'] == user][PERS_DIMS]
    potentials_pvs = pers_df[pers_df['user'].isin(potentials)][PERS_DIMS]
    scores = []

    if AFFINITY_BY_PERSONALITY_STRATEGY == 'cosine':
        for i, potential in enumerate(potentials):
            potential_pv = potentials_pvs[i]

            cos_sim = np.dot(user_pv, potential_pv) / (np.linalg.norm(user_pv) * np.linalg.norm(potential_pv))
            affinity_score = (cos_sim + 1) / 2

            scores.append({'id': potential, 'score': affinity_score}) 

    elif AFFINITY_BY_PERSONALITY_STRATEGY == 'selfhout':
        for i, potential in enumerate(potentials):
            potential_pv = potentials_pvs[i]

            dim_scores = {}

            # Openness:
            # People tend to get better with friends with similar openness
            # There is no evidence that more open people form better relationships

            dim_scores['O'] = 1 - abs(user_pv['O'] - potential_pv['O'])

            # Consciesciousness:
            # Friends with high consciousness tend to get more acceptance
            # There is no evidence that similar consciousness improves relationship

            dim_scores['C'] = potential_pv['C'] / MAX_DIM_VALUE

            # Extraversion:
            # People tend to get better with friends with similar extraversion
            # Friends with higher extraversion tend to be more accepted

            extr_simmilarity = 1 - abs(user_pv['E'] - potential_pv['E']) / MAX_DIM_VALUE
            dim_scores['E'] = potential_pv['E'] / MAX_DIM_VALUE * extr_simmilarity

            # Agreeableness:
            # People tend to get better with friends with similar agreableness
            # Friends with higher agreableness scores improve the relationship

            aggr_similarity = 1 - abs(user_pv['A'] - potential_pv['A']) / MAX_DIM_VALUE
            dim_scores['A'] = potential_pv['A'] / MAX_DIM_VALUE * aggr_similarity

            # Neuroticism:
            # Friends with less neuroticism tend to mantain more the relationships
            # There is no evidence that similar neuroticism improves relationship

            dim_scores['N'] = 1 - potential_pv['N'] / MAX_DIM_VALUE

            # The scores are weighted based on their order of importance
            
            affinity_score = ponderate_dim_scores(dim_scores)

            scores.append({'id': potential, 'score': affinity_score})


def friendship_affinity(user, potentials, pers_df, ratings_df):
    target_rate_count = ratings_df[ratings_df['rater'] == user].count()

    ratings_weight = sigmoid(target_rate_count, RATING_WEIGHT_GROWTH_RATE, RATING_WEIGHT_MIDDLE_POINT)

    pers_affinity_scores = affinity_by_user_personality(user, potentials, pers_df)
    rating_affinity_scores = affinity_by_user_ratings(user, potentials, pers_df, ratings_df)

    affinities = []

    for i, potential in enumerate(potentials):
        affinity_score = (1-ratings_weight) * pers_affinity_scores[i] + ratings_weight * rating_affinity_scores[i]

        affinities.append({'id': potential, 'score': affinity_score})

    return affinities
