import random
import math

def generate_random_location(latitude, longitude, max_radius):
    # Convert radius from kilometers to degrees
    radius_in_degrees = max_radius / 111.0

    u = random.uniform(0, 1)
    v = random.uniform(0, 1)

    w = radius_in_degrees * math.sqrt(u)
    t = 2 * math.pi * v
    x = w * math.cos(t)
    y = w * math.sin(t)

    # Adjust the x-coordinate for the shrinking of the east-west distances
    new_x = x / math.cos(math.radians(latitude))

    found_longitude = new_x + longitude
    found_latitude = y + latitude

    return (found_latitude, found_longitude)
