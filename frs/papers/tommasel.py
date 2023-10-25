# personalities: user, personality_vector
# ratings: rater, rated, rate

import numpy as np

PERS_DIMS = ['O','C','E','A','N']

def recommendations(target, potentials, pers_df, ratings_df):
    
    target_pv = pers_df[pers_df['user'] == target]
    target_ratees = ratings_df[ratings_df['rater'] == target]['ratee']
    target_ratees_pvs = pers_df[pers_df['user'].isin(target_ratees)][PERS_DIMS]

    q1s = target_ratees_pvs.quantile(0.25)
    q3s = target_ratees_pvs.quantile(0.75)
    thresholds = target_ratees_pvs.mean()

    potentials_pvs = pers_df[pers_df['user'].isin(potentials)][PERS_DIMS]
    potentials_scores = []

    for i, pot_pv in potentials_pvs.iterrows():
        dim_scores = {}

        # For each dimension add up the IQ agreement score
        for dim in PERS_DIMS:
            iqa_score = 0.5 if pot_pv[dim] > q1s[dim] and pot_pv[dim] < q3s[dim] else 0
            dim_scores[dim] = iqa_score
        
        # Consider extraversion special combinations
        if pot_pv['E'] > thresholds['E'] and target_pv['E'] > thresholds['E']:
            dim_scores['E'] += 0.5
        elif pot_pv['E'] < thresholds['E'] and target_pv['E'] < thresholds['E']:
            dim_scores['E'] += 0.25
        
        # Consider agreeableness special combinations
        if pot_pv['A'] > thresholds['A'] and target_pv['A'] > thresholds['A']:
            dim_scores['A'] += 0.5
        elif pot_pv['A'] > thresholds['A'] or target_pv['A'] > thresholds['A']:
            dim_scores['A'] += 0.25
        
        # Consider openness special combinations
        if pot_pv['O'] > thresholds['O'] and target_pv['O'] > thresholds['O']:
            dim_scores['O'] += 0.5
        elif pot_pv['O'] > thresholds['O'] or target_pv['O'] > thresholds['O']:
            dim_scores['O'] += 0.25
        
        pot_score = np.array(dim_scores).mean()
        potentials_scores.append({'id': potentials[i], 'score': pot_score})
    
    return sorted(potentials_scores, key=lambda p: p['score'])
