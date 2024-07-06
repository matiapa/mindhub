import config
config.load()

from global_affinity import generate_recommendations
from db import recommendations as recommendations_repo

import boto3
import json
import os
from datetime import datetime

sqs = boto3.resource('sqs')
queue = sqs.get_queue_by_name(QueueName=os.environ.get("RECOMMENDATIONS_QUEUE_NAME"))

print('Listening...')
while True:

    messages = queue.receive_messages()
    for message in messages:
        try:
            data = json.loads(message.body)
            print(f'Recieved request for {data["userId"]}')

            # Check if the user was processed recently

            some_current_recommendation = recommendations_repo.find_one({"targetUserId": data["userId"]})
            if some_current_recommendation is not None and "generatedAt" in some_current_recommendation:
                generated_at = some_current_recommendation["generatedAt"]
                minimum_waittime = int(os.environ.get("REQUESTS_WAITTIME_MINS"))
                actual_waittime = int((datetime.now() - generated_at).total_seconds() / 60)
                
                # If it was processed in the last 24 hours, skip
                if actual_waittime < minimum_waittime:
                    print(f'Skipping {data["userId"]} since last request was {actual_waittime} minutes ago.')
                    message.delete()
                    continue

            # Proceed with processing

            print(f'Generating recommendations for user {data["userId"]}')

            recommendations = generate_recommendations(data["userId"])

            print(f'Generated {len(recommendations)} recommendations')
            
            # message.delete()
        except Exception as error:
            print(f'Error: {error}')
            continue