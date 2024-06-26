import numpy as np
from sklearn.neighbors import KNeighborsRegressor
from db import bigfive, ratings
import pandas as pd
import os

MAX_DIM_VALUE = 5
PERS_DIMS = ['o','c','e','a','n']

POSITIVE_RATE_THRESHOLD = int(os.environ.get("FA_RA_IQ_POSITIVE_RATE_THRESHOLD"))
KNN_K = int(os.environ.get("FA_RA_KNN_K"))
RATING_WEIGHT_GROWTH_RATE = float(os.environ.get("FA_RW_GROWTH_RATE"))
RATING_WEIGHT_MIDDLE_POINT = float(os.environ.get("FA_RW_MIDDLE_POINT"))

AFFINITY_BY_RATING_STRATEGY = os.environ.get("FA_RA_STRATEGY")
AFFINITY_BY_PERSONALITY_STRATEGY = os.environ.get("FA_PA_STRATEGY")

def to_ndarray(data):
    return np.array([data['o'], data['c'], data['e'], data['a'], data['n']])

# It will start growing fast, but at x0 it will start
# to grow slower until reaching a limit value of 1
def sigmoid(x, k, x0):
    return 1 / (1 + np.exp(-k * (x - x0)))


def ponderate_dim_scores(dim_scores):
    return (2 * dim_scores['o'] + dim_scores['c'] + 4 * dim_scores['e'] + 3 * dim_scores['a'] + dim_scores['n']) / 11


def affinity_by_user_ratings(user, potentials):
    potentials_pvs = bigfive.find({'userId': {'$in': potentials}})
    affinity_scores = []

    if AFFINITY_BY_RATING_STRATEGY == 'interquartile':
        positive_ratings = ratings.find({'rater': user, 'rate': {'$gte': POSITIVE_RATE_THRESHOLD}})
        
        positive_ratees = list(map(lambda r : r['ratee'], positive_ratings))
        positive_ratees_pvs = bigfive.find({'userId': {'$in': positive_ratees}}, {'o': 1, 'c': 1, 'e': 1, 'a': 1, 'n': 1})

        positive_rates_df = pd.DataFrame(list(positive_ratees_pvs))
        
        q1s = positive_rates_df.quantile(0.25)
        q3s = positive_rates_df.quantile(0.75)

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
        user_ratings = list(ratings.find({'rater': user}))
        
        user_ratees = list(map(lambda r : r['ratee'], user_ratings))

        user_rates = list(map(lambda r : r['rate'], user_ratings))

        ratees_pvs = bigfive.find({'userId': {'$in': user_ratees}})
        ratees_pvs = list(map(to_ndarray, ratees_pvs))

        n_neighbors = min(KNN_K, len(ratees_pvs))

        neigh = KNeighborsRegressor(n_neighbors, weights='distance')
        rate_regressor = neigh.fit(ratees_pvs, user_rates)

        potentials_pvs = list(map(to_ndarray, potentials_pvs))
        affinity_scores = rate_regressor.predict(potentials_pvs)
        affinity_scores = list(affinity_scores)

    return affinity_scores


def affinity_by_user_personality(user, potentials):
    user_pv = bigfive.find_one({'userId': user})
    potentials_pvs = bigfive.find({'userId': {'$in': potentials}})

    affinity_scores = []

    if AFFINITY_BY_PERSONALITY_STRATEGY == 'cosine':
        for potential_pv in potentials_pvs:
            user_pv = to_ndarray(user_pv)
            potential_pv = to_ndarray(potential_pv)

            cos_sim = np.dot(user_pv, potential_pv) / (np.linalg.norm(user_pv) * np.linalg.norm(potential_pv))
            affinity_score = (cos_sim + 1) / 2

            affinity_scores.append(affinity_score) 

    elif AFFINITY_BY_PERSONALITY_STRATEGY == 'selfhout':
        for potential_pv in potentials_pvs:
            dim_scores = {}

            # Openness:
            # People tend to get better with friends with similar openness
            # There is no evidence that more open people form better relationships

            dim_scores['o'] = 1 - abs(user_pv['o'] - potential_pv['o'])

            # Consciesciousness:
            # Friends with high consciousness tend to get more acceptance
            # There is no evidence that similar consciousness improves relationship

            dim_scores['c'] = potential_pv['c'] / MAX_DIM_VALUE

            # Extraversion:
            # People tend to get better with friends with similar extraversion
            # Friends with higher extraversion tend to be more accepted

            extr_simmilarity = 1 - abs(user_pv['e'] - potential_pv['e']) / MAX_DIM_VALUE
            dim_scores['e'] = potential_pv['e'] / MAX_DIM_VALUE * extr_simmilarity

            # Agreeableness:
            # People tend to get better with friends with similar agreableness
            # Friends with higher agreableness scores improve the relationship

            aggr_similarity = 1 - abs(user_pv['a'] - potential_pv['a']) / MAX_DIM_VALUE
            dim_scores['a'] = potential_pv['a'] / MAX_DIM_VALUE * aggr_similarity

            # Neuroticism:
            # Friends with less neuroticism tend to mantain more the relationships
            # There is no evidence that similar neuroticism improves relationship

            dim_scores['n'] = 1 - potential_pv['n'] / MAX_DIM_VALUE

            # The scores are weighted based on their order of importance
            
            affinity_score = ponderate_dim_scores(dim_scores)

            affinity_scores.append(affinity_score)

    return affinity_scores


def friendship_affinity(user, potentials):
    target_rate_count = ratings.count_documents({'rater': user})

    ratings_weight = sigmoid(target_rate_count, RATING_WEIGHT_GROWTH_RATE, RATING_WEIGHT_MIDDLE_POINT) if target_rate_count > 0 else 0

    pers_affinity_scores = affinity_by_user_personality(user, potentials)
    rating_affinity_scores = affinity_by_user_ratings(user, potentials) if target_rate_count > 0 else [0] * len(potentials)

    affinities = []

    for i, potential in enumerate(potentials):
        affinity_score = (1-ratings_weight) * pers_affinity_scores[i] + ratings_weight * rating_affinity_scores[i]

        affinities.append({'score': affinity_score, 'by_ratings': rating_affinity_scores[i], 'by_personality': pers_affinity_scores[i]})

    return affinities
