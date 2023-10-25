from friendship_affinity import friendship_affinity
from interests_affinity import interest_affinity


def affinity(user, potentials, pers_df, ratings_df, interests_df, preferences_df):

    pers_aff = friendship_affinity(user, potentials, pers_df, ratings_df)

    interests_aff = interest_affinity(user, potentials, interests_df, preferences_df)

    return 0.7 * pers_aff + 0.3 * interest_affinity